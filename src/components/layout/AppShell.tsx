"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { AIAgent } from "@/components/layout/AIAgent";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    // If we are at the root ('/'), we are in Landing/Overview Mode.
    // Anywhere else, we are in App Mode.
    const isLanding = pathname === "/";

    // Sidebar state (Default open on desktop, closed on mobile)
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Auto-close sidebar on mobile on nav
    useEffect(() => {
        // Reset sidebar state based on mode
        if (isLanding) {
            setIsSidebarOpen(false);
        } else {
            setIsSidebarOpen(true);
        }
    }, [isLanding]);

    return (
        <div className="flex min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0f1d] to-black overflow-hidden relative">

            {/* Sidebar - Only mounted/visible if NOT landing (or animating out) */}
            <AnimatePresence mode="wait">
                {!isLanding && isSidebarOpen && (
                    <motion.div
                        initial={{ x: -300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -300, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                        className="z-40 h-screen fixed md:relative"
                    >
                        <Sidebar />
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex-1 flex flex-col h-screen overflow-hidden relative transition-all duration-300">
                {/* Background decorative elements */}
                <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-[-20%] right-[10%] w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

                {/* Header passes 'isLanding' state to adjust its appearance */}
                <Header isLanding={isLanding} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />

                <main className={cn(
                    "flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent custom-scroll",
                    isLanding ? "p-0" : "px-8 py-6" // More horizontal padding for precision
                )}>
                    {children}
                </main>
            </div>

            {/* AI Agent - Only visible in App Mode */}
            <AnimatePresence>
                {!isLanding && <AIAgent />}
            </AnimatePresence>

        </div>
    );
}
