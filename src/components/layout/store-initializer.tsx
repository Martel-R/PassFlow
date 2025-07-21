
"use client";

import { usePassFlowActions } from "@/lib/store";
import { useRef, useEffect } from "react";
import type { Session } from "@/lib/store";

interface InitializeParams {
    organizationName?: string | null;
    organizationLogo?: string | null;
    initialSession: Session | null;
}

export function StoreInitializer({ organizationName, organizationLogo, initialSession }: InitializeParams) {
    const { initialize, listenToBroadcast } = usePassFlowActions();
    const initialized = useRef(false);

    useEffect(() => {
        if (!initialized.current) {
            initialize({ organizationName, organizationLogo, initialSession });
            listenToBroadcast();
            initialized.current = true;
        }
    }, [initialize, listenToBroadcast, organizationName, organizationLogo, initialSession]);

    return null; // This component doesn't render anything
};
