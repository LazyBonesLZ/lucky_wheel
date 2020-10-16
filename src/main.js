// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import axios from 'axios';
// import ToggleSwitch from './Switch'
import { ToggleButton } from 'vue-js-toggle-button'

Vue.config.productionTip = false
// Vue.component('toggle-switch', ToggleSwitch)

Vue.component('ToggleButton', ToggleButton)
Vue.prototype.$axios = axios; //放置在 new Vue之前，否则刷新页面会导致 this.$axios is not a function Error
/* eslint-disable no-new */
new Vue({
  el: '#app',
  template: '<App/>',
  components: { App }
})
Vue.prototype.$axios = axios;
