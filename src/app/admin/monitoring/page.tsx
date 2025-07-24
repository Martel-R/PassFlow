
import { getLiveClerkState, getClerkPerformanceStats } from "@/lib/db";
import { MonitoringClient } from "./monitoring-client";
import { subDays, startOfDay, endOfDay } from "date-fns";

export default async function AdminMonitoringPage() {
    
    async function getStatsByPeriod(period: string) {
        "use server";
        let from: Date | undefined;
        let to: Date | undefined;
        const now = new Date();

        switch (period) {
            case "today":
                from = startOfDay(now);
                to = endOfDay(now);
                break;
            case "yesterday":
                const yesterday = subDays(now, 1);
                from = startOfDay(yesterday);
                to = endOfDay(yesterday);
                break;
            case "last7days":
                from = startOfDay(subDays(now, 6));
                to = endOfDay(now);
                break;
             case "last30days":
                from = startOfDay(subDays(now, 29));
                to = endOfDay(now);
                break;
            default: // "all"
                from = undefined;
                to = undefined;
        }
        
        return await getClerkPerformanceStats({ from, to });
    }

    const liveState = await getLiveClerkState();
    const initialStats = await getStatsByPeriod("today");

    return (
        <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">
                        Monitoramento de Atendimentos
                    </h2>
                    <p className="text-muted-foreground">
                        Acompanhe o status dos atendentes e as métricas de performance.
                    </p>
                </div>
            </div>
            <MonitoringClient 
                initialLiveState={liveState}
                initialPerformanceStats={initialStats}
                getStatsAction={getStatsByPeriod}
            />
        </div>
    );
}
