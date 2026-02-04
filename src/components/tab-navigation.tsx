import { Link, useLocation } from "@tanstack/react-router";
import { Flame, Archive, Settings } from "lucide-react";
import { cn } from "@/utils/tailwind";

interface TabNavigationProps {
  internalCount?: number;
  externalCount?: number;
  hotCount?: number;
}

export default function TabNavigation({
  internalCount = 0,
  externalCount = 0,
  hotCount = 0,
}: TabNavigationProps) {
  const location = useLocation();
  const currentPath = location.pathname;

  const tabs = [
    { path: "/", label: "Internal", count: internalCount },
    { path: "/external", label: "External", count: externalCount },
    { path: "/hot", label: "Hot", count: hotCount, isHot: true },
  ];

  return (
    <nav className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-2 flex-1">
        {tabs.map((tab) => {
          const isActive =
            currentPath === tab.path ||
            (tab.path === "/" && currentPath === "/");

          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={cn(
                "relative flex items-center justify-center gap-2 px-8 py-3 rounded-lg transition-all duration-200",
                "text-base font-medium flex-1 max-w-[200px]",
                isActive
                  ? "bg-white/20 text-white"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              )}
            >
              {tab.isHot && (
                <Flame
                  className={cn(
                    "w-5 h-5",
                    isActive ? "text-orange-400" : "text-orange-400/70"
                  )}
                />
              )}
              <span className="text-glass">{tab.label}</span>
              {tab.count > 0 && (
                <span
                  className={cn(
                    "ml-1 px-2 py-0.5 text-sm rounded-full",
                    isActive
                      ? "bg-white/30 text-white"
                      : "bg-white/15 text-white/80"
                  )}
                >
                  {tab.count}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <Link
          to="/archive"
          className={cn(
            "p-2.5 rounded-lg transition-all duration-200",
            currentPath === "/archive"
              ? "bg-white/20 text-white"
              : "text-white/70 hover:text-white hover:bg-white/10"
          )}
          title="Archive"
        >
          <Archive className="w-5 h-5" />
        </Link>
        <Link
          to="/settings"
          className={cn(
            "p-2.5 rounded-lg transition-all duration-200",
            currentPath === "/settings"
              ? "bg-white/20 text-white"
              : "text-white/70 hover:text-white hover:bg-white/10"
          )}
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </Link>
      </div>
    </nav>
  );
}
