/**
 * Pakistani Mobile Number Validation and Formatting Utility
 *
 * Requirements:
 * - Pakistani mobile numbers must be 11 digits locally (starting with 03, e.g. 03001234567)
 * - With international prefix, it is +92 followed by 10 digits starting with 3 (e.g. +92 300 1234567 or +923001234567)
 * - Network codes in Pakistan: 0300-0349, 0355 (Jazz, Zong, Ufone, Telenor, Warid, SCOM)
 */

export interface PhoneValidationResult {
  isValid: boolean;
  error?: string;
  formatted?: string;
}

/**
 * Validates a Pakistani mobile number.
 * Accepts:
 *  - 11 digits starting with 03 (e.g., "03001234567", "0300-1234567")
 *  - +92 prefix followed by 10 digits (e.g., "+92 300 1234567", "+923001234567")
 *  - +92 prefix followed by 11 digits with 0 (e.g., "+92 0300 1234567")
 *  - 10 digits starting with 3 (e.g., "3001234567")
 */
export const validatePakistaniMobileNumber = (phone: string): PhoneValidationResult => {
  if (!phone || !phone.trim()) {
    return {
      isValid: false,
      error: "Mobile number is required.",
    };
  }

  const raw = phone.trim();

  // Remove whitespace, dashes, dots, parentheses
  let cleaned = raw.replace(/[\s\-().]/g, "");

  // Strip international prefix +92, 0092, or 92
  if (cleaned.startsWith("+")) {
    if (cleaned.startsWith("+92")) {
      cleaned = cleaned.slice(3);
    } else {
      return {
        isValid: false,
        error: "Pakistani mobile number must start with 03 or +92 3.",
      };
    }
  } else if (cleaned.startsWith("0092")) {
    cleaned = cleaned.slice(4);
  } else if (cleaned.startsWith("92") && cleaned.length >= 12) {
    cleaned = cleaned.slice(2);
  }

  // Strip leading 0 if present (e.g. 0300 -> 300)
  if (cleaned.startsWith("0")) {
    cleaned = cleaned.slice(1);
  }

  // Only digits allowed
  if (!/^\d+$/.test(cleaned)) {
    return {
      isValid: false,
      error: "Mobile number must contain digits only.",
    };
  }

  // Pakistani mobile networks start with 3 (030x, 031x, 032x, 033x, 034x, 035x)
  if (!cleaned.startsWith("3")) {
    return {
      isValid: false,
      error: "Pakistani mobile number must start with 3 (e.g. 3000000000).",
    };
  }

  // After removing +92 and leading 0, the number must be exactly 10 digits (11 digits locally with 0)
  if (cleaned.length !== 10) {
    return {
      isValid: false,
      error: "Mobile number must be exactly 10 digits after +92 (e.g. 3000000000).",
    };
  }

  // Format cleanly with +92 prefix and NO leading 0: +923XXXXXXXXX (e.g. +923000000000)
  const formatted = `+92${cleaned}`;

  return {
    isValid: true,
    formatted,
  };
};
