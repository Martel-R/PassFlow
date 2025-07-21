
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { useCalledTicket, useCallHistory, useOrganizationName, useOrganizationLogo } from "@/lib/store";
import { Volume2, Clock } from "lucide-react";
import Image from "next/image";
import { Logo } from "../layout/logo";

export function DisplayScreen({ organizationName: initialName }: { organizationName?: string | null }) {
  const calledTicket = useCalledTicket();
  const callHistory = useCallHistory();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  // Use data from store, which is initialized from layout server component
  const organizationName = useOrganizationName() ?? initialName;
  const organizationLogo = useOrganizationLogo();

  useEffect(() => {
    if (calledTicket) {
      setIsModalOpen(true);
      setAnimationKey(prev => prev + 1); // Trigger animation on new call
      
      const audio = new Audio('/notification.mp3'); 
      audio.play().catch(e => console.error("Error playing sound:", e));
      
      const timer = setTimeout(() => {
        setIsModalOpen(false);
      }, 5000); // Close modal after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [calledTicket]); 

  return (
    <>
      <div className="flex flex-col lg:flex-row h-full w-full">
        <div className="flex flex-col flex-1 p-4 md:p-8">
          <header className="mb-4 md:mb-8">
            <h1 className="text-3xl md:text-5xl font-bold text-primary">
              <Logo organizationName={organizationName} organizationLogo={organizationLogo} />
            </h1>
          </header>
          <main className="flex-1 flex flex-col items-center justify-center">
             <Card className="w-full h-full shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl md:text-2xl">Publicidade</CardTitle>
                </CardHeader>
                <CardContent className="h-full p-0 relative">
                  <Image 
                      src="https://placehold.co/1200x800.png"
                      alt="Advertisement"
                      fill
                      data-ai-hint="advertisement marketing"
                      className="object-cover rounded-b-lg"
                    />
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
                {callHistory.slice(0, 8).map((call, index) => (
                  <li key={index} className="flex justify-between items-center text-lg md:text-xl p-2 md:p-3 bg-secondary rounded-lg">
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
