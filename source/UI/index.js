import { clientApi, plugin } from '../asyncModules.js'
import { initVueApp } from "./utils/componentsLoader.js"
plugin.eventBus.on('dock_main_inited', () => {
    const dockApp = initVueApp(import.meta.resolve(
        './components/dock/mainDock.vue'),
        'mainDock',
        {},
        plugin.工作空间根路径 + "/" + plugin.插件自身工作空间路径, {})
    dockApp.mount(plugin.mainDock.element)
})
plugin.eventBus.on('open_config_tab', (e) => {
    clientApi.openTab(
        {
            app: plugin.app,
            custom: {
                icon: "iconKeyManage",
                title: e.detail,
                data: {
                    configName: e.detail
                },
                id: plugin.name + "config-editor"
            },
        }
    )
})

const initConfigTab=(tab)=>{
    const tabApp = initVueApp(
        import.meta.resolve('./components/configs/keyManagePannel.vue'),
        'config-tab',
        {},
        plugin.工作空间根路径 + '/' + plugin.插件自身工作空间路径,
        tab.data 
    )
    tab.element.innerHTML = `
    <div class='sac-interface fn__flex fn__flex-column'></div>
    `
    tabApp.mount(tab.element.querySelector('.sac-interface'))

}

plugin.eventBus.on('config-tab-inited', (e) => {
    console.log(e.detail)
    initConfigTab(e.detail.tab)
})
Object.keys(plugin.getOpenedTab()).forEach(
    tabType=>{
        let tabArray = plugin.getOpenedTab()[tabType];
        tabArray.forEach(
            model=>{
                model&&initConfigTab(model)
            }
        )
    }
)

