export type FieldPath<T> =
  T extends ReadonlyArray<unknown>
    ? `${number}` | `${number}.${FieldPath<T[number]>}`
    : T extends object
      ? {
          [K in keyof T]: K extends string
            ? T[K] extends ReadonlyArray<unknown>
              ? `${K}` | `${K}.${FieldPath<T[K]>}`
              : T[K] extends object
                ? `${K}` | `${K}.${FieldPath<T[K]>}`
                : `${K}`
            : never;
        }[keyof T]
      : never;

export type FieldPathValue<
  T,
  P extends FieldPath<T>,
> = P extends `${infer Key}.${infer Rest}`
  ? Key extends keyof T
    ? Rest extends FieldPath<T[Key]>
      ? FieldPathValue<T[Key], Rest>
      : never
    : Key extends `${number}`
      ? T extends ReadonlyArray<infer ArrayType>
        ? Rest extends FieldPath<ArrayType>
          ? FieldPathValue<ArrayType, Rest>
          : never
        : never
      : never
  : P extends keyof T
    ? T[P]
    : P extends `${number}`
      ? T extends ReadonlyArray<infer ArrayType>
        ? ArrayType
        : never
      : never;

export type FieldValues = Record<string, unknown>;

export type FieldErrors<T extends FieldValues> = {
  [K in FieldPath<T>]?: string;
};

export type ValidationRule<T extends FieldValues, P extends FieldPath<T>> = {
  required?: boolean;
  pattern?: RegExp;
  validate?: (value: FieldPathValue<T, P>) => boolean | string;
};

export type RegisterOptions<
  T extends FieldValues,
  P extends FieldPath<T>,
> = ValidationRule<T, P>;

export interface UseForm<T extends FieldValues> {
  register: <P extends FieldPath<T>>(
    name: P,
    options?: RegisterOptions<T, P>
  ) => {
    name: P;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: () => void;
    ref: (element: HTMLInputElement | null) => void;
  };
  handleSubmit: (onSubmit: (data: T) => void) => (e: React.FormEvent) => void;
  errors: FieldErrors<T>;
  values: T;
  setFieldValue: <P extends FieldPath<T>>(
    name: P,
    value: FieldPathValue<T, P>
  ) => void;
  removeField: <P extends FieldPath<T>>(name: P) => void;
}
