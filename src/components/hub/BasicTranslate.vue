<template>
  <div>
    <div class="flex mb-4 justify-between">
      <div>
        <b-button @click="translating = !translating" icon-left="translate">
          <template v-if="translating">
            {{ $t('Stop Translating') }}
          </template>
          <template v-else>
            {{ $t('Translate') }}
          </template>
        </b-button>
      </div>
      <div>
        <language-picker v-model="language" v-show="translating" />
      </div>
    </div>
    <div class="flex">
      <div :class="{
        'w-full': !translating,
        'w-1/2 mr-2': translating
      }">
        <div class="mb-4" v-for="(field, handle) in fields" :key="handle">
          <header class="mb-2 text-sm">
            <label class="font-bold text-gray-700 block">{{ $t(capitalize(handle)) }}</label>
          </header>
          <div>
            <b-input v-model="field.values[locale]" :disabled="locked" />
          </div>
        </div>
      </div>
      <div :class="{
        'w-full': !translating,
        'w-1/2 ml-2': translating
      }" v-if="translating">
        <div class="mb-4" v-for="(field, handle) in fields" :key="handle" >
          <header class="mb-2 text-sm">
            <label class="font-bold text-gray-700 block">{{ $t(capitalize(handle)) }}</label>
          </header>
          <div>
            <b-input v-model="field.values[language]" :placeholder="field.values[locale]" :disabled="locked" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    props: ['value', 'locked'],
    data() {
      return {
        fields: this.value,
        translating: false,
        language: 'en',
      }
    },
    methods: {
      // TODO: Move out / Improve
      capitalize(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
      },
    },
    computed: {
      locale() {
        return this.$store.state.core.locale
      }
    }
  }
</script>

<style scoped>

</style>
