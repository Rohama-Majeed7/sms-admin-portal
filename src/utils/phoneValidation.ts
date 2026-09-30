/**
 * Pakistani Mobile Number Validation and Formatting Utility
 * Re-exports centralized validation to preserve backward compatibility.
 */
import { validatePakistaniMobileNumber as centralizedValidatePhone } from "./validation";
import type { ValidationResult } from "./validation";

export type PhoneValidationResult = ValidationResult;

export const validatePakistaniMobileNumber = (
  phone: string,
  fieldLabel = "Mobile number",
  required = true
): PhoneValidationResult => {
  return centralizedValidatePhone(phone, fieldLabel, required);
};
