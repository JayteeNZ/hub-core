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
    <div class="md:grid  md:gap-6" :class="translating ? 'md:grid-cols-2' : 'md:grid-cols-1'">
      <form-field :label="`${$t(capitalize(handle))}${translating ? ` (${locale})` : '' }`" v-for="(field, handle) in fields" :key="handle">
        <b-input v-model="field.values[locale]" :disabled="locked" @blur="$emit('input', value)" />
      </form-field>
      <template  v-if="translating">
        <form-field :label="`${$t(capitalize(handle))} (${language})`" v-for="(field, handle) in fields" :key="handle">
          <b-input v-model="field.values[language]" :placeholder="field.values[locale]" :disabled="locked || language == locale" @blur="$emit('input', fields)" />
        </form-field>
      </template>
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
