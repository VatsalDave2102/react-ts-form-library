import { FieldPath, FieldPathValue, FieldValues } from "../types";

/**
 * Sets a nested value in an object using a dot-notation path.
 *
 * @template T - The type of the object to modify.
 * @template P - The type of the path, which must be a valid FieldPath of T.
 *
 * @param {T} obj - The original object to modify.
 * @param {P} path - A string representing the path to the nested value, using dot notation.
 * @param {FieldPathValue<T, P>} value - The value to set at the specified path.
 *
 * @returns {T} A new object with the nested value set at the specified path.
 *
 * @example
 * const obj = { a: { b: { c: 42 } } };
 * const newObj = setNestedValue(obj, 'a.b.c', 100);
 * // newObj is { a: { b: { c: 100 } } }
 *
 * @example
 * const obj = { users: [] };
 * const newObj = setNestedValue(obj, 'users.0.name', 'John');
 * // newObj is { users: [{ name: 'John' }] }
 */
export const setNestedValue = <T extends FieldValues, P extends FieldPath<T>>(
  obj: T,
  path: P,
  value: FieldPathValue<T, P>
): T => {
  const keys = path.split(".");
  const lastKey = keys.pop()!;
  const newObj = { ...obj };
  let current: Record<string, unknown> | unknown[] = newObj;

  // Traverse the object, creating nested objects/arrays as needed
  for (const key of keys) {
    if (Array.isArray(current)) {
      const index = Number(key);
      if (!(index in current)) {
        current[index] = isNaN(Number(keys[0])) ? {} : [];
      }
      current = current[index] as Record<string, unknown> | unknown[];
    } else {
      if (!(key in current)) {
        current[key] = isNaN(Number(keys[0])) ? {} : [];
      }
      current = current[key] as Record<string, unknown> | unknown[];
    }
  }
  // Set the value at the final nested location
  if (Array.isArray(current)) {
    current[Number(lastKey)] = value;
  } else {
    current[lastKey] = value;
  }

  return newObj;
};
