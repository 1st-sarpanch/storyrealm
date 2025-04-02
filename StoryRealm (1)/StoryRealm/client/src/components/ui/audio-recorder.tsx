import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, Square, Play, Pause, Volume2, Upload, Trash } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";

interface AudioRecorderProps {
  onSave: (audioBlob: Blob) => void;
  existingAudioUrl?: string;
}

export function AudioRecorder({ onSave, existingAudioUrl }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(existingAudioUrl || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (existingAudioUrl) {
      setAudioUrl(existingAudioUrl);
    }
    
    // Set up audio element
    const audio = new Audio();
    audioRef.current = audio;
    
    if (audioUrl) {
      audio.src = audioUrl;
      
      audio.onloadedmetadata = () => {
        setDuration(audio.duration);
      };
      
      audio.ontimeupdate = () => {
        setCurrentTime(audio.currentTime);
      };
      
      audio.onended = () => {
        setIsPlaying(false);
      };
    }
    
    // Clean up
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (audioUrl && !existingAudioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl, existingAudioUrl]);

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioChunks(chunks);
        setAudioBlob(blob);
        setAudioUrl(url);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
      toast({
        title: "Recording started",
        description: "Start telling your story...",
      });
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to record audio.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all audio tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      
      toast({
        title: "Recording complete",
        description: "Your recording is ready to play or save.",
      });
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleSave = () => {
    if (audioBlob) {
      onSave(audioBlob);
      toast({
        title: "Audio saved",
        description: "Your recording has been saved successfully.",
      });
    }
  };

  const handleSliderChange = (value: number[]) => {
    if (audioRef.current && audioUrl) {
      const newTime = (value[0] / 100) * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0] / 100);
  };

  const handleDelete = () => {
    setAudioBlob(null);
    setAudioChunks([]);
    if (audioUrl && !existingAudioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    
    toast({
      title: "Recording deleted",
      description: "Your recording has been removed.",
    });
  };

  return (
    <div className="bg-neutral p-6 rounded-xl shadow-2xl border border-secondary">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-heading text-highlight">Audio Storyteller</h3>
        <div className="flex gap-3">
          {audioBlob && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSave}
              className="text-gray-400 hover:text-gray-200"
            >
              <Upload className="h-5 w-5 mr-1" /> Save
            </Button>
          )}
        </div>
      </div>
      
      <div className="bg-primary/50 rounded-lg p-4 mb-6 border border-secondary">
        {audioUrl ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-300 font-body">
                <span className="text-highlight font-medium">Your Recording</span>
                <span className="text-sm ml-2">{formatTime(currentTime)} / {formatTime(duration)}</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleDelete} 
                className="text-gray-400 hover:text-red-500"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="relative mb-4">
              <Slider
                value={[duration ? (currentTime / duration) * 100 : 0]}
                onValueChange={handleSliderChange}
                className="mb-1"
              />
            </div>
            
            <div className={`audio-visualizer mx-auto mb-4 ${isPlaying ? 'playing' : ''}`}>
              {[...Array(8)].map((_, i) => (
                <div key={i} className="audio-bar"></div>
              ))}
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2 w-1/3">
                <Volume2 className="h-4 w-4 text-gray-400" />
                <Slider
                  value={[volume * 100]}
                  onValueChange={handleVolumeChange}
                  max={100}
                  step={1}
                />
              </div>
              
              <div className="flex items-center justify-center gap-6">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-12 h-12 bg-highlight rounded-full flex items-center justify-center text-neutral hover:bg-accent transition"
                  onClick={togglePlayback}
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-1" />}
                </Button>
              </div>
              
              <div className="w-1/3"></div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center py-8">
            <Button
              variant={isRecording ? "destructive" : "default"}
              className={isRecording 
                ? "w-16 h-16 rounded-full mb-4 bg-red-600 hover:bg-red-700" 
                : "w-16 h-16 rounded-full mb-4 bg-highlight hover:bg-accent"
              }
              onClick={isRecording ? stopRecording : startRecording}
            >
              {isRecording ? <Square className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </Button>
            <p className="text-gray-300">
              {isRecording 
                ? "Recording... Click to stop" 
                : "Click to start recording your story"
              }
            </p>
          </div>
        )}
      </div>
      
      {existingAudioUrl && !audioBlob && (
        <p className="text-center text-sm text-gray-400 mt-2">
          You have an existing recording. Record a new one to replace it.
        </p>
      )}
    </div>
  );
}
