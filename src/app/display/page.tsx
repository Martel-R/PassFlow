
import { DisplayScreen } from "@/components/passflow/display-screen";
import { getSettings } from "@/lib/db";

export default async function DisplayPage() {
    const settings = await getSettings(['organizationName', 'advertisementBanner']);
    const organizationName = settings.organizationName;
    const advertisementBanner = settings.advertisementBanner;

    return (
        <div className="h-screen w-screen bg-background">
            <DisplayScreen 
                organizationName={organizationName} 
                advertisementBanner={advertisementBanner} 
            />
        </div>
    );
}
