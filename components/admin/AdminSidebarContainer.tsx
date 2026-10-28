"use client";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { useAdminContributions } from "@/hooks/admin/useAdminContributions";
import { useApplications } from "@/hooks/admin/useApplications";
import { useAuth } from "@/hooks/useAuth";

/** Client side of the admin sidebar: live queue counts and the signed-in admin. */
export function AdminSidebarContainer() {
  const { user } = useAuth();
  const applications = useApplications();
  const contributions = useAdminContributions();
  const counts = {
    applications: applications.data?.filter((a) => a.status === "pending").length ?? 0,
    contributions: contributions.data?.filter((c) => c.status === "submitted").length ?? 0,
  };
  return <AdminSidebar counts={counts} admin={{ name: user?.displayName ?? user?.email ?? "Admin" }} />;
}
