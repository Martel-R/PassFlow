
import { getSettings, updateSetting } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { DisplaySettingsClient } from "./display-settings-client";
import type { AdvertisementMedia } from "@/lib/types";

async function fileToDataUri(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    return `data:${file.type};base64,${base64}`;
}


export default async function AdminDisplaySettingsPage() {
  const settings = await getSettings(["advertisementMedia"]);
  
  let initialMedia: AdvertisementMedia[] = [];
  try {
    if (settings.advertisementMedia) {
      initialMedia = JSON.parse(settings.advertisementMedia);
    }
  } catch (e) {
    console.error("Failed to parse advertisementMedia JSON:", e);
    // If parsing fails, start with a clean slate
    initialMedia = [];
  }


  async function handleUpdateSettings(mediaItems: AdvertisementMedia[]) {
    "use server";
    
    // Simple validation
    for (const item of mediaItems) {
        if (item.type === 'image' && !item.src) {
             return { success: false, message: "Uma das imagens não tem fonte (src) definida." };
        }
        if (item.type === 'video' && !item.src) {
             return { success: false, message: "Um dos vídeos não tem URL definida." };
        }
         if (item.type === 'image' && (!item.duration || item.duration < 1)) {
             return { success: false, message: "Duração inválida para uma das imagens. Deve ser no mínimo 1 segundo." };
        }
    }
    
    await updateSetting('advertisementMedia', JSON.stringify(mediaItems));

    // For backwards compatibility, clear old settings if they exist
    await updateSetting('advertisementBanner', '');
    await updateSetting('advertisementVideoUrl', '');

    revalidatePath("/display");
    
    return { success: true, message: "Configurações da tela de chamada atualizadas com sucesso!" };
  }
  
   async function handleImageUpload(formData: FormData) {
        "use server";
        const imageFile = formData.get("image") as File;
        
        if (!imageFile || imageFile.size === 0) {
            return { success: false, message: "Nenhum arquivo de imagem enviado." };
        }
        
        if (imageFile.size > 1 * 1024 * 1024) { // 1MB Limit
            return { success: false, message: "O arquivo de imagem é muito grande. O limite é de 1MB." };
        }

        try {
            const dataUri = await fileToDataUri(imageFile);
            return { success: true, message: "Upload bem-sucedido", dataUri };
        } catch (error) {
            console.error("Image upload error:", error);
            return { success: false, message: "Falha ao processar a imagem." };
        }
    }


  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
       <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Configurar Tela de Chamada
          </h2>
          <p className="text-muted-foreground">
            Gerencie o carrossel de mídias (imagens e vídeos) da tela de chamada.
          </p>
        </div>
      </div>
      <DisplaySettingsClient
        initialMedia={initialMedia}
        updateAction={handleUpdateSettings}
        uploadAction={handleImageUpload}
      />
    </div>
  );
}
