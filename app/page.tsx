'use client';

import { useState } from 'react';
import { Download, Link2, Loader2, PlayCircle } from 'lucide-react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);
      
      setResult(data); 
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex flex-col items-center py-20 px-6">
      <div className="max-w-3xl w-full space-y-12">
        
        {/* Header Section */}
        <div className="space-y-4 text-center">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 pb-2">
            PakaiSajaDown
          </h1>
          <p className="text-neutral-400 text-lg md:text-xl font-medium max-w-xl mx-auto">
            Satu tools buat semua. Download video & foto dari TikTok, IG, Twitter, sampai YouTube tanpa aplikasi tambahan.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleDownload} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={20} />
            <input
              type="url"
              required
              placeholder="Paste link video di sini..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full pl-12 pr-5 py-4 rounded-2xl bg-neutral-900 border border-neutral-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-all text-neutral-100 placeholder:text-neutral-600"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-4 bg-white text-black font-bold rounded-2xl hover:bg-neutral-200 disabled:opacity-50 transition-all duration-200 flex items-center justify-center min-w-[160px] gap-2"
          >
            {loading ? (
              <><Loader2 className="animate-spin" size={20} /> Memproses...</>
            ) : (
              <><Download size={20} /> Download</>
            )}
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-center font-medium">
            {error}
          </div>
        )}

        {/* Result Card */}
        {result && !error && (
          <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row gap-6">
              
              {/* Thumbnail Area */}
              <div className="w-full md:w-1/3 aspect-[4/5] md:aspect-square bg-neutral-800 rounded-xl overflow-hidden relative group">
                <img 
                  src={result.thumbnail || 'https://via.placeholder.com/400x500?text=No+Thumbnail'} 
                  alt={result.title || 'Thumbnail'} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <PlayCircle size={48} className="text-white/80" />
                </div>
              </div>

              {/* Data & Download Buttons */}
              <div className="flex-1 space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-neutral-800 text-xs font-bold text-neutral-300 rounded-full uppercase tracking-wider">
                      {result.source || 'Media'}
                    </span>
                    {result.author && (
                      <span className="text-sm text-neutral-400 font-medium">by @{result.author}</span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white line-clamp-2">
                    {result.title || 'Video / Media berhasil diekstrak!'}
                  </h3>
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-neutral-500 font-medium uppercase tracking-wider">Pilih Resolusi / Format</p>
                  <div className="grid gap-3">
                    {/* Melakukan iterasi dari array 'medias' yang disediakan API */}
                    {result.medias && result.medias.map((media: any, index: number) => (
                      <a
                        key={index}
                        href={media.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 hover:border-cyan-500/50 rounded-xl transition-all group"
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                            {media.quality || 'Standard'} {media.type === 'audio' ? 'Audio' : 'Video'}
                          </span>
                          <span className="text-xs text-neutral-500 uppercase">{media.extension || 'MP4'}</span>
                        </div>
                        <Download className="text-neutral-500 group-hover:text-cyan-400 transition-colors" size={20} />
                      </a>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
        
      </div>
    </main>
  );
}