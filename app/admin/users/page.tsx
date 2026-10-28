import type { Metadata } from "next";
import { UsersContainer } from "@/components/admin/UsersContainer";

export const metadata: Metadata = { title: "Users — NeuraOS admin" };

export default async function AdminUsersPage({ searchParams }: PageProps<"/admin/users">) {
  const { user } = await searchParams;
  return (
    <main id="main" className="flex min-h-0 flex-1 flex-col">
      <UsersContainer initialUser={typeof user === "string" ? user : null} />
    </main>
  );
}
