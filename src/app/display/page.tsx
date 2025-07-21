
import { DisplayScreen } from "@/components/passflow/display-screen";
import { getSetting } from "@/lib/db";

export default async function DisplayPage() {
    const organizationName = await getSetting('organizationName');
    return (
        <div className="h-screen w-screen bg-background">
            <DisplayScreen organizationName={organizationName} />
        </div>
    );
}
