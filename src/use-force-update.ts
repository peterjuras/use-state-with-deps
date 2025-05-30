import { useReducer } from "react";

export function useForceUpdate(): () => void {
  const [, forceUpdate] = useReducer(() => Symbol(), undefined);
  return (): void => forceUpdate();
}
