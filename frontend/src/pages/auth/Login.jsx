import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import Button from "../../components/common/Button";
import { Checkbox, FormField, Input, Label } from "../../components/common/Field";
import useAuth from "../../hooks/useAuth";
import { ROLES, ROLE_HOME } from "../../utils/constants";
import { rules, validate } from "../../utils/validators";

const ROLE_TABS = [
  { value: ROLES.CITIZEN, label: "Citizen" },
  { value: ROLES.PHI, label: "PHI" },
  { value: ROLES.ADMIN, label: "Admin" },
];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [role, setRole] = useState(ROLES.CITIZEN);
  const [showPassword, setShowPassword] = useState(false);
  const [values, setValues] = useState({ email: "citizen@dengueguard.lk", password: "demo1234" });
  const [errors, setErrors] = useState({});

  const setRoleAndEmail = (nextRole) => {
    setRole(nextRole);
    setValues((current) => ({ ...current, email: `${nextRole}@dengueguard.lk` }));
  };

  const onChange = (field) => (event) =>
    setValues((current) => ({ ...current, [field]: event.target.value }));

  const submit = (event) => {
    event.preventDefault();
    const nextErrors = validate(values, {
      email: [rules.required(), rules.email()],
      password: [rules.required(), rules.password()],
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    login({ email: values.email, role });
    toast.success(`Welcome back — signed in as ${role.toUpperCase()}`);
    navigate(ROLE_HOME[role]);
  };

  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Sign in to continue to your dashboard
      </p>

      <div className="mt-6 grid grid-cols-3 gap-1 rounded-xl bg-muted p-1">
        {ROLE_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setRoleAndEmail(tab.value)}
            className={
              role === tab.value
                ? "rounded-lg bg-background px-3 py-2 text-sm font-semibold shadow-sm"
                : "rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <FormField label="Email" htmlFor="email" error={errors.email}>
          <Input
            id="email"
            type="email"
            icon={Mail}
            placeholder="you@example.com"
            value={values.email}
            onChange={onChange("email")}
            error={errors.email}
          />
        </FormField>

        <FormField error={errors.password}>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              icon={Lock}
              placeholder="••••••••"
              className="pr-10"
              value={values.password}
              onChange={onChange("password")}
              error={errors.password}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </FormField>

        <div className="flex items-center gap-2">
          <Checkbox id="remember" defaultChecked />
          <Label htmlFor="remember" className="font-normal text-muted-foreground">
            Remember me on this device
          </Label>
        </div>

        <Button type="submit" size="lg" className="w-full">
          Sign in <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="font-semibold text-primary hover:underline">
          Create one
        </Link>
      </p>
    </>
  );
}
