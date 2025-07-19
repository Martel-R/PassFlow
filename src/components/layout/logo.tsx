
"use client"

import { getSetting } from "@/lib/db";
import { Ticket } from "lucide-react";
import { useEffect, useState } from "react";

export function Logo() {
  const [name, setName] = useState("Carregando...");

  useEffect(() => {
    const fetchName = async () => {
      const orgName = await getSetting("organizationName");
      setName(orgName || "Nome da Organização");
    };
    fetchName();
  }, []);

  return (
    <div className="flex items-center gap-2 text-lg font-semibold text-primary">
      <Ticket className="h-6 w-6" />
      <span>{name}</span>
    </div>
  );
}
