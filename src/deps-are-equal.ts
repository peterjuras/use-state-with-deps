export function depsAreEqual(
  prevDeps: React.DependencyList,
  deps: React.DependencyList
): boolean {
  for (let i = 0; i < prevDeps.length; i++) {
    // TODO: Mention polyfill in README
    if (Object.is(prevDeps[i], deps[i])) {
      continue;
    }
    return false;
  }
  return true;
}
