// Get all possible paths
export type FieldPath<T> = T extends object
  ? {
      [K in keyof T]: T[K] extends unknown[]
        ? `${K & string}` | `${K & string}.${number}`
        : T[K] extends object
          ? `${K & string}` | `${K & string}.${FieldPath<T[K]>}`
          : `${K & string}`;
    }[keyof T]
  : never;

// Get value type at path
export type FieldPathValue<
  T,
  P extends FieldPath<T>,
> = P extends `${infer K}.${infer R}`
  ? K extends keyof T
    ? T[K] extends unknown[]
      ? R extends `${number}`
        ? T[K][number]
        : never
      : T[K] extends object
        ? R extends FieldPath<T[K]>
          ? FieldPathValue<T[K], R>
          : never
        : never
    : never
  : P extends keyof T
    ? T[P]
    : never;

export type FieldValues = Record<string, unknown>;

export type FieldErrors<T extends FieldValues> = {
  [K in FieldPath<T>]?: string;
};

export type FieldTouched<T extends FieldValues> = {
  [K in FieldPath<T>]?: boolean;
};

export type FieldDirty<T extends FieldValues> = {
  [K in FieldPath<T>]?: boolean;
};

export type ValidateFunction<T extends FieldValues, P extends FieldPath<T>> = (
  value: FieldPathValue<T, P>
) => boolean | string;

export type ValidateCustomError<
  T extends FieldValues,
  P extends FieldPath<T>,
> = {
  validator: ValidateFunction<T, P>;
  message: string;
};

export type Validate<T extends FieldValues, P extends FieldPath<T>> =
  | ValidateFunction<T, P>
  | ValidateCustomError<T, P>;

export type ValidationRule<T extends FieldValues, P extends FieldPath<T>> = {
  required?: boolean | { value: boolean; message: string };
  pattern?: RegExp | { value: RegExp; message: string };
  validate?: Validate<T, P>;
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
  touched: FieldTouched<T>;
  dirty: FieldDirty<T>;
}
