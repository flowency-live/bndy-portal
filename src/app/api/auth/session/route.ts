import { NextRequest, NextResponse } from 'next/server';
import admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const auth = admin.auth();

export async function POST(request: NextRequest) {
  try {
    const { idToken, uid, cookieOptions } = await request.json();

    if (!idToken || !uid) {
      return NextResponse.json(
        { error: 'Missing idToken or uid' },
        { status: 400 }
      );
    }

    // Verify the ID token
    const decodedToken = await auth.verifyIdToken(idToken);
    
    if (decodedToken.uid !== uid) {
      return NextResponse.json(
        { error: 'Token UID does not match provided UID' },
        { status: 401 }
      );
    }

    // Create session cookie (5 days expiration)
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days in milliseconds
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

    // Build cookie string
    let cookieString = `session=${sessionCookie}; Max-Age=432000; HttpOnly; Secure; SameSite=Lax; Path=/`;
    
    if (cookieOptions?.domain) {
      cookieString += `; Domain=${cookieOptions.domain}`;
    }
    
    if (cookieOptions?.sameSite) {
      cookieString = cookieString.replace('SameSite=Lax', `SameSite=${cookieOptions.sameSite}`);
    }

    return NextResponse.json(
      { success: true },
      {
        status: 200,
        headers: {
          'Set-Cookie': cookieString,
        },
      }
    );
  } catch (error) {
    console.error('Session creation error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Invalid ID token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie');
    
    if (!cookieHeader) {
      return NextResponse.json(
        { valid: false, error: 'No session cookie found' },
        { status: 401 }
      );
    }

    // Parse session cookie
    const sessionCookie = cookieHeader
      .split(';')
      .find(c => c.trim().startsWith('session='))
      ?.split('=')[1];

    if (!sessionCookie) {
      return NextResponse.json(
        { valid: false, error: 'No session cookie found' },
        { status: 401 }
      );
    }

    // Verify session cookie
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

    return NextResponse.json({
      valid: true,
      user: {
        uid: decodedClaims.uid,
        email: decodedClaims.email || null,
        name: decodedClaims.name || null,
      },
    });
  } catch (error) {
    console.error('Session validation error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Session invalid';
    
    return NextResponse.json(
      { valid: false, error: errorMessage },
      { status: 401 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const domain = url.searchParams.get('domain');

    // Clear session cookie
    let cookieString = 'session=; Max-Age=0; HttpOnly; Secure; SameSite=Lax; Path=/';
    
    if (domain) {
      cookieString += `; Domain=${domain}`;
    }

    return NextResponse.json(
      { success: true },
      {
        status: 200,
        headers: {
          'Set-Cookie': cookieString,
        },
      }
    );
  } catch (error) {
    console.error('Session deletion error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}