import { useState } from 'react';
import { Search, Plus, Loader2, Music2, Play, Check } from 'lucide-react';

async function searchYouTube(query, apiKey) {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=10&q=${encodeURIComponent(query)}&key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Search failed');
  const data = await res.json();
  return (data.items || []).map(item => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    channelTitle: item.snippet.channelTitle,
    thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
  }));
}

export default function SearchPanel({ onAddSong, onPlayNow, playlist, youtubeApiKey, isOwner }) {
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const inPlaylist = new Set(playlist.map(s => s.videoId));

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    if (!youtubeApiKey || youtubeApiKey === 'YOUR_YOUTUBE_API_KEY') {
      setError('Add your YouTube API key in .env'); return;
    }
    setError(''); setLoading(true);
    try {
      const items = await searchYouTube(query.trim(), youtubeApiKey);
      setResults(items);
      if (!items.length) setError('No results found.');
    } catch { setError('Search failed. Check your YouTube API key.'); }
    finally { setLoading(false); }
  }

  function handleClickSong(song) {
    if (!inPlaylist.has(song.videoId)) onAddSong(song);
    if (isOwner) onPlayNow && onPlayNow(song);
  }

  return (
    <div className="flex flex-col h-full gap-3">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
          <input type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search songs…"
            className="w-full bg-white/4 border border-white/8 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-white/20 focus:border-cyan-500/50 focus:bg-white/6 transition-all" />
        </div>
        <button type="submit" disabled={loading}
          className="px-4 gradient-btn rounded-xl text-sm font-medium disabled:opacity-50 transition-all hover:opacity-90 shrink-0">
          {loading ? <Loader2 size={14} className="animate-spin" /> : 'Go'}
        </button>
      </form>

      {error && <p className="text-red-400 text-xs bg-red-500/8 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

      <div className="flex-1 overflow-y-auto space-y-1.5">
        {results.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-32 text-white/15 gap-2">
            <Music2 size={28} />
            <p className="text-xs">Search for songs to add</p>
          </div>
        )}

        {results.map(song => {
          const added = inPlaylist.has(song.videoId);
          return (
            <div key={song.videoId}
              className="flex items-center gap-3 p-2 rounded-2xl hover:bg-white/5 transition-all group cursor-pointer">
              {/* Thumbnail */}
              <div className="relative shrink-0" onClick={() => handleClickSong(song)}>
                <img src={song.thumbnail} alt={song.title}
                  className="w-12 h-9 rounded-xl object-cover" />
                <div className="absolute inset-0 rounded-xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play size={13} className="fill-white text-white" />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0" onClick={() => handleClickSong(song)}>
                <p className="text-xs font-medium truncate leading-snug group-hover:text-cyan-300 transition-colors">
                  {song.title}
                </p>
                <p className="text-[10px] text-white/30 truncate mt-0.5">{song.channelTitle}</p>
              </div>

              {/* Add button */}
              <button onClick={e => { e.stopPropagation(); onAddSong(song); }} disabled={added}
                className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all text-xs ${
                  added ? 'bg-green-500/15 text-green-400 cursor-default border border-green-500/20'
                        : 'bg-cyan-500/15 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/20'
                }`}>
                {added ? <Check size={12} /> : <Plus size={12} />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
