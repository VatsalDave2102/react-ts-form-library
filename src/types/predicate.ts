const isString = (value: unknown): value is string => typeof value === "string";

const isBoolean = (value: unknown): value is boolean =>
  typeof value === "boolean";

const isRegex = (value: unknown): value is RegExp => {
  return value instanceof RegExp;
};
export { isString, isBoolean, isRegex };
