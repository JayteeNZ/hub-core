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
            <b-message class="error-message" v-if="message" type="is-danger">
              {{ message }}
            </b-message>
          </form>
      </div>
      <div class="login-image hidden lg:block w-full h-screen">
        <img src="sweet-jar.jpg" />
      </div>
    </div>

  </div>
  <!-- <v-card class="elevation-12">
    <v-toolbar
      color="primary"
      dark
      flat
    >
      <v-toolbar-title>Login to GetCandy</v-toolbar-title>
    </v-toolbar>
    <v-card-text>
      <v-form>
        <v-text-field
          label="Login"
          name="login"
          prepend-icon="mdi-account"
          type="text"
          v-model="email"
        ></v-text-field>
        <v-text-field
          id="password"
          label="Password"
          name="password"
          prepend-icon="mdi-lock"
          type="password"
          v-model="password"
        ></v-text-field>
      </v-form>
      {{ errors }}
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn @click="login" color="primary">Login</v-btn>
    </v-card-actions>
  </v-card> -->
</template>

<script>
export default {
  layout: 'auth',
  data () {
    return {
      email: '',
      password: '',
      message: null,
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
        await this.$auth.loginWith('proxy', {
          data: {
            email: this.email,
            password: this.password
          }
        })
        if (this.$auth.loggedIn) {
          if (this.$auth.user.area) {
            this.$router.push({ name: this.$auth.user.area })
          } else {
            this.$router.back()
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
