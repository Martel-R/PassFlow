
"use client"

import { Ticket } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Logo({ organizationName }: { organizationName?: string | null }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/';

  // Na página de login, sempre mostrar "PassFlow". Nas outras, o nome da organização.
  const displayName = isLoginPage ? "PassFlow" : (organizationName || "PassFlow");

  const content = (
     <div className="flex items-center gap-2 text-lg font-semibold text-primary">
      <Ticket className="h-6 w-6" />
      <span>{displayName}</span>
    </div>
  );

  // O logo na página de login não deve ser um link para si mesmo.
  if (isLoginPage) {
    return content;
  }
  
  return (
    <Link href="/" aria-label="Voltar para a página inicial">
      {content}
    </Link>
  );
}
