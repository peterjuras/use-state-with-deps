import { useReducer } from "react";

export function useForceUpdate(): () => void {
  const [, forceUpdate] = useReducer((x) => !x, false);
  return (): void => forceUpdate();
}
