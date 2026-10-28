import NextLink from "next/link";
import { contributionReviewPill, isoDay } from "@/components/admin/adminLabels";
import { reviewHistory } from "@/components/admin/reviewHistory";
import { YesNoCell } from "@/components/admin/YesNoCell";
import { verificationPill } from "@/components/account/statusPills";
import { Avatar } from "@/components/ui/Avatar";
import { KeyValueList } from "@/components/ui/KeyValueList";
import { Notice } from "@/components/ui/Notice";
import { Panel } from "@/components/ui/Panel";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { StatusPill } from "@/components/ui/StatusPill";
import { Text } from "@/components/ui/Text";
import { Timeline } from "@/components/ui/Timeline";
import type { AdminApplication, AdminContribution, AdminUser } from "@/lib/contracts/admin";

type UserDrawerBodyProps = {
  user: AdminUser;
  application: AdminApplication | undefined;
  contributions: AdminContribution[];
};

/**
 * User detail (design "Admin — User detail"): facts, whether they can contribute
 * (set by verification), application, contributions, referral counts.
 */
export function UserDrawerBody({ user, application, contributions }: UserDrawerBodyProps) {
  const pill = verificationPill[user.verificationStatus];
  const verified = user.verificationStatus === "approved";
  return (
    <>
      <div className="flex items-center gap-3.5">
        <Avatar name={user.name} size="xl" />
        <div className="min-w-0 flex-1">
          <Text as="h3" variant="dialog-title">
            {user.name}
          </Text>
          <Text variant="caption" className="mt-1 truncate text-muted">
            {user.email}
          </Text>
        </div>
        <StatusPill tone={pill.tone}>{pill.label}</StatusPill>
      </div>

      <Panel elevation="flat" className="px-4.5 py-0.5">
        <KeyValueList
          layout="inline"
          items={[
            { label: "Specialty", value: user.specialty ?? "—" },
            { label: "Institution", value: application?.institution ?? "—" },
            { label: "Phone", value: application?.phone ?? "—" },
            { label: "Registration", value: application?.registrationNumber ?? "—" },
            { label: "Joined", value: isoDay(user.createdAt) },
          ]}
        />
      </Panel>

      <Panel elevation="flat" className="flex items-center gap-3.5 py-3.5 pr-4 pl-4.5">
        <div className="min-w-0 flex-1">
          <Text as="p" id="can-contribute" variant="ui-md">
            Can contribute
          </Text>
          <Text variant="meta-md" className="mt-0.5 text-muted">
            {verified ? (user.canContribute ? "They can submit case studies." : "They can't submit case studies.") : "Available once they're verified."}
          </Text>
        </div>
        <YesNoCell value={user.canContribute} />
      </Panel>

      <section aria-labelledby="drawer-application">
        <SectionLabel as="h3" id="drawer-application">
          Application history
        </SectionLabel>
        {application ? (
          <Panel elevation="flat" className="px-4.5 pt-4 pb-0.5">
            <Timeline entries={reviewHistory(application, user.name, "Admin")} />
          </Panel>
        ) : (
          <Notice tone="empty">No application yet.</Notice>
        )}
      </section>

      <section aria-labelledby="drawer-contributions">
        <SectionLabel as="h3" id="drawer-contributions">
          Contributions · {contributions.length}
        </SectionLabel>
        {contributions.length > 0 ? (
          <Panel elevation="flat" divided>
            {contributions.map((c) => (
              <NextLink key={c.id} href={`/admin/contributions/${c.id}`} className="flex min-h-14.5 items-center gap-3 px-4 py-2.5 hover:bg-callout">
                <span className="min-w-0 flex-1">
                  <Text as="span" variant="body" className="block truncate">
                    {c.title}
                  </Text>
                  <Text as="span" variant="mono-meta" className="mt-0.75 block text-muted">
                    {c.id.toUpperCase()} · {c.type === "voice" ? "Voice" : "Text"} · {isoDay(c.submittedAt)}
                  </Text>
                </span>
                <StatusPill tone={contributionReviewPill[c.status].tone}>{contributionReviewPill[c.status].label}</StatusPill>
              </NextLink>
            ))}
          </Panel>
        ) : (
          <Notice tone="empty">No contributions yet.</Notice>
        )}
      </section>

      <section aria-labelledby="drawer-referrals">
        <SectionLabel as="h3" id="drawer-referrals">
          Referrals · {user.referralCount} signed up · {user.qualifiedReferralCount} active
        </SectionLabel>
        {user.referralCount === 0 && <Notice tone="empty">Hasn&apos;t invited anyone yet.</Notice>}
      </section>
    </>
  );
}
