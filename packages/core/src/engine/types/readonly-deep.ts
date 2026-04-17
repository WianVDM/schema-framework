// biome-ignore lint/complexity/noBannedTypes: intentional — recursive deep type must detect all functions
export type ReadonlyDeep<T> = T extends Function
  ? T
  : T extends string | number | boolean | symbol | bigint
    ? T
    : T extends Map<infer K, infer V>
      ? ReadonlyMap<ReadonlyDeep<K>, ReadonlyDeep<V>>
      : T extends Set<infer U>
        ? ReadonlySet<ReadonlyDeep<U>>
        : T extends object
          ? { readonly [K in keyof T]: ReadonlyDeep<T[K]> }
          : T

// biome-ignore lint/complexity/noBannedTypes: intentional — recursive deep type must detect all functions
export type DeepFrozen<T> = T extends Function
  ? T
  : T extends string | number | boolean | symbol | bigint
    ? T
    : T extends Map<infer K, infer V>
      ? ReadonlyMap<DeepFrozen<K>, DeepFrozen<V>>
      : T extends Set<infer U>
        ? ReadonlySet<DeepFrozen<U>>
        : T extends object
          ? { readonly [K in keyof T]: DeepFrozen<T[K]> }
          : T
