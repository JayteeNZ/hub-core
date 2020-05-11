<template>
  <div class="flex h-screen items-center justify-center">
    <div class="text-center relative">
      <template v-if="error.statusCode != 404">
        <div class="rounded ">
          <header class="rounded-t font-bold text-sm bg-red-500 text-white px-4 py-2 text-left">
           {{ $t('Internal Server Error') }}
          </header>
          <div class="border border-t-none p-6 rounded-b border-red-500 text-red-800">
            {{ error.message }}
          </div>
        </div>
      </template>
      <template v-else>
        <h1 class="text-6xl text-gray-500">{{ error.statusCode }}</h1>
        <p class="mb-4">{{ error.message }}</p>
        <NuxtLink to="/">
          {{ $t('Back to start') }}
        </NuxtLink>
      </template>
    </div>

  </div>
</template>

<script>
export default {
  layout: (context) => {
    const state = context.app.store.state
    if (state.error) {
      return state.error.statusCode == '404' ? 'default' : 'auth';
    }
    return 'auth'
  },
  props: {
    error: {
      type: Object,
      default: null
    }
  },
  head () {
    const title =
      this.error.statusCode === 404 ? this.pageNotFound : this.otherError
    return {
      title
    }
  },
  created () {
    this.$store.commit('setError', this.error)
  },
  data () {
    return {
      pageNotFound: '404 Not Found',
      otherError: 'An error occurred'
    }
  }
}
</script>
