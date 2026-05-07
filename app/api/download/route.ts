import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'Kasih URL-nya dulu dong, Bro!' }, { status: 400 });
    }

    const isTwitter = url.includes('twitter.com') || url.includes('x.com');

    if (isTwitter) {
      // MENGGUNAKAN SNAP VIDEO 3 UNTUK TWITTER/X
      const twitterApiUrl = 'https://snap-video3.p.rapidapi.com/download';
      
      // Mengubah format payload ke x-www-form-urlencoded sesuai dokumentasi snap-video3
      const bodyParams = new URLSearchParams();
      bodyParams.append('url', url);

      const response = await fetch(twitterApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'x-rapidapi-host': 'snap-video3.p.rapidapi.com',
          'x-rapidapi-key': process.env.RAPIDAPI_KEY || '', 
        },
        body: bodyParams.toString()
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.message || 'Gagal ekstrak dari Twitter. Coba link lain.');
      }

      // Normalisasi data dari snap-video3 agar cocok dengan UI frontend kamu
      const normalizedData = {
        title: data.title || data.desc || 'Video X/Twitter',
        thumbnail: data.thumbnail || data.cover || 'https://via.placeholder.com/400x500?text=Twitter+Media',
        source: 'Twitter',
        author: data.author?.name || data.author || 'X User',
        // Jika API mengembalikan array format/urls
        medias: data.medias || data.formats || data.video_urls || [
          {
            url: data.url || data.video_url || (data.data && data.data.url), 
            quality: 'HD',
            extension: 'mp4',
            type: 'video'
          }
        ]
      };

      return NextResponse.json(normalizedData);
    }

    // LOGIC DEFAULT UNTUK TIKTOK, IG, DLL (Tetap pakai 'social-download-all-in-one')
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
      throw new Error(data.message || 'Gagal ekstrak video.');
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Terjadi kesalahan sistem' }, { status: 500 });
  }
}
