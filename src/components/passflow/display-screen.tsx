"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { mockCounters, mockTickets } from "@/lib/mock-data";
import { Ticket } from "@/lib/types";
import { Volume2, Clock } from "lucide-react";
import Image from "next/image";

type CalledTicket = {
  number: string;
  counter: string;
};

export function DisplayScreen() {
  const [calledTicket, setCalledTicket] = useState<CalledTicket | null>(null);
  const [history, setHistory] = useState<CalledTicket[]>([]);
  const [key, setKey] = useState(0);

  useEffect(() => {
    const availableTickets = mockTickets.filter(
      (t) => !history.some((h) => h.number === t.number)
    );

    if (availableTickets.length === 0) {
      // All mock tickets have been called, do nothing.
      return;
    }

    const interval = setInterval(() => {
      // Select a random ticket and counter for simulation
      const randomTicketIndex = Math.floor(Math.random() * availableTickets.length);
      const randomTicket = availableTickets[randomTicketIndex];

      const randomCounterIndex = Math.floor(Math.random() * mockCounters.length);
      const randomCounter = mockCounters[randomCounterIndex];

      const newCall: CalledTicket = {
        number: randomTicket.number,
        counter: randomCounter.name,
      };

      setCalledTicket(newCall);
      setHistory((prev) => [newCall, ...prev].slice(0, 5));
      setKey(prev => prev + 1); // Reset animation
    }, 8000); // Call a new ticket every 8 seconds

    return () => clearInterval(interval);
  }, [history]);

  return (
    <div className="flex h-full w-full">
      <div className="flex flex-col w-2/3 p-8">
        <header className="mb-8">
          <h1 className="text-5xl font-bold text-primary">PassFlow</h1>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center">
          <Card key={key} className="w-full max-w-4xl shadow-2xl flash">
            <CardContent className="p-10 text-center">
              <p className="text-2xl text-muted-foreground">Senha</p>
              <p className="text-9xl font-extrabold text-primary my-4">
                {calledTicket?.number || "----"}
              </p>
              <div className="flex items-center justify-center gap-4 text-4xl font-semibold text-foreground">
                <Volume2 className="h-10 w-10" />
                <span>{calledTicket?.counter || "------"}</span>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
      <aside className="w-1/3 bg-card flex flex-col p-8 border-l">
        <Card className="flex-1 mb-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Clock className="h-6 w-6" /> Últimas Chamadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {history.slice(1).map((call, index) => (
                <li key={index} className="flex justify-between items-center text-xl p-3 bg-secondary rounded-lg">
                  <span className="font-bold">{call.number}</span>
                  <span className="text-muted-foreground">{call.counter}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card className="h-1/3">
          <CardHeader>
            <CardTitle className="text-2xl">Publicidade</CardTitle>
          </CardHeader>
          <CardContent className="h-full p-0">
             <Image 
                src="https://placehold.co/600x400.png"
                alt="Advertisement"
                width={600}
                height={400}
                data-ai-hint="advertisement abstract"
                className="object-cover w-full h-full rounded-b-lg"
              />
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
