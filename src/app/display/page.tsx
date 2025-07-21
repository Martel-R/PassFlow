
import { DisplayScreen } from "@/components/passflow/display-screen";
import { getSettings } from "@/lib/db";
import type { AdvertisementMedia } from "@/lib/types";

export default async function DisplayPage() {
    const settings = await getSettings(['organizationName', 'advertisementMedia', 'advertisementBanner', 'advertisementVideoUrl']);
    const organizationName = settings.organizationName;
    
    let mediaItems: AdvertisementMedia[] = [];

    // New media system
    if (settings.advertisementMedia) {
        try {
            mediaItems = JSON.parse(settings.advertisementMedia);
        } catch (e) {
            console.error("Failed to parse advertisementMedia in display page", e);
        }
    } 
    // Backwards compatibility for old system
    else if (settings.advertisementVideoUrl) {
        mediaItems.push({ id: 'video_legacy', type: 'video', src: settings.advertisementVideoUrl });
    } else if (settings.advertisementBanner) {
        mediaItems.push({ id: 'image_legacy', type: 'image', src: settings.advertisementBanner, duration: 10 });
    }

    return (
        <div className="h-screen w-screen bg-background">
            <DisplayScreen 
                organizationName={organizationName} 
                mediaItems={mediaItems}
            />
        </div>
    );
}
