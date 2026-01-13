<script setup lang="ts">
import {ref} from 'vue'
import {v4 as uuid} from 'uuid'
import {SceneSetQuality} from '@vben/common-ui'

const datasource = ref(
  [
    {
      key: uuid(),
      title: '111'
    }
  ]
)


</script>

<template>
  <div class="w-full h-full p-5  ">
    <SceneSetQuality/>
  </div>
</template>

<style scoped>

</style>
