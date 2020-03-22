import { useRef, SetStateAction } from "react";
import { useForceUpdate } from "./use-force-update";
import { depsAreEqual } from "./deps-are-equal";
import { isFunction } from "./is-function";

export function useStateWithDeps<S>(
  initialState: S | ((previousState?: S) => S),
  deps: React.DependencyList
): [S, React.Dispatch<SetStateAction<S>>] {
  // Determine initial state
  let usableInitialState: S;
  if (isFunction(initialState)) {
    usableInitialState = initialState();
  } else {
    usableInitialState = initialState;
  }

  const state = useRef(usableInitialState);

  // Check if dependencies have changed
  const prevDeps = useRef(deps);
  if (!depsAreEqual(prevDeps.current, deps)) {
    // Update state and deps
    let nextState: S;
    if (isFunction(initialState)) {
      nextState = initialState(state.current);
    } else {
      nextState = initialState;
    }
    state.current = nextState;
    prevDeps.current = deps;
  }

  const forceUpdate = useForceUpdate();
  function updateState(newState: S | ((previousState: S) => S)): void {
    let nextState: S;
    if (isFunction(newState)) {
      nextState = newState(state.current);
    } else {
      nextState = newState;
    }
    state.current = nextState;
    forceUpdate();
  }

  return [state.current, updateState];
}
