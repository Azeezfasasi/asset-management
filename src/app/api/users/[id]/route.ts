import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import bcryptjs from 'bcryptjs';
import { createAuditLog, createActivityLog } from '@/lib/audit';
import { verifyToken } from '@/lib/auth';

// GET /api/users/[id] - Get user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const { id } = await params;
    const user = await User.findById(id, '-password');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const authUser = await verifyToken(request);
    const { id } = await params;
    const { name, email, role, isActive, password } = await request.json();

    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email.toLowerCase();
    if (role) updateData.role = role;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    if (password) {
      updateData.password = await bcryptjs.hash(password, 12);
    }

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Audit logging
    if (authUser) {
      await createAuditLog({
        action: 'UPDATE_USER',
        entityType: 'User',
        entityId: id,
        performedBy: authUser.id,
        performerName: authUser.name,
        performerRole: authUser.role,
        details: { name: user.name, email: user.email, role: user.role, isActive: user.isActive },
      });
      await createActivityLog({
        user: authUser.id,
        userName: authUser.name,
        userRole: authUser.role,
        action: 'UPDATE_USER',
        description: `Updated user ${user.name} (${user.email})`,
        entityType: 'User',
        entityId: id,
      });
    }

    return NextResponse.json({
      message: 'User updated successfully',
      user,
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const authUser = await verifyToken(request);
    const { id } = await params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Audit logging
    if (authUser) {
      await createAuditLog({
        action: 'DELETE_USER',
        entityType: 'User',
        entityId: id,
        performedBy: authUser.id,
        performerName: authUser.name,
        performerRole: authUser.role,
        details: { name: user.name, email: user.email },
      });
      await createActivityLog({
        user: authUser.id,
        userName: authUser.name,
        userRole: authUser.role,
        action: 'DELETE_USER',
        description: `Deleted user ${user.name} (${user.email})`,
        entityType: 'User',
        entityId: id,
      });
    }

    return NextResponse.json({
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

