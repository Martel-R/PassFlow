
import { getTicketHistory } from "@/lib/db";
import { HistoryClient } from "./history-client";

export default async function AdminHistoryPage() {
    const history = await getTicketHistory();

    return (
        <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                <h2 className="text-3xl font-bold tracking-tight">
                    Histórico de Atendimentos
                </h2>
                <p className="text-muted-foreground">
                    Consulte todos os tickets que já foram finalizados.
                </p>
                </div>
            </div>
            <HistoryClient history={history} />
        </div>
    );
}
