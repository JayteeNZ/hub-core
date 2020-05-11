<template>
  <div>
    <div class="text-center" v-if="!versions.length">
      <div class="px-8">
        <p class="mb-4 text-gray-600 text-sm">There is currently no version history available.</p>
      </div>
    </div>
    <div class="search-table" v-if="versions.length">
      <div class="b-table">
        <table class="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Author</th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="version in versions" :key="version.id">
              <td>{{ $format.date(version.created_at) }}</td>
              <td>
                <span v-if="version.user.data">
                  {{ version.user.data.email }}
                </span>
                <span v-else>
                  Unknown
                </span>
              </td>
              <td>
                <button @click="triggerRestore(version.id)" class="inline-flex justify-center text-xs w-full rounded-md border border-blue-300 px-2 py-1 bg-white leading-6 font-medium text-blue-600 shadow-sm hover:text-blue-700">
                  {{ $t('Restore') }}
                </button>
              </td>
              <td>
                <!--<button @click="$emit('delete', version.id)" class="inline-flex justify-center text-xs w-full rounded-md border border-red-300 p-1 bg-white leading-6 font-medium text-red-600 shadow-sm hover:text-red-700">
                  <b-icon icon="delete-bin-line" />
                </button>-->
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      versions: {
        type: Array,
        default: () => []
      }
    },
    methods: {
      triggerRestore (versionId) {
        this.$buefy.dialog.confirm({
          title: this.$t('Restore Version'),
          message: this.$t('Are you sure you want to create a draft based on this version?'),
          confirmText: 'Restore Version',
          type: 'is-info',
          hasIcon: true,
          onConfirm: () => {
            this.$emit('restore', versionId)
          }
        })
      }
    }
  }
</script>

<style scoped>

</style>
