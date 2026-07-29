import { useRef, useState } from "react";
import { Camera, ImagePlus, UploadCloud, X } from "lucide-react";
import Button from "../common/Button";
import { cn } from "../../utils/helpers";

/** Drag-and-drop image picker with a local preview. */
export default function ImageUploader({ onSelect, hint = "PNG, JPG up to 10MB" }) {
  const [preview, setPreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    onSelect?.(file);
  };

  const clear = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    onSelect?.(null);
  };

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragOver(false);
        handleFile(event.dataTransfer.files?.[0]);
      }}
      className={cn(
        "relative flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center transition-colors",
        dragOver ? "border-primary bg-primary/5" : "border-border bg-muted/30",
      )}
    >
      {preview ? (
        <>
          <img src={preview} alt="Selected upload" className="max-h-[320px] rounded-xl object-cover" />
          <Button size="sm" variant="secondary" onClick={clear} className="mt-3">
            <X className="h-4 w-4" /> Remove
          </Button>
        </>
      ) : (
        <>
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <UploadCloud className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm font-semibold">Drag &amp; drop an image here</p>
            <p className="text-xs text-muted-foreground">{hint}</p>
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            <Button onClick={() => inputRef.current?.click()}>
              <ImagePlus className="h-4 w-4" /> Upload from Device
            </Button>
            <Button
              variant="outline"
              onClick={() => inputRef.current?.click()}
            >
              <Camera className="h-4 w-4" /> Camera Capture
            </Button>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(event) => handleFile(event.target.files?.[0])}
          />
        </>
      )}
    </div>
  );
}
