export function isFunction<S>(
  input: S | Function
): input is Function {
  return typeof input === "function";
}
