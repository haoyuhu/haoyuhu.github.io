import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

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
    if (!audio) return;

    const updateProgress = () => {
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    const setAudioDuration = () => {
      setDuration(audio.duration);
    };

    const onEnded = () => {
        setIsPlaying(false);
        setProgress(0);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', setAudioDuration);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', setAudioDuration);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioRef.current) {
        audioRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (audioRef.current) {
        const bounds = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - bounds.left;
        const width = bounds.width;
        const percent = x / width;
        audioRef.current.currentTime = percent * audioRef.current.duration;
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-ide-sidebar border border-ide-border rounded p-3 font-mono text-xs select-none group">
      <audio ref={audioRef} src={src} />
      
      <div className="flex items-center gap-3">
        <button 
            onClick={togglePlay}
            className="w-8 h-8 flex items-center justify-center bg-geek-orange text-white rounded hover:bg-geek-orange/90 transition-colors shrink-0"
        >
          {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
        </button>

        <div className="flex-1 space-y-1">
            <div className="flex justify-between text-ide-text-dim text-[10px] uppercase tracking-wider">
                <span>Audio_Stream</span>
                <span>{formatTime(audioRef.current?.currentTime || 0)} / {formatTime(duration)}</span>
            </div>
            
            {/* Progress Bar */}
            <div 
                className="h-4 bg-ide-bg border border-ide-border rounded cursor-pointer relative overflow-hidden"
                onClick={handleSeek}
            >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10" 
                    style={{ backgroundImage: 'linear-gradient(90deg, transparent 50%, #000 50%)', backgroundSize: '4px 100%' }} 
                />
                
                {/* Progress Fill */}
                <div 
                    className="absolute top-0 left-0 bottom-0 bg-geek-orange/80 transition-all duration-100 ease-linear"
                    style={{ width: `${progress}%` }}
                ></div>
                
                {/* Playhead */}
                <div 
                    className="absolute top-0 bottom-0 w-0.5 bg-ide-text"
                    style={{ left: `${progress}%` }}
                ></div>
            </div>
        </div>

        <button onClick={toggleMute} className="text-ide-text-dim hover:text-ide-text shrink-0">
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>
      </div>
    </div>
  );
};

export default AudioPlayer;