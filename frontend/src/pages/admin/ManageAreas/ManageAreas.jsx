import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Button from "../../../components/common/Button";
import Modal from "../../../components/common/Modal";
import PageHeader from "../../../components/common/PageHeader";
import { FormField, Input, Select } from "../../../components/common/Field";
import AreaRiskList from "../../../components/maps/AreaRiskList";
import RiskMap from "../../../components/maps/RiskMap";
import { AREAS } from "../../../utils/constants";

export default function ManageAreas() {
  const [areas, setAreas] = useState(AREAS);
  const [editing, setEditing] = useState(null);

  const remove = (id) => {
    setAreas((current) => current.filter((area) => area.id !== id));
    toast.success(`${id} removed`);
  };

  return (
    <>
      <PageHeader
        title="Manage Areas"
        description="Assign PHIs, set risk levels, and monitor area statistics"
        action={
          <Button onClick={() => setEditing({ id: "new", name: "", risk: "Medium", phi: "" })}>
            <Plus className="h-4 w-4" /> Add Area
          </Button>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <RiskMap areas={areas} />
        <div className="max-h-[520px] overflow-y-auto pr-1">
          <AreaRiskList
            areas={areas}
            actions={(area) => (
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label={`Edit ${area.name}`}
                  onClick={() => setEditing(area)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  aria-label={`Delete ${area.name}`}
                  onClick={() => remove(area.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          />
        </div>
      </div>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing?.id === "new" ? "Add area" : `Edit ${editing?.name ?? ""}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setEditing(null);
                toast.success("Area saved");
              }}
            >
              Save
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <FormField label="Area name" htmlFor="area-name">
            <Input id="area-name" defaultValue={editing?.name} placeholder="Nugegoda" />
          </FormField>
          <FormField label="Risk level" htmlFor="area-risk">
            <Select id="area-risk" defaultValue={editing?.risk} options={["High", "Medium", "Low"]} />
          </FormField>
          <FormField label="Assigned PHI" htmlFor="area-phi">
            <Input id="area-phi" defaultValue={editing?.phi} placeholder="I. Perera" />
          </FormField>
        </div>
      </Modal>
    </>
  );
}
