# use-state-with-deps

[![npm (scoped)](https://img.shields.io/npm/v/use-state-with-deps.svg)](https://www.npmjs.com/package/use-state-with-deps) [![Actions Status](https://github.com/peterjuras/use-state-with-deps/workflows/use-state-with-deps/badge.svg)](https://github.com/peterjuras/use-state-with-deps/actions) [![Coverage Status](https://coveralls.io/repos/github/peterjuras/use-state-with-deps/badge.svg?branch=main)](https://coveralls.io/github/peterjuras/use-state-with-deps?branch=main) [![Renovate](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

A React hook to use state and reset with dependencies.

## Usage

### `useStateWithDeps` hook

`useState` hook with an additional dependency array that resets the state to the `initialState` param when the dependencies passed in the `deps` array change.

Example:

```js
import React from "react";
import { useStateWithDeps } from "use-state-with-deps";

function AnimatedComponent({ animationType }) {
  const [animation, setAnimation] = useStateWithDeps(
    getAnimation(animationType),
    [animationType]
  );

  return <div>Current animation: {animation}</div>;
}
```

#### Parameters:

- `initialState`:
  The state that will be set when the component mounts or the dependencies change.

  It can also be a function which resolves to the state. If the state is reset due to a change of dependencies, this function will be called with the previous state (`undefined` for the first call upon mount).

- `deps`: Dependencies for this hook that resets the state to `initialState`

## Motivation

There are some scenarios, where the state of a component is derived from its props and needs to be reset upon an update of the incoming props. For class based components, this could be achieved with the `getDerivedStateFromProps` lifecycle method. With hooks however, this currently can't be achieved out of the box since the state can't be reset easily without triggering another re-render. Let's look at the [example of the documentation](https://reactjs.org/docs/hooks-faq.html#how-do-i-implement-getderivedstatefromprops) of how to migrate `getDerivedStateFromProps` to hooks:

```js
function ScrollView({ row }) {
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [prevRow, setPrevRow] = useState(null);

  if (row !== prevRow) {
    // Row changed since last render. Update isScrollingDown.
    setIsScrollingDown(prevRow !== null && row > prevRow);
    setPrevRow(row);
  }

  return `Scrolling down: ${isScrollingDown}`;
}
```

Here, `isScrollingDown` is returned which was based on `prevRow`, although the correct value would be `prevRow !== null && row > prevRow`. While react will re-render before continuing, the current render method _will continue_, because the execution is synchronous. This is especially problematic when using hooks and expecting the result to be consistent with its input.

Let's look at a component where transferring the example from the documentation 1 to 1 would lead to issues:

```js
function getAnimationFromType(type) {
  switch (type) {
    case "Scale":
      return { scale: { x: 0, y: 0 } };
    case "Rotate":
      return { rotate: { deg: 0 } };
    default:
      throw new Error("Invalid Type");
  }
}

function useAnimation(type) {
  const [animation, setAnimation] = useState(getAnimationFromType(type));
  const [prevType, setPrevType] = useState(type);

  if (prevType !== type) {
    setAnimation(getAnimationFromType(type));
    setPrevType(type);
  }

  useEffect(() => {
    // TODO: Animate
  }, [animation]);

  return animation; // Warning! This returns an object with properties that don't match the type!
}

function MyComponent({ type }) {
  const animation = useAnimation(type);

  // Let's assume we want to work with a value that has been returned
  // from the hook in the render function. We might receive an Exception, since
  // the returned value from the useAnimation hook might not be in-sync
  // with our type prop.
  let valueFromAnimationHook;
  switch (type) {
    case "Scale":
      // ERROR: This will throw if the type changed, since animation is still based
      // on "Rotate"
      valueFromAnimationHook = animation.scale.x + animation.scale.y;
      break;
    case "Rotate":
      // ERROR: This will throw if the type changed, since animation is still based
      // on "Scale"
      valueFromAnimationHook = animation.rotate.deg;
      break;
    default:
      break;
  }

  return <OtherComponent animation={animation} />;
}
```

In this example, an exception is thrown when the type changes, since the returned value by the hook is based on a previous prop. This could be fixed by making the state variable re-assignable:

```js
function useAnimation(type) {
  let [animation, setAnimation] = useState(getAnimationFromType(type));
  const [prevType, setPrevType] = useState(type);

  if (prevType !== type) {
    const newAnimation = getAnimationFromType(type);
    setAnimation(newAnimation);
    animation = newAnimation;

    setPrevType(type);
  }

  useEffect(() => {
    // TODO: Animate
  }, [animation]);

  return animation;
}
```

This however adds a lot of code and additional complexity. It also triggers another re-render after the state is updated, although it would theoretically not be needed (since the new state is already returned). Therefore this library provides the `useStateWithDeps` hook to achieve the same outcome with less code and remove the potential of returning a stale value.

With `useStateWithDeps`, the previous hook can then be rewritten as:

```js
import { useStateWithDeps } from "use-state-with-deps";

function useAnimation(type) {
  const [animation, setAnimation] = useStateWithDeps(
    getAnimationFromType(type),
    [type]
  );

  useEffect(() => {
    // TODO: Animate
  }, [animation]);

  return animation;
}
```

## Requirements

- React 16.8 or higher
- A JavaScript environment or polyfill that supports [Object.is](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is)
