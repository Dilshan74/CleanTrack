import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "../../utils/helpers";

export default function Modal({ isOpen, onClose, title, children, className }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Dialog */}
      <div 
        className={cn(
          "relative z-50 w-full max-w-md rounded-2xl border bg-card p-6 shadow-lg sm:max-w-lg",
          className
        )}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold">{title}</h2>
          <button 
            onClick={onClose}
            className="rounded-lg p-1.5 hover:bg-muted text-muted-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="max-h-[80vh] overflow-y-auto pr-1 -mr-1">
          {children}
        </div>
      </div>
    </div>
  );
}
