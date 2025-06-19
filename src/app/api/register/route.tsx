// pages/api/auth/register.js

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs'; // FIX: Importing bcryptjs instead of bcrypt
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export const POST = async (request: Request) => {
  const body = await request.json();
  const { email, password, name } = body;

  // Basic input validation (consider using a library like Zod for more robust validation)
  if (!email || !password || !name) {
    return NextResponse.json(
      { success: false, message: 'Missing required fields: email, password, and name' },
      { status: 400 } // Bad Request
    );
  }

  try {
    // Check if user already exists
    const checkUser = await prisma.user.findUnique({
      where: { email },
    });

    if (checkUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'User already exists with this email address.',
        },
        { status: 409 } // Conflict
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12); // FIX: Called hash method from bcrypt object

    // Create new user
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    // Return success response with user data
    // It's generally good practice not to return the full user object including hashed password to the client.
    // Return only necessary, non-sensitive data.
    const { password: userPassword, ...userWithoutPassword } = user; // Destructure to exclude password

    return NextResponse.json(
      {
        success: true,
        message: 'User created successfully',
        user: userWithoutPassword, // Return user without password
      },
      { status: 201 } // Created
    );
  } catch (error) {
    // Log the actual error on the server for debugging purposes
    console.error('Registration API Error:', error);

    // Return a generic error message to the client for security
    return NextResponse.json(
      {
        success: false,
        message: 'An internal server error occurred during registration.',
      },
      { status: 500 } // Internal Server Error
    );
  }
};