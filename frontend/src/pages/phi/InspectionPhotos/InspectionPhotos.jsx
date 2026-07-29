import { Camera, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import Button from "../../../components/common/Button";
import PageHeader from "../../../components/common/PageHeader";
import { FormField, Textarea } from "../../../components/common/Field";
import ImageUploader from "../../../components/ai/ImageUploader";

const STAGES = ["Before Inspection", "After Inspection"];

export default function InspectionPhotos() {
  return (
    <>
      <PageHeader
        title="Upload Inspection Photos"
        description="DG-1042 · Nugegoda, Ward 12"
      />
      <div className="grid gap-6 lg:grid-cols-2">
        {STAGES.map((stage) => (
          <div key={stage} className="soft-shadow rounded-2xl border border-border bg-card p-6">
            <h3 className="mb-3 flex items-center gap-2 font-semibold">
              <Camera className="h-4 w-4 text-primary" /> {stage}
            </h3>
            <ImageUploader hint="Up to 5 images, PNG or JPG" />
          </div>
        ))}
      </div>

      <div className="soft-shadow mt-6 rounded-2xl border border-border bg-card p-6">
        <FormField label="Inspection Notes" htmlFor="inspection-notes">
          <Textarea
            id="inspection-notes"
            placeholder="Describe the observed conditions, actions taken, and follow-up requirements…"
            className="min-h-[120px]"
          />
        </FormField>
        <div className="mt-4 flex justify-end">
          <Button onClick={() => toast.success("Inspection photos uploaded")}>
            <UploadCloud className="h-4 w-4" /> Upload &amp; Save
          </Button>
        </div>
      </div>
    </>
  );
}
