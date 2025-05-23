import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import type { NextRequest } from 'next/server';
export async function POST(
  request: NextRequest,
  // { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user?.email || '' }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('user', user);

    if (user.role === 'ADMIN') {
      const tickets = await prisma.ticket.findMany(); // Fetch all tickets
      return NextResponse.json(tickets); // Return all tickets
    }

    const json = await request.json();
    const { content } = json;
    console.log('request', request.nextUrl.pathname);
    const id = request.nextUrl.pathname.split('/')[3] || ''; // Get the ID from the 4th segment (index 3)
    console.log('id', id);
    console.log('content', content);
    const comment = await prisma.ticketComment.create({
      data: {
        content,
        ticketId: parseInt(id),
        userId: user.id
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 