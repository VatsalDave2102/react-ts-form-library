import { useCallback, useRef, useState } from "react";

import {
  FieldErrors,
  FieldPath,
  FieldPathValue,
  FieldValues,
  RegisterOptions,
  UseForm,
  ValidationRule,
} from "../types";
import { getNestedValue } from "../helpers/getNestedValue";
import { setNestedValue } from "../helpers/setNestedValue";
import { validateField } from "../validators/validateField";

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
  const fieldsRef = useRef<Record<FieldPath<T>, ValidationRule<T>>>(
    {} as Record<FieldPath<T>, ValidationRule<T>>
  );

  /**
   * Registers a field with the form.
   * @param {keyof T} name - The name of the field to register.
   * @param {RegisterOptions} options - Options for field registration and validation.
   * @returns {Object} An object with field properties for React.
   */
  const register = useCallback(
    <P extends FieldPath<T>>(name: P, options: RegisterOptions<T> = {}) => {
      // Store validation rules for the field
      fieldsRef.current[name] = options;

      const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value =
          e.target.type === "checkbox" ? e.target.checked : e.target.value;
        // Update form values
        setValues((prev) =>
          setNestedValue(prev, name, value as FieldPathValue<T, P>)
        );
      };

      const onBlur = () => {
        const value = getNestedValue(values, name);
        // Validate field on blur
        const error = validateField(value, fieldsRef.current[name]);

        setErrors((prev) => ({
          ...prev,
          [name]: error,
        }));
      };
      return { name, onChange, onBlur, ref: () => {} };
    },
    [values]
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
        const name = fieldName as FieldPath<T>;
        const value = getNestedValue(values, name);
        const error = validateField(value, fieldsRef.current[name]);
        if (error) {
          newErrors[name] = error;
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

  /**
   * Sets the value of a specific field.
   *
   * @param {P} name - The name of the field to update.
   * @param {FieldPathValue<T, P>} value - The new value for the field.
   */
  const setFieldValue = useCallback(
    <P extends FieldPath<T>>(name: P, value: FieldPathValue<T, P>) => {
      setValues((prev) => setNestedValue(prev, name, value));
    },
    []
  );

  /**
   * Removes a field from the form state.
   *
   * @param {P} name - The name of the field to remove.
   */
  const removeField = useCallback(<P extends FieldPath<T>>(name: P) => {
    setValues((prev) => {
      const newValues = { ...prev };
      const keys = name.split(".");
      const lastKey = keys.pop()!;
      const lastObj = keys.reduce(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (acc: any, key) => (acc && acc[key] !== undefined ? acc[key] : acc),
        newValues
      );

      if (lastObj) {
        const isArrayIndex = !isNaN(Number(lastKey));
        if (isArrayIndex && Array.isArray(lastObj)) {
          // Remove array element
          lastObj.splice(Number(lastKey), 1);

          // Maintain an empty array if no elements left
          if (lastObj.length === 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            keys.reduce((acc: any, key) => acc && acc[key], newValues)[
              keys.pop()!
            ] = [];
          }
        } else {
          // Remove object property
          delete lastObj[lastKey];
        }
      }

      return newValues;
    });
    // Remove field errors
    setErrors((prev) => {
      const newErrors = { ...prev };
      const keys = name.split(".");
      const lastKey = keys.pop()!;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let current: any = newErrors;
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        current = current[key] || {};
      }
      delete current[lastKey];
      return newErrors;
    });
    // Remove field validation rules
    delete fieldsRef.current[name];
  }, []);

  return { register, handleSubmit, errors, values, setFieldValue, removeField };
}
