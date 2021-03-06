<template>
    <div class="editor-wrapper">
        <div :id="editorId" class="editor"></div>
    </div>
</template>

<script>
    import Editor from 'wangeditor'
    import 'wangeditor/release/wangEditor.min.css'
    import {oneOf} from '@/libs/tools'

    export default {
        name: 'Editor',
        props: {
            value: {
                type: String,
                default: ''
            },
            /**
             * 绑定的值的类型, enum: ['html', 'text']
             */
            valueType: {
                type: String,
                default: 'html',
                validator: (val) => {
                    return oneOf(val, ['html', 'text'])
                }
            },
            /**
             * @description 设置change事件触发时间间隔
             */
            changeInterval: {
                type: Number,
                default: 200
            },
            /**
             * @description 是否开启本地存储
             */
            cache: {
                type: Boolean,
                default: false
            },
            menus: {
                type: Array,
                default() {
                    return [
                        'head',  // 标题
                        'bold',  // 粗体
                        'fontSize',  // 字号
                        'fontName',  // 字体
                        'italic',  // 斜体
                        'underline',  // 下划线
                        'strikeThrough',  // 删除线
                        'foreColor',  // 文字颜色
                        'backColor',  // 背景颜色
                        'link',  // 插入链接
                        'list',  // 列表
                        'justify',  // 对齐方式
                        'quote',  // 引用
                        //'emoticon',  // 表情
                        'image',  // 插入图片
                        //'table',  // 表格
                        // 'video',  // 插入视频
                        // 'code',  // 插入代码
                        // 'undo',  // 撤销
                        // 'redo'  // 重复
                    ]
                }
            },
            /**
             * 额外的菜单项
             */
            extraMenus: {
                type: Array,
                default() {
                    return []
                }
            },
            uploadImgServer: String,     // 上传图片的服务地址，与base64不能并存,
            uploadImgTimeout: {
                type: Number,
                default: 60000
            }
        },
        computed: {
            editorId() {
                return `editor${this._uid}`
            }
        },
        watch: {
            // value() {
            //     if (this.editor) {
            //         this.editor.txt.html(this.value)
            //     }
            // }
        },
        methods: {
            setHtml (val) {
                this.editor.txt.html(val)
            }
        },
        mounted() {
            this.editor = new Editor(`#${this.editorId}`)
            this.editor.customConfig.onchange = (html) => {
                let text = this.editor.txt.text()
                if (this.cache) localStorage.editorCache = html
                this.$emit('input', this.valueType === 'html' ? html : text)
                this.$emit('on-change', html, text)
            }
            this.editor.customConfig.zIndex = 1
            this.editor.customConfig.onchangeTimeout = this.changeInterval
            this.editor.customConfig.menus = this.menus.concat(this.extraMenus)
            if (this.uploadImgServer) {
                this.editor.customConfig.uploadFileName = 'file'
                this.editor.customConfig.uploadImgServer = this.uploadImgServer
                this.editor.customConfig.uploadImgTimeout = this.uploadImgTimeout
            } else{
                this.editor.customConfig.uploadImgShowBase64 = true
            }

            // create这个方法一定要在所有配置项之后调用
            this.editor.create();
            if (this.value) {
                this.editor.txt.html(this.value)
            }
            // 如果本地有存储加载本地存储内容
            if (this.cache) {
                let html = localStorage.editorCache;
                if (html) {
                    this.editor.txt.html(html)
                }
            }
        }
    }
</script>

<style>

</style>
