export const SetOps = {
    union: (a, b) => new Set([...a, ...b]),
    intersection: (a, b) => new Set([...a].filter((x) => b.has(x))),
    difference: (a, b) => new Set([...a].filter((x) => !b.has(x))),
    map: (set, fn) => new Set([...set].map(fn)),
    reduce: (sets, fn) => (sets.length ? sets.reduce(fn) : new Set()),
};
