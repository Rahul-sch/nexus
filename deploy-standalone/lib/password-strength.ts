/**
 * Password Strength Validation
 *
 * Security Requirements (OWASP Recommendations):
 * - Minimum 12 characters (NIST/OWASP 2023 guidance)
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 * - No common passwords (top 10000 list)
 */

export interface PasswordStrengthResult {
  isValid: boolean;
  score: number; // 0-100
  feedback: string[];
  requirements: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
    notCommon: boolean;
  };
}

// Top 50 most common passwords (subset - full list would be larger)
const COMMON_PASSWORDS = new Set([
  '123456', 'password', '12345678', 'qwerty', '123456789', '12345',
  '1234', '111111', '1234567', 'dragon', '123123', 'baseball', 'iloveyou',
  'trustno1', '1234567890', 'sunshine', 'master', 'welcome', 'shadow',
  'ashley', 'football', 'jesus', 'michael', 'ninja', 'mustang', 'password1',
  'abc123', 'passw0rd', 'password123', 'Password1', 'letmein', 'monkey',
  'liverpool', 'qwertyuiop', 'admin', 'welcome123', 'admin123', 'root',
  'toor', 'pass', 'test', 'guest', 'changeme', 'password!', 'P@ssw0rd',
  'Password123', 'Aa123456', 'aaaaaa', '123321',
]);

const MIN_LENGTH = 12;
const MAX_LENGTH = 128; // Prevent DoS via excessive password length

export function validatePasswordStrength(password: string): PasswordStrengthResult {
  const feedback: string[] = [];
  let score = 0;

  // Check length
  const meetsMinLength = password.length >= MIN_LENGTH;
  const meetsMaxLength = password.length <= MAX_LENGTH;

  if (!meetsMinLength) {
    feedback.push(`Password must be at least ${MIN_LENGTH} characters`);
  } else if (!meetsMaxLength) {
    feedback.push(`Password must be less than ${MAX_LENGTH} characters`);
  } else {
    score += 25;
  }

  // Check for uppercase letters
  const hasUppercase = /[A-Z]/.test(password);
  if (!hasUppercase) {
    feedback.push('Add at least one uppercase letter (A-Z)');
  } else {
    score += 15;
  }

  // Check for lowercase letters
  const hasLowercase = /[a-z]/.test(password);
  if (!hasLowercase) {
    feedback.push('Add at least one lowercase letter (a-z)');
  } else {
    score += 15;
  }

  // Check for numbers
  const hasNumber = /[0-9]/.test(password);
  if (!hasNumber) {
    feedback.push('Add at least one number (0-9)');
  } else {
    score += 15;
  }

  // Check for special characters
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);
  if (!hasSpecialChar) {
    feedback.push('Add at least one special character (!@#$%^&* etc.)');
  } else {
    score += 15;
  }

  // Check against common passwords
  const lowerPassword = password.toLowerCase();
  const notCommon = !COMMON_PASSWORDS.has(lowerPassword);
  if (!notCommon) {
    feedback.push('This password is too common - choose something unique');
    score = Math.min(score, 20); // Cap score at 20 for common passwords
  } else {
    score += 15;
  }

  // Additional entropy bonus for length > 16
  if (password.length >= 16) {
    score += 5;
  }
  if (password.length >= 20) {
    score += 5;
  }

  // Check for repeated characters (weak pattern)
  const hasRepeatedChars = /(.)\1{2,}/.test(password);
  if (hasRepeatedChars) {
    feedback.push('Avoid repeated characters (e.g., "aaa")');
    score -= 10;
  }

  // Check for sequential characters (weak pattern)
  const hasSequential = /(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(password);
  if (hasSequential) {
    feedback.push('Avoid sequential characters (e.g., "abc", "123")');
    score -= 10;
  }

  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, score));

  const isValid =
    meetsMinLength &&
    meetsMaxLength &&
    hasUppercase &&
    hasLowercase &&
    hasNumber &&
    hasSpecialChar &&
    notCommon;

  if (isValid) {
    feedback.unshift('Strong password ✓');
  }

  return {
    isValid,
    score,
    feedback,
    requirements: {
      minLength: meetsMinLength && meetsMaxLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecialChar,
      notCommon,
    },
  };
}

/**
 * Generate a secure random password
 * Useful for password reset tokens or temporary passwords
 */
export function generateSecurePassword(length: number = 16): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  const allChars = uppercase + lowercase + numbers + special;

  let password = '';

  // Ensure at least one of each required character type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Get password strength label for UI display
 */
export function getPasswordStrengthLabel(score: number): {
  label: string;
  color: string;
} {
  if (score >= 80) {
    return { label: 'Very Strong', color: 'text-green-600' };
  } else if (score >= 60) {
    return { label: 'Strong', color: 'text-green-500' };
  } else if (score >= 40) {
    return { label: 'Moderate', color: 'text-yellow-500' };
  } else if (score >= 20) {
    return { label: 'Weak', color: 'text-orange-500' };
  } else {
    return { label: 'Very Weak', color: 'text-red-600' };
  }
}
