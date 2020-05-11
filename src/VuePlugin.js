import Vue from "vue"

import TestComponent from './components/TestComponent.vue'

export default {
    install (Vue) {
        Vue.component('test-component', TestComponent);
    }
}
