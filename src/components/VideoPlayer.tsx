import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatbotInterface } from "@/components/ChatbotInterface";

interface VideoPlayerProps {
  videoId: string;
  title: string;
  videoUrl?: string;
  onClose: () => void;
  onComplete?: () => void;
}

export const VideoPlayer = ({ videoId, title, videoUrl, onClose, onComplete }: VideoPlayerProps) => {
  const [mode, setMode] = useState<"video" | "chatbot">("video");

  const handleVideoEnd = () => {
    // Switch to chatbot mode instead of closing
    setMode("chatbot");
  };

  const handleChatbotComplete = () => {
    // Only mark video as complete when chatbot is finished
    if (onComplete) {
      onComplete();
    }
    // Close the modal
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-5xl h-[90vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
        
        {mode === "video" ? (
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
            {videoUrl ? (
              <video
                src={videoUrl}
                className="w-full h-full"
                controls
                autoPlay
                onEnded={handleVideoEnd}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <div className="w-0 h-0 border-l-[20px] border-l-primary border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-1"></div>
                  </div>
                  <p className="text-white text-lg font-medium">Video Player Placeholder</p>
                  <p className="text-white/70 text-sm mt-2">Connect your video source here</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 bg-background rounded-lg overflow-hidden">
            <ChatbotInterface
              videoId={videoId}
              videoTitle={title}
              onComplete={handleChatbotComplete}
              onClose={onClose}
            />
          </div>
        )}
      </div>
    </div>
  );
};
