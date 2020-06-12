<template>
  <div>
    <toolbar :heading="$t('Available Attributes')">
      <button @click="showCreateModal = true" class="inline-flex justify-center w-full rounded-md border border-green-300 px-4 py-2 bg-white text-base leading-6 font-medium text-green-600 shadow-sm hover:text-green-500 focus:outline-none focus:border-blue-300 focus:shadow-outline transition ease-in-out duration-150 sm:text-sm sm:leading-5">
        {{ $t('Create attribute') }}
      </button>
        <quick-view-panel :heading="$t('Create attribute')" @close="showCreateModal = false" :open="showCreateModal">
          <create-attribute :attribute-groups="attributeGroups" @close="showCreateModal = false" />
        </quick-view-panel>
    </toolbar>

    <div class="search-table">
     <b-table
        @page-change="changePage"
        :data="attributes"
        :total="total"
        :per-page="perPage"
        paginated
        backend-pagination
      >
        <template slot-scope="props">
          <b-table-column field="name" :label="$t('Name')">
            <nuxt-link :to="{ name: 'settings-attributes-id', params: { id: props.row.id }}">
              {{ getLocaleValue(props.row.name) }}
            </nuxt-link>
          </b-table-column>
          <b-table-column field="handle" :label="$t('Handle')">
            <code>{{ props.row.handle }}</code>
          </b-table-column>
          <b-table-column field="group" :label="$t('Group')">
            {{ getLocaleValue(props.row.group.data.name) }}
          </b-table-column>
          <b-table-column field="type" :label="$t('Type')">
            {{ $t(props.row.type) }}
          </b-table-column>
          <b-table-column field="searchable" :label="$t('Searchable')">
            <b-icon :icon="props.row.searchable ? 'check-line' : 'close-line'" />
          </b-table-column>
          <b-table-column field="required" :label="$t('Required')">
            <b-icon :icon="props.row.required ? 'check-line' : 'close-line'" />
          </b-table-column>
          <b-table-column field="filterable" :label="$t('Filterable')">
            <b-icon :icon="props.row.filterable ? 'check-line' : 'close-line'" />
          </b-table-column>
        </template>
      </b-table>
    </div>
  </div>
</template>

<script>
import { get } from 'lodash'

export default {
  layout: 'settings',
  head () {
    return {
      title: this.$t('Available Attributes')
    }
  },
  data () {
    return {
      attributes: [],
      page: 1,
      perPage: 15,
      total: 0,
      showCreateModal: false
    }
  },

  async asyncData ({ app }) {
    const response = await app.$gc.attributeGroups.get({})
    return {
      attributeGroups: response.data.data
    }
  },
  async mounted () {
    await this.fetch()
  },
  methods: {
    getLocaleValue (data) {
      return get(data, this.locale, data.en)
    },
    async fetch () {
      const response = await this.$gc.attributes.get({
        page: this.page,
        includes: 'group',
        per_page: this.perPage
      })

      const data = response.data.data
      const meta = response.data.meta

      this.attributes = data
      this.page = meta.current_page
      this.perPage = meta.per_page
      this.total = meta.total
    },
    changePage (page) {
      this.page = page
      this.fetch()
    }
  },
  locale () {
    return this.$store.state.core.locale
  }
}
</script>

<style scoped>

</style>
