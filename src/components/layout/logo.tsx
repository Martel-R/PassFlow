
"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Logo({ organizationName }: { organizationName?: string | null }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/';

  // Na página de login, sempre mostrar "PassFlow". Nas outras, o nome da organização.
  const displayName = isLoginPage ? "PassFlow" : (organizationName || "PassFlow");

  const content = (
     <div className="flex items-center gap-2 text-lg font-semibold text-primary">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-7 w-7"
        >
          <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
          <path d="M9 12h6" />
          <path d="m12 9 3 3-3 3" />
        </svg>
      <span className="font-bold">{displayName}</span>
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
