import AdminLayout from "./AdminLayout";
import BaseContainer from "./container/BaseContainer";
import SplitContainer from "./container/SplitContainer";

import mixin from './mixins'
import store from "../../store";
import menuStore from './store/menu'
import defaultMenus from './menu-default'

export default {
    install: (Vue, options) => {
        store.registerModule('menu', menuStore)
        Vue.mixin(mixin)

        // 保存菜单
        store.dispatch('menu/storeMenusAction', options.menus.concat(defaultMenus))

        Vue.component('admin-layout', AdminLayout)
        Vue.component('base-container', BaseContainer)
        Vue.component('split-container', SplitContainer)
        console.log('%c 👌 Admin Layout init finished!', 'background: #9d8621; padding: 1px 25px; color: #fff; border-radius: 4px;', options);
    }
}