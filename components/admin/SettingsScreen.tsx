"use client";

import { clsx } from "clsx";
import { useId, useState } from "react";
import { TopBar } from "@/components/app/TopBar";
import { money } from "@/components/admin/adminLabels";
import { Button } from "@/components/ui/Button";
import { Meter } from "@/components/ui/Meter";
import { Panel } from "@/components/ui/Panel";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Text } from "@/components/ui/Text";
import { TextInput } from "@/components/ui/TextInput";
import { showToast } from "@/components/ui/toastStore";
import { Toggle } from "@/components/ui/Toggle";
import { errorMessage } from "@/lib/api/client";
import { appConfigSchema, type AppConfig, type UpdateConfigRequest } from "@/lib/contracts/admin";

type Feature = "aiEnabled" | "groupsEnabled" | "contributionsEnabled";

const features: { key: Feature; title: string; description: string }[] = [
  { key: "aiEnabled", title: "AI enabled", description: "Doctors can chat with NeuraOS. Turning this off pauses every AI reply." },
  { key: "groupsEnabled", title: "Groups enabled", description: "Doctors can turn chats into groups and invite colleagues." },
  { key: "contributionsEnabled", title: "Contributions enabled", description: "Doctors can submit case studies for training." },
];

type SettingsScreenProps = {
  config: AppConfig;
  /** Null until there's a spend route. */
  spendToday: number | null;
  /** PATCH /api/admin/config. */
  onSave: (body: UpdateConfigRequest) => Promise<void>;
};

/** Feature switches and the daily spend cap (design "Admin — Settings"). */
export function SettingsScreen({ config, spendToday, onSave }: SettingsScreenProps) {
  const [saved, setSaved] = useState(config);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState({ ...config, cap: String(config.dailySpendCapUsd) });
  const capId = useId();

  const next: AppConfig = {
    aiEnabled: draft.aiEnabled,
    groupsEnabled: draft.groupsEnabled,
    contributionsEnabled: draft.contributionsEnabled,
    dailySpendCapUsd: Number.parseFloat(draft.cap),
  };
  const valid = appConfigSchema.safeParse(next).success;
  const dirty =
    features.some((f) => draft[f.key] !== saved[f.key]) || next.dailySpendCapUsd !== saved.dailySpendCapUsd;
  const cap = valid ? next.dailySpendCapUsd : saved.dailySpendCapUsd;
  const share = spendToday === null ? 0 : cap > 0 ? spendToday / cap : 1;

  return (
    <>
      <TopBar title="Settings" subtitle="App switches and AI budget">
        <Button
          look="app-accent-sm"
          disabled={!dirty || !valid || busy}
          onClick={async () => {
            setBusy(true);
            try {
              await onSave(next);
              setSaved(next);
              showToast("Settings saved");
            } catch (error) {
              showToast(errorMessage(error));
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? "Saving…" : "Save changes"}
        </Button>
      </TopBar>
      <div className="min-h-0 flex-1 overflow-auto px-4 pt-2 pb-14 app:px-7">
        <div className="mx-auto flex max-w-admin flex-col">
          <div className="flex max-w-190 flex-col gap-7">
            <section aria-labelledby="features">
              <SectionLabel id="features">Features</SectionLabel>
              <Panel divided>
                {features.map((f) => (
                  <div key={f.key} className="flex min-h-19 items-center gap-4 py-3.5 pr-4.5 pl-5">
                    <div className="min-w-0 flex-1">
                      <Text as="p" id={`${capId}-${f.key}`} variant="item-title">
                        {f.title}
                      </Text>
                      <Text variant="body-sm" className="mt-0.75 text-muted text-pretty">
                        {f.description}
                      </Text>
                    </div>
                    <Toggle
                      checked={draft[f.key]}
                      onCheckedChange={(value) => setDraft({ ...draft, [f.key]: value })}
                      aria-labelledby={`${capId}-${f.key}`}
                    />
                  </div>
                ))}
              </Panel>
            </section>

            <section aria-labelledby="ai-spend">
              <SectionLabel id="ai-spend">AI spend</SectionLabel>
              <Panel className="flex flex-col gap-5.5 p-5">
                <div className="flex flex-col gap-2">
                  <Text as="label" htmlFor={capId} variant="key-label" className="px-1 text-muted">
                    Daily spend cap (USD)
                  </Text>
                  <TextInput
                    id={capId}
                    prefix="$"
                    mono
                    inputMode="decimal"
                    value={draft.cap}
                    aria-invalid={!valid}
                    onChange={(event) => setDraft({ ...draft, cap: event.target.value })}
                    className="max-w-65"
                  />
                  <Text variant="caption" className="px-1 text-muted text-pretty">
                    AI replies pause for everyone when today&apos;s spend reaches the cap, and resume at midnight IST.
                    {!valid && " Enter an amount from 0 to 100."}
                  </Text>
                </div>
                <div className="flex flex-col gap-2.5 border-t border-ink/7 pt-4.5">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <Text as="span" variant="item-title">
                      Today&apos;s spend
                    </Text>
                    <Text as="span" variant="mono-sm" className="text-ink-soft">
                      {spendToday === null ? "—" : money(spendToday)} of {money(cap)}
                    </Text>
                  </div>
                  <Meter value={share} label="Today's AI spend against the cap" />
                  <Text
                    as="span"
                    variant="mono-sm"
                    className={clsx(share >= 1 ? "text-danger-text" : share >= 0.8 ? "text-amber-text" : "text-muted")}
                  >
                    {spendToday === null
                      ? "Spend tracking isn't shown yet · resets at midnight IST"
                      : share >= 1
                        ? "Cap reached · AI replies paused until midnight IST"
                        : `${Math.round(share * 100)}% used · resets at midnight IST`}
                  </Text>
                </div>
              </Panel>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
