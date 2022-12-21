import { ref, unref, Ref } from 'vue';
import { NOOP } from './shared';
import { tryOnMounted, tryOnUnmounted } from './utils';

export interface UseScriptTagOptions {
    /**
     * Load the script immediately
     *
     * @default true
     */
    immediate?: boolean;

    /**
     * Add `async` attribute to the script tag
     *
     * @default true
     */
    async?: boolean;

    /**
     * Script type
     *
     * @default 'text/javascript'
     */
    type?: string;

    /**
     * Manual controls the timing of loading and unloading
     *
     * @default false
     */
    manual?: boolean;

    crossOrigin?: 'anonymous' | 'use-credentials';
    referrerPolicy?:
        | 'no-referrer'
        | 'no-referrer-when-downgrade'
        | 'origin'
        | 'origin-when-cross-origin'
        | 'same-origin'
        | 'strict-origin'
        | 'strict-origin-when-cross-origin'
        | 'unsafe-url';
    noModule?: boolean;
    defer?: boolean;
    /**
     * Append to head?
     *
     * @default false
     */
    head?: boolean;
}

export type ScriptTagReturn = {
    scriptTag: Ref<HTMLScriptElement | null>;
    load(waitForScriptLoad: boolean): Promise<HTMLScriptElement | boolean>;
    unload(): void;
};

export function useScriptTag(
    src: string,
    onLoaded: (el: HTMLScriptElement) => void = NOOP,
    options: UseScriptTagOptions = {}
): ScriptTagReturn {
    let _promise: Promise<HTMLScriptElement | boolean> | null = null;
    const scriptTag = ref<HTMLScriptElement | null>(null);
    const { type = 'text/javascript', async = true, immediate = true, head } = options;

    /**
     * Load the script specified via `src`.
     *
     * @param waitForScriptLoad Whether if the Promise should resolve once the "load" event is emitted by the <script> attribute, or right after appending it to the DOM.
     * @returns Promise<HTMLScriptElement>
     */
    const loadScript = (waitForScriptLoad: boolean): Promise<HTMLScriptElement | boolean> =>
        new Promise((resolve, reject) => {
            // Some little closure for resolving the Promise.
            const resolveWithElement = (el: HTMLScriptElement) => {
                scriptTag.value = el;
                resolve(el);
                return el;
            };

            // Check if document actually exists, otherwise resolve the Promise (SSR Support).
            if (!document) {
                resolve(false);
                return;
            }

            // Local variable defining if the <script> tag should be appended or not.
            let shouldAppend = false;

            let el = document.querySelector(
                `script[src="${src}"][data-script-tag="true"]`
            ) as HTMLScriptElement;

            // Script tag not found, preparing the element for appending
            if (!el) {
                el = document.createElement('script');
                el.type = type;
                el.async = async;
                el.src = unref(src);

                el.setAttribute('data-script-tag', 'true');

                // Optional attributes
                if (options.defer) {
                    el.defer = options.defer;
                }

                if (options.crossOrigin) {
                    el.crossOrigin = options.crossOrigin;
                }

                if (options.noModule) {
                    el.noModule = options.noModule;
                }

                if (options.referrerPolicy) {
                    el.referrerPolicy = options.referrerPolicy;
                }

                // Enables shouldAppend
                shouldAppend = true;
            }
            // Script tag already exists, resolve the loading Promise with it.
            else if (el.hasAttribute('data-loaded')) {
                resolveWithElement(el);
            }

            // Event listeners
            el.addEventListener('error', (event) => reject(event));
            el.addEventListener('abort', (event) => reject(event));
            el.addEventListener('load', () => {
                el.setAttribute('data-loaded', 'true');
                onLoaded(el);
                resolveWithElement(el);
            });

            // Append the <script> tag to head.
            if (shouldAppend) {
                el = head ? document.head.appendChild(el) : document.body.appendChild(el);
            }

            // If script load awaiting isn't needed, we can resolve the Promise.
            if (!waitForScriptLoad) {
                resolveWithElement(el);
            }
        });

    /**
     * Exposed singleton wrapper for `loadScript`, avoiding calling it twice.
     *
     * @param waitForScriptLoad Whether if the Promise should resolve once the "load" event is emitted by the <script> attribute, or right after appending it to the DOM.
     * @returns Promise<HTMLScriptElement>
     */
    const load = (waitForScriptLoad = true): Promise<HTMLScriptElement | boolean> => {
        if (!_promise) {
            _promise = loadScript(waitForScriptLoad);
        }

        return _promise;
    };

    /**
     * Unload the script specified by `src`.
     */
    const unload = () => {
        if (!document) {
            return;
        }

        _promise = null;

        if (scriptTag.value) {
            head
                ? document.head.removeChild(scriptTag.value)
                : document.body.removeChild(scriptTag.value);
            scriptTag.value = null;
        }
    };

    if (immediate && !options.manual) {
        tryOnMounted(load);
    }

    if (!options.manual) {
        tryOnUnmounted(unload);
    }

    return { scriptTag, load, unload };
}