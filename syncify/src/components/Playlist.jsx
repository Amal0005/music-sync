import { Music, Trash2 } from 'lucide-react';

export default function Playlist({ playlist, currentSong, onSelect, onRemove, isOwner }) {
  if (playlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-white/20">
        <Music size={28} className="mb-2" />
        <p className="text-sm">Playlist is empty</p>
        <p className="text-xs mt-1">Search for songs to add</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {playlist.map((song, index) => {
        const isCurrent = song.videoId === currentSong?.videoId;
        return (
          <div
            key={song.id}
            onClick={() => isOwner && onSelect(song)}
            className={`group flex items-center gap-3 p-2.5 rounded-xl transition-colors ${
              isCurrent
                ? 'bg-purple-900/40 border border-purple-700/50'
                : isOwner
                ? 'hover:bg-white/5 cursor-pointer active:bg-white/10'
                : 'opacity-80'
            }`}
          >
            {/* Index / equaliser */}
            <div className="w-5 text-center shrink-0">
              {isCurrent ? (
                <div className="flex items-end justify-center gap-0.5 h-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-0.5 bg-purple-400 rounded-full"
                      style={{ height: `${8 + Math.sin(Date.now() / 300 + i) * 4}px`, animation: 'pulse-purple 1s ease-in-out infinite', animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
              ) : (
                <span className="text-xs text-white/30">{index + 1}</span>
              )}
            </div>

            <img src={song.thumbnail} alt={song.title}
              className="w-10 h-8 rounded object-cover shrink-0" />

            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${isCurrent ? 'text-purple-300' : ''}`}>
                {song.title}
              </p>
              <p className="text-xs text-white/30 truncate">{song.addedBy}</p>
            </div>

            {isOwner && (
              <button
                onClick={e => { e.stopPropagation(); onRemove(song.id); }}
                className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-900/20 transition-colors
                           opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
