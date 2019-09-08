import Vue from "vue";
import Inject from '../../conf/index-main-inject'

Vue.use(Inject, {
    config: {
        title: '业务前台页面',
    },
    pages: [
        {
            name: 'Index',
            path: '/',
            meta: {
                anonymous: true
            },
            component: () => import('./pages/index/Index')
        }
    ],
    modules: []
})