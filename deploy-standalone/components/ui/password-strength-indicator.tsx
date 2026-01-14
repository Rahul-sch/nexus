"use client";

import { useEffect, useState } from "react";
import { validatePasswordStrength, getPasswordStrengthLabel } from "@/lib/password-strength";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface PasswordStrengthIndicatorProps {
  password: string;
  onValidationChange?: (isValid: boolean) => void;
}

export function PasswordStrengthIndicator({
  password,
  onValidationChange,
}: PasswordStrengthIndicatorProps) {
  const [validation, setValidation] = useState(validatePasswordStrength(""));

  useEffect(() => {
    const result = validatePasswordStrength(password);
    setValidation(result);
    onValidationChange?.(result.isValid);
  }, [password, onValidationChange]);

  if (!password) {
    return null;
  }

  const strengthLabel = getPasswordStrengthLabel(validation.score);

  return (
    <div className="space-y-3">
      {/* Strength Meter */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-[var(--foreground-secondary)]">Password Strength:</span>
          <span className={`font-medium ${strengthLabel.color}`}>
            {strengthLabel.label}
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              validation.score >= 80
                ? "bg-green-600"
                : validation.score >= 60
                ? "bg-green-500"
                : validation.score >= 40
                ? "bg-yellow-500"
                : validation.score >= 20
                ? "bg-orange-500"
                : "bg-red-600"
            }`}
            style={{ width: `${validation.score}%` }}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      <div className="space-y-1.5 text-sm">
        <RequirementItem
          met={validation.requirements.minLength}
          text="At least 12 characters"
        />
        <RequirementItem
          met={validation.requirements.hasUppercase}
          text="One uppercase letter (A-Z)"
        />
        <RequirementItem
          met={validation.requirements.hasLowercase}
          text="One lowercase letter (a-z)"
        />
        <RequirementItem
          met={validation.requirements.hasNumber}
          text="One number (0-9)"
        />
        <RequirementItem
          met={validation.requirements.hasSpecialChar}
          text="One special character (!@#$%...)"
        />
        <RequirementItem
          met={validation.requirements.notCommon}
          text="Not a common password"
        />
      </div>

      {/* Feedback Messages */}
      {validation.feedback.length > 0 && !validation.isValid && (
        <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-yellow-700">
            <p className="font-medium mb-1">Password requirements:</p>
            <ul className="list-disc list-inside space-y-0.5">
              {validation.feedback.slice(1).map((fb, i) => (
                <li key={i}>{fb}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {validation.isValid && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
          <span className="text-sm font-medium text-green-700">
            Strong password! Your account will be secure.
          </span>
        </div>
      )}
    </div>
  );
}

function RequirementItem({ met, text }: { met: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2">
      {met ? (
        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
      ) : (
        <XCircle className="h-4 w-4 text-gray-400 flex-shrink-0" />
      )}
      <span className={met ? "text-green-600" : "text-[var(--foreground-secondary)]"}>
        {text}
      </span>
    </div>
  );
}
