export const NOOP = (): void => {};
export const isString = (val: unknown): val is string => typeof val === 'string';