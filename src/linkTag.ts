import { Ref, ref } from "vue";
import { NOOP } from "./shared";
import { tryOnMounted, tryOnUnmounted } from "./utils";

export interface UseLinkTagOptions {
  /**
   * Load the script immediately
   *
   * @default true
   */
  immediate?: boolean;

  /**
   * Script type
   *
   * @default 'text/css'
   */
  type?: string;

  /**
   * Manual controls the timing of loading and unloading
   *
   * @default false
   */
  manual?: boolean;

  crossOrigin?: "anonymous" | "use-credentials";
  referrerPolicy?:
    | "no-referrer"
    | "no-referrer-when-downgrade"
    | "origin"
    | "origin-when-cross-origin"
    | "same-origin"
    | "strict-origin"
    | "strict-origin-when-cross-origin"
    | "unsafe-url";
  rel?: string;
  media?: string;
}

export type LinkTagReturn = {
  linkTag: Ref<HTMLLinkElement | null>;
  load(): Promise<HTMLLinkElement | boolean>;
  unload(): void;
};

export function useLinkTag(
  href: string,
  onLoaded: (el: HTMLLinkElement) => void = NOOP,
  options: UseLinkTagOptions = {}
): LinkTagReturn {
  let _promise: Promise<HTMLLinkElement | boolean> | null = null;
  const { type = "text/css", immediate = true } = options;

  const loadLink = (): Promise<HTMLLinkElement | boolean> => {
    return new Promise((resolve, reject) => {
      const resolveWithElement = (el: HTMLLinkElement) => {
        linkTag.value = el;
        resolve(el);
        return el;
      };

      if (!document) {
        resolve(false);
        return;
      }

      // Local variable defining if the <link> tag should be appended or not.
      let shouldAppend = false;
      let el = document.querySelector(`link[href="${href}"]`) as HTMLLinkElement;
      // Script tag not found, preparing the element for appending
      if (!el) {
        el = document.createElement("link");
        el.href = href;
        el.type = type;
        if (options.crossOrigin) {
          el.crossOrigin = options.crossOrigin;
        }

        if (options.referrerPolicy) {
          el.referrerPolicy = options.referrerPolicy;
        }

        if (options.media) {
          el.media = options.media;
        }

        if (options.rel) {
          el.rel = options.rel;
        }

        shouldAppend = true;
      }

      // Script tag already exists, resolve the loading Promise with it.
      else if (el.hasAttribute("data-loaded")) {
        resolveWithElement(el);
      }

      // Event listeners
      el.addEventListener("error", (event) => reject(event));
      el.addEventListener("abort", (event) => reject(event));
      el.addEventListener("load", () => {
        el.setAttribute("data-loaded", "true");
        onLoaded(el);
        resolveWithElement(el);
      });

      // Append the <link> tag to head.
      if (shouldAppend) {
        el = document.head.appendChild(el);
      }

      resolveWithElement(el);
    });
  };
  const linkTag = ref<HTMLLinkElement | null>(null);
  const load = (): Promise<HTMLLinkElement | boolean> => {
    if (!_promise) {
      _promise = loadLink();
    }

    return _promise;
  };

  const unload = () => {
    if (!document) {
      return;
    }

    _promise = null;

    if (linkTag.value) {
      document.head.removeChild(linkTag.value);
      linkTag.value = null;
    }
  };

  if (immediate && !options.manual) {
    tryOnMounted(load);
  }

  if (!options.manual) {
    tryOnUnmounted(unload);
  }

  return { linkTag, load, unload };
}
