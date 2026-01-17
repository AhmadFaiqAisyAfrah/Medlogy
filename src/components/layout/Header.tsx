"use client";

import { GlassPanel } from "@/components/ui/GlassPanel";
import { Search, Bell, PanelLeftClose, PanelLeftOpen, LogOut } from "lucide-react";
import { signout } from "@/app/(auth)/login/actions";

interface HeaderProps {
    isLanding?: boolean;
    toggleSidebar?: () => void;
    isSidebarOpen?: boolean;
}

export function Header({ isLanding = false, toggleSidebar, isSidebarOpen = true }: HeaderProps) {

    // LANDING MODE HEADER
    if (isLanding) {
        return (
            <header className="sticky top-0 z-30 px-6 py-4 flex items-center justify-between pointer-events-auto bg-[#0B0C10]/70 backdrop-blur-lg border-b border-white/5">
                <div className="flex items-center">
                    <span className="font-bold text-white text-xl tracking-tighter">Medlogy</span>
                </div>
                <div className="pointer-events-auto flex items-center gap-4">
                    <a href="/login" className="px-6 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-white text-sm font-semibold shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_30px_rgba(14,165,233,0.5)] transition-all">
                        Login
                    </a>
                </div>
            </header>
        );
    }

    // APP MODE HEADER
    return (
        <header className="px-6 py-4 z-30">
            <GlassPanel className="flex items-center justify-between p-3" noBorder>
                <div className="flex items-center gap-4 flex-1">
                    {/* Sidebar Toggle */}
                    <button
                        onClick={toggleSidebar}
                        className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                    >
                        {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
                    </button>

                    {/* Search */}
                    <div className="relative max-w-md w-full hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search outbreak ID, region, or keyword..."
                            className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-1 rounded bg-white/5 border border-white/5">
                            <span className="text-[10px] text-slate-500 font-mono">⌘ K</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Time / Context */}
                    <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-900/50 border border-white/5">
                        <span className="text-xs text-slate-400">Jan 17, 2026</span>
                        <div className="w-[1px] h-3 bg-white/10" />
                        <span className="text-[10px] font-bold text-emerald-500 animate-pulse">LIVE</span>
                    </div>

                    {/* Notifications */}
                    <button className="relative p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
                        <Bell size={20} />
                        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 border border-slate-900" />
                    </button>

                    {/* Sign Out Button */}
                    <form action={signout}>
                        <button
                            type="submit"
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors text-sm font-medium"
                        >
                            <LogOut size={16} />
                            <span className="hidden sm:inline">Sign Out</span>
                        </button>
                    </form>

                    {/* Profile Placeholder */}
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-slate-900" />
                </div>
            </GlassPanel>
        </header>
    );
}
