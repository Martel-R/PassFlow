
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSettings, updateSettings } from "@/lib/db";
import { BrandingForm } from "./branding-form";
import { revalidatePath } from "next/cache";

export default async function AdminBrandingPage() {
  const settings = await getSettings([
    "organizationName",
    "theme.primary",
    "theme.accent",
    "theme.background",
  ]);

  const brandingData = {
    name: settings.organizationName || "Nome da Organização",
    primaryColor: settings["theme.primary"] || "210 70% 50%",
    accentColor: settings["theme.accent"] || "180 60% 40%",
    backgroundColor: settings["theme.background"] || "210 20% 95%",
  };

  async function handleUpdateBranding(formData: FormData) {
    "use server";
    
    const settingsToUpdate = {
      organizationName: formData.get("name") as string,
      "theme.primary": formData.get("primaryColor") as string,
      "theme.accent": formData.get("accentColor") as string,
      "theme.background": formData.get("backgroundColor") as string,
    };

    await updateSettings(settingsToUpdate);
    
    // Revalidate all paths to reflect the new branding
    revalidatePath("/", "layout");
    
    return { success: true, message: "Branding atualizado com sucesso!" };
  }

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Branding Personalizado
          </h2>
          <p className="text-muted-foreground">
            Ajuste o nome, as cores e futuramente o logo para se adequar à sua marca.
          </p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Identidade da Organização</CardTitle>
          <CardDescription>
            Atualize o nome e as cores do sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BrandingForm
            initialData={brandingData}
            updateBrandingAction={handleUpdateBranding}
          />
        </CardContent>
      </Card>
    </div>
  );
}
