import { Ticket } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center gap-2 text-lg font-semibold text-primary">
      <Ticket className="h-6 w-6" />
      <span>PassFlow</span>
    </div>
  );
}
