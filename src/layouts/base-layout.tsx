import React from "react";
import DragWindowRegion from "@/components/drag-window-region";
import TabNavigation from "@/components/tab-navigation";

interface BaseLayoutProps {
  children: React.ReactNode;
  internalCount?: number;
  externalCount?: number;
  hotCount?: number;
}

export default function BaseLayout({
  children,
  internalCount = 0,
  externalCount = 0,
  hotCount = 0,
}: BaseLayoutProps) {
  return (
    <div className="flex flex-col h-screen">
      <DragWindowRegion title="SyncTrack" />
      <TabNavigation
        internalCount={internalCount}
        externalCount={externalCount}
        hotCount={hotCount}
      />
      <main className="flex-1 overflow-auto px-4 pb-4">{children}</main>
    </div>
  );
}
