import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../../prisma/client';
import { patchIssueSchema } from '@/app/validationSchemas';
import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';
import { Buffer } from 'buffer';
import { deleteFromCloudinary } from '@/lib/cloudinary';

export const GET = async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const issueId = parseInt(params.id);

    if (isNaN(issueId)) {
      return NextResponse.json({ error: 'Invalid issue ID format' }, { status: 400 });
    }

    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
      include: {
        issueImages: {
          select: {
            id: true,
            imageUrl: true,
            storageType: true,
          }
        },
        assignedToUser: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        }
      }
    });

    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    return NextResponse.json(issue);
  } catch (error) {
    console.error('Error fetching issue:', error);
    return NextResponse.json({ error: 'Failed to fetch issue' }, { status: 500 });
  }
};

export const PATCH = async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const issueId = parseInt(params.id);
    if (isNaN(issueId)) {
      return NextResponse.json({ error: 'Invalid issue ID' }, { status: 400 });
    }

    const existingIssue = await prisma.issue.findFirst({ where: { id: issueId } });
    if (!existingIssue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    const formData = await request.formData();
    const userId = formData.get('user_id')?.toString();
    const title = formData.get('title')?.toString();
    const priority = formData.get('priority')?.toString();
    const description = formData.get('description')?.toString();
    const assignDate = formData.get('assignedDate')?.toString();
    const deadlineDate = formData.get('deadlineDate')?.toString();
    const status = formData.get('status')?.toString();
    const assignedUserId = formData.get('assignedToUserId')?.toString();
    const files = formData.getAll('images') as File[];
    const deleteImages = JSON.parse(formData.get('delete_images') as string || '[]');

    const assignedDate = assignDate ? new Date(assignDate).toISOString() : null;
    const deadlineDateISO = deadlineDate ? new Date(deadlineDate).toISOString() : null;

    const validation = patchIssueSchema.safeParse({ userId, title, description, priority });
    if (!validation.success) {
      return NextResponse.json(validation.error.errors, { status: 400 });
    }

    if (files.length > 0) {
      for (const imageUrl of deleteImages) {
        try {
          await prisma.issueImage.deleteMany({ where: { issueId, imageUrl } });
        } catch (deleteError) {
          console.error('Failed to delete image:', deleteError);
        }
      }
    }

    const uploadResults = [];

    for (const file of files) {
      if (file instanceof File) {
        const fileName = `${Date.now()}_${Math.floor(Math.random() * 10000)}.webp`;
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const webpBuffer = await sharp(buffer).webp().toBuffer();

        let imageUrl = '';
        try {
          const cloudinaryResult = await new Promise<any>((resolve, reject) => {
            cloudinary.uploader.upload_stream(
              { resource_type: 'image', public_id: fileName, format: 'webp' },
              (error, result) => {
                if (error) {
                  console.error('Cloudinary upload failed:', error);
                  reject(new Error('Cloudinary upload failed'));
                } else {
                  resolve(result);
                }
              }
            ).end(webpBuffer);
          });

          imageUrl = cloudinaryResult?.secure_url || '';
        } catch (cloudinaryError) {
          console.error('Cloudinary upload failed:', cloudinaryError);
          throw new Error('Cloudinary upload failed');
        }

        uploadResults.push(imageUrl);

        await prisma.issueImage.create({
          data: { issueId, imageUrl },
        });
      }
    }

    const updatedIssue = await prisma.issue.update({
      where: { id: issueId },
      data: {
        title,
        description,
        priority,
        assignedToUserId: assignedUserId,
        status,
        assignedDate,
        deadlineDate: deadlineDateISO,
      },
    });

    return NextResponse.json({
      message: 'Issue updated successfully',
      issue: updatedIssue,
      uploadedImages: uploadResults,
      deletedImages: deleteImages,
    });
  } catch (error) {
    console.error('Error updating issue:', error);
    return NextResponse.json({ error: 'Failed to update issue' }, { status: 500 });
  }
};

export const DELETE = async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const issueId = parseInt(params.id);
    if (isNaN(issueId)) {
      return NextResponse.json({ error: 'Invalid issue ID' }, { status: 400 });
    }

    const findIssue = await prisma.issue.findUnique({
      where: { id: issueId },
      include: {
        issueImages: {
          select: {
            id: true,
            imageUrl: true,
            storageType: true,
          },
        }
      }
    });

    if (!findIssue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    const deletionResults = [];
    if (findIssue?.issueImages?.length) {
      for (const image of findIssue.issueImages) {
        if (image.storageType === 'CLOUDINARY' && image.imageUrl) {
          try {
            const result = await deleteFromCloudinary(image.imageUrl);
            deletionResults.push({
              imageUrl: image.imageUrl,
              success: true,
              result
            });
            console.log(`Successfully deleted image: ${image.imageUrl}`);
          } catch (error) {
            console.error(`Error deleting image from Cloudinary: ${image.imageUrl}`, error);
            deletionResults.push({
              imageUrl: image.imageUrl,
              success: false,
              error: (error as Error).message
            });
          }
        }
      }
    }

    const deletedIssue = await prisma.issue.delete({ where: { id: issueId } });

    return NextResponse.json({
      message: 'Issue deleted successfully',
      issue: deletedIssue,
      imageResults: deletionResults
    });

  } catch (error) {
    console.error('Error deleting issue:', error);
    return NextResponse.json({ error: 'Failed to delete issue' }, { status: 500 });
  }
};
