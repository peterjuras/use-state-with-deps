import { useState, SetStateAction, useCallback } from "react";
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
  deps: React.DependencyList,
): [S, React.Dispatch<SetStateAction<S>>] {
  const [stateAndDeps, setStateAndDeps] = useState<{
    state: S;
    deps: React.DependencyList;
  }>(() => {
    const state = isFunction(initialState)
      ? initialState(undefined)
      : initialState;
    return { state, deps };
  });

  // Use the prevState pattern to detect dependency changes during rendering.
  // Calling setState during render (without refs) is the React-approved approach
  // for adjusting state based on changing inputs, and correctly supports
  // concurrent features like useTransition and useDeferredValue.
  let currentState = stateAndDeps.state;
  if (!depsAreEqual(stateAndDeps.deps, deps)) {
    const nextState = isFunction(initialState)
      ? initialState(stateAndDeps.state)
      : (initialState as S);
    currentState = nextState;
    setStateAndDeps({ state: nextState, deps });
  }

  const updateState = useCallback(function updateState(
    newState: S | ((previousState: S) => S),
  ): void {
    setStateAndDeps((prev) => {
      const nextState = isFunction(newState)
        ? newState(prev.state)
        : (newState as S);
      if (Object.is(prev.state, nextState)) {
        return prev;
      }
      return { state: nextState, deps: prev.deps };
    });
  }, []);

  return [currentState, updateState];
}
