import { Eye, Plus, Star } from "lucide-react";
import { toast } from "sonner";
import Avatar from "../../../components/common/Avatar";
import Badge from "../../../components/common/Badge";
import Button from "../../../components/common/Button";
import PageHeader from "../../../components/common/PageHeader";
import { PHIS } from "../../../utils/constants";

export default function ManagePHIs() {
  return (
    <>
      <PageHeader
        title="Manage PHIs"
        description={`${PHIS.length} inspectors`}
        action={
          <Button onClick={() => toast("Add PHI form coming soon")}>
            <Plus className="h-4 w-4" /> Add PHI
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {PHIS.map((phi) => (
          <div key={phi.id} className="soft-shadow rounded-2xl border border-border bg-card p-5">
            <div className="flex items-start gap-3">
              <Avatar name={phi.name} className="h-12 w-12" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate font-semibold">{phi.name}</h3>
                  <Badge
                    className={
                      phi.status === "Active"
                        ? "bg-success/15 text-success"
                        : "bg-warning/15 text-warning"
                    }
                  >
                    {phi.status}
                  </Badge>
                </div>
                <p className="truncate text-xs text-muted-foreground">{phi.email}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">📍 {phi.area}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-muted/40 p-3 text-center text-xs">
              <div>
                <div className="text-lg font-bold">{phi.inspections}</div>
                <div className="text-muted-foreground">Inspections</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1 text-lg font-bold">
                  <Star className="h-4 w-4 fill-warning text-warning" />
                  {phi.rating}
                </div>
                <div className="text-muted-foreground">Rating</div>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="outline" className="flex-1">
                <Eye className="h-3.5 w-3.5" /> Profile
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => toast.success(`Area assignment updated for ${phi.name}`)}
              >
                Assign area
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
