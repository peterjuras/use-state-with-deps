// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function isFunction<S>(input: S | Function): input is Function {
  return typeof input === "function";
}
