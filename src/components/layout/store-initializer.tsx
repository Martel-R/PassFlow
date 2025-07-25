
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
    const { initialize } = usePassFlowActions();
    const initialized = useRef(false);

    useEffect(() => {
        if (!initialized.current) {
            initialize({ organizationName, organizationLogo, initialSession });
            initialized.current = true;
        }
    }, [initialize, organizationName, organizationLogo, initialSession]);

    return null; // This component doesn't render anything
};
