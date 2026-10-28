import { AppSidebar } from "@/components/app/AppSidebar";
import { SidebarProvider } from "@/components/app/SidebarProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { ChatSidebarContainer } from "@/components/chat/ChatSidebarContainer";
import { RequireAuth } from "@/components/RequireAuth";
import { Toast } from "@/components/ui/Toast";

/**
 * Signed-in app shell: sidebar (docked from 900px, overlay below) and the page.
 * The sidebar reads its data on the client (ChatSidebarContainer).
 */
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <AuthProvider>
      <RequireAuth>
        <SidebarProvider>
          <div className="flex h-dvh overflow-hidden bg-(image:--gradient-app) text-ink">
            <AppSidebar label="Chats and account">
              <ChatSidebarContainer />
            </AppSidebar>
            <div className="relative flex min-w-0 flex-1 flex-col">{children}</div>
          </div>
          <Toast />
        </SidebarProvider>
      </RequireAuth>
    </AuthProvider>
  );
}
