import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(req: NextRequest) {
  try {
    console.log('Upload API called');
    
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    console.log('File received:', file?.name, file?.type, file?.size);

    if (!file) {
      console.log('No file found in request');
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf', 
      'image/jpeg', 
      'image/png', 
      'image/gif', 
      'image/webp',
      'image/svg+xml'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      console.log('Invalid file type:', file.type);
      return NextResponse.json({ 
        error: `Invalid file type. Received: ${file.type}` 
      }, { status: 400 });
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      console.log('File too large:', file.size);
      return NextResponse.json({ error: 'File too large. Maximum size is 10MB' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public/uploads');
    try {
      await mkdir(uploadsDir, { recursive: true });
      console.log('Uploads directory created/verified:', uploadsDir);
    } catch (error) {
      console.error('Error creating uploads directory:', error);
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}_${randomString}_${originalName}`;
    const filepath = join(uploadsDir, filename);

    console.log('Saving file to:', filepath);

    try {
      // Save file
      await writeFile(filepath, buffer);
      console.log('File saved successfully');
    } catch (error) {
      console.error('Error saving file:', error);
      return NextResponse.json({ error: 'Failed to save file' }, { status: 500 });
    }

    // Return public URL
    const fileUrl = `/uploads/${filename}`;

    console.log('Upload successful, returning URL:', fileUrl);

    return NextResponse.json({ 
      success: true, 
      url: fileUrl,
      filename: file.name,
      type: file.type,
      size: file.size
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}