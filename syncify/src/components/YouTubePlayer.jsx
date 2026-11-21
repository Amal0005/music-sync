import { useEffect, useRef, useCallback, useState } from 'react';
import { useYouTubePlayer } from '../hooks/useYouTubePlayer';
import { Play, Pause, SkipForward, SkipBack } from 'lucide-react';
import { formatTime } from '../utils/roomUtils';

const YT_STATES = { UNSTARTED: -1, ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3, CUED: 5 };

export default function YouTubePlayer({ currentSong, playbackState, isOwner, onPlaybackChange, onEnded }) {
  const [localProgress, setLocalProgress] = useState(0);
  const [localDuration, setLocalDuration] = useState(0);
  const progressInterval  = useRef(null);
  const lastSyncRef       = useRef(0);
  const isPlayingRef      = useRef(false);
  const resumingRef       = useRef(false);
  const playbackStateRef  = useRef(playbackState);
  const currentSongRef    = useRef(currentSong);
  useEffect(() => { playbackStateRef.current = playbackState; }, [playbackState]);
  useEffect(() => { currentSongRef.current   = currentSong;   }, [currentSong]);
  const playerContainerId = 'yt-player-container';

  function calcCurrentPosition(pb) {
    if (!pb || !pb.isPlaying) return pb?.currentTime || 0;
    const elapsed = (Date.now() - (pb.playStartedAt || pb.updatedAt || Date.now())) / 1000;
    return (pb.currentTime || 0) + elapsed;
  }

  const handleStateChange = useCallback((e) => {
    if (e.data === YT_STATES.PLAYING)  isPlayingRef.current = true;
    if (e.data === YT_STATES.PAUSED)   isPlayingRef.current = false;
    if (e.data === YT_STATES.ENDED)    isPlayingRef.current = false;
    if (e.data === YT_STATES.PLAYING) {
      const t = e.target.getCurrentTime();
      onPlaybackChange({ isPlaying: true, currentTime: t, videoId: currentSongRef.current?.videoId, playStartedAt: Date.now() });
    } else if (e.data === YT_STATES.PAUSED) {
      if (document.visibilityState === 'hidden') return;
      if (resumingRef.current) return;
      onPlaybackChange({ isPlaying: false, currentTime: e.target.getCurrentTime(), videoId: currentSongRef.current?.videoId, playStartedAt: null });
    } else if (e.data === YT_STATES.ENDED) {
      onPlaybackChange({ isPlaying: false, currentTime: 0, videoId: currentSongRef.current?.videoId, playStartedAt: null });
      onEnded && onEnded();
    }
  }, [onPlaybackChange, onEnded]);

  const { playerReady, loadVideo, play, pause, seekTo, getCurrentTime, getDuration, getPlayerState } =
    useYouTubePlayer({ containerId: playerContainerId, onStateChange: handleStateChange });

  useEffect(() => {
    if (!playerReady || !currentSong?.videoId) return;
    loadVideo(currentSong.videoId, true);
  }, [currentSong?.videoId, playerReady]); // eslint-disable-line

  // Sync all clients to Firebase playback state
  useEffect(() => {
    if (!playerReady || !playbackState) return;
    const now = Date.now();
    if (now - lastSyncRef.current < 1000) return;
    lastSyncRef.current = now;
    const targetTime = calcCurrentPosition(playbackState);
    const drift = Math.abs(targetTime - getCurrentTime());
    if (playbackState.isPlaying) {
      if (drift > 2) seekTo(targetTime);
      if (getPlayerState() !== YT_STATES.PLAYING) play();
    } else {
      if (drift > 0.5) seekTo(playbackState.currentTime);
      if (getPlayerState() === YT_STATES.PLAYING) pause();
    }
  }, [playbackState, playerReady, play, pause, seekTo, getCurrentTime, getPlayerState]);

  useEffect(() => {
    if (!playerReady || !playbackState?.videoId) return;
    if (currentSong?.videoId !== playbackState.videoId)
      loadVideo(playbackState.videoId, playbackState.isPlaying);
  }, [playbackState?.videoId, playerReady, currentSong?.videoId, loadVideo]);

  useEffect(() => {
    if (!playerReady) return;
    function onShow() {
      if (!isPlayingRef.current && !(playbackStateRef.current?.isPlaying)) return;
      resumingRef.current = true;
      setTimeout(() => {
        const pb = playbackStateRef.current;
        const resumeTime = calcCurrentPosition(pb);
        seekTo(resumeTime); play();
        onPlaybackChange({ isPlaying: true, currentTime: resumeTime, videoId: currentSongRef.current?.videoId, playStartedAt: Date.now() - resumeTime * 1000 });
        setTimeout(() => { resumingRef.current = false; }, 600);
      }, 250);
    }
    const onVis = () => { if (document.visibilityState === 'visible') onShow(); };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('focus', onShow);
    return () => { document.removeEventListener('visibilitychange', onVis); window.removeEventListener('focus', onShow); };
  }, [playerReady, play, seekTo, onPlaybackChange]);

  useEffect(() => {
    progressInterval.current = setInterval(() => {
      if (!playerReady) return;
      setLocalProgress(getCurrentTime());
      setLocalDuration(getDuration());
    }, 500);
    return () => clearInterval(progressInterval.current);
  }, [playerReady, getCurrentTime, getDuration]);

  function handlePlayPause() {
    if (!currentSong) return;
    getPlayerState() === YT_STATES.PLAYING ? pause() : play();
  }

  function handleSeek(e) {
    const newTime = (parseFloat(e.target.value) / 100) * localDuration;
    seekTo(newTime);
    onPlaybackChange({ isPlaying: getPlayerState() === YT_STATES.PLAYING, currentTime: newTime, videoId: currentSong?.videoId, playStartedAt: getPlayerState() === YT_STATES.PLAYING ? Date.now() - newTime * 1000 : null });
  }

  const isPlaying   = getPlayerState() === YT_STATES.PLAYING;
  const progressPct = localDuration > 0 ? (localProgress / localDuration) * 100 : 0;

  return (
    <div className="bg-[#0d1117] border-t border-white/5 shrink-0 relative">
      {/* iframe lives inside the player bar — always on-screen so browsers never throttle it.
          Clipped to 1×1 px visually but fully rendered at 160×90 internally. */}
      <div style={{
        position: 'absolute', bottom: 0, right: 0,
        width: '1px', height: '1px',
        overflow: 'hidden', pointerEvents: 'none',
      }}>
        <div id={playerContainerId} style={{ width: '160px', height: '90px' }} />
      </div>
      {/* Silent looping audio — keeps the audio session alive on mobile Safari */}
      <audio src="/silence.mp3" loop autoPlay muted={false} style={{ display: 'none' }} />

      <div className="px-4 pt-2.5 pb-4 max-w-screen-xl mx-auto">
        {/* Progress bar */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-[10px] text-white/25 w-8 text-right tabular-nums">{formatTime(localProgress)}</span>
          <div className="relative flex-1 h-1 group">
            <input type="range" min={0} max={100} step={0.1} value={progressPct}
              onChange={handleSeek}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            <div className="h-full rounded-full bg-white/8">
              <div className="h-full rounded-full transition-all"
                style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg,#22d3ee,#818cf8)' }} />
            </div>
          </div>
          <span className="text-[10px] text-white/25 w-8 tabular-nums">{formatTime(localDuration)}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-3">
          {/* Song info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {currentSong ? (
              <>
                <img src={currentSong.thumbnail} alt={currentSong.title}
                  className="w-10 h-10 rounded-xl object-cover shrink-0 shadow-lg" />
                <div className="min-w-0 hidden sm:block">
                  <p className="text-sm font-semibold truncate leading-tight">{currentSong.title}</p>
                  <p className="text-[11px] text-white/35 truncate mt-0.5">{currentSong.channelTitle}</p>
                </div>
              </>
            ) : (
              <p className="text-xs text-white/20">No song playing</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <button onClick={() => onEnded && onEnded('prev')}
              className="p-2 text-white/30 hover:text-white transition-all hover:bg-white/5 rounded-xl">
              <SkipBack size={18} />
            </button>
            <button onClick={handlePlayPause} disabled={!currentSong}
              className="w-11 h-11 rounded-2xl gradient-btn disabled:opacity-30 flex items-center justify-center transition-all hover:opacity-90 shadow-lg shadow-cyan-500/20 shrink-0">
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button onClick={() => onEnded && onEnded('next')}
              className="p-2 text-white/30 hover:text-white transition-all hover:bg-white/5 rounded-xl">
              <SkipForward size={18} />
            </button>
          </div>

          <div className="flex-1" />
        </div>
      </div>
    </div>
  );
}
