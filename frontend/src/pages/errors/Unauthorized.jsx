import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import Button from "../../components/common/Button";

export default function Unauthorized() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-destructive/10 text-destructive">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h1 className="mt-6 text-3xl font-bold">403 — Unauthorized</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account doesn&apos;t have permission to view this page.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button as={Link} to="/login">
            Sign in with another account
          </Button>
          <Button as={Link} to="/" variant="outline">
            Go home
          </Button>
        </div>
      </div>
    </div>
  );
}
