import {
  FieldPath,
  FieldPathValue,
  FieldValues,
  ValidationRule,
} from "../types";
import { isString } from "../types/predicate";

export const validateField = <T extends FieldValues, P extends FieldPath<T>>(
  value: FieldPathValue<T, P>,
  rules: ValidationRule<T> | undefined
) => {
  if (!rules) return "";

  // Check required rule
  if (rules.required && !value) {
    return "This field is required";
  }

  // Check pattern rule
  if (rules.pattern && isString(value) && !rules.pattern.test(value)) {
    return "Invalid format";
  }

  // Check custom validation rule
  if (rules.validate) {
    const validationResult = rules.validate(
      value as FieldPathValue<T, FieldPath<T>>
    );
    if (isString(validationResult)) {
      return validationResult;
    } else if (!validationResult) {
      return "Invalid value";
    }
  }

  return "";
};
