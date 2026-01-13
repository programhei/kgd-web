
<script setup lang="ts">
import {SupportingIntelligence} from '@vben/common-ui'
import {ref} from "vue";
const datasource=ref([])
</script>

<template>
  <div class="w-full h-full p-5 ">
    <SupportingIntelligence v-model:datasource="datasource"/>
  </div>
</template>

<style scoped>

</style>



