import { ref, Ref } from 'vue-demi';
import { NOOP } from './shared';

export type UseAsyncResult = {
  loading: Ref<boolean>;
  error: Ref<Error | null>;
  networkError: Ref<Error | null>;
};
export type UseAsyncHandle<T> = (...args: any) => T | Promise<T>;
export type UseAsyncReturn<T> = [UseAsyncHandle<T>, UseAsyncResult];
export interface UseAsyncContext {
  loading: Ref<boolean>;
  error: Ref<Error | null>;
  networkError: Ref<Error | null>;
}

export type OnResolve<T> = (context: UseAsyncContext, data: T) => void;
export type OnReject = (context: UseAsyncContext, error: any) => void;

export interface UseAsyncOptions<T> {
  onResolve?: OnResolve<T>;
  onReject?: OnReject;
}

/**
 * Reactive async. Will not block your setup function and will trigger changes once
 * the promise is ready.
 * @param fn
 * @param options
 */
export function useAsync<T>(
  fn: UseAsyncHandle<T>,
  options: UseAsyncOptions<T> = {
    onResolve: NOOP,
    onReject: NOOP,
  },
): UseAsyncReturn<T> {
  const loading = ref(false);
  const error = ref(null);
  const networkError = ref(null);

  const { onResolve, onReject } = options;

  const context: UseAsyncContext = {
    loading,
    error,
    networkError,
  };

  const handle = ((...args: any) => {
    loading.value = true;
    const promise = Promise.resolve(args ? fn(...args) : fn());

    return promise
      .then(async data => {
        error.value = null;
        networkError.value = null;

        if (onResolve) {
          await onResolve(context, data);
        }
        return Promise.resolve(data);
      })
      .catch(async err => {
        // TODO: consider move specific logic of network error to onReject hook
        if (err?.name === 'AxiosError') {
          networkError.value = err;
        }
        error.value = err;

        if (onReject) {
          await onReject(context, err);
        }
        return Promise.resolve();
      })
      .finally(() => {
        loading.value = false;
      });
  }) as UseAsyncHandle<T>;

  return [handle, { loading, error, networkError }];
}
