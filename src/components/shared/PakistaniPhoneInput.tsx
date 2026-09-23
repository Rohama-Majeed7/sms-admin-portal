import React from "react";
import { Phone } from "lucide-react";

interface PakistaniPhoneInputProps {
  id?: string;
  value: string; // May be "+923000000000" or raw digits
  onChange: (fullPhoneWithPrefix: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  hasError?: boolean;
  className?: string;
}

/**
 * Extracts the 10-digit Pakistani mobile number without +92 or leading 0.
 * Example: "+923000000000" -> "3000000000"
 * Example: "03000000000" -> "3000000000"
 */
export const extractPakistaniLocalDigits = (input: string): string => {
  if (!input) return "";

  let cleaned = input.trim().replace(/[\s\-().]/g, "");

  if (cleaned.startsWith("+92")) {
    cleaned = cleaned.slice(3);
  } else if (cleaned.startsWith("0092")) {
    cleaned = cleaned.slice(4);
  } else if (cleaned.startsWith("92") && cleaned.length >= 12) {
    cleaned = cleaned.slice(2);
  }

  // Strip leading 0
  if (cleaned.startsWith("0")) {
    cleaned = cleaned.slice(1);
  }

  // Digits only
  cleaned = cleaned.replace(/\D/g, "");

  // Max 10 digits for Pakistani mobile number (e.g. 3000000000)
  return cleaned.slice(0, 10);
};

const PakistaniPhoneInput: React.FC<PakistaniPhoneInputProps> = ({
  id = "ownerPhone",
  value,
  onChange,
  placeholder = "3000000000",
  disabled = false,
  required = false,
  hasError = false,
  className = "",
}) => {
  const localDigits = extractPakistaniLocalDigits(value);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawInput = e.target.value;
    const digits = extractPakistaniLocalDigits(rawInput);

    if (!digits) {
      onChange("");
      return;
    }

    // Always prefix with persistent +92 (e.g. +923000000000)
    onChange(`+92${digits}`);
  };

  return (
    <div
      className={`relative flex items-center rounded-xl border transition-all ${
        hasError
          ? "border-rose-300 ring-2 ring-rose-500/10 focus-within:border-rose-500 focus-within:ring-rose-500/20"
          : "border-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20"
      } bg-slate-50 focus-within:bg-white overflow-hidden shadow-2xs ${className}`}
    >
      {/* Persistent +92 prefix badge */}
      <div className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 border-r border-slate-200 text-slate-700 select-none shrink-0 font-bold text-sm">
        <Phone size={14} className="text-slate-400" />
        <span className="tracking-tight">+92</span>
      </div>

      {/* Local phone number input (user does not type +92, no leading 0) */}
      <input
        id={id}
        type="tel"
        inputMode="numeric"
        required={required}
        disabled={disabled}
        value={localDigits}
        onChange={handleInputChange}
        placeholder={placeholder}
        maxLength={10}
        className="w-full h-11 px-3.5 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none disabled:opacity-50"
      />
    </div>
  );
};

export default PakistaniPhoneInput;
