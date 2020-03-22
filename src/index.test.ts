import { act, renderHook } from "@testing-library/react-hooks";
import { useStateWithDeps } from "./index";

describe("#use-state-with-deps", () => {
  test("should work with empty dependency array", () => {
    const { result, rerender } = renderHook<
      { value: number },
      [number, React.Dispatch<React.SetStateAction<number>>]
    >(
      ({ value }) => {
        const state = useStateWithDeps(value, []);
        return state;
      },
      { initialProps: { value: 1 } }
    );
    let [state, setState] = result.current;
    expect(state).toBe(1);
    act(() => {
      setState(2);
    });
    rerender();
    [state, setState] = result.current;
    expect(state).toBe(2);
  });

  test("should not reset state when no dependency changes", () => {
    const { result, rerender } = renderHook<
      { value: number; deps: any[] },
      [number, React.Dispatch<React.SetStateAction<number>>]
    >(
      ({ value, deps }) => {
        const state = useStateWithDeps(value, deps);
        return state;
      },
      { initialProps: { value: 1, deps: [5] } }
    );
    let [state] = result.current;
    expect(state).toBe(1);
    rerender({ value: 2, deps: [5] });
    [state] = result.current;
    expect(state).toBe(1);
  });

  test("should reset state when single dependency changes", () => {
    const { result, rerender } = renderHook<
      { value: number; deps: any[] },
      [number, React.Dispatch<React.SetStateAction<number>>]
    >(
      ({ value, deps }) => {
        const state = useStateWithDeps(value, deps);
        return state;
      },
      { initialProps: { value: 1, deps: [5] } }
    );
    let [state] = result.current;
    expect(state).toBe(1);
    rerender({ value: 2, deps: [5] });
    [state] = result.current;
    expect(state).toBe(1);
  });

  test("should reset state when any dependency changes", () => {
    const { result, rerender } = renderHook<
      { value: number; deps: any[] },
      [number, React.Dispatch<React.SetStateAction<number>>]
    >(
      ({ value, deps }) => {
        const state = useStateWithDeps(value, deps);
        return state;
      },
      { initialProps: { value: 1, deps: [5, 6, 7] } }
    );
    let [state] = result.current;
    expect(state).toBe(1);
    rerender({ value: 2, deps: [5, 8, 7] });
    [state] = result.current;
    expect(state).toBe(2);
  });

  test("should call initial state function with undefined on first run", () => {
    let lastStateValue;
    const { result, rerender } = renderHook<
      { value: number | ((lastState?: number) => number); deps: any[] },
      [number, React.Dispatch<React.SetStateAction<number>>]
    >(
      ({ value, deps }) => {
        const state = useStateWithDeps(value, deps);
        return state;
      },
      {
        initialProps: {
          value: lastState => {
            lastStateValue = lastState;
            return 1;
          },
          deps: [5]
        }
      }
    );
    let [state] = result.current;
    expect(state).toBe(1);
    rerender({ value: 2, deps: [5] });
    [state] = result.current;
    expect(state).toBe(1);
    expect(lastStateValue).toBe(undefined);
  });

  test("should call initial state function with previous state on dependency update", () => {
    const lastStateValue: (undefined | number)[] = [];
    const { result, rerender } = renderHook<
      { value: number | ((lastState?: number) => number); deps: any[] },
      [number, React.Dispatch<React.SetStateAction<number>>]
    >(
      ({ value, deps }) => {
        const state = useStateWithDeps(value, deps);
        return state;
      },
      {
        initialProps: {
          value: lastState => {
            lastStateValue.push(lastState);
            return 1;
          },
          deps: [5]
        }
      }
    );
    let [state] = result.current;
    expect(state).toBe(1);
    rerender({
      value: lastState => {
        lastStateValue.push(lastState);
        return 2;
      },
      deps: [9]
    });
    [state] = result.current;
    expect(state).toBe(2);
    expect(lastStateValue).toEqual([undefined, undefined, 1]);
  });

  test("should work with using a setState updater function", () => {
    const { result } = renderHook<
      { value: number | ((lastState?: number) => number); deps: any[] },
      [number, React.Dispatch<React.SetStateAction<number>>]
    >(
      ({ value, deps }) => {
        const state = useStateWithDeps(value, deps);
        return state;
      },
      {
        initialProps: {
          value: () => 1,
          deps: [5]
        }
      }
    );
    let [state, setState] = result.current;
    let previousValueFromSetState;
    expect(state).toBe(1);
    act(() => {
      setState(previousValue => {
        previousValueFromSetState = previousValue;
        return 2;
      });
    });
    [state, setState] = result.current;
    expect(state).toBe(2);
    expect(previousValueFromSetState).toBe(1);
  });
});
