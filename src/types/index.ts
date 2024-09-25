export type FieldValues = Record<string, unknown>;

export type FieldErrors<T extends FieldValues> = Partial<
  Record<keyof T, string>
>;

export type ValidationRule = {
  required?: boolean;
  pattern?: RegExp;
  validate?: (value: unknown) => boolean | string;
};

export type RegisterOptions = {
  required?: boolean;
  pattern?: RegExp;
  validate?: (value: unknown) => boolean | string;
};

export interface UseForm<T extends FieldValues> {
  register: (
    name: keyof T,
    options?: RegisterOptions
  ) => {
    name: keyof T;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: () => void;
    ref: (element: HTMLInputElement | null) => void;
  };
  handleSubmit: (onSubmit: (data: T) => void) => (e: React.FormEvent) => void;
  errors: FieldErrors<T>;
  values: T;
}
