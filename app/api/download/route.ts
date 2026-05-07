import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'Kasih URL-nya dulu dong, Bro!' }, { status: 400 });
    }

    const apiUrl = 'https://social-download-all-in-one.p.rapidapi.com/v1/social/autolink';
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': 'social-download-all-in-one.p.rapidapi.com',
        'x-rapidapi-key': process.env.RAPIDAPI_KEY || '', 
      },
      body: JSON.stringify({ url: url })
    });

    const data = await response.json();

    // API ini mengembalikan error: true jika link invalid
    if (!response.ok || data.error) {
      throw new Error(data.message || 'Gagal ekstrak video. Pastikan link valid atau akun tidak di-private.');
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Terjadi kesalahan sistem' }, { status: 500 });
  }
}