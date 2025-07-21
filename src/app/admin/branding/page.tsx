
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSettings, updateSettings, updateSetting } from "@/lib/db";
import { BrandingForm } from "./branding-form";
import { revalidatePath } from "next/cache";
import { BrandingPageClient } from "./branding-page-client";

function hexToHsl(hex: string): string {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);
  return `${h} ${s}% ${l}%`;
}

async function fileToDataUri(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    return `data:${file.type};base64,${base64}`;
}


export default async function AdminBrandingPage() {
  const settings = await getSettings([
    "organizationName",
    "organizationLogo",
    "theme.primary",
    "theme.accent",
    "theme.background",
    "advertisementBanner",
  ]);

  const brandingData = {
    name: settings.organizationName || "Nome da Organização",
    logo: settings.organizationLogo || null,
    primaryColor: settings["theme.primary"] || "210 70% 50%",
    accentColor: settings["theme.accent"] || "180 60% 40%",
    backgroundColor: settings["theme.background"] || "210 20% 95%",
    advertisementBanner: settings.advertisementBanner || null,
  };

  async function handleUpdateBranding(formData: FormData) {
    "use server";
    
    const settingsToUpdate: Record<string, string> = {
      organizationName: formData.get("name") as string,
      "theme.primary": hexToHsl(formData.get("primaryColor") as string),
      "theme.accent": hexToHsl(formData.get("accentColor") as string),
      "theme.background": hexToHsl(formData.get("backgroundColor") as string),
    };
    
    await updateSettings(settingsToUpdate);

    // Handle Logo
    const logoFile = formData.get("logo") as File;
    const removeLogo = formData.get("removeLogo") === 'true';

    if (removeLogo) {
        await updateSetting('organizationLogo', '');
    } else if (logoFile && logoFile.size > 0) {
        if (logoFile.size > 200 * 1024) { // 200KB size limit
             return { success: false, message: "O arquivo da logo é muito grande. O limite é de 200KB." };
        }
        const logoDataUri = await fileToDataUri(logoFile);
        await updateSetting('organizationLogo', logoDataUri);
    }
    
    // Handle Advertisement Banner
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

    revalidatePath("/", "layout");
    revalidatePath("/display");
    
    return { success: true, message: "Branding atualizado com sucesso!" };
  }

  return (
    <BrandingPageClient initialData={brandingData} updateBrandingAction={handleUpdateBranding} />
  );
}
