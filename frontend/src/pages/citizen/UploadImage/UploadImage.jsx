import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Sparkles } from "lucide-react";
import { toast } from "sonner";
import Button from "../../../components/common/Button";
import PageHeader from "../../../components/common/PageHeader";
import { FormField, Input, Select, Textarea } from "../../../components/common/Field";
import ImageUploader from "../../../components/ai/ImageUploader";

const CATEGORIES = [
  { value: "water", label: "Stagnant Water" },
  { value: "container", label: "Discarded Container" },
  { value: "drain", label: "Blocked Drain" },
  { value: "other", label: "Other" },
];

export default function UploadImage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);

  const submit = () => {
    if (!file) {
      toast.error("Add a photo of the site before submitting");
      return;
    }
    toast.success("Report submitted — AI analysis in progress");
    navigate("/citizen/ai-result");
  };

  return (
    <>
      <PageHeader
        title="Upload a report"
        description="Snap or upload a photo of stagnant water or suspicious debris."
      />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="soft-shadow rounded-2xl border border-border bg-card p-6">
          <ImageUploader onSelect={setFile} />
        </div>

        <div className="space-y-4">
          <div className="soft-shadow rounded-2xl border border-border bg-card p-6">
            <h3 className="mb-4 font-semibold">Location &amp; Details</h3>
            <div className="space-y-4">
              <FormField label="Location" htmlFor="location">
                <Input id="location" icon={MapPin} defaultValue="Nugegoda, Ward 12" />
                <div className="rounded-xl border border-dashed border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                  📍 GPS: 6.8712° N, 79.8890° E — auto-detected
                </div>
              </FormField>
              <FormField label="Category" htmlFor="category">
                <Select id="category" defaultValue="water" options={CATEGORIES} />
              </FormField>
              <FormField label="Description" htmlFor="description">
                <Textarea
                  id="description"
                  placeholder="Describe what you observed…"
                  className="min-h-[100px] resize-none"
                />
              </FormField>
            </div>
          </div>

          <Button size="lg" className="w-full font-semibold" onClick={submit}>
            <Sparkles className="h-4 w-4" /> Submit for AI Analysis
          </Button>
        </div>
      </div>
    </>
  );
}
