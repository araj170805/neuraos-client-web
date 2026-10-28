"use client";

import { useState } from "react";
import { isoDay } from "@/components/admin/adminLabels";
import { DataTable } from "@/components/admin/DataTable";
import { PersonCell } from "@/components/admin/PersonCell";
import { TableToolbar } from "@/components/admin/TableToolbar";
import { TextCell } from "@/components/admin/TextCell";
import { UserDrawerBody } from "@/components/admin/UserDrawerBody";
import { YesNoCell } from "@/components/admin/YesNoCell";
import { verificationPill } from "@/components/account/statusPills";
import { Drawer } from "@/components/ui/Drawer";
import { StatusPill } from "@/components/ui/StatusPill";
import type { AdminApplication, AdminContribution, AdminUser } from "@/lib/contracts/admin";

type UsersScreenProps = {
  users: AdminUser[];
  applications: AdminApplication[];
  contributions: AdminContribution[];
  /** Opened from a contributor card (?user=). */
  initialUser: string | null;
};

/** Users table with the detail drawer. */
export function UsersScreen({ users, applications, contributions, initialUser }: UsersScreenProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(initialUser);

  const q = query.trim().toLowerCase();
  const list = users.filter((u) => [u.name, u.email, u.specialty ?? ""].some((v) => v.toLowerCase().includes(q)));
  const selected = users.find((u) => u.uid === open);

  return (
    <div className="flex flex-col gap-4">
      <TableToolbar query={query} onQuery={setQuery} placeholder="Search name or email" />
      <DataTable
        label="Users"
        minWidth="65rem"
        columns={[
          { header: "Name", width: "minmax(13.75rem,1.4fr)" },
          { header: "Email", width: "minmax(13.75rem,1.4fr)" },
          { header: "Verification", width: "7.5rem" },
          { header: "Can contribute", width: "7.5rem" },
          { header: "Referrals", width: "10.625rem" },
          { header: "Joined", width: "6.875rem" },
        ]}
        rows={list.map((u) => ({
          key: u.uid,
          onOpen: () => setOpen(u.uid),
          label: `Open ${u.name}`,
          cells: [
            <PersonCell key="p" name={u.name} sub={u.specialty ?? undefined} />,
            <TextCell key="e" tone="muted">{u.email}</TextCell>,
            <StatusPill key="v" tone={verificationPill[u.verificationStatus].tone}>
              {verificationPill[u.verificationStatus].label}
            </StatusPill>,
            <YesNoCell key="c" value={u.canContribute} />,
            <TextCell key="r" tone="mono">{`${u.referralCount} invited · ${u.qualifiedReferralCount} active`}</TextCell>,
            <TextCell key="j" tone="muted">{isoDay(u.createdAt)}</TextCell>,
          ],
        }))}
        empty={{ icon: "search", title: "No matches", description: "Try a different name or email." }}
        footer={list.length ? `Showing ${list.length} of ${users.length}` : undefined}
      />
      <Drawer open={selected !== undefined} onClose={() => setOpen(null)} label="User">
        {selected && (
          <UserDrawerBody
            user={selected}
            application={applications.find((a) => a.uid === selected.uid)}
            contributions={contributions.filter((c) => c.contributorUid === selected.uid)}
          />
        )}
      </Drawer>
    </div>
  );
}
