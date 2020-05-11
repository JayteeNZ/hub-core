<template>
  <div class="flex bg-white border-b justify-between items-center">
    <div v-if="heading" class="px-6 py-4">
      <div class="flex items-center">
          <h1 class="text-gray-600 font-medium">{{ heading }}</h1>
          <template v-if="subHeading">
            <b-icon class="text-gray-300" icon="arrow-right-s-line" />
            <span >{{ truncate(subHeading) }}</span>
          </template>
      </div>

    </div>
    <div class="w-2/3" v-if="$slots.search">
      <slot name="search" />
    </div>
    <div class="pr-6" v-if="$slots.default">
      <slot />
    </div>
      <!-- <div class="toolbar__header">
        <h1 class="toolbar__heading">{{heading}}</h1>
        <span class="toolbar__subheading" v-if="subHeading">
          <b-icon icon="arrow-right-s-line" />
          <span>{{subHeading}}</span>
        </span>
      </div>
      <div class="toolbar__search" v-if="$slots.search">
        <slot name="search" />
      </div>
      <div class="toolbar__slots">
        <slot />
      </div> -->
  </div>
</template>

<script>
  export default {
    props: {
      fixed: {
        type: Boolean,
        default: false
      },
      heading: {
        type: String,
        required: true
      },
      subHeading: {
        type: String,
        required: false
      },
      searchBar: {
        type: Boolean,
        required: false
      }
    },
    methods: {
      truncate(string, maxLength = 70) {
        if (!string) return null;
        if (string.length <= maxLength) return string;
        return `${string.substring(0, maxLength)}...`;
      }
    }
  }
</script>
