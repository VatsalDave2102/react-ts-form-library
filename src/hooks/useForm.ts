import { useCallback, useRef, useState } from "react";

import {
  FieldErrors,
  FieldValues,
  RegisterOptions,
  UseForm,
  ValidationRule,
} from "../types";
import { isString } from "../types/predicate";

/**
 * A custom hook for managing form state and validation.
 * @template T - The type of the form values, extending FieldValues.
 * @returns {UseForm<T>} An object containing form handling methods and state.
 */
export function useForm<T extends FieldValues>(): UseForm<T> {
  // Initialize form values and errors state
  const [values, setValues] = useState<T>(Object.create(null));
  const [errors, setErrors] = useState<FieldErrors<T>>({});

  // Store validation rules for each field
  const fieldsRef = useRef<Record<keyof T, ValidationRule>>(
    {} as Record<keyof T, ValidationRule>
  );

  /**
   * Validates a single field based on its rules.
   * @param {keyof T} name - The name of the field to validate.
   * @param {unknown} value - The value of the field to validate.
   * @returns {string} An error message if validation fails, or an empty string if it passes.
   */
  const validateField = (name: keyof T, value: unknown) => {
    const rules = fieldsRef.current[name];

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
      const validationResult = rules.validate(value);
      if (isString(validationResult)) {
        return validationResult;
      } else if (!validationResult) {
        return "Invalid value";
      }
    }

    return "";
  };

  /**
   * Registers a field with the form.
   * @param {keyof T} name - The name of the field to register.
   * @param {RegisterOptions} options - Options for field registration and validation.
   * @returns {Object} An object with field properties for React.
   */
  const register = useCallback(
    (name: keyof T, options: RegisterOptions = {}) => {
      fieldsRef.current[name] = options;
      return {
        name,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
          const value =
            e.target.type === "checkbox" ? e.target.checked : e.target.value;
          setValues((prev) => ({ ...prev, [name]: value }));
        },
        onBlur: () => {
          const error = validateField(name, values[name]);

          setErrors((prev) => ({
            ...prev,
            [name]: error,
          }));
        },
        ref: () => {
          // ref can be used for imperative operations if needed
        },
      };
    },
    [values, validateField]
  );

  /**
   * Handles form submission.
   * @param {function} onSubmit - Callback function to be called with form data if validation passes.
   * @returns {function} A function to be used as the onSubmit handler for the form.
   */
  const handleSubmit = useCallback(
    (onSubmit: (data: T) => void) => (e: React.FormEvent) => {
      e.preventDefault();
      const newErrors: FieldErrors<T> = {};
      let hasErrors = false;

      // Validate all fields
      Object.keys(fieldsRef.current).forEach((fieldName) => {
        const error = validateField(fieldName, values[fieldName]);
        if (error) {
          newErrors[fieldName as keyof T] = error;
          hasErrors = true;
        }
      });

      setErrors(newErrors);

      if (!hasErrors) {
        // Call onSubmit if there are no errors
        onSubmit(values);
      }
    },
    [values]
  );

  return { register, handleSubmit, errors, values };
}
