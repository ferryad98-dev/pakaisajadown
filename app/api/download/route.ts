import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'Kasih URL-nya dulu dong, Bro!' }, { status: 400 });
    }

    const isTwitter = url.includes('twitter.com') || url.includes('x.com');

    if (isTwitter) {
      // PERBAIKAN: Menggunakan All Media Downloader untuk Twitter
      const twitterApiUrl = 'https://all-media-downloader1.p.rapidapi.com/all';
      
      // API ini butuh URLSearchParams sesuai dokumentasi resminya
      const bodyParams = new URLSearchParams();
      bodyParams.append('url', url);

      const response = await fetch(twitterApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'x-rapidapi-host': 'all-media-downloader1.p.rapidapi.com',
          'x-rapidapi-key': process.env.RAPIDAPI_KEY || '', 
        },
        body: bodyParams.toString()
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.message || 'Gagal ekstrak dari Twitter. Coba link lain.');
      }

      // Normalisasi data untuk Frontend kamu
      const normalizedData = {
        title: data.title || 'Video X/Twitter',
        thumbnail: data.thumbnail || 'https://via.placeholder.com/400x500?text=Twitter+Media',
        source: 'Twitter',
        author: data.extractor || 'X User',
        // All Media Downloader biasanya mengembalikan array formats/urls
        medias: data.formats ? data.formats.slice(0, 3).map((f: any) => ({
          url: f.url,
          quality: f.format_note || f.resolution || 'HD',
          extension: f.ext || 'mp4',
          type: 'video'
        })) : [{
          url: data.url,
          quality: 'HD',
          extension: 'mp4',
          type: 'video'
        }]
      };

      return NextResponse.json(normalizedData);
    }

    // LOGIC DEFAULT UNTUK TIKTOK, IG, DLL
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
