import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../prisma/client';

import { convertToWebP } from '@/lib/imageProcessor';
import { uploadToS3 } from '@/lib/upload';
import { uploadTOCloudinary } from '@/lib/cloudinary';
export async function POST(request: NextRequest) {

  try {
    const formData = await request.formData();
    const userId = formData.get('user_id')?.toString();
    const title = formData.get('title')?.toString();
    const priority = formData.get('priority')?.toString();
    const description = formData.get('description')?.toString();
    const stroageType = formData.get('storageType')?.toString();
    const files = formData.getAll('images');

    if (!userId || !title || !priority || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    // Create issue entry in DB
    const issue = await prisma.issue.create({
      data: { title, description, userId, priority },
    });

    const uploadResults = await Promise.all(
      files.map(async (file) => {
        if (!(file instanceof File)) {
          throw new Error('Invalid file format');
        }

        const webpBuffer = await convertToWebP(file);
        let imageUrl = '';

        if (stroageType === 's3') {
          try {
            imageUrl = await uploadToS3(webpBuffer, 'webp', issue.id);
          } catch (s3Error) {
            console.error('S3 upload failed:', s3Error);
            throw new Error('S3 upload failed');
          }
        } else {
          imageUrl = await uploadTOCloudinary(file);
          await prisma.issueImage.create({
            data: {
              issueId: issue.id,
              imageUrl,
            },
          })
          if (!imageUrl) {
            throw new Error('Cloudinary upload failed');
          }
        }



        return imageUrl;
      })
    );
    console.log(issue)
    return NextResponse.json({
      msg: 'success',
      issue
    });
  } catch (error) {
    console.error('Error handling upload:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error.message },
      { status: 500 }
    );
  }
}


function formatTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) {
    return `${seconds} seconds ago`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days} day${days === 1 ? '' : 's'} ago`;
  }

  // Fallback for longer durations (you can extend this or use a library like 'date-fns' or 'moment')
  return date.toLocaleDateString();
}

export async function GET() {
  try {
    const issues = await prisma.issue.findMany({
      include: {
        assignedToUser: {
          select: {
            name: true, // Select only the name of the assigned user
          },
        },
        issueCommands: {
          select: {
            id: true, // We only need to count them, so selecting the ID is enough
          },
        },
      },
    });

    // Transform the fetched data into the desired format
    const formattedIssues = issues.map(issue => ({
      id: issue.id,
      title: issue.title,
      description: issue.description,
      priority: issue.priority.charAt(0).toUpperCase() + issue.priority.slice(1), // Capitalize first letter
      status: issue.status.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase()), // Convert ENUM to readable format
      assignee: issue.assignedToUser?.name || 'Unassigned', // Use assigned user's name or 'Unassigned'
      createdAt: formatTimeAgo(issue.createdAt), // Function to format date to "X time ago"
      comments: issue.issueCommands.length, // Count the number of issue commands
    }));

    return NextResponse.json(formattedIssues, { status: 200 });
  } catch (error) {
    console.error('Error fetching issues:', error);
    return NextResponse.json(
      { message: 'Failed to fetch issues', error: (error as Error).message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
