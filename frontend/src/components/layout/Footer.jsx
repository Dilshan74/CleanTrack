import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { APP_NAME } from "../../utils/constants";

export default function Footer() {
  return (
    <footer className="border-t border-border py-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 text-sm text-muted-foreground md:flex-row md:px-8">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <span>© 2026 {APP_NAME} — Ministry of Health partnership.</span>
        </div>
        <div className="flex gap-5">
          <Link to="/login" className="hover:text-foreground">
            Sign in
          </Link>
          <Link to="/register" className="hover:text-foreground">
            Register
          </Link>
        </div>
      </div>
    </footer>
  );
}
