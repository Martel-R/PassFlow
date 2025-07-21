
"use client";

import { usePassFlowActions } from "@/lib/store";
import { useRef, useEffect } from "react";

interface InitializeParams {
    organizationName?: string | null;
    organizationLogo?: string | null;
}

export function StoreInitializer({ organizationName, organizationLogo }: InitializeParams) {
    const { initialize, listenToBroadcast } = usePassFlowActions();
    const initialized = useRef(false);

    useEffect(() => {
        if (!initialized.current) {
            initialize({ organizationName, organizationLogo });
            listenToBroadcast();
            initialized.current = true;
        }
    }, [initialize, listenToBroadcast, organizationName, organizationLogo]);

    return null; // This component doesn't render anything
};
