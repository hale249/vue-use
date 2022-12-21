import { ref, watch, Ref } from "vue";
import { isString } from "./shared";

/**
 * Reactive document title.
 * @param newTitle
 * @param template
 */
export function useTitle(newTitle: string | Ref<string>, template = "%s"): Ref<string> {
  const title = ref(newTitle ?? document?.title ?? "");

  watch(
    title,
    (t, o) => {
      if (isString(t) && t !== o && document) {
        document.title = template.replace(/%s/g, t);
      }
    },
    { immediate: true }
  );

  return title;
}
