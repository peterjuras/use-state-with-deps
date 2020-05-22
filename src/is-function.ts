// eslint-disable-next-line @typescript-eslint/ban-types
export function isFunction<S>(input: S | Function): input is Function {
  return typeof input === "function";
}
