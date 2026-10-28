import NextLink from "next/link";
import { AdminNavigator } from "@/components/admin/AdminNavigator";
import { SignOutButton } from "@/components/app/SignOutButton";
import { AppBrand } from "@/components/ui/AppBrand";
import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";
import { StatusPill } from "@/components/ui/StatusPill";
import { Text } from "@/components/ui/Text";

type AdminSidebarProps = {
  counts: { applications: number; contributions: number };
  admin: { name: string };
};

/** Admin sidebar (design): brand + Admin pill, sections, back to the app, the signed-in admin. */
export function AdminSidebar({ counts, admin }: AdminSidebarProps) {
  return (
    <>
      <div className="flex h-nav shrink-0 items-center px-5.5">
        <AppBrand badge={<StatusPill tone="dark">Admin</StatusPill>} />
      </div>
      <AdminNavigator counts={counts} />
      <div className="flex shrink-0 flex-col gap-2 px-3 pt-3 pb-4">
        <Text
          as={NextLink}
          href="/chat"
          variant="body-sm"
          className="flex h-10 items-center gap-2.5 rounded-card px-3.5 text-copy hover:bg-ink/4 hover:text-ink"
        >
          <Icon name="arrow-left" size={14} />
          Back to NeuraOS
        </Text>
        <SignOutButton />
        <div className="flex h-16 items-center gap-3 rounded-full border border-ink/8 bg-paper px-2.5 shadow-card-raised">
          <Avatar name={admin.name} size="lg" tone="dark" />
          <div className="min-w-0">
            <Text variant="button-sm" className="truncate">
              {admin.name}
            </Text>
            <Text variant="meta" className="mt-0.5 text-muted">
              Admin · Reviewer
            </Text>
          </div>
        </div>
      </div>
    </>
  );
}
