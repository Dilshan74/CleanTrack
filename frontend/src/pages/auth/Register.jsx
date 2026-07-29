import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Lock, Mail, MapPin, Phone, User } from "lucide-react";
import { toast } from "sonner";
import Button from "../../components/common/Button";
import { FormField, Input, Textarea } from "../../components/common/Field";
import useAuth from "../../hooks/useAuth";
import { ROLES, ROLE_HOME } from "../../utils/constants";
import { rules, validate } from "../../utils/validators";

const BENEFITS = [
  "AI-powered risk analysis in seconds",
  "Real-time updates from your local PHI",
  "Neighbourhood dengue risk map",
  "Prevention tips tailored to your area",
];

const INITIAL = {
  name: "",
  email: "",
  mobile: "",
  password: "",
  confirm: "",
  address: "",
};

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [values, setValues] = useState(INITIAL);
  const [errors, setErrors] = useState({});

  const onChange = (field) => (event) =>
    setValues((current) => ({ ...current, [field]: event.target.value }));

  const submit = (event) => {
    event.preventDefault();
    const nextErrors = validate(values, {
      name: [rules.required("Enter your full name")],
      email: [rules.required(), rules.email()],
      mobile: [rules.required(), rules.mobile()],
      password: [rules.required(), rules.password()],
      confirm: [rules.required("Confirm your password"), rules.matches("password", "Passwords do not match")],
      address: [rules.required("Enter your address")],
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    login({ email: values.email, name: values.name, role: ROLES.CITIZEN });
    toast.success("Account created — welcome to DengueGuard AI");
    navigate(ROLE_HOME[ROLES.CITIZEN]);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto grid min-h-screen max-w-6xl place-items-center px-4 py-10">
        <div className="soft-shadow w-full overflow-hidden rounded-3xl border border-border bg-card">
          <div className="grid md:grid-cols-[1.1fr_1fr]">
            <div className="border-b border-border bg-gradient-to-br from-primary to-accent p-8 text-primary-foreground md:border-b-0 md:border-r">
              <Link to="/" className="flex items-center gap-2.5 font-bold">
                DengueGuard AI
              </Link>
              <h1 className="mt-10 text-3xl font-bold leading-tight md:text-4xl">
                Join the fight against dengue.
              </h1>
              <p className="mt-3 text-sm text-primary-foreground/85">
                Create your citizen account to report breeding sites, receive alerts, and
                track inspections in your neighbourhood.
              </p>
              <ul className="mt-8 space-y-3 text-sm">
                {BENEFITS.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                    <span className="text-primary-foreground/90">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <form onSubmit={submit} className="space-y-4 p-8">
              <div>
                <h2 className="text-2xl font-bold">Create your account</h2>
                <p className="text-sm text-muted-foreground">It only takes a minute.</p>
              </div>

              <FormField label="Full Name" htmlFor="name" error={errors.name}>
                <Input
                  id="name"
                  icon={User}
                  placeholder="Nimal Perera"
                  value={values.name}
                  onChange={onChange("name")}
                  error={errors.name}
                />
              </FormField>
              <FormField label="Email Address" htmlFor="email" error={errors.email}>
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
              <FormField label="Mobile Number" htmlFor="mobile" error={errors.mobile}>
                <Input
                  id="mobile"
                  icon={Phone}
                  placeholder="+94 77 123 4567"
                  value={values.mobile}
                  onChange={onChange("mobile")}
                  error={errors.mobile}
                />
              </FormField>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Password" htmlFor="password" error={errors.password}>
                  <Input
                    id="password"
                    type="password"
                    icon={Lock}
                    placeholder="••••••••"
                    value={values.password}
                    onChange={onChange("password")}
                    error={errors.password}
                  />
                </FormField>
                <FormField label="Confirm Password" htmlFor="confirm" error={errors.confirm}>
                  <Input
                    id="confirm"
                    type="password"
                    icon={Lock}
                    placeholder="••••••••"
                    value={values.confirm}
                    onChange={onChange("confirm")}
                    error={errors.confirm}
                  />
                </FormField>
              </div>
              <FormField label="Address" htmlFor="address" error={errors.address}>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    id="address"
                    placeholder="Street, Ward, City"
                    className="min-h-[80px] resize-none pl-10"
                    value={values.address}
                    onChange={onChange("address")}
                    error={errors.address}
                  />
                </div>
              </FormField>

              <Button type="submit" size="lg" className="w-full">
                Register <ArrowRight className="h-4 w-4" />
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="font-semibold text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
