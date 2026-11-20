import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, ArrowLeft, Copy, Check, Users, Loader2 } from 'lucide-react';
import { generateRoomCode, buildInviteLink } from '../utils/roomUtils';
import { createRoom } from '../hooks/useRoom';
import { signInAnon, auth } from '../firebase';

export default function CreateRoomPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [roomName, setRoomName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [created, setCreated] = useState(null); // { roomCode, inviteLink }

  async function handleCreate(e) {
    e.preventDefault();
    if (!username.trim() || !roomName.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      // Sign in anonymously
      let user = auth.currentUser;
      if (!user) {
        const result = await signInAnon();
        user = result.user;
      }

      const roomCode = generateRoomCode();
      await createRoom(roomCode, user.uid, username.trim(), roomName.trim());

      const inviteLink = buildInviteLink(roomCode);
      setCreated({ roomCode, inviteLink });

      // Store in sessionStorage so the room page can read it
      sessionStorage.setItem('syncify_user', JSON.stringify({
        userId: user.uid,
        username: username.trim(),
        isOwner: true,
      }));
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Failed to create room. Check your Firebase config.');
    } finally {
      setLoading(false);
    }
  }

  function copyLink() {
    if (!created) return;
    navigator.clipboard.writeText(created.inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function enterRoom() {
    navigate(`/room/${created.roomCode}`);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[400px] rounded-full bg-purple-900/15 blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-md fade-in">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-8 text-sm"
        >
          <ArrowLeft size={16} /> Back to Home
        </button>

        <div className="glass rounded-2xl p-8">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
              <Music size={18} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Create a Room</h1>
              <p className="text-white/40 text-sm">Start your listening session</p>
            </div>
          </div>

          {!created ? (
            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="block text-sm text-white/60 mb-2">Your Name</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="e.g. Alex"
                  maxLength={30}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2">Room Name</label>
                <input
                  type="text"
                  value={roomName}
                  onChange={e => setRoomName(e.target.value)}
                  placeholder="e.g. Friday Night Vibes"
                  maxLength={50}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-purple-500 transition-colors"
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
                  <><Loader2 size={18} className="animate-spin" /> Creating…</>
                ) : (
                  <><Users size={18} /> Create Room</>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-6 fade-in">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-purple-600/20 border border-purple-500/50 flex items-center justify-center mx-auto mb-4">
                  <Check size={28} className="text-purple-400" />
                </div>
                <h2 className="text-xl font-bold mb-1">Room Created!</h2>
                <p className="text-white/40 text-sm">Share the code or link to invite friends</p>
              </div>

              {/* Room code */}
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <p className="text-white/40 text-xs mb-2 uppercase tracking-wider">Room Code</p>
                <p className="text-4xl font-black tracking-widest text-purple-400">
                  {created.roomCode}
                </p>
              </div>

              {/* Invite link */}
              <div>
                <p className="text-white/40 text-xs mb-2 uppercase tracking-wider">Invite Link</p>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={created.inviteLink}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white/60 truncate focus:outline-none"
                  />
                  <button
                    onClick={copyLink}
                    className="px-3 py-2.5 glass rounded-xl hover:border-purple-500/50 transition-colors flex items-center gap-1.5 text-sm whitespace-nowrap"
                  >
                    {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              <button
                onClick={enterRoom}
                className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold transition-colors"
              >
                Enter Room →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
