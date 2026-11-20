import { Crown } from 'lucide-react';

const COLORS = [
  'from-cyan-500 to-blue-600',
  'from-indigo-500 to-purple-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-emerald-500 to-teal-600',
];

export default function ParticipantsPanel({ participants, ownerUserId, currentUserId }) {
  return (
    <div className="space-y-1.5">
      {participants.map((p, i) => {
        const isOwner = p.id === ownerUserId;
        const isYou   = p.id === currentUserId;
        return (
          <div key={p.id} className="flex items-center gap-3 px-2 py-2.5 rounded-2xl hover:bg-white/3 transition-colors">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${COLORS[i % COLORS.length]} flex items-center justify-center text-sm font-bold shrink-0 shadow-lg`}>
              {(p.username || '?')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium truncate">{p.username || 'Anonymous'}</span>
                {isYou && <span className="text-[10px] text-white/25 shrink-0">(you)</span>}
              </div>
              {isOwner && <p className="text-[10px] text-cyan-400 mt-0.5">Room host</p>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {isOwner && <Crown size={13} className="text-amber-400" />}
              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
