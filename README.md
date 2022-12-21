# Miraway share package vue use with vue 3

## Installation

```bash
    npm install @mirawayltd/vue-use
```

## Usage

### useAsync

You can define async functions that run once and persist the data on client-side.

```bash
  import { useAsync } from '@mirawayltd/vue-use';

  const [func, { loading, error }] = useAsync(T) => {....}

  /...
```

### useSpinner

Useful to bind the `isPending` to a spinner icon with a minimum duration.

```bash
    import { useAsync, useSpinner } from '@mirawayltd/vue-use';

    const func = () => ...

    const { data, loading } = useAsync(func, [params, condition]);

    const isPendingSpinner = useSpinner(loading);

    // ...
```

### useTitle

Reactive document title

```bash
    import { useTitle } from '@mirawayltd/vue-use';

    const title = useTitle('New Title', { template: '%s | My Awesome Website' })
```

### useScriptTag

Script tag injecting.

```bash
    import { useScriptTag } from '@mirawayltd/vue-use';

    useScriptTag(
      'https://miraway.vn/js/example.js',
      // on script tag loaded.
      (el: HTMLScriptElement) => {
        // do something
      },
    )
```

### useLinkTag

Inject `reactive` link `style` or `js` element in head.

```bash
    import { useLinkTag } from '@mirawayltd/vue-use';

    useLinkTag(
      'https://miraway.vn/css/example.css',
      // on link tag loaded.
      (el: HTMLLinkElement) => {
        // do something
      },
    )
```

### tryOnMounted

Safe `onMounted`. Call `onMounted()` if it's inside a component lifecycle, if not, just call the function

```bash
    import { tryOnMounted } from '@mirawayltd/vue-use';

    tryOnMounted(() => {

    })
```

### tryOnMounted

Call `onUnmounted()` if it's inside a component lifecycle, if not, do nothing

```bash
    import { tryOnUnmounted } from '@mirawayltd/vue-use';

    tryOnUnmounted(() => {

    })
```
