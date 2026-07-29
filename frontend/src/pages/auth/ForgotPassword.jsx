import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Send } from "lucide-react";
import { toast } from "sonner";
import Button from "../../components/common/Button";
import { FormField, Input } from "../../components/common/Field";
import { rules, validate } from "../../utils/validators";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  const submit = (event) => {
    event.preventDefault();
    const nextErrors = validate({ email }, { email: [rules.required(), rules.email()] });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setSent(true);
    toast.success("Reset link sent — check your inbox");
  };

  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight">Reset your password</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        We&apos;ll email you a secure link to choose a new password.
      </p>

      {sent ? (
        <div className="mt-6 rounded-2xl border border-border bg-muted/30 p-5 text-sm">
          <p className="font-semibold">Check your inbox</p>
          <p className="mt-1 text-muted-foreground">
            If an account exists for {email}, a reset link is on its way.
          </p>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-6 space-y-4">
          <FormField label="Email" htmlFor="email" error={errors.email}>
            <Input
              id="email"
              type="email"
              icon={Mail}
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              error={errors.email}
            />
          </FormField>
          <Button type="submit" size="lg" className="w-full">
            Send reset link <Send className="h-4 w-4" />
          </Button>
        </form>
      )}

      <Link
        to="/login"
        className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> Back to sign in
      </Link>
    </>
  );
}
