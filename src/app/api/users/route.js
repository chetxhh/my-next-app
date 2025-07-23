import { connectDB } from '@/lib/db';
import { NextResponse } from 'next/server';

  export async function GET() {
    const db = await connectDB();
    const [rows] = await db.query('SELECT * FROM users');
    return Response.json(rows);
  }
  
  export async function POST(request) {
    const db = await connectDB();
    const { name, email } = await request.json();
    const [result] = await db.query(
      'INSERT INTO users (name, email) VALUES (?, ?)', 
      [name, email]
    );
    return Response.json({ id: result.insertId, name, email });
  }
  
  export async function PUT(request) {
    const db = await connectDB();
    const { id, name, email } = await request.json();
    await db.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [
      name,
      email,
      id,
    ]);
    return Response.json({ message: 'Updated successfully' });
  }
  
  export async function DELETE(request) {
    const db = await connectDB();
    const { id } = await request.json();
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    return Response.json({ message: 'Deleted successfully' });
  }