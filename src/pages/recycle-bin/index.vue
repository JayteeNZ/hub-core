<template>
  <div>
  <toolbar heading="Recycling Bin">
    <b-field>
      <p class="control is-expanded">
        <b-input v-model="searchTerm" @input="refresh" :placeholder="$t('Search recyling bin')" icon="search-line" />
      </p>
    </b-field>
  </toolbar>
    <div class="search-table">

      <b-table
        @page-change="changePage"
        :data="items"
        :total="total"
        :per-page="perPage"
        paginated
        backend-pagination
      >
        <template slot-scope="props">
          <b-table-column>
            <img :src="props.row.thumbnail" v-if="props.row.thumbnail" width="40">
          </b-table-column>
          <b-table-column
            :label="$t('Name')"
            field="name"
          >
            <nuxt-link
            :to="{
              name: 'recycle-bin-id',
              params: {
                id: props.row.id
              },
              query: {
                type: getTypeLabel(props.row.type),
              }
            }">
              {{ props.row.name }}
            </nuxt-link>
          </b-table-column>
          <b-table-column
            :label="$t('Deleted at')"
            field="deleted_at"
          >
            {{ $format.date(props.row.deleted_at) }}
          </b-table-column>
          <b-table-column
            :label="$t('Type')"
            field="type"
          >
            {{ getTypeLabel(props.row.type) }}
          </b-table-column>
        </template>
      </b-table>
    </div>
  </div>
</template>

<script>
import { debounce } from 'lodash'
import HasAttributes from '@getcandyhub/core/src/mixins/HasAttributes'

export default {
  mixins: [
    HasAttributes
  ],
  data () {
    return {
      page: 1,
      perPage: 30,
      total: 0,
      searchTerm: null,
      items: []
    }
  },
  mounted () {
    this.fetch()
    // this.$nuxt.context.app.$hooks.callHook('customers.listing.columns', this.customColumns);
  },
  methods: {
    changePage (val) {
      this.page = val
      this.fetch()
    },
    getTypeLabel (val) {
      return val.split('\\').slice(-1)[0]
    },
    refresh: debounce(function () {
      this.fetch()
    }, 300),
    async fetch () {
      const response = await this.$gc.recycleBin.get({
        page: this.page,
        per_page: this.perPage,
        full_response: true,
        terms: this.searchTerm
      })
      const { data } = response

      this.items = data.data
      this.page = data.meta.current_page
      this.perPage = data.meta.per_page
      this.total = data.meta.total
    }
  }
}
</script>
