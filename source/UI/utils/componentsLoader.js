import * as Vue from '../../../static/vue.esm-browser.js'
import { loadModule } from '../../../static/vue3-sfc-loader.esm.js'
import * as runtime from '../../asyncModules.js';

const moduleCache = {
    vue: Vue,
    runtime: runtime,
    eventBus: runtime.plugin.eventBus,
}
let watched = {}
let { ref, reactive } = Vue


/**
 * 初始化并返回一个Vue应用实例。
 * 
 * 该函数负责创建一个Vue应用实例，它可以动态加载和渲染组件。此外，如果在Electron环境中运行（即window.require存在），
 * 并且提供了一个目录路径，该函数还会监视该目录下的文件变化，以便在文件更新时重新加载和渲染组件。
 * 
 * @param {string} appURL - 组件的URL地址，用于动态加载Vue组件。
 * @param {string} name - 组件的名称，将用作Vue组件的标签名。
 * @param {Object} [mixinOptions={}] - 一个对象，包含要混入Vue应用实例的选项。
 * @param {string} [directory] - 一个可选的目录路径，如果提供，函数将监视该目录下的文件变化。
 * @param {Object} [data] - 传递给Vue应用实例的初始数据。
 * 
 * @returns {Vue.App} 返回一个Vue应用实例。
 * 
 * @example
 * // 初始化Vue应用，加载并渲染名为'my-component'的组件，该组件的代码位于'/path/to/my-component.js'。
 * const app = initVueApp('/path/to/my-component.js', 'my-component');
 * app.mount('#app');
 */
export const initVueApp = (appURL, name, mixinOptions = {}, directory, data) => {
    const asyncModules = {}
    const styleElements = []

    const options = {
        moduleCache: {
            ...moduleCache
        },
        async getFile(url) {
            const res = await fetch(url);
            if (!res.ok) {
                throw Object.assign(new Error(res.statusText + ' ' + url), { res });
            }
            if (url.endsWith('.js')) {
                if (!asyncModules[url]) {
                    let module = await import(url)
                    asyncModules[url] = module
                }
            }
            return {
                getContentData: asBinary => asBinary ? res.arrayBuffer() : res.text(),
            }
        },
        handleModule(type, source, path, options) {
            if (type === '.json') {
                return JSON.parse(source);
            }
            if (type === '.js') {
                return asyncModules[path]
            }
        },

        addStyle(textContent) {
            const style = Object.assign(document.createElement('style'), { textContent });
            const ref = document.head.getElementsByTagName('style')[0] || null;
            document.head.insertBefore(style, ref);
            styleElements.push(style)
        },
    }

    let oldApp
    let _args
    let f = () => {
        try {
            styleElements.forEach(el => {
                el.remove()
            })
            oldApp ? oldApp.unmount : null
            let obj = { ...options, ...mixinOptions }
            obj.moduleCache = { ...moduleCache }
            let componentsCache = {}
            componentsCache[name] = Vue.defineAsyncComponent(() => loadModule(appURL, obj))
            let app = Vue.createApp({
                components: componentsCache,
                template: `<${name}></${name}>`,
                setup() {
                    const dataReactive = reactive(data);
                    app.provide('appData', dataReactive);
                }
            }, data)
            if (window.require && directory) {
                watched[directory] = true
                let _mount = app.mount
                app.mount = (...args) => {
                    _args = args;
                    _mount.bind(app)(...args)
                }
            }
            return app
        } catch (e) {
            console.warn(e)
            return oldApp
        }
    }
    oldApp = f()
    if (window.require) {
        const fs = require('fs');
        const path = require('path');
        let previousContents = {};
        function watchDirectory(directory) {
            fs.readdirSync(directory).forEach(file => {
                let filePath = path.join(directory, file);
                let stats = fs.statSync(filePath);
                if (stats.isFile()) {
                    previousContents[filePath] = fs.readFileSync(filePath, 'utf-8');
                    fs.watchFile(filePath, (curr, prev) => {
                        let currentContent = fs.readFileSync(filePath, 'utf-8');
                        if (currentContent !== previousContents[filePath]) {
                            oldApp.unmount();
                            oldApp = f();
                            oldApp.mount(..._args);
                            previousContents[filePath] = currentContent;
                        }
                    });
                } else if (stats.isDirectory()) {
                    watchDirectory(filePath);  // Recursively watch subdirectories
                }
            });
        }
        directory&& watchDirectory(directory);
    }
    return oldApp
}
