import { AppSidebar } from "@/components/common/app-sidebar";
import { AppHeader } from "@/components/common/app-header";
import { GlobalScratchpadDrawer } from "@/features/scratchpad/components/global-scratchpad-drawer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#0B0C10] text-[#F6F6F8]">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
      <GlobalScratchpadDrawer />
    </div>
  );
}