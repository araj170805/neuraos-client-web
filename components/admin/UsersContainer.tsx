"use client";

import { UsersScreen } from "@/components/admin/UsersScreen";
import { PageStatus } from "@/components/app/PageStatus";
import { TopBar } from "@/components/app/TopBar";
import { useAdminContributions } from "@/hooks/admin/useAdminContributions";
import { useAdminUsers } from "@/hooks/admin/useAdminUsers";
import { useApplications } from "@/hooks/admin/useApplications";

/** Client side of the users page. `initialUser` opens a drawer (?user=). */
export function UsersContainer({ initialUser }: { initialUser: string | null }) {
  const users = useAdminUsers();
  const applications = useApplications();
  const contributions = useAdminContributions();

  return (
    <>
      <TopBar title="Users" subtitle={users.data ? `${users.data.length} accounts` : undefined} />
      {users.data && applications.data && contributions.data ? (
        <div className="min-h-0 flex-1 overflow-auto px-4 pt-2 pb-14 app:px-7">
          <div className="mx-auto max-w-admin">
            <UsersScreen
              users={users.data}
              applications={applications.data}
              contributions={contributions.data}
              initialUser={initialUser}
            />
          </div>
        </div>
      ) : (
        <PageStatus error={users.error ?? applications.error ?? contributions.error} />
      )}
    </>
  );
}
