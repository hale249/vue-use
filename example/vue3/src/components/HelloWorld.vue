<template>
  <p class="read-the-docs">isPendingSpinner: {{ isPendingSpinner }}</p>
</template>

<script lang="ts">
import {ref} from "vue";
import {useSpinner, useTitle} from "@mirawayltd/vue-use";

export default {
  setup() {
    const isPending = ref(true);
    useTitle('Miraway vue use title')
    const isPendingSpinner = useSpinner(isPending, 300)
    return {
      isPendingSpinner
    }
  },

}
</script>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
