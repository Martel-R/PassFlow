
"use client"

import { Ticket } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// The logo now accepts the organization name as a prop
// to avoid client-side data fetching on public pages.
export function Logo({ organizationName }: { organizationName?: string | null }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/';

  const content = (
     <div className="flex items-center gap-2 text-lg font-semibold text-primary">
      <Ticket className="h-6 w-6" />
      <span>{organizationName || "Sistema"}</span>
    </div>
  );

  // The logo on the login page should not be a link to itself.
  if (isLoginPage) {
    return content;
  }
  
  return (
    <Link href="/" aria-label="Voltar para a página inicial">
      {content}
    </Link>
  );
}
