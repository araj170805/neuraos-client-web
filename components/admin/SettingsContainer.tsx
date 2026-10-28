"use client";

import { SettingsScreen } from "@/components/admin/SettingsScreen";
import { PageStatus } from "@/components/app/PageStatus";
import { useConfig } from "@/hooks/admin/useConfig";

/** Client side of admin settings: live `config/app`. */
export function SettingsContainer() {
  const config = useConfig();
  if (!config.data) {
    return <PageStatus error={config.error} label={config.loading ? "Loading…" : "No config/app document yet. Run bun run seed:config."} />;
  }
  return <SettingsScreen key={JSON.stringify(config.data)} config={config.data} spendToday={null} onSave={config.update} />;
}
