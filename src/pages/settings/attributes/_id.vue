<template>
  <div>
    <div class="bg-orange-100 text-orange-600 py-3 text-xs font-bold border-b border-orange-300 px-6 flex" v-if="attribute.system">
      <i class="ri-lock-line mr-2" />
      You are trying to edit a system attribute. Saving has been disabled.
    </div>
    <simple-modal heading="Permanent delete" :open="showDeleteConfirm" @confirmed="deleteAttribute" @close="showDeleteConfirm = false">
      {{ $t('Are you sure you want to delete this record? This action cannot be undone.') }}
    </simple-modal>
    <toolbar :heading="$t('Available Attributes')" :subHeading="getLocaleValue(attribute.name)">
      <div class="flex">
        <div>
          <button @click="save" v-if="!attribute.system" class="inline-flex justify-center w-full rounded-md border border-green-300 px-4 py-2 bg-white text-base leading-6 font-medium text-green-600 shadow-sm hover:text-green-500 focus:outline-none focus:border-blue-300 focus:shadow-outline transition ease-in-out duration-150 sm:text-sm sm:leading-5">
            {{ $t('Save changes') }}
          </button>
        </div>
        <div class="ml-4" v-if="!attribute.system">
          <button @click="showDeleteConfirm = true" class="inline-flex justify-center w-full rounded-md border border-transparent px-1 py-1 bg-red-600 text-base leading-6 font-medium text-white shadow-sm hover:bg-red-400 focus:outline-none focus:border-blue-300 focus:shadow-outline transition ease-in-out duration-150 sm:text-sm sm:leading-5">
            <b-icon icon="delete-bin-line" />
          </button>
        </div>
      </div>
    </toolbar>
    <div class="bg-white pb-4 shadow">
      <div class="px-6">
        <div class="py-4">
          <div>
            <basic-translate v-model="fields" :locked="attribute.system" />
          </div>
        </div>

        <div class="mb-4">
          <header class="mb-2 text-sm">
            <label class="font-bold text-gray-700 block">{{ $t('Handle') }}</label>
          </header>
          <div>
            <b-input v-model="attribute.handle" :disabled="true" />
          </div>
        </div>
        <div class="mb-4">
          <header class="mb-2 text-sm">
            <label class="font-bold text-gray-700 block">{{ $t('Type') }}</label>
          </header>
          <div>
            <select-input v-model="attribute.type" :disabled="attribute.system">
              <option value="text">{{ $t('Text') }}</option>
              <option value="textarea">{{ $t('Textarea') }}</option>
              <option value="richtext">{{ $t('Richtext') }}</option>
              <option value="select">{{ $t('Select') }}</option>
              <option value="checkbox">{{ $t('Checkbox') }}</option>
              <option value="date">{{ $t('Date') }}</option>
              <option value="time">{{ $t('Time') }}</option>
              <option value="checkbox_group">{{ $t('Checkbox Group') }}</option>
              <option value="radio_group">{{ $t('Radio Group') }}</option>
              <option value="toggle">{{ $t('Toggle') }}</option>
              <option value="multiselect">{{ $t('Multiselect') }}</option>
            </select-input>
          </div>
        </div>
        <div class="mb-4">
          <header class="mb-2 text-sm">
            <label class="font-bold text-gray-700 block">{{ $t('Attribute Group') }}</label>
          </header>
          <div>
            <select-input v-model="groupId" :disabled="attribute.system">
              <option v-for="(group, index) in attributeGroups" :value="group.id" :key="index">
                {{ getLocaleValue(group.name) }}
              </option>
            </select-input>
          </div>
        </div>

        <div class="flex">
          <div class="w-1/3">
              <header class="mb-2 text-sm">
                <label class="font-bold text-gray-700 block">{{ $t('Searchable') }}</label>
                <p class="text-gray-600 leading-tight text-xs font-normal">{{ $t('Should this attribute be searchable across GetCandy?') }}</p>
              </header>
              <div>
                <radio-checkbox v-model="attribute.searchable" :disabled="attribute.system" />
              </div>
          </div>
          <div class="w-1/3">
              <header class="mb-2 text-sm">
                <label class="font-bold text-gray-700 block">{{ $t('Filterable') }}</label>
                <p class="text-gray-600 leading-tight text-xs font-normal">{{ $t('Should this attribute appear in search aggregates?') }}</p>
              </header>
              <div>
                <radio-checkbox v-model="attribute.filterable" :disabled="attribute.system" />
              </div>
          </div>
          <div class="w-1/3">
              <header class="mb-2 text-sm">
                <label class="font-bold text-gray-700 block">{{ $t('Required?') }}</label>
                <p class="text-gray-600 leading-tight text-xs font-normal">{{ $t('Admins editing products will not be able to leave this blank') }}</p>
              </header>
              <div>
                <radio-checkbox v-model="attribute.required" :disabled="attribute.system" />
              </div>
          </div>
        </div>
      </div>

      <div v-if="(['select', 'multiselect']).includes(attribute.type)">
        <header class="px-6 my-4 flex justify-between">
          <h3>{{ $t('Lookups') }}</h3>
          <b-button type="is-primary" @click="addLookup()">{{ $t('Add Lookup') }}</b-button>
        </header>
        <div class="search-table">
          <b-table searchable paginated :data="attribute.lookups || []">
            <template slot-scope="props">
              <b-table-column field="label" :label="$t('Label')" sortable>
                <b-input v-model="props.row.label" />
              </b-table-column>
              <b-table-column field="value" :label="$t('Value')" sortable>
                <b-input v-model="props.row.value" />
              </b-table-column>
              <b-table-column>
                <b-button type="is-danger" @click="removeLookup(props.index)"><i class="ri-delete-bin-line"></i></b-button>
              </b-table-column>
            </template>
            <template slot="top-left">
              <b-button type="is-primary" @click="addLookup()">{{ $t('Add Lookup') }}</b-button>
            </template>
          </b-table>
        </div>
      </div>
      </div>
    </div>

  </div>
</template>

<script>
import { get } from 'lodash'

export default {
  layout: 'settings',
  head () {
    return {
      title: this.getLocaleValue(this.attribute.name)
    }
  },
  data () {
    return {
      lookups: [],
      showDeleteConfirm: false
    }
  },
  async asyncData ({ app, params }) {
    const response = await app.$gc.attributes.find(params.id, {
      include: 'group'
    })
    const groups = await app.$gc.attributeGroups.get({
      paginated: false
    })
    return {
      attribute: response.data.data,
      groupId: response.data.data.group.data.id,
      attributeGroups: groups.data.data,
      fields: {
        name: {
          values: response.data.data.name,
          type: 'text'
        }
      }
    }
  },
  methods: {
    getLocaleValue (data) {
      return get(data, this.locale, data.en)
    },
    removeLookup (index) {
      this.attribute.lookups.splice(index, 1)
    },
    addLookup () {
      if (!this.attribute.lookups) {
        this.$set(this.attribute, 'lookups', [])
      }
      this.attribute.lookups.push({
        label: null,
        value: null,
      })
    },
    async deleteAttribute () {
      if (this.attribute.system) {
        this.$notify.queue('error', this.$t('Unable to delete attribute'))
        return;
      }
      try {
        await this.$gc.attributes.delete(this.attribute.id)
        await this.$router.replace({
          name: 'settings-attributes'
        })
        this.$notify.queue('success', this.$t('Attribute deleted'))
      } catch (error) {
        this.$notify.queue('error', this.$t('Unable to delete attribute'))
      }
    },
    async save () {
      try {
        this.attribute.group_id = this.groupId
        await this.$gc.attributes.update(this.attribute.id, this.attribute)
        this.$notify.queue('success', this.$t('Attribute saved'))
      } catch (e) {
        this.$notify.queue('error', this.$t('Unable to save Attribute'))
      }
    }
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
