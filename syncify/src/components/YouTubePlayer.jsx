import { useEffect, useRef, useCallback, useState } from 'react';
import { useYouTubePlayer } from '../hooks/useYouTubePlayer';
import { Play, Pause, SkipForward, SkipBack } from 'lucide-react';
import { formatTime } from '../utils/roomUtils';

const YT_STATES = { UNSTARTED: -1, ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3, CUED: 5 };

export default function YouTubePlayer({
  currentSong, playbackState, isOwner, onPlaybackChange, onEnded,
}) {
  const [localProgress, setLocalProgress] = useState(0);
  const [localDuration, setLocalDuration] = useState(0);
  const progressInterval = useRef(null);
  const lastSyncRef = useRef(0);

  // Track when the page was hidden and whether we were playing
  const hiddenAtRef   = useRef(null);
  const wasPlayingRef = useRef(false);

  const playerContainerId = 'yt-player-container';

  const handleStateChange = useCallback((e) => {
    if (!isOwner) return;
    if (e.data === YT_STATES.PLAYING) {
      onPlaybackChange({ isPlaying: true, currentTime: e.target.getCurrentTime(), videoId: currentSong?.videoId });
    } else if (e.data === YT_STATES.PAUSED) {
      // Ignore programmatic pauses that happen when the tab is hidden
      if (document.visibilityState === 'hidden') return;
      onPlaybackChange({ isPlaying: false, currentTime: e.target.getCurrentTime(), videoId: currentSong?.videoId });
    } else if (e.data === YT_STATES.ENDED) {
      onPlaybackChange({ isPlaying: false, currentTime: 0, videoId: currentSong?.videoId });
      onEnded && onEnded();
    }
  }, [isOwner, onPlaybackChange, onEnded, currentSong]);

  const { playerReady, loadVideo, play, pause, seekTo, getCurrentTime, getDuration, getPlayerState } =
    useYouTubePlayer({ containerId: playerContainerId, onStateChange: handleStateChange });

  // ── Page Visibility: resume + resync on tab restore ──────────
  useEffect(() => {
    if (!playerReady) return;

    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        // Record the moment and playing state when tab hid
        hiddenAtRef.current   = Date.now();
        wasPlayingRef.current = getPlayerState() === YT_STATES.PLAYING;
      } else {
        // Tab is visible again
        if (!wasPlayingRef.current) return; // was paused before — leave it

        const hiddenMs = hiddenAtRef.current ? Date.now() - hiddenAtRef.current : 0;

        // For the owner: seek forward by the hidden duration so the
        // position stays correct, then resume.
        if (isOwner) {
          const resumeTime = getCurrentTime() + hiddenMs / 1000;
          seekTo(resumeTime);
          play();
          onPlaybackChange({ isPlaying: true, currentTime: resumeTime, videoId: currentSong?.videoId });
        } else {
          // Non-owner: re-sync to Firebase state (the owner kept playing)
          if (!playbackState) return;
          const elapsed = (Date.now() - playbackState.updatedAt) / 1000;
          const targetTime = playbackState.currentTime + elapsed;
          seekTo(targetTime);
          if (playbackState.isPlaying) play();
        }

        hiddenAtRef.current = null;
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [playerReady, isOwner, play, seekTo, getCurrentTime, getPlayerState, currentSong, playbackState, onPlaybackChange]);

  // ── Load video when song changes ─────────────────────────────
  useEffect(() => {
    if (!playerReady || !currentSong?.videoId) return;
    loadVideo(currentSong.videoId, false);
  }, [currentSong?.videoId, playerReady, loadVideo]);

  // ── Non-owner: sync from Firebase ────────────────────────────
  useEffect(() => {
    if (!playerReady || !playbackState || isOwner) return;
    const now = Date.now();
    if (now - lastSyncRef.current < 1000) return;
    lastSyncRef.current = now;

    const remoteTime = playbackState.currentTime || 0;
    const localTime  = getCurrentTime();
    const drift      = Math.abs(remoteTime - localTime);

    if (playbackState.isPlaying) {
      const adjustedTime = remoteTime + (now - playbackState.updatedAt) / 1000;
      if (drift > 2) seekTo(adjustedTime);
      if (getPlayerState() !== YT_STATES.PLAYING) play();
    } else {
      if (drift > 0.5) seekTo(remoteTime);
      if (getPlayerState() === YT_STATES.PLAYING) pause();
    }
  }, [playbackState, playerReady, isOwner, play, pause, seekTo, getCurrentTime, getPlayerState]);

  // ── Non-owner: load new video when owner changes song ────────
  useEffect(() => {
    if (!playerReady || !playbackState?.videoId || isOwner) return;
    if (currentSong?.videoId !== playbackState.videoId) {
      loadVideo(playbackState.videoId, playbackState.isPlaying);
    }
  }, [playbackState?.videoId, playerReady, isOwner, currentSong?.videoId, loadVideo]);

  // ── Progress tick ─────────────────────────────────────────────
  useEffect(() => {
    progressInterval.current = setInterval(() => {
      if (!playerReady) return;
      setLocalProgress(getCurrentTime());
      setLocalDuration(getDuration());
    }, 500);
    return () => clearInterval(progressInterval.current);
  }, [playerReady, getCurrentTime, getDuration]);

  function handlePlayPause() {
    if (!isOwner) return;
    getPlayerState() === YT_STATES.PLAYING ? pause() : play();
  }

  function handleSeek(e) {
    if (!isOwner) return;
    const newTime = (parseFloat(e.target.value) / 100) * localDuration;
    seekTo(newTime);
    onPlaybackChange({ isPlaying: getPlayerState() === YT_STATES.PLAYING, currentTime: newTime, videoId: currentSong?.videoId });
  }

  const isPlaying   = getPlayerState() === YT_STATES.PLAYING;
  const progressPct = localDuration > 0 ? (localProgress / localDuration) * 100 : 0;

  return (
    <div className="bg-[#111] border-t border-white/5 shrink-0">
      {/* Hidden YT player — must stay in DOM */}
      <div className="hidden"><div id={playerContainerId} /></div>

      <div className="px-3 sm:px-4 pt-2 pb-3 flex flex-col gap-2">
        {/* Progress bar */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/30 w-8 text-right tabular-nums">{formatTime(localProgress)}</span>
          <input
            type="range" min={0} max={100} step={0.1} value={progressPct}
            onChange={handleSeek} disabled={!isOwner}
            className={`flex-1 h-1 rounded-full appearance-none ${isOwner ? 'cursor-pointer' : 'cursor-default'}`}
            style={{ background: `linear-gradient(to right, #9333ea ${progressPct}%, rgba(255,255,255,0.1) ${progressPct}%)` }}
          />
          <span className="text-xs text-white/30 w-8 tabular-nums">{formatTime(localDuration)}</span>
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between gap-2">

          {/* Song info */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {currentSong ? (
              <>
                <img src={currentSong.thumbnail} alt={currentSong.title}
                  className="w-9 h-9 rounded-lg object-cover shrink-0" />
                <div className="min-w-0 hidden sm:block">
                  <p className="text-sm font-medium truncate leading-tight">{currentSong.title}</p>
                  <p className="text-xs text-white/40 truncate">{currentSong.channelTitle}</p>
                </div>
              </>
            ) : (
              <p className="text-xs text-white/30">No song</p>
            )}
          </div>

          {/* Playback buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <button onClick={() => onEnded && onEnded('prev')} disabled={!isOwner}
              className="text-white/40 hover:text-white disabled:opacity-30 transition-colors p-1">
              <SkipBack size={20} />
            </button>
            <button onClick={handlePlayPause} disabled={!isOwner || !currentSong}
              className="w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-500 disabled:opacity-40 flex items-center justify-center transition-colors shrink-0">
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button onClick={() => onEnded && onEnded('next')} disabled={!isOwner}
              className="text-white/40 hover:text-white disabled:opacity-30 transition-colors p-1">
              <SkipForward size={20} />
            </button>
          </div>

          {/* Right hint */}
          <div className="flex-1 justify-end hidden sm:flex">
            {!isOwner && <span className="text-xs text-white/20 italic">Owner controls playback</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
