
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import { Volume2, Clock, Youtube, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { Logo } from "../layout/logo";
import type { AdvertisementMedia, Ticket } from "@/lib/types";
import YouTube from 'react-youtube';
import { usePassFlowStore, useOrganizationLogo, useOrganizationName, usePassFlowActions } from "@/lib/store";

interface DisplayScreenProps {
  organizationName?: string | null;
  mediaItems: AdvertisementMedia[];
}

function getYoutubeVideoId(url: string | null): string | null {
  if (!url) return null;
  let videoId: string | null = null;
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'youtu.be') {
      videoId = urlObj.pathname.slice(1);
    } else if (urlObj.hostname.includes('youtube.com')) {
      videoId = urlObj.searchParams.get('v');
    }
  } catch (e) {
    return null; // Invalid URL
  }
  return videoId;
}


export function DisplayScreen({ 
  organizationName: initialName,
  mediaItems
}: DisplayScreenProps) {
  const tickets = usePassFlowStore((state) => state.tickets);
  const { refreshTickets } = usePassFlowActions();
  const [callHistory, setCallHistory] = useState<Ticket[]>([]);
  const [calledTicket, setCalledTicket] = useState<Ticket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  const organizationName = useOrganizationName() ?? initialName;
  const organizationLogo = useOrganizationLogo();
  
  const lastCalledTicketId = useRef<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const advanceSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % (mediaItems.length || 1));
  }, [mediaItems.length]);
  
  const currentMedia = mediaItems[currentIndex];
  
  // Polling effect to refresh tickets
  useEffect(() => {
      const interval = setInterval(() => {
          refreshTickets();
      }, 3000); // Poll every 3 seconds
      return () => clearInterval(interval);
  }, [refreshTickets]);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    if (mediaItems.length > 1 && currentMedia?.type === 'image') {
      timerRef.current = setTimeout(advanceSlide, (currentMedia.duration || 10) * 1000);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [currentIndex, mediaItems, currentMedia, advanceSlide]);

  useEffect(() => {
    // Update call history with all tickets that have a called_timestamp
    const updatedHistory = tickets
        .filter(t => t.calledTimestamp)
        .sort((a, b) => new Date(b.calledTimestamp!).getTime() - new Date(a.calledTimestamp!).getTime());
    
    setCallHistory(updatedHistory);
    
    // Check for the newest called ticket
    const latestCalled = updatedHistory[0];

    // If there is a newly called ticket that we haven't shown yet
    if (latestCalled && latestCalled.id !== lastCalledTicketId.current) {
        lastCalledTicketId.current = latestCalled.id;
        setCalledTicket(latestCalled);
        setIsModalOpen(true);
        setAnimationKey(prev => prev + 1); // Force re-render of dialog for animation
        
        // Play sound
        const audio = new Audio('/notification.mp3'); 
        audio.play().catch(e => console.error("Error playing sound:", e));
        
        // Close modal after a delay
        const timer = setTimeout(() => {
            setIsModalOpen(false);
        }, 5000);

        return () => clearTimeout(timer);
    }
  }, [tickets]);

  const renderMedia = () => {
    if (!currentMedia) {
        return (
            <Image 
                src="https://placehold.co/1200x800.png"
                alt="Placeholder"
                fill
                data-ai-hint="advertisement marketing"
                className="object-cover rounded-b-lg"
            />
        );
    }

    if (currentMedia.type === 'video') {
       const videoId = getYoutubeVideoId(currentMedia.src);
       if (!videoId) return <p>URL do vídeo inválida.</p>;
       
       return (
            <YouTube
                videoId={videoId}
                opts={{
                    width: '100%',
                    height: '100%',
                    playerVars: {
                        autoplay: 1,
                        mute: 1,
                        controls: 0,
                        loop: mediaItems.length <= 1 ? 1 : 0,
                        playlist: mediaItems.length <= 1 ? videoId : undefined,
                        modestbranding: 1,
                        iv_load_policy: 3,
                    },
                }}
                className="w-full h-full object-cover rounded-b-lg"
                onEnd={mediaItems.length > 1 ? advanceSlide : undefined}
            />
       );

    }

    return (
      <Image 
          src={currentMedia.src}
          alt="Advertisement"
          fill
          data-ai-hint="advertisement marketing"
          className="object-cover rounded-b-lg"
          key={currentMedia.id}
        />
    );
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row h-full w-full">
        <div className="flex flex-col flex-1 p-4 md:p-8">
          <header className="mb-4 md:mb-8">
             <Logo organizationName={organizationName} organizationLogo={organizationLogo} />
          </header>
          <main className="flex-1 flex flex-col items-center justify-center">
             <Card className="w-full h-full shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
                    {currentMedia?.type === 'video' ? <Youtube /> : <ImageIcon />}
                    Publicidade
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-full p-0 relative">
                  {renderMedia()}
                </CardContent>
              </Card>
          </main>
        </div>
        <aside className="w-full lg:w-1/3 bg-card flex flex-col p-4 md:p-8 border-t lg:border-t-0 lg:border-l">
          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
                <Clock className="h-5 w-5 md:h-6 md:w-6" /> Últimas Chamadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 md:space-y-4">
                {callHistory.slice(0, 8).map((call) => (
                  <li key={call.id} className="flex justify-between items-center text-lg md:text-xl p-2 md:p-3 bg-secondary rounded-lg">
                    <span className="font-bold">{call.number}</span>
                    <span className="text-muted-foreground">{call.counter}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </aside>
      </div>
      
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent key={animationKey} className="sm:max-w-xl p-0 border-0 overflow-hidden flash">
            <DialogHeader>
              <DialogTitle className="sr-only">Senha Chamada</DialogTitle>
            </DialogHeader>
            <div className="p-10 md:p-16 text-center">
               <p className="text-2xl md:text-3xl text-muted-foreground">Senha</p>
               <p className="text-8xl sm:text-9xl md:text-[10rem] font-extrabold text-primary my-4 md:my-6 leading-none">
                 {calledTicket?.number || "----"}
               </p>
               <div className="flex items-center justify-center gap-4 text-3xl md:text-5xl font-semibold text-foreground">
                 <Volume2 className="h-10 w-10 md:h-12 md:w-12" />
                 <span>{calledTicket?.counter || "------"}</span>
               </div>
            </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
