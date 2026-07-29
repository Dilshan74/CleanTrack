import { useState } from "react";
import { toast } from "sonner";
import Button from "../../../components/common/Button";
import PageHeader from "../../../components/common/PageHeader";
import { Label, Switch } from "../../../components/common/Field";
import useTheme from "../../../hooks/useTheme";

const GROUPS = [
  {
    title: "Notifications",
    items: ["Push notifications", "Email alerts", "SMS updates", "Weekly digest"],
  },
  {
    title: "Privacy",
    items: ["Share location with PHIs", "Show my reports publicly", "Allow analytics"],
  },
  { title: "Display", items: ["Dark mode", "Reduce motion", "High contrast"] },
];

const initialState = () =>
  Object.fromEntries(
    GROUPS.flatMap((group) => group.items.map((item, index) => [item, index % 2 === 0])),
  );

export default function Settings() {
  const { isDark, toggleTheme } = useTheme();
  const [toggles, setToggles] = useState(initialState);

  const isChecked = (item) => (item === "Dark mode" ? isDark : toggles[item]);

  const setToggle = (item) => (checked) => {
    if (item === "Dark mode") {
      toggleTheme();
      return;
    }
    setToggles((current) => ({ ...current, [item]: checked }));
  };

  return (
    <>
      <PageHeader title="Settings" description="Manage your account preferences" />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {GROUPS.map((group) => (
          <div key={group.title} className="soft-shadow rounded-2xl border border-border bg-card p-6">
            <h3 className="mb-4 font-semibold">{group.title}</h3>
            <div className="space-y-4">
              {group.items.map((item) => (
                <div key={item} className="flex items-center justify-between gap-3">
                  <Label className="font-normal text-muted-foreground">{item}</Label>
                  <Switch label={item} checked={isChecked(item)} onChange={setToggle(item)} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-end">
        <Button onClick={() => toast.success("Preferences saved")}>Save preferences</Button>
      </div>
    </>
  );
}
