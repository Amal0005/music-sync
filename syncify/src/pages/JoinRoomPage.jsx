import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Music2, ArrowLeft, Loader2, LogIn } from 'lucide-react';
import { checkRoomExists } from '../hooks/useRoom';
import { signInAnon, auth } from '../firebase';

export default function JoinRoomPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState(searchParams.get('code') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) setRoomCode(code.toUpperCase());
  }, [searchParams]);

  async function handleJoin(e) {
    e.preventDefault();
    const code = roomCode.trim().toUpperCase();
    if (!username.trim()) { setError('Enter your name.'); return; }
    if (code.length !== 6) { setError('Room code must be 6 characters.'); return; }
    setError(''); setLoading(true);
    try {
      const exists = await checkRoomExists(code);
      if (!exists) { setError('Room not found. Check the code and try again.'); setLoading(false); return; }
      let user = auth.currentUser;
      if (!user) { const r = await signInAnon(); user = r.user; }
      sessionStorage.setItem('syncify_user', JSON.stringify({ userId: user.uid, username: username.trim(), isOwner: false }));
      navigate(`/room/${code}`);
    } catch {
      setError('Something went wrong. Check your connection.');
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-[#080b14] flex items-center justify-center p-4">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-indigo-500/6 blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-md fade-up">
        <button onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white/30 hover:text-white transition-colors mb-6 text-sm">
          <ArrowLeft size={15} /> Back
        </button>

        <div className="glass-strong rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-2xl gradient-btn flex items-center justify-center shadow-lg">
              <LogIn size={19} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Join a Room</h1>
              <p className="text-white/35 text-xs mt-0.5">Enter the code to join</p>
            </div>
          </div>

          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/40 mb-1.5 uppercase tracking-wider">Your Name</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                placeholder="e.g. Jordan" maxLength={30}
                className="w-full bg-white/4 border border-white/8 rounded-2xl px-4 py-3.5 text-sm text-white placeholder-white/20 focus:border-cyan-500/60 focus:bg-white/6 transition-all" />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/40 mb-1.5 uppercase tracking-wider">Room Code</label>
              <input type="text" value={roomCode} onChange={e => setRoomCode(e.target.value.toUpperCase())}
                placeholder="XXXXXX" maxLength={6}
                className="w-full bg-white/4 border border-white/8 rounded-2xl px-4 py-3.5 text-white placeholder-white/20 focus:border-cyan-500/60 focus:bg-white/6 transition-all font-mono text-2xl tracking-[0.3em] text-center uppercase" />
            </div>

            {error && (
              <div className="text-red-400 text-xs bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-4 gradient-btn rounded-2xl font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-2">
              {loading ? <><Loader2 size={16} className="animate-spin" /> Joining…</> : <><LogIn size={16} /> Join Room</>}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            <p className="text-white/25 text-xs">
              No code?{' '}
              <button onClick={() => navigate('/create')} className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium">
                Create a room
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
