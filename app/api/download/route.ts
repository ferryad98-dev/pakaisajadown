import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'Kasih URL-nya dulu dong, Bro!' }, { status: 400 });
    }

    // Deteksi apakah link berasal dari Twitter atau X
    const isTwitter = url.includes('twitter.com') || url.includes('x.com');

    if (isTwitter) {
      // LOGIC KHUSUS TWITTER: Menggunakan 'best-all-in-one-video-downloader' dari skdeveloper
      const twitterApiUrl = `https://best-all-in-one-video-downloader.p.rapidapi.com/dl?url=${encodeURIComponent(url)}`;
      
      const response = await fetch(twitterApiUrl, {
        method: 'GET', // API ini menggunakan method GET dengan query parameter
        headers: {
          'x-rapidapi-host': 'best-all-in-one-video-downloader.p.rapidapi.com',
          'x-rapidapi-key': process.env.RAPIDAPI_KEY || '', 
        }
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.message || 'Gagal ekstrak dari Twitter. Coba link lain.');
      }

      // Normalisasi format data Twitter agar sama dengan UI Frontend kamu
      // Asumsi output API skdeveloper memiliki property: title, thumbnail, dan array media atau links
      const normalizedData = {
        title: data.title || 'Video Twitter Berhasil Diekstrak',
        thumbnail: data.thumbnail || data.cover || 'https://via.placeholder.com/400x500?text=Twitter+Media',
        source: 'Twitter',
        author: data.author || 'X User',
        // Mapping links dari skdeveloper ke format yang frontend kamu mengerti
        medias: data.medias || data.links || [
          {
            url: data.url || data.video_url, // Sesuaikan dengan key JSON aktual dari skdeveloper
            quality: 'HD',
            extension: 'mp4',
            type: 'video'
          }
        ]
      };

      return NextResponse.json(normalizedData);
    }

    // LOGIC DEFAULT: Untuk TikTok, IG, FB, dll (Tetap pakai 'social-download-all-in-one')
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

    if (!response.ok || data.error) {
      throw new Error(data.message || 'Gagal ekstrak video. Pastikan link valid.');
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Terjadi kesalahan sistem' }, { status: 500 });
  }
}
