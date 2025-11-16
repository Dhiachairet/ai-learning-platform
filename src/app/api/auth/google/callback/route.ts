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

    // If user doesn't exist, create with empty role and redirect to role selection
    if (!user) {
      user = new User({
        name,
        email,
        image: picture,
        password: 'google-oauth',
        role: '', // Empty role for new users
      });
      await user.save();

      // Generate temporary token for role selection
      const tempToken = jwt.sign(
        {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          needsRoleSelection: true, // Flag to indicate role selection needed
        },
        process.env.JWT_SECRET!,
        { expiresIn: '1h' } // Short expiration for security
      );

      // Redirect to role selection page
      const redirectUrl = new URL('/auth/select-role', request.url);
      redirectUrl.searchParams.set('token', tempToken);
      return NextResponse.redirect(redirectUrl);
    }

    // ✅ UPDATED: If user exists and has a role, redirect based on role
    if (user.role) {
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

      // ✅ NEW: Determine redirect path based on role
      let redirectPath = '/';
      if (user.role === 'instructor') {
        redirectPath = '/dashboard/instructor';
      } else if (user.role === 'admin') {
        redirectPath = '/dashboard/admin';
      }

      // ✅ NEW: Redirect directly to the appropriate page
      const redirectUrl = new URL(redirectPath, request.url);
      redirectUrl.searchParams.set('token', token);
      redirectUrl.searchParams.set('message', 'Signed in with Google!');
      return NextResponse.redirect(redirectUrl);
    }

    // If user exists but has no role (edge case), redirect to role selection
    const tempToken = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        needsRoleSelection: true,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    const redirectUrl = new URL('/auth/select-role', request.url);
    redirectUrl.searchParams.set('token', tempToken);
    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error('Google callback error:', error);
    return NextResponse.redirect(new URL('/auth/signin?error=google_auth_failed', request.url));
  }
}