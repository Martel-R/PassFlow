
import { getSettings, updateSettings, updateSetting } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { BrandingPageClient } from "./branding-page-client";

function hexToHsl(hex: string): string {
  if (!hex || typeof hex !== 'string') return '0 0% 0%';
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

function hslToHex(hslStr: string | null | undefined): string {
  if (!hslStr || typeof hslStr !== 'string') return "#000000";
  const match = hslStr.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
  if (!match) return "#000000";
  
  let h = parseInt(match[1], 10);
  let s = parseInt(match[2], 10);
  let l = parseInt(match[3], 10);

  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  
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
  ]);

  const brandingData = {
    name: settings.organizationName || "Nome da Organização",
    logo: settings.organizationLogo || null,
    primaryColor: hslToHex(settings["theme.primary"]),
    accentColor: hslToHex(settings["theme.accent"]),
    backgroundColor: hslToHex(settings["theme.background"]),
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
    
    revalidatePath("/", "layout");
    revalidatePath("/display");
    
    return { success: true, message: "Branding atualizado com sucesso!" };
  }

  return (
    <BrandingPageClient
      initialData={brandingData}
      updateBrandingAction={handleUpdateBranding}
    />
  );
}
