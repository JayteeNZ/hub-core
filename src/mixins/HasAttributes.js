import { get } from 'lodash'

export default {
  methods: {
    /**
   * Gets an attribute value
    */
    attribute (data, attribute) {
      return get(data, `${attribute}.${this.channel}.${this.locale}`, get(data, `${attribute}.${this.channel}.en`))
    }
  },
  computed: {
    channel () {
      return this.$store.state.core.channel
    },
    locale () {
      return this.$store.state.core.locale
    }
  }
}
