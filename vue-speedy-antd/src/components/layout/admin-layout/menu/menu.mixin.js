import {mapActions, mapGetters} from "vuex";
import {MenuUtil} from "../../../../utils/menu.util";
import {setSiteTitle} from "../../../../utils/common";

export default {
    data() {
        return {
            current: null
        }
    },
    watch: {
        currentMenu(value) {
            this.current = [value.id]
            if (this.currentChange) {
                this.currentChange(value)
            }
            setSiteTitle(value.name)
        }
    },
    methods: {
        ...mapActions('menu', {
            'addTab': 'addTabAction'
        }),
        menuSelect({item, key, selectedKeys}) {
            console.log('menuId', key)
            const menu = MenuUtil.findById(this.menus, key)
            if (menu) {
                this.addTab(menu)
                if (menu.url) {
                    this.$router.push(menu.url).catch(err => {
                    })
                }
            }
        }
    },
    computed: {
        ...mapGetters('menu', {
            currentMenu: 'currentGet'
        })
    }
}