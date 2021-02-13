import { useRef, SetStateAction, useCallback } from "react";
import { useForceUpdate } from "./use-force-update";
import { depsAreEqual } from "./deps-are-equal";
import { isFunction } from "./is-function";

/**
 * `useState` hook with an additional dependency array that resets
 * the state to the `initialState` param when the dependencies passed
 * in the `deps` array change.
 *
 * @param initialState
 * The state that will be set when the component mounts or the
 * dependencies change.
 *
 * It can also be a function which resolves to the state. If the state
 * is reset due to a change of dependencies, this function will be called with the previous
 * state (`undefined` for the first call upon mount).
 * @param deps Dependencies for this hook that resets the state to `initialState`
 */
export function useStateWithDeps<S>(
  initialState: S | ((previousState?: S) => S),
  deps: React.DependencyList
): [S, React.Dispatch<SetStateAction<S>>] {
  const isMounted = useRef(false);

  // Determine initial state
  let usableInitialState: S | null = null;
  if (!isMounted.current) {
    isMounted.current = true;
    if (isFunction(initialState)) {
      usableInitialState = initialState();
    } else {
      usableInitialState = initialState;
    }
  }

  // It would be possible to use useState instead of
  // useRef to store the state, however this would
  // trigger re-renders whenever the state is reset due
  // to a change in dependencies. In order to avoid these
  // re-renders, the state is stored in a ref and an
  // update is triggered via forceUpdate below when necessary
  const state = useRef(usableInitialState as S);

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

  const updateState = useCallback(function updateState(
    newState: S | ((previousState: S) => S)
  ): void {
    let nextState: S;
    if (isFunction(newState)) {
      nextState = newState(state.current);
    } else {
      nextState = newState;
    }
    if (!Object.is(state.current, nextState)) {
      state.current = nextState;
      forceUpdate();
    }
  },
  []);

  return [state.current, updateState];
}
