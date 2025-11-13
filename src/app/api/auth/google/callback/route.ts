import connectMongoDB from '../../../../lib/db';
import User from '../../../../model/User';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/api/auth/google/callback'
);

export async function GET(request: Request) {
  try {
    await connectMongoDB();

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.redirect(new URL('/auth/signin?error=no_code', request.url));
    }

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get Google user info
    const oauth2 = google.oauth2({ auth: oauth2Client, version: 'v2' });
    const { data } = await oauth2.userinfo.get();
    const { email, name, picture } = data;

    if (!email) {
      throw new Error('Google account has no email');
    }

    // Check if user already exists
    let user = await User.findOne({ email });

    // If not found → create one (auto signup)
    if (!user) {
      user = new User({
        name,
        email,
        image: picture,
        password: 'google-oauth', // placeholder (won’t be used)
        role: 'student', // default role
      });
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // Redirect to sign-in page with token in URL
    const redirectUrl = new URL('/auth/signin', request.url);
    redirectUrl.searchParams.set('token', token);
    redirectUrl.searchParams.set('message', 'Signed in with Google!');

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Google callback error:', error);
    return NextResponse.redirect(new URL('/auth/signin?error=google_auth_failed', request.url));
  }
}