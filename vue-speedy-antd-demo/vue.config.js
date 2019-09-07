module.exports = require('vue-speedy-antd/conf')({
    lessModifyVars: {   // 用于覆盖主题配色，所有变量如下：https://github.com/vueComponent/ant-design-vue/blob/master/components/style/themes/default.less
        'primary-color': '#0682a5',
    },
    title: 'Vue Speedy Ant Design',
    baseUrl: '/',
    devServer: {
        port: 6161,
        proxy: {
            '/api': {
                target: "http://localhost:18080",
                changeOrigin: true,
                secure: false,
                pathRewrite: {
                    '^/api': '/api'
                }
            }
        }
    }
})