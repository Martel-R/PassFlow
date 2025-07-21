
"use client";

import { usePassFlowActions } from "@/lib/store";
import { useRef, useEffect } from "react";
import Cookies from "js-cookie";

interface InitializeParams {
    organizationName?: string | null;
    organizationLogo?: string | null;
}

export function StoreInitializer({ organizationName, organizationLogo }: InitializeParams) {
    const { initialize, listenToBroadcast, setSession } = usePassFlowActions();
    const initialized = useRef(false);

    // Synchronously set session on initial client load
    if (typeof window !== "undefined" && !initialized.current) {
         try {
            const cookie = Cookies.get('auth-session');
            if (cookie) {
                const session = JSON.parse(cookie);
                setSession(session);
            }
        } catch (e) {
            console.error("Failed to parse session cookie", e);
            setSession(null);
        }
    }

    useEffect(() => {
        if (!initialized.current) {
            initialize({ organizationName, organizationLogo });
            listenToBroadcast();
            initialized.current = true;
        }
    }, [initialize, listenToBroadcast, organizationName, organizationLogo]);

    return null; // This component doesn't render anything
};
