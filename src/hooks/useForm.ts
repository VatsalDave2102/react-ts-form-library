import { useCallback, useState } from "react";
import { FieldErrors, FieldValues, UseForm } from "../types";

export function useForm<T extends FieldValues>(): UseForm<T> {
  const [values, setValues] = useState<T>({} as T);
  const [errors, setErrors] = useState<FieldErrors<T>>({});

  const register = useCallback(
    (name: keyof T) => {
      return {
        name,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
          setValues((prev) => ({ ...prev, [name]: e.target.value }));
        },
        onBlur: () => {
          if (!values[name]) {
            setErrors((prev) => ({
              ...prev,
              [name]: "This field is required",
            }));
          } else {
            setErrors((prev) => {
              const newErrors = { ...prev };
              delete newErrors[name];
              return newErrors;
            });
          }
        },
      };
    },
    [values]
  );

  const handleSubmit = useCallback(
    (onSubmit: (data: T) => void) => (e: React.FormEvent) => {
      e.preventDefault();
      if (Object.keys(errors).length === 0) {
        onSubmit(values);
      }
    },
    [errors, values]
  );

  return { register, handleSubmit, errors, values };
}
