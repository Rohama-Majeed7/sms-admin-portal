/**
 * Centralized Frontend Validation Utilities for SMS Admin Portal
 *
 * Enforces standardized validation rules across all forms:
 * - Password: min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special character
 * - Confirm Password: mandatory and must match password
 * - Person Name: letters and spaces only, no digits, symbols, or emojis
 * - Pakistani Mobile Number: strict +923XXXXXXXXX format
 * - Email: valid standard email format
 * - Required fields: reject empty, whitespace-only, null, undefined
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  formatted?: string;
}

export const VALIDATION_MESSAGES = {
  NAME_REQUIRED: "Name is required.",
  NAME_INVALID: "Name can only contain letters and spaces.",
  EMAIL_REQUIRED: "Email address is required.",
  EMAIL_INVALID: "Please enter a valid email address.",
  PASSWORD_REQUIRED: "Password is required.",
  PASSWORD_INVALID:
    "Password must be at least 8 characters and contain an uppercase letter, lowercase letter, number, and special character.",
  CONFIRM_PASSWORD_REQUIRED: "Confirm password is required.",
  PASSWORDS_MUST_MATCH: "Passwords do not match.",
  PHONE_REQUIRED: "Mobile number is required.",
  PHONE_INVALID:
    "Please enter a valid Pakistani mobile number (e.g. +923001234567).",
  FIELD_REQUIRED: (fieldLabel: string) => `${fieldLabel} is required.`,
};

/**
 * Validates any person-name field (Admin Name, Full Name, Owner Name, Teacher Name, Student Name, Guardian Name, etc.)
 * Requirements:
 * - Letters only
 * - Spaces allowed between words
 * - Reject numbers, special characters, symbols, emojis
 */
export const validatePersonName = (
  name: string | null | undefined,
  fieldLabel = "Name"
): ValidationResult => {
  if (!name || !name.trim()) {
    return {
      isValid: false,
      error: `${fieldLabel} is required.`,
    };
  }

  const trimmed = name.trim();

  // Letters and spaces between words only
  // Matches "Ali", "Muhammad Ali", "Dr Sarah" etc.
  const nameRegex = /^[A-Za-z]+(?:\s+[A-Za-z]+)*$/;

  if (!nameRegex.test(trimmed)) {
    return {
      isValid: false,
      error: VALIDATION_MESSAGES.NAME_INVALID,
    };
  }

  return {
    isValid: true,
    formatted: trimmed,
  };
};

/**
 * Validates email address format throughout the portal.
 */
export const validateEmail = (
  email: string | null | undefined,
  fieldLabel = "Email address"
): ValidationResult => {
  if (!email || !email.trim()) {
    return {
      isValid: false,
      error: `${fieldLabel} is required.`,
    };
  }

  const trimmed = email.trim();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(trimmed)) {
    return {
      isValid: false,
      error: VALIDATION_MESSAGES.EMAIL_INVALID,
    };
  }

  return {
    isValid: true,
    formatted: trimmed,
  };
};

/**
 * Validates strong password requirements:
 * - At least 8 characters long
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export const validatePassword = (
  password: string | null | undefined,
  fieldLabel = "Password"
): ValidationResult => {
  if (!password) {
    return {
      isValid: false,
      error: `${fieldLabel} is required.`,
    };
  }

  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  if (!hasMinLength || !hasUpper || !hasLower || !hasNumber || !hasSpecial) {
    return {
      isValid: false,
      error: VALIDATION_MESSAGES.PASSWORD_INVALID,
    };
  }

  return {
    isValid: true,
  };
};

/**
 * Validates confirm password against password:
 * - Must be provided (mandatory)
 * - Must exactly match password
 */
export const validateConfirmPassword = (
  password: string,
  confirmPassword: string | null | undefined
): ValidationResult => {
  if (!confirmPassword) {
    return {
      isValid: false,
      error: VALIDATION_MESSAGES.CONFIRM_PASSWORD_REQUIRED,
    };
  }

  if (password !== confirmPassword) {
    return {
      isValid: false,
      error: VALIDATION_MESSAGES.PASSWORDS_MUST_MATCH,
    };
  }

  return {
    isValid: true,
  };
};

/**
 * Validates Pakistani mobile numbers.
 * The standardized project format is: +923XXXXXXXXX (e.g. +923001234567)
 * Strictly rejects numbers missing +92, wrong length, non-digits, or starting with anything other than +923.
 */
export const validatePakistaniMobileNumber = (
  phone: string | null | undefined,
  fieldLabel = "Mobile number",
  required = true
): ValidationResult => {
  if (!phone || !phone.trim()) {
    if (!required) {
      return { isValid: true, formatted: "" };
    }
    return {
      isValid: false,
      error: `${fieldLabel} is required.`,
    };
  }

  const raw = phone.trim();

  // Strict regex: starts with +923 followed by exactly 9 digits (total 13 chars)
  const strictPakistaniPhoneRegex = /^\+923\d{9}$/;

  if (!strictPakistaniPhoneRegex.test(raw)) {
    return {
      isValid: false,
      error: VALIDATION_MESSAGES.PHONE_INVALID,
    };
  }

  return {
    isValid: true,
    formatted: raw,
  };
};

/**
 * Validates general mandatory text/dropdown/date fields.
 * Rejects empty strings, whitespace-only, null, undefined.
 */
export const validateRequired = (
  value: string | number | null | undefined,
  fieldLabel = "Field"
): ValidationResult => {
  if (value === null || value === undefined) {
    return {
      isValid: false,
      error: `${fieldLabel} is required.`,
    };
  }

  if (typeof value === "string" && !value.trim()) {
    return {
      isValid: false,
      error: `${fieldLabel} is required.`,
    };
  }

  return {
    isValid: true,
    formatted: typeof value === "string" ? value.trim() : String(value),
  };
};
