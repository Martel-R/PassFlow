
"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

interface LogoProps {
  organizationName?: string | null;
  organizationLogo?: string | null;
}

export function Logo({ organizationName, organizationLogo }: LogoProps) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/';

  const displayName = isLoginPage ? "PassFlow" : (organizationName || "PassFlow");

  const content = (
    <div className="flex items-center gap-2 text-lg font-semibold text-primary">
      {organizationLogo && !isLoginPage ? (
        <Image 
          src={organizationLogo} 
          alt={`${displayName} logo`} 
          width={32} 
          height={32} 
          className="h-8 w-8 object-contain"
        />
      ) : (
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
      )}
      <span className="font-bold">{displayName}</span>
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
