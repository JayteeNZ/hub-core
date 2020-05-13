<template>
  <b-input
    :value="formattedValue"
    @input="input"
    type="number"
    step="any"
  />
</template>

<script>
import { debounce } from 'lodash'
import HasCurrencies from '@getcandy/hub-core/src/mixins/HasCurrencies.js'
export default {
  mixins: [
    HasCurrencies
  ],
  props: {
    value: {
      type: [Number, String],
      default: null
    },
    isCents: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    input: debounce(function (val) {
      this.$emit('input', this.isCents ? val * 100 : val)
    }, 500)
  },
  computed: {
    formattedValue () {
      return this.$format.currency(this.value, null, this.isCents, false)
    }
  }
}
</script>
