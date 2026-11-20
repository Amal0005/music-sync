import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Music, Users, MessageSquare, ListMusic,
  Copy, Check, LogOut, Crown, Loader2, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useRoom } from '../hooks/useRoom';
import { buildInviteLink } from '../utils/roomUtils';
import YouTubePlayer from '../components/YouTubePlayer';
import SearchPanel from '../components/SearchPanel';
import Playlist from '../components/Playlist';
import ParticipantsPanel from '../components/ParticipantsPanel';
import ChatPanel from '../components/ChatPanel';

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || '';

const TABS = ['search', 'playlist', 'participants', 'chat'];
const TAB_ICONS = {
  playlist:     <ListMusic size={16} />,
  search:       <Music size={16} />,
  participants: <Users size={16} />,
  chat:         <MessageSquare size={16} />,
};
const TAB_LABELS = {
  playlist:     'Queue',
  search:       'Search',
  participants: 'People',
  chat:         'Chat',
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

  const {
    roomData, participants, playlist, messages,
    playbackState, loading, error,
    addToPlaylist, removeFromPlaylist, updatePlayback, sendMessage,
  } = useRoom(roomCode, userId, username);

  const isOwner = roomData?.ownerUserId === userId;

  const [currentSong, setCurrentSong]   = useState(null);
  const [activeTab, setActiveTab]       = useState('search');
  const [copied, setCopied]             = useState(false);
  // Mobile: whether the bottom panel is expanded
  const [panelOpen, setPanelOpen]       = useState(true);

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
    updatePlayback({ videoId: song.videoId, isPlaying: true, currentTime: 0 });
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
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!userInfo) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-purple-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-4 text-white/60 p-4">
        <Music size={40} className="text-purple-700" />
        <p className="text-center">{error}</p>
        <button onClick={() => navigate('/')} className="px-6 py-3 bg-purple-600 rounded-xl hover:bg-purple-500 text-white">
          Back to Home
        </button>
      </div>
    );
  }

  const SidebarContent = (
    <>
      {/* Tabs */}
      <div className="flex border-b border-white/5 shrink-0">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-xs transition-colors ${
              activeTab === tab
                ? 'text-purple-400 border-b-2 border-purple-500'
                : 'text-white/30 hover:text-white/60'
            }`}
          >
            {TAB_ICONS[tab]}
            <span className="hidden sm:inline">{TAB_LABELS[tab]}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === 'search' && (
          <SearchPanel onAddSong={addToPlaylist} playlist={playlist} youtubeApiKey={YOUTUBE_API_KEY} />
        )}
        {activeTab === 'playlist' && (
          <Playlist playlist={playlist} currentSong={currentSong} onSelect={handleSelectSong} onRemove={removeFromPlaylist} isOwner={isOwner} />
        )}
        {activeTab === 'participants' && (
          <ParticipantsPanel participants={participants} ownerUserId={roomData?.ownerUserId} currentUserId={userId} />
        )}
        {activeTab === 'chat' && (
          <ChatPanel messages={messages} onSend={sendMessage} currentUserId={userId} />
        )}
      </div>
    </>
  );

  return (
    <div className="h-[100dvh] bg-[#0a0a0a] flex flex-col overflow-hidden">

      {/* ── Top Bar ── */}
      <header className="shrink-0 flex items-center justify-between px-3 sm:px-4 py-2.5 bg-[#111] border-b border-white/5">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center shrink-0">
            <Music size={13} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm truncate max-w-[120px] sm:max-w-none">
                {roomData?.roomName || roomCode}
              </span>
              {isOwner && <Crown size={11} className="text-yellow-400 shrink-0" />}
            </div>
            <div className="flex items-center gap-1 text-xs text-white/30">
              <span className="font-mono">{roomCode}</span>
              <span>·</span>
              <span>{participants.length} listener{participants.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={copyInvite}
            className="flex items-center gap-1 px-2.5 py-1.5 glass rounded-lg text-xs hover:border-purple-500/50 transition-colors"
          >
            {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Invite'}</span>
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1 px-2.5 py-1.5 glass rounded-lg text-xs hover:border-red-500/50 hover:text-red-400 transition-colors"
          >
            <LogOut size={12} />
            <span className="hidden sm:inline">Leave</span>
          </button>
        </div>
      </header>

      {/* ── DESKTOP layout: side-by-side ── */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        {/* Album art area */}
        <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-96 h-96 rounded-full bg-purple-900/10 blur-[80px]" />
          </div>
          {currentSong ? (
            <div className="relative text-center max-w-xs fade-in">
              <div className="relative inline-block">
                <img
                  src={currentSong.thumbnail}
                  alt={currentSong.title}
                  className="w-56 h-56 md:w-64 md:h-64 rounded-2xl object-cover glow-purple-lg shadow-2xl"
                />
                {playbackState?.isPlaying && (
                  <div className="absolute bottom-3 right-3 flex items-end gap-0.5 bg-black/60 rounded-lg px-2 py-1.5">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="w-0.5 bg-purple-400 rounded-full"
                        style={{ height: `${8 + (i % 2 === 0 ? 6 : 10)}px`, animation: `pulse-purple 0.8s ease-in-out infinite`, animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                )}
              </div>
              <h2 className="mt-4 text-lg font-bold leading-tight px-2">{currentSong.title}</h2>
              <p className="text-sm text-white/40 mt-1">{currentSong.channelTitle}</p>
            </div>
          ) : (
            <div className="text-center text-white/20">
              <div className="w-56 h-56 rounded-2xl bg-white/3 border border-white/5 flex flex-col items-center justify-center gap-4">
                <Music size={48} className="text-white/10" />
                <p className="text-sm px-4">{isOwner ? 'Search and add songs to start' : 'Waiting for the owner…'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="w-80 shrink-0 flex flex-col border-l border-white/5 bg-[#0e0e0e]">
          {SidebarContent}
        </div>
      </div>

      {/* ── MOBILE layout: album art + bottom panel ── */}
      <div className="flex md:hidden flex-1 flex-col overflow-hidden relative">

        {/* Album art — fills space above panel */}
        <div
          className="flex items-center justify-center relative overflow-hidden transition-all duration-300"
          style={{ flex: panelOpen ? '0 0 auto' : '1 1 auto', paddingTop: panelOpen ? '1rem' : '2rem', paddingBottom: panelOpen ? '0.5rem' : '2rem' }}
        >
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-64 rounded-full bg-purple-900/15 blur-[60px]" />
          </div>
          {currentSong ? (
            <div className="text-center fade-in px-4">
              <div className="relative inline-block">
                <img
                  src={currentSong.thumbnail}
                  alt={currentSong.title}
                  className="w-36 h-36 rounded-2xl object-cover glow-purple-lg shadow-2xl"
                />
                {playbackState?.isPlaying && (
                  <div className="absolute bottom-2 right-2 flex items-end gap-0.5 bg-black/60 rounded-md px-1.5 py-1">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="w-0.5 bg-purple-400 rounded-full"
                        style={{ height: `${6 + (i % 2 === 0 ? 4 : 8)}px`, animation: `pulse-purple 0.8s ease-in-out infinite`, animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                )}
              </div>
              <h2 className="mt-3 text-base font-bold leading-tight px-2 line-clamp-1">{currentSong.title}</h2>
              <p className="text-xs text-white/40 mt-0.5 truncate px-2">{currentSong.channelTitle}</p>
            </div>
          ) : (
            <div className="text-center text-white/20 px-4">
              <div className="w-32 h-32 rounded-2xl bg-white/3 border border-white/5 flex flex-col items-center justify-center gap-2 mx-auto">
                <Music size={32} className="text-white/10" />
                <p className="text-xs px-2">{isOwner ? 'Search for songs' : 'Waiting…'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom slide-up panel */}
        <div
          className={`bg-[#0e0e0e] border-t border-white/5 flex flex-col transition-all duration-300 ${
            panelOpen ? 'flex-1' : 'h-12'
          }`}
        >
          {/* Panel handle / toggle */}
          <button
            onClick={() => setPanelOpen(o => !o)}
            className="w-full flex items-center justify-center py-2 text-white/30 hover:text-white/60 transition-colors shrink-0"
          >
            <div className="w-8 h-1 bg-white/20 rounded-full" />
          </button>

          {panelOpen && (
            <div className="flex flex-col flex-1 overflow-hidden">
              {SidebarContent}
            </div>
          )}
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
