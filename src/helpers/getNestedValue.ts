import { FieldPath, FieldPathValue, FieldValues } from "../types";

/**
 * Retrieves a nested value from an object using a dot-notation path.
 *
 * @template T - The type of the object to traverse.
 * @template P - The type of the path, which must be a valid FieldPath of T.
 *
 * @param {T} obj - The object to traverse.
 * @param {P} path - A string representing the path to the nested value, using dot notation.
 *
 * @returns {FieldPathValue<T, P>} The value at the specified path, or undefined if the path is invalid.
 *
 */
export const getNestedValue = <T extends FieldValues, P extends FieldPath<T>>(
  obj: T,
  path: P
): FieldPathValue<T, P> => {
  return path.split(".").reduce((acc: unknown, part) => {
    if (acc && typeof acc === "object" && part in acc) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj) as FieldPathValue<T, P>;
};
