import { useState } from "react";
import { toast } from "sonner";
import Button from "../../../components/common/Button";
import PageHeader from "../../../components/common/PageHeader";
import { FormField, Input, Label, Switch } from "../../../components/common/Field";

const TOGGLES = [
  "Auto-assign PHIs",
  "Send SMS alerts",
  "AI auto-approve low risk",
  "Public risk map",
  "Maintenance mode",
];

export default function Settings() {
  const [toggles, setToggles] = useState(() =>
    Object.fromEntries(TOGGLES.map((item, index) => [item, index < 3])),
  );

  return (
    <>
      <PageHeader title="System Settings" description="Platform-wide configuration" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="soft-shadow rounded-2xl border border-border bg-card p-6">
          <h3 className="mb-4 font-semibold">General</h3>
          <div className="space-y-4">
            <FormField label="Platform name" htmlFor="platform-name">
              <Input id="platform-name" defaultValue="DengueGuard AI" />
            </FormField>
            <FormField label="Support email" htmlFor="support-email">
              <Input id="support-email" type="email" defaultValue="support@dengueguard.lk" />
            </FormField>
            <FormField label="AI model version" htmlFor="model-version">
              <Input id="model-version" defaultValue="v2.4.1" />
            </FormField>
          </div>
        </div>

        <div className="soft-shadow rounded-2xl border border-border bg-card p-6">
          <h3 className="mb-4 font-semibold">System Toggles</h3>
          <div className="space-y-4">
            {TOGGLES.map((item) => (
              <div key={item} className="flex items-center justify-between gap-3">
                <Label className="font-normal text-muted-foreground">{item}</Label>
                <Switch
                  label={item}
                  checked={toggles[item]}
                  onChange={(checked) =>
                    setToggles((current) => ({ ...current, [item]: checked }))
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <Button onClick={() => toast.success("Settings saved")}>Save</Button>
      </div>
    </>
  );
}
