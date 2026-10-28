import { AdminGate } from "@/components/admin/AdminGate";
import { AdminSidebarContainer } from "@/components/admin/AdminSidebarContainer";
import { AppSidebar } from "@/components/app/AppSidebar";
import { SidebarProvider } from "@/components/app/SidebarProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { RequireAuth } from "@/components/RequireAuth";
import { Toast } from "@/components/ui/Toast";

/** Admin shell: signed in + admin claim, 256px sidebar (overlay below 900px). */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <AuthProvider>
      <RequireAuth>
        <AdminGate>
          <SidebarProvider>
            <div className="flex h-dvh overflow-hidden bg-(image:--gradient-app) text-ink">
              <AppSidebar width="admin" label="Admin sections">
                <AdminSidebarContainer />
              </AppSidebar>
              <div className="relative flex min-w-0 flex-1 flex-col">{children}</div>
            </div>
            <Toast />
          </SidebarProvider>
        </AdminGate>
      </RequireAuth>
    </AuthProvider>
  );
}
