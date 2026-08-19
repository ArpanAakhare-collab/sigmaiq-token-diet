"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { auth, logoutUser } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  LayoutDashboard,
  FolderKanban,
  Zap,
  Database,
  BarChart2,
  History,
  TrendingUp,
  Settings,
  LogOut,
  Search,
  Menu,
  X,
  Activity,
  User as UserIcon,
  Loader2,
} from "lucide-react";
import { AuroraBackground } from "@/components/ui/aurora-background";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [authResolving, setAuthResolving] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [healthStatus, setHealthStatus] = useState<string>("healthy");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthResolving(false);
      if (!currentUser && !document.cookie.includes("session=")) {
        router.replace("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => setHealthStatus(data.status || "healthy"))
      .catch(() => setHealthStatus("degraded"));
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length > 0) {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setSearchResults(data.results || []);
        setShowSearch(true);
      } catch (e) {
        console.error("Search error:", e);
      }
    } else {
      setSearchResults([]);
      setShowSearch(false);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    await logoutUser();
  };

  const navItems = [
    { name: "Overview", href: "/app", icon: LayoutDashboard },
    { name: "Projects", href: "/app/projects", icon: FolderKanban },
    { name: "Query Analyzer", href: "/app/query", icon: Zap },
    { name: "Datasets", href: "/app/datasets", icon: Database },
    { name: "Benchmarks", href: "/app/benchmarks", icon: BarChart2 },
    { name: "Runs", href: "/app/runs", icon: History },
    { name: "Analytics", href: "/app/analytics", icon: TrendingUp },
    { name: "Settings", href: "/app/settings", icon: Settings },
  ];

  if (authResolving) {
    return (
      <AuroraBackground showRadialGradient={true}>
        <div className="min-h-screen flex flex-col items-center justify-center space-y-4 font-sans relative z-10">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#3B82F6] via-[#6366F1] to-[#22D3EE] text-white flex items-center justify-center font-bold text-2xl shadow-xl shadow-[#3B82F6]/20">
            Σ
          </div>
          <div className="text-base font-extrabold text-white tracking-tight">SigmaIQ</div>
          <div className="text-xs text-[#94A3B8] flex items-center gap-2 font-medium">
            <Loader2 className="w-4 h-4 animate-spin text-[#3B82F6]" />
            Checking authentication...
          </div>
        </div>
      </AuroraBackground>
    );
  }

  return (
    <AuroraBackground showRadialGradient={true} className="min-h-screen">
      <div className="min-h-screen w-full flex flex-col md:flex-row font-sans selection:bg-[#3B82F6]/30 relative z-10">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#080C18]/90 border-r border-white/10 backdrop-blur-xl flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div>
            {/* Header */}
            <div className="h-16 px-6 border-b border-white/10 flex items-center justify-between">
              <Link href="/app" className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#3B82F6] to-[#22D3EE] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  Σ
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-lg text-white leading-none tracking-tight">SigmaIQ</span>
                  <span className="text-[10px] text-[#22D3EE] font-mono tracking-wider uppercase">TOKEN-DIET</span>
                </div>
              </Link>
              <button onClick={() => setMobileOpen(false)} className="md:hidden text-[#94A3B8] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Items */}
            <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-140px)]">
              <div className="px-3 pb-2 text-[10px] font-bold text-[#64748B] uppercase tracking-wider font-mono">
                Token-Diet Engine
              </div>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href || (item.href !== "/app" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-[#2563EB] text-white font-bold shadow-md shadow-[#2563EB]/25 border border-[#3B82F6]/30"
                        : "text-[#94A3B8] hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-[#64748B]"}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Footer: Profile & Sign Out */}
          <div className="p-4 border-t border-white/10 bg-[#050816]/80 space-y-3">
            <div className="flex items-center gap-3 px-2">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Google Profile" className="w-9 h-9 rounded-full border border-white/10" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#3B82F6]/20 border border-[#3B82F6]/30 text-[#22D3EE] flex items-center justify-center font-semibold">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
              <div className="flex-1 min-w-0 text-xs">
                <div className="font-semibold text-white truncate">
                  {user?.displayName || "Authenticated User"}
                </div>
                <div className="text-[#94A3B8] truncate">
                  {user?.email || "user@sigmaiq.io"}
                </div>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="w-full py-2 px-3 bg-[#050816] border border-white/10 hover:bg-[#EF4444]/10 hover:border-[#EF4444]/40 hover:text-[#EF4444] disabled:opacity-50 rounded-xl text-xs font-semibold text-[#94A3B8] transition-all flex items-center justify-center gap-2"
            >
              {signingOut ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Signing out...</span>
                </>
              ) : (
                <>
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </>
              )}
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 md:pl-64 flex flex-col min-h-screen relative z-10">
          <header className="h-16 bg-[#080C18]/80 backdrop-blur-xl border-b border-white/10 px-6 sticky top-0 z-30 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setMobileOpen(true)} className="md:hidden text-[#94A3B8] hover:text-white">
                <Menu className="w-6 h-6" />
              </button>

              {/* Global Search Bar */}
              <div className="relative w-64 sm:w-96">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                <input
                  type="text"
                  placeholder="Search projects, datasets, runs..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 bg-[#050816]/90 border border-white/10 rounded-xl text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#3B82F6] transition-all"
                />

                {showSearch && searchResults.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-[#080C18] border border-white/10 rounded-xl shadow-xl p-2 z-50 max-h-80 overflow-y-auto">
                    {searchResults.map((item, i) => (
                      <Link
                        key={i}
                        href={item.url}
                        onClick={() => setShowSearch(false)}
                        className="block p-2 hover:bg-[#050816] rounded-lg text-xs transition-colors"
                      >
                        <div className="flex items-center justify-between text-white font-semibold">
                          <span>{item.title}</span>
                          <span className="text-[10px] bg-[#3B82F6]/10 text-[#22D3EE] px-1.5 py-0.5 rounded font-mono">
                            {item.type}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#94A3B8] truncate">{item.subtitle}</div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                  healthStatus === "healthy"
                    ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20"
                    : "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20"
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>{healthStatus === "healthy" ? "Engine Active" : "Degraded"}</span>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6 max-w-7xl w-full mx-auto relative z-10">{children}</main>
        </div>
      </div>
    </AuroraBackground>
  );
}
