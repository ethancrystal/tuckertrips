'use client'

import React, { useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

const VideoSection = () => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-[#3a4d6f] to-[#4a5d7f]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            The Transformative Power of Travel
          </h2>
        </div>

        {/* Video Player */}
        <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black group">
          <video
            ref={videoRef}
            className="w-full aspect-video"
            muted={isMuted}
            loop
            playsInline
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          >
            <source src="https://customer-assets.emergentagent.com/job_43a6966a-d890-4dd3-91aa-8c7f1d773745/artifacts/9o1y7nx5_tucker-trips_compressed.webm" type="video/webm" />
          </video>

          {/* Video Controls Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <Button
                onClick={togglePlay}
                className="bg-white/90 hover:bg-white text-[#3a4d6f] rounded-full w-12 h-12 flex items-center justify-center shadow-lg"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </Button>
              
              <Button
                onClick={toggleMute}
                className="bg-white/90 hover:bg-white text-[#3a4d6f] rounded-full w-12 h-12 flex items-center justify-center shadow-lg"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Play Button Center (when paused) */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                onClick={togglePlay}
                className="bg-[#ec4899] hover:bg-[#db2777] text-white rounded-full w-20 h-20 flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-300"
              >
                <Play className="w-10 h-10 ml-1" />
              </Button>
            </div>
          )}
        </div>

      </div>
    </section>
  );
};

export default VideoSection;