const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const LK_MOBILE_RE = /^(?:\+94|0)?7\d{8}$/;

export const isRequired = (value) => String(value ?? "").trim().length > 0;
export const isEmail = (value) => EMAIL_RE.test(String(value ?? "").trim());
export const isMobile = (value) =>
  LK_MOBILE_RE.test(String(value ?? "").replace(/[\s-]/g, ""));
export const isStrongPassword = (value) => String(value ?? "").length >= 8;

/**
 * Validate a form object against a `{ field: [rule] }` shape.
 * Each rule is `{ test, message }`. Returns `{ field: message }`.
 */
export function validate(values, rules) {
  const errors = {};
  for (const [field, fieldRules] of Object.entries(rules)) {
    for (const rule of fieldRules) {
      if (!rule.test(values[field], values)) {
        errors[field] = rule.message;
        break;
      }
    }
  }
  return errors;
}

export const rules = {
  required: (message = "This field is required") => ({ test: isRequired, message }),
  email: (message = "Enter a valid email address") => ({ test: isEmail, message }),
  mobile: (message = "Enter a valid mobile number") => ({ test: isMobile, message }),
  password: (message = "Use at least 8 characters") => ({
    test: isStrongPassword,
    message,
  }),
  matches: (field, message = "Values do not match") => ({
    test: (value, values) => value === values[field],
    message,
  }),
};
