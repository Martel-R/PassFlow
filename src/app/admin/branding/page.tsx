
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSetting, updateSetting } from "@/lib/db";
import { BrandingForm } from "./branding-form";
import { revalidatePath } from "next/cache";

export default async function AdminBrandingPage() {
  const organizationName = (await getSetting("organizationName")) || "Nome da Organização";
  const organizationLogo = (await getSetting("organizationLogo")) || "";

  async function handleUpdateBranding(formData: FormData) {
    "use server";
    const newName = formData.get("name") as string;
    await updateSetting("organizationName", newName);
    
    // Revalidate all paths to reflect the new name
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
            Ajuste as cores e o logo para se adequar à sua marca.
          </p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Identidade da Organização</CardTitle>
          <CardDescription>
            Atualize o nome e futuramente o logo da sua organização.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BrandingForm
            initialName={organizationName}
            updateBrandingAction={handleUpdateBranding}
          />
        </CardContent>
      </Card>
    </div>
  );
}
