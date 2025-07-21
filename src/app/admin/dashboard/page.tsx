
import { getDashboardMetrics, getRecentTickets } from "@/lib/db";
import { AdminDashboardClient } from "./dashboard-client";


export default async function AdminDashboardPage() {
    const metrics = await getDashboardMetrics();
    const recentTickets = await getRecentTickets(5);
    
    return (
        <AdminDashboardClient metrics={metrics} recentTickets={recentTickets} />
    );
}
