import {
  FieldPath,
  FieldPathValue,
  FieldValues,
  ValidationRule,
} from "../types";
import { isBoolean, isRegex } from "../types/predicate";

export const validateField = <T extends FieldValues, P extends FieldPath<T>>(
  value: FieldPathValue<T, P>,
  rules: ValidationRule<T, P> | undefined
) => {
  if (!rules) return "";

  // Check required rule
  if (rules.required && !value) {
    const isRequiredValid = isBoolean(rules.required)
      ? rules.required
      : rules.required.value;
    if (isRequiredValid) {
      return isBoolean(rules.required)
        ? "This field is required"
        : rules.required.message;
    }
  }

  // Check pattern rule
  if (rules.pattern) {
    const regex = isRegex(rules.pattern) ? rules.pattern : rules.pattern.value;
    if (!regex.test(value as string)) {
      return isRegex(rules.pattern) ? "Invalid format" : rules.pattern.message;
    }
  }

  // Check custom validation rule
  if (rules.validate) {
    const validationResult =
      typeof rules.validate === "function"
        ? rules.validate(value)
        : rules.validate.validator(value);

    if (validationResult !== true) {
      return typeof rules.validate === "function"
        ? String(validationResult)
        : rules.validate.message || String(validationResult);
    }
  }

  return "";
};
