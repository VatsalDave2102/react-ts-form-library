export type FieldValues = Record<string, unknown>;

export type FieldErrors<T extends FieldValues> = Partial<
  Record<keyof T, string>
>;

export interface UseForm<T extends FieldValues> {
  register: (name: keyof T) => {
    name: keyof T;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: () => void;
  };
  handleSubmit: (onSubmit: (data: T) => void) => (e: React.FormEvent) => void;
  errors: FieldErrors<T>;
  values: T;
}
