"use client"

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { validateToken } from "../signin/auth";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const data = await validateToken();

                if (!data) {
                    router.push("/signin");
                }

                setIsAuthenticated(true);
            } catch(err) {
                router.push("/signin");
            }
        }

        checkAuth();
    }, [router]);

    return isAuthenticated ? children : null;
}