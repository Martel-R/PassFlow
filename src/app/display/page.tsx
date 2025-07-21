
import { DisplayScreen } from "@/components/passflow/display-screen";
import { getSettings } from "@/lib/db";

export default async function DisplayPage() {
    const settings = await getSettings(['organizationName', 'advertisementBanner', 'advertisementVideoUrl']);
    const organizationName = settings.organizationName;
    const advertisementBanner = settings.advertisementBanner;
    const advertisementVideoUrl = settings.advertisementVideoUrl;

    return (
        <div className="h-screen w-screen bg-background">
            <DisplayScreen 
                organizationName={organizationName} 
                advertisementBanner={advertisementBanner} 
                advertisementVideoUrl={advertisementVideoUrl}
            />
        </div>
    );
}
