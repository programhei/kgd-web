<script setup lang="ts">
import {InitialTask} from '@vben/common-ui'
import {ref} from "vue";
const datasource=ref([])
</script>

<template>
  <div class="w-full h-full p-5 ">
    <InitialTask v-model:datasource="datasource"/>
  </div>
</template>

<style scoped>

</style>
