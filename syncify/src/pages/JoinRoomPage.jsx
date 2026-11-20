import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Music, ArrowLeft, Loader2, LogIn } from 'lucide-react';
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

    setError('');
    setLoading(true);

    try {
      const exists = await checkRoomExists(code);
      if (!exists) { setError('Room not found. Check the code and try again.'); setLoading(false); return; }

      let user = auth.currentUser;
      if (!user) {
        const result = await signInAnon();
        user = result.user;
      }

      sessionStorage.setItem('syncify_user', JSON.stringify({
        userId: user.uid,
        username: username.trim(),
        isOwner: false,
      }));

      navigate(`/room/${code}`);
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Check your Firebase config.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[400px] rounded-full bg-purple-900/15 blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-md fade-in">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-8 text-sm"
        >
          <ArrowLeft size={16} /> Back to Home
        </button>

        <div className="glass rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
              <Music size={18} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Join a Room</h1>
              <p className="text-white/40 text-sm">Enter the room code to join</p>
            </div>
          </div>

          <form onSubmit={handleJoin} className="space-y-5">
            <div>
              <label className="block text-sm text-white/60 mb-2">Your Name</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="e.g. Jordan"
                maxLength={30}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-2">Room Code</label>
              <input
                type="text"
                value={roomCode}
                onChange={e => setRoomCode(e.target.value.toUpperCase())}
                placeholder="e.g. AB3X9Z"
                maxLength={6}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-purple-500 transition-colors font-mono text-lg tracking-widest uppercase"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-900/20 border border-red-700/30 rounded-lg px-4 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-60 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Joining…</>
              ) : (
                <><LogIn size={18} /> Join Room</>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            <p className="text-white/30 text-sm">
              Don't have a code?{' '}
              <button
                onClick={() => navigate('/create')}
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                Create a room
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
