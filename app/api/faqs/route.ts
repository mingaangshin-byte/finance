import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const data = await sql`
      SELECT f.id, f.question, f.answer, f.file_url, c.name as category_name
      FROM faqs f
      LEFT JOIN categories c ON f.category_id = c.id
      ORDER BY f.created_at DESC
    `;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'DB Fetch Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { question, answer, category_id, new_category_name, file_url } = await req.json();

    let targetCatId = category_id;

    if (!targetCatId && new_category_name) {
      const catInsert = await sql`
        INSERT INTO categories (name) VALUES (${new_category_name})
        ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
        RETURNING id
      `;
      targetCatId = catInsert[0].id;
    }

    await sql`
      INSERT INTO faqs (question, answer, category_id, file_url)
      VALUES (${question}, ${answer}, ${targetCatId}, ${file_url || null})
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Insert Error' }, { status: 500 });
  }
}