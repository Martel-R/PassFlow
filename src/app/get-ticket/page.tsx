import { TicketSelection } from "@/components/passflow/ticket-selection";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function GetTicketPage() {
  return (
    <div className="relative min-h-screen">
      <div className="absolute top-4 left-4">
        <Button variant="outline" asChild>
          <Link href="/">
            <ArrowLeft />
            <span>Voltar ao Início</span>
          </Link>
        </Button>
      </div>
      <div className="flex flex-col items-center justify-center min-h-screen p-4 pt-20">
        <TicketSelection />
      </div>
    </div>
  );
}
