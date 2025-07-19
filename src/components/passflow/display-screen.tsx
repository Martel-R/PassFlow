
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCalledTicket, useCallHistory } from "@/lib/store";
import { Volume2, Clock } from "lucide-react";
import Image from "next/image";
import { Logo } from "../layout/logo";

export function DisplayScreen() {
  const calledTicket = useCalledTicket();
  const callHistory = useCallHistory();
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    if (calledTicket) {
      setAnimationKey(prev => prev + 1);
      
      const audio = new Audio('/notification.mp3'); 
      audio.play().catch(e => console.error("Error playing sound:", e));
    }
  }, [calledTicket]); 

  return (
    <div className="flex flex-col lg:flex-row h-full w-full">
      <div className="flex flex-col flex-1 p-4 md:p-8">
        <header className="mb-4 md:mb-8">
          <h1 className="text-3xl md:text-5xl font-bold text-primary">
            <Logo />
          </h1>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center">
          <Card key={animationKey} className="w-full max-w-4xl shadow-2xl flash">
            <CardContent className="p-6 md:p-10 text-center">
              <p className="text-xl md:text-2xl text-muted-foreground">Senha</p>
              <p className="text-7xl sm:text-8xl md:text-9xl font-extrabold text-primary my-2 md:my-4">
                {calledTicket?.number || "----"}
              </p>
              <div className="flex items-center justify-center gap-4 text-2xl md:text-4xl font-semibold text-foreground">
                <Volume2 className="h-8 w-8 md:h-10 md:w-10" />
                <span>{calledTicket?.counter || "------"}</span>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
      <aside className="w-full lg:w-1/3 bg-card flex flex-col p-4 md:p-8 border-t lg:border-t-0 lg:border-l">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 h-full">
          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
                <Clock className="h-5 w-5 md:h-6 md:w-6" /> Últimas Chamadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 md:space-y-4">
                {callHistory.slice(0, 5).map((call, index) => (
                  <li key={index} className="flex justify-between items-center text-lg md:text-xl p-2 md:p-3 bg-secondary rounded-lg">
                    <span className="font-bold">{call.number}</span>
                    <span className="text-muted-foreground">{call.counter}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="h-64 sm:h-auto lg:h-1/3">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl">Publicidade</CardTitle>
            </CardHeader>
            <CardContent className="h-full p-0 relative">
               <Image 
                  src="https://placehold.co/600x400.png"
                  alt="Advertisement"
                  fill
                  data-ai-hint="advertisement abstract"
                  className="object-cover rounded-b-lg"
                />
            </CardContent>
          </Card>
        </div>
      </aside>
    </div>
  );
}
