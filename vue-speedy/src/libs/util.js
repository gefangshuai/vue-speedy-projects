import Cookies from 'js-cookie'
import {LANGUAGE_KEY, SESSION_HOLDER_KEY, TOKEN_KEY} from "../const";
// cookie保存的天数
import config from '@/config'
import {forEach, hasOneOf} from '@/libs/tools'
import _endsWith from 'lodash/endsWith'
import _startsWith from 'lodash/startsWith'

export const setToken = (token) => {
    Cookies.set(TOKEN_KEY, token, {expires: config.cookieExpires || 1})
}

export const getToken = () => {
    const token = Cookies.get(TOKEN_KEY)
    if (token) {
        return token
    } else {
        return false
    }
}

export const hasChild = (item) => {
    return item.children && item.children.length !== 0
}

const showThisMenuEle = (item, access) => {
    if (item.meta && item.meta.access && item.meta.access.length) {
        if (hasOneOf(item.meta.access, access)) {
            return true
        } else {
            return false
        }
    } else {
        return true
    }
}


/**
 * @param {Array} list 通过路由列表得到菜单列表
 * @param {Array} access 用户权限
 * @returns {Array}
 */
export const getMenuByRouter = (list, access) => {
    let res = []
    forEach(list, item => {
        if (!item.meta || (item.meta && !item.meta.hideInMenu)) {
            let obj = {
                icon: (item.meta && item.meta.icon) || '',
                name: item.name,
                meta: item.meta
            }
            if ((hasChild(item) || (item.meta && item.meta.showAlways)) && checkIfShowThisMenu(item, access)) {
                obj.children = getMenuByRouter(item.children, access)
            }
            if (item.meta && item.meta.href) obj.href = item.meta.href
            if (checkIfShowThisMenu(item, access)) res.push(obj)
            // if (showThisMenuEle(item, access)) res.push(obj)
        }
    })
    return res
}
/**
 * 递归检查是否包含当前菜单
 * @param list  路由列表
 * @param item  当前路由
 * @param access    当前用户权限
 */
const checkIfShowThisMenu = (item, access) => {
    if (item.meta && item.meta.authenticated || hasOneOf([item.name], access)) return true

    if (item.children) {
        for (let child of item.children) {
            if (checkIfShowThisMenu(child, access)) {
                return true
            }
        }
    }
};

/**
 * @param {Array} routeMetched 当前路由metched
 * @returns {Array}
 */
export const getBreadCrumbList = (routeMetched, homeRoute) => {
    let res = routeMetched.filter(item => {
        return item.meta === undefined || !item.meta.hide
    }).map(item => {
        let obj = {
            icon: (item.meta && item.meta.icon) || '',
            name: item.name,
            meta: item.meta
        }
        return obj
    })
    res = res.filter(item => {
        return !item.meta.hide
    })
    return [Object.assign(homeRoute, {to: homeRoute.path}), ...res]
}

export const showTitle = (item, vm) => {
    if (item.params && item.params.tabTitle) {
        return item.params.tabTitle
    } else {
        return vm.$config.useI18n ? vm.$t(item.name) : ((item.meta && item.meta.title) || item.name)
    }
}

/**
 * @description 本地存储和获取标签导航列表
 */
export const setTagNavListInLocalstorage = list => {
    localStorage.tagNaveList = JSON.stringify(list.filter(o => Object.keys(o).length > 0))
}
/**
 * @returns {Array} 其中的每个元素只包含路由原信息中的name, path, meta三项
 */
export const getTagNavListFromLocalstorage = () => {
    const list = localStorage.tagNaveList
    return list ? JSON.parse(list) : []
}

/**
 * @param {Array} routers 路由列表数组
 * @description 用于找到路由列表中name为home的对象
 */
export const getHomeRoute = routers => {
    let i = -1
    let len = routers.length
    let homeRoute = {}
    while (++i < len) {
        let item = routers[i]
        if (item) {
            if (item.children && item.children.length) {
                let res = getHomeRoute(item.children)
                if (res.name) return res
            } else {
                if (item.name === 'Home') homeRoute = item
            }
        }
    }
    return homeRoute
}

/**
 * @param {*} list 现有标签导航列表
 * @param {*} newRoute 新添加的路由原信息对象
 * @description 如果该newRoute已经存在则不再添加
 */
export const getNewTagList = (list, newRoute) => {
    console.log('getNewTagList', list, newRoute);
    const {name, path, meta, params, query} = newRoute

    let newList = [...list]
    let findItemIndex = newList.findIndex(item => {
        return (item.meta.matchByPath && item.path === path) || (!item.meta.matchByPath && item.name === name)
    })
    console.log('findItemIndex', findItemIndex, name)
    if (findItemIndex >= 0) {
        return newList
    } else {
        newList.push({name, path, meta, params, query})
    }
    return newList
}

/**
 * @param {*} access 用户权限数组，如 ['super_admin', 'admin']
 * @param {*} route 路由列表
 */
const hasAccess = (access, route) => {
    if (route.meta && route.meta.access) {
        return hasOneOf(access, route.meta.access)
    } else {
        return true
    }
}

/**
 * 权鉴
 * @param {*} name 即将跳转的路由name
 * @param {*} access 用户权限数组
 * @param {*} routes 路由列表
 * @description 用户是否可跳转到该页
 */
export const canTurnTo = (name, access, routes) => {
    const routePermissionJudge = (list) => {
        return list.some(item => {
            if (item.children && item.children.length) {
                return routePermissionJudge(item.children)
            } else if (item.name === name) {
                return hasAccess(access, item)
            }
        })
    }

    return routePermissionJudge(routes)
}

/**
 * @param {String} url
 * @description 从URL中解析参数
 */
export const getParams = url => {
    const keyValueArr = url.split('?')[1].split('&')
    let paramObj = {}
    keyValueArr.forEach(item => {
        const keyValue = item.split('=')
        paramObj[keyValue[0]] = keyValue[1]
    })
    return paramObj
}

/**
 * @param {Array} list 标签列表
 * @param {String} name 当前关闭的标签的name
 */
export const getNextByName = (list, name) => {
    let res = ''
    if (list.length === 2) {
        res = getHomeRoute(list)
    } else {
        if (list.findIndex(item => item.name === name) === list.length - 1) {
            res = list[list.length - 2]
        } else {
            res = list[list.findIndex(item => item.name === name) + 1]
        }
    }
    return res
}
/**
 * @param {Array} list 标签列表
 * @param {String} path 当前关闭的标签的path
 */
export const getNextByPath = (list, path) => {
    let res = ''
    if (list.length === 2) {
        res = '/'
    } else {
        if (list.findIndex(item => item.path === path) === list.length - 1) {
            res = list[list.length - 2]
        } else {
            res = list[list.findIndex(item => item.path === path) + 1]
        }
    }
    return res
}

/**
 * @param {Number} times 回调函数需要执行的次数
 * @param {Function} callback 回调函数
 */
export const doCustomTimes = (times, callback) => {
    let i = -1
    while (++i < times) {
        callback()
    }
}

/**
 * @param {Object} file 从上传组件得到的文件对象
 * @returns {Promise} resolve参数是解析后的二维数组
 * @description 从Csv文件中解析出表格，解析成二维数组
 */
export const getArrayFromFile = (file) => {
    let nameSplit = file.name.split('.')
    let format = nameSplit[nameSplit.length - 1]
    return new Promise((resolve, reject) => {
        let reader = new FileReader()
        reader.readAsText(file) // 以文本格式读取
        let arr = []
        reader.onload = function (evt) {
            let data = evt.target.result // 读到的数据
            let pasteData = data.trim()
            arr = pasteData.split((/[\n\u0085\u2028\u2029]|\r\n?/g)).map(row => {
                return row.split('\t')
            }).map(item => {
                return item[0].split(',')
            })
            if (format === 'csv') {
                resolve(arr)
            } else {
                reject(new Error('[Format Error]:你上传的不是Csv文件'))
            }
        }
    })
}

/**
 * @param {Array} array 表格数据二维数组
 * @returns {Object} { columns, tableData }
 * @description 从二维数组中获取表头和表格数据，将第一行作为表头，用于在iView的表格中展示数据
 */
export const getTableDataFromArray = (array) => {
    let columns = []
    let tableData = []
    if (array.length > 1) {
        let titles = array.shift()
        columns = titles.map(item => {
            return {
                title: item,
                key: item
            }
        })
        tableData = array.map(item => {
            let res = {}
            item.forEach((col, i) => {
                res[titles[i]] = col
            })
            return res
        })
    }
    return {
        columns,
        tableData
    }
}

export const findNodeUpper = (ele, tag) => {
    if (ele.parentNode) {
        if (ele.parentNode.tagName === tag.toUpperCase()) {
            return ele.parentNode
        } else {
            return findNodeUpper(ele.parentNode, tag)
        }
    }
}

export const findNodeDownward = (ele, tag) => {
    const tagName = tag.toUpperCase()
    if (ele.childNodes.length) {
        let i = -1
        let len = ele.childNodes.length
        while (++i < len) {
            let child = ele.childNodes[i]
            if (child.tagName === tagName) {
                return child
            } else {
                return findNodeDownward(child, tag)
            }
        }
    }
}

export const showByAccess = (access, canViewAccess) => {
    return hasOneOf(canViewAccess, access)
}

/**
 * 将路由数据打平
 * @param routers
 * @returns {Array}
 */
export const routesToParallel = routers => {
    let parallelList = []
    const parallel = list => {
        list.forEach(o => {
            parallelList.push(o)
            if (o.children && o.children.length > 0) {
                parallel(o.children)
            }
        })
    }
    parallel(routers)
    return parallelList
}
/**
 * 根据名字获取路由
 * @param list
 * @param name
 * @returns {*}
 */
export const getRouteByName = (list, name) => {
    return routesToParallel(list).find(o => o.name === name)
}

/**
 * 将对象转化成表单参数 FormData
 * @param object
 * @returns {FormData}
 */
export const toFormData = (object) => {
    let formData = new FormData()
    Object.keys(object).forEach(key => {
        if (object[key])
            formData.append(key, object[key])
    })
    return formData
}

/**
 * 存储holder
 * @param route
 */
export const storeHolder = route => {
    if (route.params && route.params.holder) {
        window.sessionStorage.setItem(SESSION_HOLDER_KEY, route.params.holder)
    }
}
/**
 * 检查当前路由是否属于租户，返回true则不需要在租户下
 */
export const checkIfHolderNeedless = route => {
    return route.meta && route.meta.holderNeedless
}

/**
 * 为路由设置holder
 * @param route
 */
export const setLocalHolder = (route, holder) => {
    if (!route.params) {
        route.params = {}
    }

    route.params.holder = holder
    storeHolder(route)
}

/**
 * 获取HolderId
 * @returns {string}
 */
export const getLocalHolder = () => {
    return window.sessionStorage.getItem(SESSION_HOLDER_KEY)
}
/**
 * 获取response error code
 * @param err
 * @returns {*}
 */
export const getErrorCode = (err) => {
    if (err.response && err.response.data && err.response.data.code) {
        return err.response.data.code
    } else {
        return null
    }
}

/**
 * 清理Object，将值为空的属性去掉
 * @param obj
 */
export const clearObj = obj => {
    let target = {};
    Object.keys(obj).forEach(key => {
        if (obj[key])
            target[key] = obj[key]
    });
    return target;
};

export const setLocale = (language) => {
    window.localStorage.setItem(LANGUAGE_KEY, language)
}

export const getLocale = () => {
    return window.localStorage.getItem(LANGUAGE_KEY)
}

export const appendPath = (prefix, path) => {
    if (_endsWith(prefix, '/')) {
        prefix = prefix.slice(0, -1)
    }
    if (_startsWith(path, '/')) {
        path = path.slice(1)
    }
    return prefix + '/' + path
}
