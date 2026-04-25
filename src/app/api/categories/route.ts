import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import AssetCategory from '@/models/AssetCategory';

// GET /api/categories
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const query: Record<string, unknown> = {};
    if (isActive !== null) query.isActive = isActive === 'true';

    const skip = (page - 1) * limit;
    const [categories, total] = await Promise.all([
      AssetCategory.find(query).sort({ name: 1 }).skip(skip).limit(limit),
      AssetCategory.countDocuments(query),
    ]);

    return NextResponse.json({ categories, total, page, limit });
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/categories
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();

    if (!body.name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const category = new AssetCategory(body);
    await category.save();
    return NextResponse.json({ message: 'Category created', category }, { status: 201 });
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

