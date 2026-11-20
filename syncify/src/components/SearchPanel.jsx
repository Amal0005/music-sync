import { useState } from 'react';
import { Search, Plus, Loader2, Music } from 'lucide-react';

// YouTube Data API v3 search
async function searchYouTube(query, apiKey) {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&maxResults=10&q=${encodeURIComponent(query)}&key=${apiKey}`;
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

export default function SearchPanel({ onAddSong, playlist, youtubeApiKey }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const inPlaylist = new Set(playlist.map(s => s.videoId));

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    if (!youtubeApiKey || youtubeApiKey === 'YOUR_YOUTUBE_API_KEY') {
      setError('Add your YouTube API key in RoomPage.jsx');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const items = await searchYouTube(query.trim(), youtubeApiKey);
      setResults(items);
      if (!items.length) setError('No results found.');
    } catch (err) {
      setError('Search failed. Check your YouTube API key.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search YouTube songs…"
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-xl text-sm font-medium transition-colors disabled:opacity-60"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : 'Search'}
        </button>
      </form>

      {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {results.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-32 text-white/20">
            <Music size={28} className="mb-2" />
            <p className="text-sm">Search for songs to add</p>
          </div>
        )}

        {results.map((song) => {
          const added = inPlaylist.has(song.videoId);
          return (
            <div
              key={song.videoId}
              className="flex items-center gap-3 p-2.5 rounded-xl bg-white/3 hover:bg-white/8 transition-colors group"
            >
              <img
                src={song.thumbnail}
                alt={song.title}
                className="w-12 h-9 rounded-lg object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate leading-tight">{song.title}</p>
                <p className="text-xs text-white/40 truncate">{song.channelTitle}</p>
              </div>
              <button
                onClick={() => onAddSong(song)}
                disabled={added}
                className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                  added
                    ? 'bg-green-900/40 text-green-400 cursor-default'
                    : 'bg-purple-600/80 hover:bg-purple-500 text-white'
                }`}
              >
                {added ? '✓' : <Plus size={14} />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
