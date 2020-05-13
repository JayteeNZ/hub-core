<template>
  <div>
    <div class="flex p-8">
      <div class="w-2/3 mr-8">
        <div class="border border-dashed border-gray-400 overflow-hidden rounded">
          <file-upload
            @built="initUploader"
            @file-added="handleFileAdded"
            @file-uploaded="handleFileUploaded"
            :initial-files="pending"
            :process-on-add="processOnAdd"
            :assetable="assetable"
            :parent-id="parent.id"
          />
        </div>
      </div>
      <div class="w-1/3">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <button @click="showYoutubeUpload = true" class="bg-gray-800 hover:bg-gray-900 text-white shadow-md rounded py-2 px-4 text-sm">
              <div class="flex items-center">
              <b-icon icon="youtube-line" class="mr-2 text-youtube" />
              <span class="inline-flex">Upload YouTube Video</span>
              </div>
            </button>
            <quick-view-panel :heading="$t('Upload YouTube video')" :open="showYoutubeUpload" @close="showYoutubeUpload = false">
              <div class="p-6">
                <youtube-uploader type="youtube" @uploaded="handleExternalAssetUpload" />
              </div>
            </quick-view-panel>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-gray-900 px-8 text-sm font-medium">
      <div class="flex">
        <button
          class="text-gray-400 px-8 py-3 focus:outline-none"
          :class="{
            'text-gray-900 bg-white' : filter == type.handle,
            'hover:bg-gray-800 hover:text-white' : filter != type.handle
          }"
          @click="filter = type.handle"
          v-for="(type, index) in types"
          :key="index"
        >
        {{ $t(type.label) }}
        </button>
      </div>
    </div>
    <div class="search-table">
      <div class="b-table">
        <table class="table is-fullwidth">
          <thead>
            <tr>
              <th v-if="getFilteredResults.length > 1" />
              <th>
                <b-tooltip
                  :label="$t('Set the main image for this product')"
                  position="is-bottom"
                >
                  {{ $t('Primary') }} <b-icon icon="question" size="is-small" />
                </b-tooltip>
              </th>
              <th />
              <th>{{ $t('Title/Alt Tag') }}</th>
              <th>{{ $t('Description') }}</th>
              <th>{{ $t('Tags') }}</th>
              <th>{{ $t('File Type') }}</th>
              <th />
            </tr>
          </thead>
          <tfoot v-if="!getFilteredResults.length">
            <tr>
              <td colspan="42">
                {{ $t('No assets found') }}
              </td>
            </tr>
          </tfoot>
          <tbody v-sortable="sortableOptions">
            <tr v-for="(asset, index) in getFilteredResults" :key="asset.id">
              <td class="handle" v-if="getFilteredResults.length > 1">
                <svg width="13px" viewBox="0 0 13 19" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                  <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                    <g id="Artboard" fill="#D8D8D8">
                      <rect id="Rectangle" x="2" y="2" width="3" height="3" />
                      <rect id="Rectangle-Copy-2" x="2" y="8" width="3" height="3" />
                      <rect id="Rectangle-Copy-4" x="2" y="14" width="3" height="3" />
                      <rect id="Rectangle-Copy-5" x="8" y="14" width="3" height="3" />
                      <rect id="Rectangle-Copy" x="8" y="2" width="3" height="3" />
                      <rect id="Rectangle-Copy-3" x="8" y="8" width="3" height="3" />
                    </g>
                  </g>
                </svg>
              </td>
              <td>
                <div class="field">
                  <b-switch v-model="asset.primary" v-if="getThumbnail(asset)" @click="setPrimary(asset)" />
                </div>
              </td>
              <td>
                <thumbnail-loader :asset="asset" width="50px" />
              </td>
              <td>
                <b-input v-model="asset.title" @blur="save" />
              </td>
              <td>
                <b-input v-model="asset.caption" @blur="save" />
              </td>
              <td>
                <b-taginput
                  @input="save"
                  :data="defaultTags"
                  v-model="asset.tags"
                  :placeholder="$t('Asset tags')"
                  icon="price-tag-3-line"
                />
              </td>
              <td>
                <span v-if="asset.extension">.{{ asset.extension }}</span><span v-else>-</span>
              </td>
              <td align="right">
                <b-button :href="asset.url" class="button is-text" target="_blank">
                  <b-icon icon="download-line" size="is-small" />
                </b-button>
                <b-button  @click="showDeleteModal(index)" class="button is-text" icon color="red">
                  <b-icon icon="delete-bin-line" size="is-small" />
                </b-button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <simple-modal heading="Permanent delete" :open="deleteModalOpen" @confirmed="deleteAsset" @close="deleteModalOpen = false">
      {{ $t('This action cannot be undone') }}
    </simple-modal>
  </div>
</template>

<script>
const first = require('lodash/first')
const find = require('lodash/find')
const map = require('lodash/map')


export default {
  props: {
    processOnAdd: {
      type: Boolean,
      default: true
    },
    assetable: {
      type: String,
      default: () => {}
    },
    parent: {
      type: Object,
      default: () => {}
    },
    token: {
      type: String,
      default: null
    },
    pending: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      deleteModalOpen: false,
      assetToDelete: {},
      filter: null,
      processingAssetUrl: false,
      failedUploads: [],
      assetUrlType: 'external',
      defaultTags: [],
      showYoutubeUpload: false,
      urlUpload: {
        type: 'youtube',
        url: ''
      },
      uploader: null,
      sortableOptions: {
        onEnd: this.reorder,
        filter: '.disabled',
        handle: '.handle',
        animation: 150
      },
      types: [
        {
          label: 'All',
          handle: null,
        },
        {
          label: 'Images',
          handle: 'images',
        },
        {
          label: 'Files',
          handle: 'files',
        },
        {
          label: 'Videos',
          handle: 'videos',
        }
      ],
      mimeTypes: [
        {
          label: 'YouTube',
          value: 'youtube'
        },
        {
          label: 'Vimeo',
          value: 'vimeo'
        },
        {
          label: 'URL',
          value: 'external'
        }
      ],
      urlUploadModalOpen: false,
      assets: [],
      assetsToUpload: [],
      dzOptions: {
        headers: {
          'X-CANDY-HUB': true
        }
      }
    }
  },
  computed: {
    /**
     * Gets filtered results for the assets
     * @param  {string} type
     * @return {Object}
     */
    getFilteredResults () {
      if (this.filter) {
        return this.assets.filter((asset) => {
          if (this.filter === 'images') {
            return asset.kind === 'image'
          } else if (this.filter === 'videos') {
            return asset.external && asset.kind !== 'image'
          } else {
            return asset.kind !== 'image' && !asset.external
          }
        })
      }
      return this.assets
    },
    parentId () {
      return this.parent.id
    }
  },
  watch: {
    parentId (val) {
      if (val !== this.parent.id) {
        this.initAssets()
      }
    }
  },
  mounted () {
    this.initAssets()
    this.urlUpload.type = this.mimeTypes[0].value
  },
  methods: {
    initAssets () {
      this.assets = []
      this.parent.assets.data.forEach((asset) => {
        if (asset.tags.data) {
          asset.tags = map(asset.tags.data, tag => {
            return tag.name
          })
          delete asset.tags.data
        } else {
          asset.tags = []
        }
        this.assets.push(asset)
      })
    },
    save () {
      this.$emit('beforeSave', this.assets, (done) => {
        this.saveAssets()
      })
    },
    saveAssets () {
      const formData = new FormData()
      formData.append('assets', this.assets)
      this.$gc.assets.put({
        assets: this.assets
      }).then((response) => {
        this.$buefy.toast.open({
          message: 'Assets Saved',
          position: 'is-bottom',
          type: 'is-success'
        })
      })
    },
    handleExternalAssetUpload (response) {
      const asset = response.data
      asset.tags = []
      this.$emit('beforeSave', this.assets, (done) => {
        this.assets.push(asset)
      })
      this.$emit('externalAssetAdded', response)
    },
    initUploader (context) {
      this.uploader = context
    },
    handleFileAdded (file) {
      this.$emit('file-added', file)
    },
    handleFileUploaded (data) {
      this.$emit('file-uploaded', data.file)
      const response = data.response.body.data
      response.tags = response.tags.data
      this.assets.push(response)
    },
    getThumbnail (asset) {
      if (asset.thumbnail) {
        return asset.thumbnail
      }
      if (!asset.transforms || !asset.transforms.data.length) {
        return false
      }
      return first(asset.transforms.data).url
    },
    deleteAsset (event) {
      const asset = this.assetToDelete;
      this.$getcandy.on('Assets').postAssetsAssetIdDetachOwnerId(asset.id, this.parentId, {
        assetDetachBody: {
          type: asset.type
        }
      }).then(response => {
        this.assets.splice(this.deletedIndex, 1)
        this.assetToDelete = {}
        this.deletedIndex = null
        this.deleteModalOpen = false
        this.$notify.queue('success', 'Asset deleted')
      })
    },
    reorder ({ oldIndex, newIndex }) {
      this.$emit('changed', this.assets, (done) => {
        const movedItem = this.assets.splice(oldIndex, 1)[0]
        this.assets.splice(newIndex, 0, movedItem)
        let pos = 1
        this.assets.forEach((asset) => {
          asset.position = pos
          pos++
        })
        this.save()
      })
    },
    setPrimary (newPrimary) {
      this.assets.forEach((asset) => {
        if (asset.id === newPrimary.id) {
          asset.primary = 1
        } else {
          asset.primary = 0
        }
      })
      this.save()
    },
    /**
     * Shows the delete modal for an asset
     * @param  int index
     * @return void
     */
    showDeleteModal (index) {
      this.deletedIndex = index
      this.assetToDelete = this.assets[index]
      this.deleteModalOpen = true
    },
    openUrlModal () {
      this.urlUploadModalOpen = true
    },
    closeUrlModal () {
      this.urlUploadModalOpen = false
    },
    closeDeleteModal () {
      this.deleteModalOpen = false
    },
    getIcon (type) {
      return '/candy-hub/icons/file-types/' + type + '.svg'
    }
  }
}
</script>
