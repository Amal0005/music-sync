import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Music2, Users, MessageSquare, ListMusic, Copy, Check, LogOut, Crown, Loader2 } from 'lucide-react';
import { useRoom } from '../hooks/useRoom';
import { buildInviteLink } from '../utils/roomUtils';
import YouTubePlayer from '../components/YouTubePlayer';
import SearchPanel from '../components/SearchPanel';
import Playlist from '../components/Playlist';
import ParticipantsPanel from '../components/ParticipantsPanel';
import ChatPanel from '../components/ChatPanel';

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || '';

const TABS = ['search', 'playlist', 'participants', 'chat'];
const TAB_META = {
  search:       { icon: <Music2 size={15} />,       label: 'Search'  },
  playlist:     { icon: <ListMusic size={15} />,    label: 'Queue'   },
  participants: { icon: <Users size={15} />,        label: 'People'  },
  chat:         { icon: <MessageSquare size={15} />, label: 'Chat'   },
};

export default function RoomPage() {
  const { roomCode } = useParams();
  const navigate = useNavigate();

  const [userInfo] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('syncify_user') || 'null'); }
    catch { return null; }
  });

  const userId   = userInfo?.userId;
  const username = userInfo?.username;

  const { roomData, participants, playlist, messages, playbackState, loading, error,
    addToPlaylist, removeFromPlaylist, updatePlayback, sendMessage } = useRoom(roomCode, userId, username);

  const isOwner = roomData?.ownerUserId === userId;

  const [currentSong, setCurrentSong] = useState(null);
  const [activeTab, setActiveTab]     = useState('search');
  const [copied, setCopied]           = useState(false);
  const [panelOpen, setPanelOpen]     = useState(true);

  useEffect(() => {
    if (isOwner || !playbackState?.videoId) return;
    const song = playlist.find(s => s.videoId === playbackState.videoId);
    if (song) setCurrentSong(song);
  }, [playbackState?.videoId, playlist, isOwner]);

  useEffect(() => {
    if (!userInfo) navigate(`/join?code=${roomCode}`);
  }, [userInfo, navigate, roomCode]);

  const handlePlaybackChange = useCallback((state) => {
    if (!isOwner) return;
    updatePlayback(state);
  }, [isOwner, updatePlayback]);

  const handleSelectSong = useCallback((song) => {
    if (!isOwner) return;
    setCurrentSong(song);
    updatePlayback({ videoId: song.videoId, isPlaying: true, currentTime: 0, playStartedAt: Date.now() });
  }, [isOwner, updatePlayback]);

  const handleEnded = useCallback((direction = 'next') => {
    if (!isOwner || !playlist.length || !currentSong) return;
    const idx = playlist.findIndex(s => s.videoId === currentSong.videoId);
    const nextIdx = direction === 'prev'
      ? (idx <= 0 ? playlist.length - 1 : idx - 1)
      : (idx >= playlist.length - 1 ? 0 : idx + 1);
    const next = playlist[nextIdx];
    if (next) handleSelectSong(next);
  }, [isOwner, playlist, currentSong, handleSelectSong]);

  const autoPlayedRef = useRef(false);
  useEffect(() => {
    if (isOwner && playlist.length > 0 && !currentSong && !autoPlayedRef.current) {
      autoPlayedRef.current = true;
      setCurrentSong(playlist[0]);
      updatePlayback({ videoId: playlist[0].videoId, isPlaying: false, currentTime: 0 });
    }
  }, [isOwner, playlist, currentSong, updatePlayback]);

  function copyInvite() {
    navigator.clipboard.writeText(buildInviteLink(roomCode));
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  if (!userInfo) return null;

  if (loading) return (
    <div className="min-h-screen bg-[#080b14] flex items-center justify-center">
      <Loader2 size={28} className="animate-spin text-cyan-500" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#080b14] flex flex-col items-center justify-center gap-4 text-white/40 p-4">
      <Music2 size={36} className="text-cyan-900" />
      <p className="text-center text-sm">{error}</p>
      <button onClick={() => navigate('/')} className="px-6 py-3 gradient-btn rounded-2xl text-sm font-medium">
        Back to Home
      </button>
    </div>
  );

  const SidebarContent = (
    <>
      {/* Tabs */}
      <div className="flex shrink-0 border-b border-white/5">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-all ${
              activeTab === tab
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-white/25 hover:text-white/50'
            }`}>
            {TAB_META[tab].icon}
            <span>{TAB_META[tab].label}</span>
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === 'search'       && <SearchPanel onAddSong={addToPlaylist} onPlayNow={handleSelectSong} playlist={playlist} youtubeApiKey={YOUTUBE_API_KEY} isOwner={isOwner} />}
        {activeTab === 'playlist'     && <Playlist playlist={playlist} currentSong={currentSong} onSelect={handleSelectSong} onRemove={removeFromPlaylist} isOwner={isOwner} />}
        {activeTab === 'participants' && <ParticipantsPanel participants={participants} ownerUserId={roomData?.ownerUserId} currentUserId={userId} />}
        {activeTab === 'chat'         && <ChatPanel messages={messages} onSend={sendMessage} currentUserId={userId} />}
      </div>
    </>
  );

  return (
    <div className="h-[100dvh] bg-[#080b14] flex flex-col overflow-hidden">

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-30%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/5 blur-[120px]" />
        <div className="absolute bottom-[10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-cyan-500/5 blur-[100px]" />
      </div>

      {/* ── Top bar ── */}
      <header className="relative shrink-0 flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#080b14]/80 backdrop-blur-xl">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl gradient-btn flex items-center justify-center shrink-0 shadow-lg">
            <Music2 size={14} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm truncate max-w-[130px] sm:max-w-xs">
                {roomData?.roomName || roomCode}
              </span>
              {isOwner && <Crown size={11} className="text-amber-400 shrink-0" />}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-white/25 mt-0.5">
              <span className="font-mono tracking-wider">{roomCode}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {participants.length} listening
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button onClick={copyInvite}
            className="flex items-center gap-1.5 px-3 py-1.5 glass rounded-xl text-xs hover:bg-white/8 transition-all">
            {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
            <span className="hidden sm:inline">{copied ? 'Copied!' : 'Invite'}</span>
          </button>
          <button onClick={() => navigate('/')}
            className="flex items-center gap-1.5 px-3 py-1.5 glass rounded-xl text-xs hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all">
            <LogOut size={11} />
            <span className="hidden sm:inline">Leave</span>
          </button>
        </div>
      </header>

      {/* ── Desktop: side-by-side ── */}
      <div className="hidden md:flex flex-1 overflow-hidden relative">
        {/* Album art */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
          {currentSong ? (
            <div className="text-center fade-in max-w-sm w-full">
              <div className="relative inline-block">
                <img src={currentSong.thumbnail} alt={currentSong.title}
                  className="w-64 h-64 rounded-3xl object-cover shadow-2xl glow-cyan-lg" />
                {playbackState?.isPlaying && (
                  <div className="absolute bottom-3 right-3 flex items-end gap-0.5 bg-black/70 rounded-xl px-2.5 py-2 backdrop-blur-sm">
                    {[0.5,1,0.6,0.9].map((h,i) => (
                      <div key={i} className="eq-bar" style={{ animationDelay: `${i*0.15}s`, height: `${h*14}px` }} />
                    ))}
                  </div>
                )}
              </div>
              <h2 className="mt-6 text-xl font-bold leading-tight">{currentSong.title}</h2>
              <p className="text-sm text-white/35 mt-1.5">{currentSong.channelTitle}</p>
              {/* Participant avatars */}
              {participants.length > 0 && (
                <div className="flex items-center justify-center gap-1 mt-5">
                  {participants.slice(0,5).map((p,i) => (
                    <div key={p.id} className="w-7 h-7 rounded-full gradient-btn flex items-center justify-center text-xs font-bold border-2 border-[#080b14]"
                      style={{ marginLeft: i > 0 ? '-6px': 0, zIndex: 5-i }}>
                      {(p.username||'?')[0].toUpperCase()}
                    </div>
                  ))}
                  {participants.length > 5 && <span className="text-xs text-white/25 ml-2">+{participants.length-5}</span>}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-white/15">
              <div className="w-64 h-64 rounded-3xl bg-white/3 border border-white/5 flex flex-col items-center justify-center gap-4 mx-auto">
                <Music2 size={48} className="text-white/8" />
                <p className="text-sm px-6">{isOwner ? 'Search and add songs to start' : 'Waiting for the host…'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-[320px] shrink-0 flex flex-col border-l border-white/5 bg-[#080b14]/60 backdrop-blur-xl">
          {SidebarContent}
        </div>
      </div>

      {/* ── Mobile layout ── */}
      <div className="flex md:hidden flex-1 flex-col overflow-hidden relative">
        {/* Album art area */}
        <div className="flex items-center justify-center py-4 px-6 relative"
          style={{ flex: panelOpen ? '0 0 auto' : '1 1 auto' }}>
          {currentSong ? (
            <div className="text-center fade-in">
              <div className="relative inline-block">
                <img src={currentSong.thumbnail} alt={currentSong.title}
                  className="w-32 h-32 rounded-2xl object-cover shadow-2xl glow-cyan" />
                {playbackState?.isPlaying && (
                  <div className="absolute bottom-2 right-2 flex items-end gap-0.5 bg-black/70 rounded-lg px-1.5 py-1">
                    {[0.5,1,0.6,0.9].map((h,i) => (
                      <div key={i} className="eq-bar" style={{ animationDelay: `${i*0.15}s`, height: `${h*12}px` }} />
                    ))}
                  </div>
                )}
              </div>
              <h2 className="mt-3 text-sm font-bold line-clamp-1 px-2">{currentSong.title}</h2>
              <p className="text-[11px] text-white/30 mt-0.5 truncate px-2">{currentSong.channelTitle}</p>
            </div>
          ) : (
            <div className="text-center text-white/15">
              <div className="w-28 h-28 rounded-2xl bg-white/3 border border-white/5 flex flex-col items-center justify-center gap-2 mx-auto">
                <Music2 size={28} className="text-white/8" />
                <p className="text-[10px] px-2">{isOwner ? 'Search songs' : 'Waiting…'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Slide-up panel */}
        <div className={`bg-[#0d1117] border-t border-white/5 flex flex-col transition-all duration-300 ${panelOpen ? 'flex-1' : 'h-10'}`}>
          <button onClick={() => setPanelOpen(o => !o)}
            className="w-full flex items-center justify-center py-2 shrink-0">
            <div className="w-10 h-1 bg-white/15 rounded-full" />
          </button>
          {panelOpen && <div className="flex flex-col flex-1 overflow-hidden">{SidebarContent}</div>}
        </div>
      </div>

      {/* ── Player bar ── */}
      <YouTubePlayer
        currentSong={currentSong}
        playbackState={playbackState}
        isOwner={isOwner}
        onPlaybackChange={handlePlaybackChange}
        onEnded={handleEnded}
      />
    </div>
  );
}
