import { useReducer } from "react";

export function useForceUpdate(): () => void {
  const forceUpdate = useReducer(() => Symbol(), undefined)[1];
  return (): void => forceUpdate();
}
