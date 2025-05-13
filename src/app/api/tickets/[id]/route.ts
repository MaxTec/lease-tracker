import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import type { NextRequest } from 'next/server';
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Type guard for session.user
    const user = session.user as { id?: string | number; role?: string };
    const userRole = user?.role;
    const userId = typeof user?.id === 'string' ? parseInt(user.id) : user?.id;

    if (userRole === 'TENANT') {
      if (!userId || isNaN(Number(userId))) {
        return NextResponse.json({ error: 'Invalid user id' }, { status: 400 });
      }
      // Find the tenant record for this user
      const tenant = await prisma.tenant.findUnique({ where: { userId: Number(userId) } });
      if (!tenant) {
        return NextResponse.json({ error: 'Tenant record not found' }, { status: 403 });
      }
      const ticket = await prisma.ticket.findFirst({
        where: {
          id: parseInt(id),
          tenantId: tenant.id
        },
        include: {
          property: true,
          unit: true,
          tenant: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          },
          comments: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            }
          },
          images: true,
        }
      });
      if (!ticket) {
        return NextResponse.json({ error: 'Ticket not found or access denied' }, { status: 404 });
      }
      return NextResponse.json(ticket);
    }

    if (userRole === 'ADMIN' || userRole === 'LANDLORD') {
      const ticket = await prisma.ticket.findUnique({
        where: {
          id: parseInt(id)
        },
        include: {
          property: true,
          unit: true,
          tenant: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          },
          comments: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            }
          },
          images: true,
        }
      });
      if (!ticket) {
        return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
      }
      return NextResponse.json(ticket);
    }

    // For other roles, deny access
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
) {
  try {
    const session = await getServerSession(authOptions);
    console.log('session:tickets', session);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const json = await request.json();
    const { status, priority } = json;
    const id = request.nextUrl.pathname.split('/').pop() || ''; // ← Extract ID manually
    const ticket = await prisma.ticket.update({
      where: {
        id: parseInt(id)
      },
      data: {
        status,
        priority
      },
      include: {
        property: true,
        unit: true
      }
    });

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = request.nextUrl.pathname.split('/').pop() || ''; // ← Extract ID manually

    await prisma.ticket.delete({
      where: {
        id: parseInt(id)
      }
    });

    return NextResponse.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 