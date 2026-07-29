import { cn } from "../../utils/helpers";
import { initials } from "../../utils/helpers";

export default function Avatar({ name = "", src, className, textClassName }) {
  return (
    <div
      className={cn(
        "grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-primary/20 bg-primary/10",
        className,
      )}
    >
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span className={cn("text-xs font-bold text-primary", textClassName)}>
          {initials(name)}
        </span>
      )}
    </div>
  );
}
