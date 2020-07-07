<template>
  <div>
    <div class="md:flex">
      <div class="mx-8 lg:w-2/5 lg:ml-48 lg:mt-48 lg:mr-32">
        <div class="my-8 w-48">
          <get-candy-logo />
        </div>
        <div class="mb-4">
          <span class="text-purple-800 text-xl block">Welcome to</span>
          <strong class="text-purple-800 text-3xl uppercase">The Hub</strong>
        </div>
          <form @submit.prevent="process" action="" class="has-margin-top-20">
            <form-field :label="$t('Email')" :error="getError('email')" required>
              <b-input v-model="email" type="email" required />
            </form-field>
            <form-field :label="$t('Password')" :error="getError('password')" required v-if="!forgotPassword">
              <b-input v-model="password" type="password" required />
            </form-field>
            <div>
              <button :disabled="processing" type="submit" class="inline-flex items-center rounded-md border border-green-300 px-4 py-2 bg-white text-base leading-6 font-medium text-green-600 shadow-sm hover:text-green-500 focus:outline-none focus:border-blue-300 focus:shadow-outline transition ease-in-out duration-150 sm:text-sm sm:leading-5">
                <b-icon icon="loader-4-line" class="spin" v-if="processing" />
                <span v-else>{{ $t(forgotPassword ? 'Send reset email' : 'Sign in') }}</span>
              </button>
              <!-- <button @click="forgotPassword = !forgotPassword" type="button" class="text-sm ml-2 focus:outline-none">
                <span v-if="!forgotPassword">Forgot password</span>
                <span v-else>Back to login</span>
              </button> -->
            </div>

            <div class="text-red-600 mt-4 text-sm" v-if="message">
              {{ message }}
            </div>
          </form>
      </div>
      <div class="login-image hidden lg:block w-full h-screen">

      </div>
    </div>
  </div>
</template>

<script>
export default {
  layout: 'auth',
  data () {
    return {
      email: '',
      password: '',
      message: '',
      processing: false,
      forgotPassword: false,
      errors: {}
    }
  },
  head () {
    return {
      title: this.$t('Login')
    }
  },
  computed: {
    config () {
      return this.$config
    }
  },
  methods: {
    async forgot () {
      const response = await this.$gc.generic.post('password/reset/request', {
        email: this.email,
      })
    },
    async process () {
      if (this.forgotPassword) {
        this.forgot()
      } else {
        this.login()
      }
    },
    async login (event) {
      this.errors = {}
      this.message = null
      this.processing = true
      try {
        // if (this.config.auth == 'sanctum') {
          await this.$axios.get('/sanctum/csrf-cookie')
        // }
        await this.$auth.loginWith('local', {
          data: {
            email: this.email,
            password: this.password
          }
        })
        if (this.$auth.loggedIn) {
          if (this.$auth.user.area) {
            await this.$router.push({ name: this.$auth.user.area })
          } else {
            await this.$router.back()
          }
        } else {
          this.password = null
          this.processing = false
          this.message = 'You are not authorised to access the hub'
        }
      } catch (e) {
        if (e.response) {
          const response = e.response.data
          if (response.errors) {
            this.errors = response.errors
          }
          this.message = response.error || response.message
        } else {
          if (window.console) {
            console.error(e)
            this.message = 'Something went wrong, check the console for more info.'
          } else {
            this.message = 'Something went wrong'
          }

        }
      }
      this.processing = false
    },
    getType (field) {
      if (this.errors[field] && this.errors[field].length) {
        return 'is-danger'
      }
      return null
    },
    getError (field) {
      return this.errors[field] || null
    }
  }
}
</script>

<style lang="scss" scoped>
  .login-image {
    background-image: url('~assets/images/sweet-jar.jpg');
    background-size:cover;
    background-repeat:no-repeat;
  }
</style>
