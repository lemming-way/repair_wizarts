type KeyMap<T> = Record<string, ((target: T) => any) | string & keyof T | null | undefined | false>;

type MappedResult<T, M extends KeyMap<T>> =
  { [K in keyof M as M[K] extends false | null | undefined ? never : K]:
      M[K] extends (target: T) => infer R ? R :
      M[K] extends keyof T ? T[M[K]] :
      never;
  } &
  Omit<T, keyof M>;

export function objectMapper<
  T extends object,
  const M extends KeyMap<T>
>(target: T, keyMap: M = {} as M): Readonly<MappedResult<T, M>> {
  const result = {} as MappedResult<T, M>;

  for (const alias of Object.keys(target)) {
    let mapped: string | Function = alias;
    if (alias in keyMap) {
      if (keyMap[alias]) mapped = keyMap[alias];
      else continue;
    }
    Object.defineProperty(result, alias, {
      get() { return 'function' === typeof mapped ? mapped(target) : target[mapped]; },
      enumerable: true,
      configurable: false
    });
  }

  for (const alias of Object.keys(keyMap)) {
    if (keyMap[alias] && !(alias in result)) {
      const mapped = keyMap[alias];
      Object.defineProperty(result, alias, {
      get() { return 'function' === typeof mapped ? mapped(target) : target[mapped]; },
        enumerable: true,
        configurable: false
      });
    }
  }

  return Object.freeze(result);
}
