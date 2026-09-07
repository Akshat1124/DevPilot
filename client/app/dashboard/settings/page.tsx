"use client";

import { RequireAuth } from "@/components/providers/require-auth";
import { AppShell } from "@/components/layout/app-shell";
import { SettingsDashboard } from "@/components/dashboard/settings-dashboard";

export default function SettingsPage() {
  return (
    <RequireAuth>
      <AppShell hideHeader>
        <SettingsDashboard/>
      </AppShell>
    </RequireAuth>
  );
}
