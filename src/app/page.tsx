import { TicketSelection } from "@/components/passflow/ticket-selection";

export default function Home() {
  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
      <TicketSelection />
    </div>
  );
}
