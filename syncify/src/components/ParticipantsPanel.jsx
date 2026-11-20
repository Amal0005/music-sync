import { Crown, Circle } from 'lucide-react';

export default function ParticipantsPanel({ participants, ownerUserId, currentUserId }) {
  return (
    <div className="space-y-2">
      {participants.map(p => {
        const isOwner = p.id === ownerUserId;
        const isYou = p.id === currentUserId;
        return (
          <div key={p.id} className="flex items-center gap-3 py-1.5">
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-700 to-purple-900 flex items-center justify-center text-sm font-bold shrink-0">
              {(p.username || '?')[0].toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium truncate">
                  {p.username || 'Anonymous'}
                </span>
                {isYou && (
                  <span className="text-xs text-white/30">(you)</span>
                )}
              </div>
            </div>

            {isOwner && (
              <Crown size={14} className="text-yellow-400 shrink-0" title="Room Owner" />
            )}
            <Circle size={8} className="text-green-400 shrink-0 fill-green-400" />
          </div>
        );
      })}
    </div>
  );
}
