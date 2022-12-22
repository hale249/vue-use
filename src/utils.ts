import { getCurrentInstance, onMounted, onUnmounted, nextTick } from 'vue-demi';

export type Fn = () => void;

/**
 * Call onMounted() if it's inside a component lifecycle, if not, run just call the function
 *
 * @param fn
 * @param sync if set to false, it will run in the nextTick() of Vue
 */
export function tryOnMounted(fn: Fn, sync = true): void {
  if (getCurrentInstance()) {
    onMounted(fn);
  } else if (sync) {
    fn();
  } else {
    nextTick().then(fn);
  }
}

/**
 * Call onUnmounted() if it's inside a component lifecycle, if not, do nothing
 *
 * @param fn
 */
export function tryOnUnmounted(fn: Fn): void {
  if (getCurrentInstance()) {
    onUnmounted(fn);
  }
}
