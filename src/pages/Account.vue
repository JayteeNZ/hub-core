<template>
  <div>
    <form @submit.prevent="save">
      <toolbar heading="Account Settings" sub-heading="Manage your personal account settings">
        <div class="flex">
          <div class="mr-4">
            <button type="submit" class="inline-flex justify-center rounded-md border border-green-300 px-4 py-2 bg-white text-base leading-6 font-medium text-green-600 shadow-sm hover:text-green-500 focus:outline-none focus:border-blue-300 focus:shadow-outline transition ease-in-out duration-150 sm:text-sm sm:leading-5">
              <b-icon icon="loader-4-line" class="spin" v-if="processing" />
              <span v-else>{{ $t('Save account details') }}</span>
            </button>
          </div>
          <div>
            <button @click="$auth.logout()" type="button" class="inline-flex justify-center rounded-md border border-red-300 px-4 py-2 bg-white text-base leading-6 font-medium text-red-600 shadow-sm hover:text-red-500 focus:outline-none focus:border-blue-300 focus:shadow-outline transition ease-in-out duration-150 sm:text-sm sm:leading-5">
              {{ $t('Logout') }}
            </button>
          </div>
        </div>
      </toolbar>
      <div  class="bg-white shadow  px-6 py-8">
      <div class="flex">
        <div class="w-1/5">
          <h3>Personal Details</h3>
        </div>
        <div class="w-full">
          <div>
            <div class="flex w-full">
              <div class="mr-2 w-1/2">
                <header class="mb-1 font-bold text-gray-700 text-sm">
                  <label>{{ $t('First name') }}</label>
                </header>
                <div>
                  <b-input v-model="details.firstname" />
                </div>
              </div>
              <div class="ml-2 w-1/2">
                <header class="mb-1 font-bold text-gray-700 text-sm">
                  <label>{{ $t('Last name') }}</label>
                </header>
                <div>
                  <b-input v-model="details.lastname" />
                </div>
              </div>
            </div>
            <div class="mt-4">
              <header class="mb-1 font-bold text-gray-700 text-sm">
                <label>{{ $t('Email address') }}</label>
              </header>
              <div>
                <b-input v-model="user.email" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="flex mt-6">
        <div class="w-1/5">
          <h3>Security Details</h3>
        </div>
        <div class="w-full">
          <div>
            <div class="flex w-full">
              <div class="mr-2 w-1/3">
                <header class="mb-1 font-bold text-gray-700 text-sm">
                  <label>{{ $t('Current password') }}</label>
                </header>
                <div>
                  <b-input v-model="currentPassword" type="password" />
                </div>
              </div>
              <div class="ml-2 w-1/3">
                <header class="mb-1 font-bold text-gray-700 text-sm">
                  <label>{{ $t('New password') }}</label>
                </header>
                <div>
                  <b-input v-model="newPassword" />
                </div>
              </div>
              <div class="ml-2 w-1/3">
                <header class="mb-1 font-bold text-gray-700 text-sm">
                  <label>{{ $t('New password confirmation') }}</label>
                </header>
                <div>
                  <b-input v-model="newPasswordConfirm" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </form>
  </div>

  </div>
</template>

<script>
export default {
  head() {
    return {
      title: this.$t("Account settings")
    };
  },
  data() {
    return {
      currentPassword: null,
      newPassword: null,
      newPasswordConfirm: null,
      defaultPage: "Default page",
      processing: false
    };
  },
  async asyncData({ app }) {
    const response = await app.$gc.users.current();

    const user = response.data.data

    return {
      user,
      details: user.details.data || {}
    };
  },
  methods: {
    save() {
      this.processing = true
      const data = this.details
      data.email = this.user.email
      if (this.newPassword) {
        data.password = this.newPassword
        data.password_confirm = this.newPasswordConfirm
      }
      this.$gc.users.update(this.user.id, data).then(result => {
        this.$notify.queue('success', this.$t('Details saved'))
      }).catch(error => {
        this.$notify.queue('error', this.$t('Unable to save details'))
      }).finally(res => {
        this.processing = false
      })
    }
  }
};
</script>
