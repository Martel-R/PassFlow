
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BrandingForm } from "./branding-form";


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
            initialData={initialData}
            updateBrandingAction={updateBrandingAction}
          />
        </CardContent>
      </Card>
    </div>
  );
}
