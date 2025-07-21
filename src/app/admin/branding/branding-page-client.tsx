
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BrandingForm } from "./branding-form";

function hslToHex(hslStr: string): string {
  if (!hslStr) return "#000000";
  const match = hslStr.match(/\d+/g);
  if (!match) return "#000000";
  const [h, s, l] = match.map(Number);
  const sFraction = s / 100;
  const lFraction = l / 100;
  const c = (1 - Math.abs(2 * lFraction - 1)) * sFraction;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lFraction - c / 2;
  let r = 0, g = 0, b = 0;
  if (h >= 0 && h < 60) { [r, g, b] = [c, x, 0]; }
  else if (h >= 60 && h < 120) { [r, g, b] = [x, c, 0]; }
  else if (h >= 120 && h < 180) { [r, g, b] = [0, c, x]; }
  else if (h >= 180 && h < 240) { [r, g, b] = [0, x, c]; }
  else if (h >= 240 && h < 300) { [r, g, b] = [x, 0, c]; }
  else if (h >= 300 && h < 360) { [r, g, b] = [c, 0, x]; }
  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

interface BrandingData {
  name: string;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  logo: string | null;
  advertisementBanner: string | null;
}

interface BrandingPageClientProps {
  initialData: BrandingData;
  updateBrandingAction: (formData: FormData) => Promise<{ success: boolean; message: string }>;
}


export function BrandingPageClient({ initialData, updateBrandingAction }: BrandingPageClientProps) {
  const brandingFormInitialData = {
    ...initialData,
    primaryColor: hslToHex(initialData.primaryColor),
    accentColor: hslToHex(initialData.accentColor),
    backgroundColor: hslToHex(initialData.backgroundColor),
  };

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Branding Personalizado
          </h2>
          <p className="text-muted-foreground">
            Ajuste o nome, as cores, o logo e o banner para se adequar à sua marca.
          </p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Identidade da Organização</CardTitle>
          <CardDescription>
            Atualize o nome, as cores, o logo e o banner do sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BrandingForm
            initialData={brandingFormInitialData}
            updateBrandingAction={updateBrandingAction}
          />
        </CardContent>
      </Card>
    </div>
  );
}
