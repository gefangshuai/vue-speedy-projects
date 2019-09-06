import Vue from "vue";
import Inject from '../conf/main-inject'
import pages from './pages'
import adminLayout from "./layout/admin-layout";
import router from "./router";

import homeMenu from './pages/home/menu'
import systemMenu from './pages/system/menu'

const routerInstance = router(pages)

Vue.use(adminLayout, {
    menus: [
        homeMenu,
        {
            id: 'tenowork',
            name: 'Tenowork',
            icon: 'project',
            url: 'https://app.tenowork.com',
            iframe: true
        },
        {
            id: 'example',
            name: '示例',
            icon: 'appstore',
            children: [
                {
                    id: 'exampleBase',
                    name: '基础示例',
                    url: '/example',
                },
                {
                    id: 'exampleSplit',
                    name: '分割容器',
                    url: '/example/split',
                },
                {
                    id: 'exampleTree',
                    name: '树容器',
                    url: '/example/tree',
                },
            ]
        },
        systemMenu
    ],
})

Vue.use(Inject, {
    config: {
        title: 'Vue Speedy Ant Design',
        shortTitle: 'VD',
        router: routerInstance
    },
    pages: pages,
    modules: [
        {
            path: 'test',
            module: {
                namespaced: true,
                state: {
                    name: 'VueSpeedyAntD'
                },
                getters: {
                    nameGet: state => state.name
                }
            }
        }
    ]
})