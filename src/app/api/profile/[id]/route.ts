
import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../../prisma/client';

export const GET= async (
  request: NextRequest,
  { params }: { params: { id: string } }
)=>{
  const {id} = await params;
  try {
    const user = await prisma.user.findUnique({
      where: { id},
      include: {
        issues: true,
        assignedIssues: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
