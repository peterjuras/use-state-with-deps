export function depsAreEqual(
  prevDeps: React.DependencyList,
  deps: React.DependencyList
): boolean {
  return (
    prevDeps.length === deps.length &&
    deps.every((dep, index) => Object.is(dep, prevDeps[index]))
  );
}
