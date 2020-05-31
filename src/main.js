// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.

// 第三方模块
import Vue from 'vue';
import axios from 'axios';
import VueAxios from 'vue-axios';
import 'bootstrap';
// Import component
import Loading from 'vue-loading-overlay';
// Import stylesheet
import 'vue-loading-overlay/dist/vue-loading.css';
// Import Vee Validate
import VeeValidate from 'vee-validate';
// Import Vee Validate  locale language hint
import zhCNValidate from 'vee-validate/dist/locale/zh_CN'

// 自定义模块
import App from './App';
import router from './router';
import './bus';
import currencyFilter from './filters/currency';
import timeFilter from './filters/time';

Vue.config.productionTip = false;
Vue.use(VueAxios, axios);
Vue.use(VeeValidate);
VeeValidate.Validator.localize('zh_CN', zhCNValidate);

axios.defaults.withCredentials = true;

Vue.component('loading', Loading);
Vue.filter('currency', currencyFilter);
Vue.filter('time', timeFilter);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})

router.beforeEach((to, from, next) => {
  // console.log('to', to, 'from', from, 'next', next);
  // 查看访问的页面（路由路径）是否需要登陆
  if(to.meta.requiresAuth) {
    const api = `${process.env.API_PATH}/api/user/check`;
    axios.post(api).then(response => {
      console.log(response.data);
      if (response.data.success) {
        // this.$router.push('/')
        next();
      } else {
        next({
          path: '/login'
        })
      }
    });
  } else {
    // 如果页面不需要登陆可以直接「放行」
    next();
  }
})