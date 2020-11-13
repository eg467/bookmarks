export const SetOps = {
   union: <T extends {}>(a: ReadonlySet<T>, b: ReadonlySet<T>) => new Set([...a, ...b]),
   intersection: <T extends {}>(a: ReadonlySet<T>, b: ReadonlySet<T>) =>
      new Set([...a].filter(x => b.has(x))),
   difference: <T extends {}>(a: ReadonlySet<T>, b: ReadonlySet<T>) =>
      new Set([...a].filter(x => !b.has(x))),
   map: <T, TDest>(set: ReadonlySet<T>, fn: (x: T) => TDest) =>
      new Set([...set].map(fn)),
   reduce: <T extends {}>(sets: ReadonlySet<T>[], fn: (a: ReadonlySet<T>, b: ReadonlySet<T>) => Set<T>) =>
      sets.length ? sets.reduce(fn) : new Set<T>()
};
