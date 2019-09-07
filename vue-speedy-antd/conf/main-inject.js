import Vue from 'vue'
import App from '../src/App.vue'
import axios from 'axios'
import router from '../src/router'
import store from '../src/store'
import VueBus from 'vue-bus'

import AntdDependency from '../src/antd-common-dependency'
import axiosInterceptors from '../src/core/axios.interceptors'

import '../src/assets/less/index.less'
import {setSiteTitle} from "../src/utils/common";
import InjectSModal from '../src/components/global/s-modal'

Vue.use(VueBus)
Vue.config.productionTip = false
Vue.use(AntdDependency)
Vue.use(InjectSModal)
export default {
    install: (Vue, options) => {
        let defaultOptions = {
            baseAdminUrl: '/',
            pages: null,                // 路由配置
            modules: [],
            mixins: [],
            config: {
            }
        }
        defaultOptions = Object.assign(defaultOptions, options)

        setSiteTitle(defaultOptions.config.title, true)

        const routerInstance = router(defaultOptions.pages, defaultOptions.baseAdminUrl)
        axiosInterceptors(axios, routerInstance)

        /**
         * @description 全局注册应用配置
         */
        Vue.prototype.$http = axios;

        defaultOptions.modules.forEach(m => {
            store.registerModule(m.path, m.module)
        })
        //
        // Vue.config.errorHandler = (error, vm) => {
        //     console.error(error)
        //     console.error({
        //         error,
        //         vm
        //     })
        //     notification.error({
        //         message: '遇到未知错误!',
        //         description: `请按Ctrl + F5强制刷新浏览器重试！`
        //     })
        // }

        // 保存菜单
        store.dispatch('app/storeConfigAction', defaultOptions.config)
        new Vue({
            router: routerInstance,
            store,
            render: h => h(App),
        }).$mount('#app')

        console.log('%c 😎 Platform init finished!', 'background: #00a1ff; padding: 1px 25px; color: #fff; border-radius: 4px;', options);
    }
}
