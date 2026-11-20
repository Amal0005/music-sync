import { Music2, Trash2 } from 'lucide-react';

export default function Playlist({ playlist, currentSong, onSelect, onRemove, isOwner }) {
  if (playlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-white/15 gap-2">
        <Music2 size={28} />
        <p className="text-xs">Queue is empty</p>
        <p className="text-[10px] text-white/10">Search and add songs</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {playlist.map((song, index) => {
        const isCurrent = song.videoId === currentSong?.videoId;
        return (
          <div key={song.id} onClick={() => isOwner && onSelect(song)}
            className={`group flex items-center gap-3 px-2.5 py-2 rounded-2xl transition-all ${
              isCurrent ? 'bg-cyan-500/10 border border-cyan-500/20'
              : isOwner ? 'hover:bg-white/4 cursor-pointer active:bg-white/8' : 'opacity-70'
            }`}>

            {/* Index / eq bars */}
            <div className="w-5 text-center shrink-0">
              {isCurrent ? (
                <div className="flex items-end justify-center gap-0.5 h-4">
                  {[0.7,1,0.5].map((h,i) => (
                    <div key={i} className="eq-bar" style={{ animationDelay: `${i*0.2}s`, height: `${h*14}px` }} />
                  ))}
                </div>
              ) : (
                <span className="text-[10px] text-white/20">{index + 1}</span>
              )}
            </div>

            <img src={song.thumbnail} alt={song.title}
              className="w-10 h-8 rounded-lg object-cover shrink-0" />

            <div className="flex-1 min-w-0">
              <p className={`text-xs font-medium truncate ${isCurrent ? 'text-cyan-300' : ''}`}>
                {song.title}
              </p>
              <p className="text-[10px] text-white/25 truncate">{song.addedBy}</p>
            </div>

            {isOwner && (
              <button onClick={e => { e.stopPropagation(); onRemove(song.id); }}
                className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white/15 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100">
                <Trash2 size={11} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
