
import { getSettings, updateSetting } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { DisplaySettingsForm } from "./display-settings-form";

async function fileToDataUri(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    return `data:${file.type};base64,${base64}`;
}


export default async function AdminDisplaySettingsPage() {
  const settings = await getSettings(["advertisementBanner"]);
  
  const initialData = {
    advertisementBanner: settings.advertisementBanner || null,
  };

  async function handleUpdateSettings(formData: FormData) {
    "use server";
    
    const bannerFile = formData.get("advertisementBanner") as File;
    const removeBanner = formData.get("removeBanner") === 'true';

    if (removeBanner) {
        await updateSetting('advertisementBanner', '');
    } else if (bannerFile && bannerFile.size > 0) {
        if (bannerFile.size > 500 * 1024) { // 500KB size limit
             return { success: false, message: "O arquivo do banner é muito grande. O limite é de 500KB." };
        }
        const bannerDataUri = await fileToDataUri(bannerFile);
        await updateSetting('advertisementBanner', bannerDataUri);
    }

    revalidatePath("/display");
    
    return { success: true, message: "Configurações da tela de chamada atualizadas com sucesso!" };
  }

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
       <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Configurar Tela de Chamada
          </h2>
          <p className="text-muted-foreground">
            Personalize o conteúdo da tela de chamada de senhas.
          </p>
        </div>
      </div>
      <DisplaySettingsForm
        initialData={initialData}
        updateAction={handleUpdateSettings}
      />
    </div>
  );
}
