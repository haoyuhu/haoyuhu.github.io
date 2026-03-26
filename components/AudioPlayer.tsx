import React, { useEffect, useRef, useState } from 'react';
import { Pause, Play, Volume2, VolumeX } from 'lucide-react';

interface AudioPlayerProps {
  src: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    const updateProgress = () => {
      if (!audio.duration) {
        return;
      }
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    const updateDuration = () => setDuration(audio.duration);
    const onEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    if (isPlaying) {
      audio.pause();
    } else {
      void audio.play();
    }
    setIsPlaying((current) => !current);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    audio.muted = !isMuted;
    setIsMuted((current) => !current);
  };

  const formatTime = (time: number) => {
    if (!Number.isFinite(time)) {
      return '00:00';
    }
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div className="rounded border border-ide-border bg-ide-panel p-3 font-mono text-xs">
      <audio ref={audioRef} src={src} />
      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          className="flex h-8 w-8 items-center justify-center rounded bg-accent text-white transition-colors hover:bg-accent/90"
          aria-label="Toggle audio"
        >
          {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
        </button>
        <div className="flex-1 space-y-1">
          <div className="flex justify-between text-[10px] uppercase tracking-wider text-ide-text-dim">
            <span>Audio Stream</span>
            <span>
              {formatTime(audioRef.current?.currentTime || 0)} / {formatTime(duration)}
            </span>
          </div>
          <div className="relative h-3 overflow-hidden rounded border border-ide-border bg-ide-bg">
            <div className="absolute inset-y-0 left-0 bg-accent/80" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <button onClick={toggleMute} className="text-ide-text-dim transition-colors hover:text-ide-text" aria-label="Toggle mute">
          {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>
      </div>
    </div>
  );
};

export default AudioPlayer;
