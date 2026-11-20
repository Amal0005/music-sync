import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music2, ArrowLeft, Copy, Check, Users, Loader2, Sparkles } from 'lucide-react';
import { generateRoomCode, buildInviteLink } from '../utils/roomUtils';
import { createRoom } from '../hooks/useRoom';
import { signInAnon, auth } from '../firebase';

export default function CreateRoomPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [roomName, setRoomName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]  = useState('');
  const [copied, setCopied] = useState(false);
  const [created, setCreated] = useState(null);

  async function handleCreate(e) {
    e.preventDefault();
    if (!username.trim() || !roomName.trim()) { setError('Please fill in all fields.'); return; }
    setError(''); setLoading(true);
    try {
      let user = auth.currentUser;
      if (!user) { const r = await signInAnon(); user = r.user; }
      const roomCode = generateRoomCode();
      await createRoom(roomCode, user.uid, username.trim(), roomName.trim());
      setCreated({ roomCode, inviteLink: buildInviteLink(roomCode) });
      sessionStorage.setItem('syncify_user', JSON.stringify({ userId: user.uid, username: username.trim(), isOwner: true }));
    } catch (err) {
      setError(err?.message || 'Failed to create room.');
    } finally { setLoading(false); }
  }

  function copyLink() {
    navigator.clipboard.writeText(created.inviteLink);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-[#080b14] flex items-center justify-center p-4">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-cyan-500/6 blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-md fade-up">
        <button onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white/30 hover:text-white transition-colors mb-6 text-sm">
          <ArrowLeft size={15} /> Back
        </button>

        <div className="glass-strong rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-2xl gradient-btn flex items-center justify-center shadow-lg">
              <Music2 size={19} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Create a Room</h1>
              <p className="text-white/35 text-xs mt-0.5">Start your listening session</p>
            </div>
          </div>

          {!created ? (
            <form onSubmit={handleCreate} className="space-y-4">
              {[
                { label: 'Your Name', value: username, set: setUsername, placeholder: 'e.g. Alex', max: 30 },
                { label: 'Room Name', value: roomName, set: setRoomName, placeholder: 'e.g. Friday Night Vibes', max: 50 },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-xs font-medium text-white/40 mb-1.5 uppercase tracking-wider">{f.label}</label>
                  <input type="text" value={f.value} onChange={e => f.set(e.target.value)}
                    placeholder={f.placeholder} maxLength={f.max}
                    className="w-full bg-white/4 border border-white/8 rounded-2xl px-4 py-3.5 text-sm text-white placeholder-white/20 focus:border-cyan-500/60 focus:bg-white/6 transition-all" />
                </div>
              ))}

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full py-4 gradient-btn rounded-2xl font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
                {loading ? <><Loader2 size={16} className="animate-spin" /> Creating…</> : <><Sparkles size={16} /> Create Room</>}
              </button>
            </form>
          ) : (
            <div className="space-y-5 scale-in">
              <div className="text-center py-2">
                <div className="w-16 h-16 rounded-2xl gradient-btn flex items-center justify-center mx-auto mb-4 shadow-xl shadow-cyan-500/20">
                  <Check size={28} />
                </div>
                <h2 className="text-xl font-bold">Room Created!</h2>
                <p className="text-white/35 text-xs mt-1">Share the code or link</p>
              </div>

              {/* Room code */}
              <div className="bg-white/4 border border-white/8 rounded-2xl p-5 text-center">
                <p className="text-white/30 text-[10px] uppercase tracking-widest mb-2">Room Code</p>
                <p className="text-5xl font-black tracking-[0.2em] gradient-text">{created.roomCode}</p>
              </div>

              {/* Invite link */}
              <div>
                <p className="text-white/30 text-[10px] uppercase tracking-widest mb-1.5">Invite Link</p>
                <div className="flex gap-2">
                  <input readOnly value={created.inviteLink}
                    className="flex-1 bg-white/4 border border-white/8 rounded-xl px-3 py-2.5 text-xs text-white/50 truncate" />
                  <button onClick={copyLink}
                    className="px-3.5 py-2.5 glass rounded-xl text-xs flex items-center gap-1.5 hover:bg-white/8 transition-all whitespace-nowrap">
                    {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <button onClick={() => navigate(`/room/${created.roomCode}`)}
                className="w-full py-4 gradient-btn rounded-2xl font-semibold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2">
                Enter Room <ArrowLeft size={14} className="rotate-180" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
