
"use client";

import { icons, LucideProps, Box } from "lucide-react";

interface DynamicIconProps extends LucideProps {
  name: string;
}

export const DynamicIcon = ({ name, ...props }: DynamicIconProps) => {
  const LucideIcon = icons[name as keyof typeof icons];

  if (LucideIcon) {
    return <LucideIcon {...props} />;
  }

  // Fallback Icon
  return <Box {...props} />;
};
