<template>
  <div class="search-table">
    <div class="search-field" v-if="hideSearch === false">
      <b-input v-model="searchTerm" @input="refresh" :placeholder="$t(searchPlaceholder)"></b-input>
    </div>
    <div v-if="largeDataSet" class="text-white bg-red-500 p-4 text-xs font-medium">
      Large data set returned, showing the first <strong class="text-white">{{ total }}</strong> results, use search and filters to find products.
    </div>
    <b-table
      :striped="!hoverable"
      :loading="loading"
      :hoverable="hoverable"
      :data="data"
      :total="total"
      :per-page="perPage"
      :current-page="page"
      backend-sorting
      @sort="onSort"
      sort-icon="arrow-up-s-line"
      paginated
      @mouseenter="handleMouseEnter"
      backend-pagination
      @page-change="changePage"
      :checkable="checkable"
    >
      <template slot-scope="props">
        <slot v-bind="props" />
      </template>
      <template slot="empty">
        <section class="section">
          <div class="content has-text-grey has-text-centered">
            <p>Nothing here.</p>
          </div>
        </section>
      </template>
    </b-table>
  </div>
</template>

<script>
  const each = require('lodash/each')
  const debounce = require('lodash/debounce')
  export default {
    props: {
      type: {
        type: String,
        required: true
      },
      filters: {
        type: Object,
        default: () => {}
      },
      checkable: {
        type: Boolean,
        default: false
      },
      externalTerm: {
        type: String,
        default: null
      },
      hoverable: {
        type: Boolean,
        default: false
      },
      includes: {
        type: String|Array
      },
      limit: {
        type: String|Number,
        default: 30
      },
      searchPlaceholder: {
        type: String,
        default: 'Search by keyword'
      },
      hideSearch: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        loading: true,
        data: [],
        sort: null,
        searchTerm: this.externalTerm,
        largeDataSet: false,
        page: 1,
        total: 0,
        perPage: this.limit,
      }
    },
    watch: {
      externalTerm (val) {
        this.searchTerm = this.externalTerm
        this.refresh()
      },
      filters: {
        deep: true,
        handler () {
          this.loadData()
        }
      }
    },
    mounted() {
      const query = this.$route.query;
      this.searchTerm = query.keywords || null
      this.page = parseInt(query.page) || 1
      this.sort = query.sort || null
      this.loadData()
    },
    methods: {
      refresh: debounce(function () {
        this.loadData(false)
      }, 400),
      changePage(page) {
        this.page = page
        this.loadData()
      },
      onSort(val, dir) {
        this.sort = val + '-' + dir

        this.loadData()
      },
      handleMouseEnter(e) {
        this.$emit('mouseenter', e)
      },
      async loadData() {
        this.loading = true;

        // channel, category, page, searchType, keywords, rank, idsOnly, include, sort, options = {

        try {
          const response = await this.$getcandy.on('Search').getSearch(
            this.channel,
            null,
            this.page,
            this.type,
            this.externalTerm || this.searchTerm,
            false,
            false,
            this.includes,
            this.sort,
            true,
            {
              query: {
                per_page: this.limit
              }
            }
          )

          this.data = response.data.data
          const meta = response.data.meta
          this.total = meta.total
          this.perPage = meta.per_page
          this.page = meta.current_page;

          this.$emit('loaded', response.data)

          const query = this.$route.query;
          // Push everything to the query string
          this.$router.push({
            path: this.$route.path,
            query: {
              keywords: this.searchTerm,
              sort: this.sort,
              page: this.page
            }
          })
        } catch (e) {

        }
        this.loading = false
      }
    }
  }
</script>
