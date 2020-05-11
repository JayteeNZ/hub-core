<template>
  <div>
    <nuxt/>
  </div>
</template>

<script>
export default {
  head () {
    return {
      meta: [
        { hid: 'robots', name: 'robots', content: 'noindex' }
      ]
    }
  }
}
</script>
