import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Volume1 } from 'lucide-react';

const TRACKS = [
  { id: 1, title: 'SYNTHETIC AWAKENING / TRACK 01', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 2, title: 'CYBERPULSE OVERRIDE / TRACK 02', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 3, title: 'NEON GRIME PARADOX / TRACK 03', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
];

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => {
          console.error("Autoplay blocked or audio load error:", e);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const duration = audioRef.current.duration;
      const current = audioRef.current.currentTime;
      if (duration > 0) {
        setProgress((current / duration) * 100);
      }
    }
  };

  const toggleMute = () => {
    if (volume > 0) {
      setVolume(0);
    } else {
      setVolume(0.5);
    }
  };

  return (
    <section className="bg-black/40 border border-[#39ff14]/20 p-4 relative overflow-hidden font-mono w-full flex flex-col gap-4">
      <audio
        ref={audioRef}
        src={TRACKS[currentTrackIndex].url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={nextTrack}
        preload="auto"
      />
      
      {/* Display */}
      <h2 className="text-[10px] uppercase tracking-widest text-[#39ff14] flex items-center gap-2">
         <span className="w-2 h-2 bg-[#39ff14] rounded-full animate-pulse"></span> Audio Matrix
      </h2>
      
      <div className="bg-[#39ff14]/10 border-l-2 border-[#39ff14] p-3 flex flex-col gap-1 relative z-10 w-full">
        <div className="flex justify-between items-end">
           <div className="text-xs font-bold text-white whitespace-nowrap overflow-hidden text-ellipsis pr-4">
             {TRACKS[currentTrackIndex].title}
           </div>
           <div className="flex gap-0.5 opacity-80 shrink-0">
             {[...Array(3)].map((_, i) => (
               <div key={i} className="w-1 bg-[#39ff14]" style={{ height: '8px', animation: isPlaying ? `flicker ${0.2 + i * 0.1}s infinite` : 'none', opacity: isPlaying ? 1 : 0.2 }} />
             ))}
           </div>
        </div>
        <div className="text-[10px] opacity-60 uppercase mt-1 text-[#39ff14]">SYSTEM GEN // PLAYBACK ACTIVE</div>
      </div>

      {/* Progress */}
      <div className="mt-1 h-1.5 w-full bg-white/5 relative z-10">
        <div 
          className="absolute top-0 left-0 h-full bg-[#39ff14] shadow-[0_0_8px_#39ff14] transition-all duration-100" 
          style={{ width: `${progress}%` }}
        />
        {progress > 0 && (
           <div 
             className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg border border-[#39ff14] transition-all duration-100"
             style={{ left: `max(0%, calc(${progress}% - 6px))` }}
           />
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between z-10 relative mt-2">
        <div className="flex items-center gap-4">
          <button 
            onClick={prevTrack} 
            className="text-white/40 hover:text-white transition-colors active:scale-95"
            aria-label="Previous Track"
          >
            <SkipBack size={24} />
          </button>
          
          <button 
            onClick={togglePlay} 
            className="p-3 bg-white text-black hover:bg-[#39ff14] transition-all active:scale-95"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause size={24} className="fill-current" /> : <Play size={24} className="fill-current" />}
          </button>
          
          <button 
            onClick={nextTrack} 
            className="text-white/40 hover:text-white transition-colors active:scale-95"
            aria-label="Next Track"
          >
            <SkipForward size={24} />
          </button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-3">
          <button onClick={toggleMute} className="text-white/40 hover:text-white transition-colors">
             {volume === 0 ? <VolumeX size={18} /> : volume < 0.5 ? <Volume1 size={18} /> : <Volume2 size={18} />}
          </button>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-20 transition-all h-1 bg-white/10 appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white hover:[&::-webkit-slider-thumb]:bg-[#39ff14]"
          />
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none z-0"></div>
    </section>
  );
}
