import NextLink from "next/link";
import { money } from "@/components/admin/adminLabels";
import { Meter } from "@/components/ui/Meter";
import { Text } from "@/components/ui/Text";

/** Dark overview tile: today's AI spend against the daily cap; opens Settings. `spend` is null until there's a spend route. */
export function SpendCard({ spend, cap }: { spend: number | null; cap: number }) {
  const share = spend === null ? 0 : cap > 0 ? spend / cap : 1;
  return (
    <NextLink
      href="/admin/settings"
      className="flex min-h-40 flex-col gap-3 rounded-panel-lg bg-linear-to-b from-key-dark to-ink p-4.5 text-on-dark shadow-dark-card"
    >
      <Text as="span" variant="stat-label" className="text-on-dark-muted">
        Today&apos;s AI spend
      </Text>
      <span className="flex flex-wrap items-baseline gap-2">
        <Text as="span" variant="stat">
          {spend === null ? "—" : money(spend)}
        </Text>
        <Text as="span" variant="caption" className="text-on-dark-muted">
          of {money(cap)}
        </Text>
      </span>
      <span className="mt-auto flex w-full flex-col gap-2">
        <Meter value={share} label="Today's AI spend against the daily cap" theme="dark" />
        <Text as="span" variant="mono-meta" className="text-on-dark-muted">
          {spend === null
            ? "Spend tracking isn't shown yet · resets at midnight IST"
            : share >= 1
              ? "Cap reached · AI replies paused until midnight IST"
              : `${Math.round(share * 100)}% used · resets at midnight IST`}
        </Text>
      </span>
    </NextLink>
  );
}
