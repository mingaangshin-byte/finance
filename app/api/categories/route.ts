import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const data = await sql`SELECT * FROM categories ORDER BY name ASC`;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'DB Fetch Error' }, { status: 500 });
  }
}