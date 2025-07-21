
import { getSettings, updateSetting, updateSettings } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { DisplaySettingsForm } from "./display-settings-form";

async function fileToDataUri(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    return `data:${file.type};base64,${base64}`;
}


export default async function AdminDisplaySettingsPage() {
  const settings = await getSettings(["advertisementBanner", "advertisementVideoUrl"]);
  
  const initialData = {
    advertisementBanner: settings.advertisementBanner || null,
    advertisementVideoUrl: settings.advertisementVideoUrl || null,
  };

  async function handleUpdateSettings(formData: FormData) {
    "use server";
    
    const mediaType = formData.get("mediaType");

    if (mediaType === "image") {
        const bannerFile = formData.get("advertisementBanner") as File;
        const removeBanner = formData.get("removeBanner") === 'true';

        // Clear video URL if we are saving an image
        await updateSetting('advertisementVideoUrl', '');

        if (removeBanner) {
            await updateSetting('advertisementBanner', '');
        } else if (bannerFile && bannerFile.size > 0) {
            if (bannerFile.size > 500 * 1024) { // 500KB size limit
                return { success: false, message: "O arquivo do banner é muito grande. O limite é de 500KB." };
            }
            const bannerDataUri = await fileToDataUri(bannerFile);
            await updateSetting('advertisementBanner', bannerDataUri);
        }
    } else if (mediaType === "video") {
        const videoUrl = formData.get("advertisementVideoUrl") as string;
        const removeVideo = formData.get("removeVideo") === 'true';

        // Clear banner if we are saving a video
        await updateSetting('advertisementBanner', '');
        
        if (removeVideo) {
            await updateSetting('advertisementVideoUrl', '');
        } else if (videoUrl) {
            // Basic validation for youtube url
            try {
                const url = new URL(videoUrl);
                if (!url.hostname.includes("youtube.com") && !url.hostname.includes("youtu.be")) {
                    return { success: false, message: "Por favor, insira uma URL válida do YouTube." };
                }
            } catch (e) {
                 return { success: false, message: "A URL do vídeo é inválida." };
            }
            await updateSetting('advertisementVideoUrl', videoUrl);
        } else {
             await updateSetting('advertisementVideoUrl', '');
        }
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
