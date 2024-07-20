import { plugin } from '../asyncModules.js'
import { reactive, watch } from '../../static/vue.esm-browser.js'
import { readDir, readFile, readFileSync } from '../polyfills/fs.js'
const savedConfigs = await readDir(plugin.插件自身数据存储路径)
const configs = reactive({
    currentAIConfig: globalThis.siyuan.config.ai.openAI,
    savedConfigs: [],
    savedDescribes: {},
})

if (savedConfigs) {
    let describes = savedConfigs.find(
        item => {
            return item.name === "describes"
        }
    )
    if (describes) {
        try {
            configs.savedDescribes = JSON.parse(readFileSync(plugin.插件自身数据存储路径 + '/' + describes.name)) || {}
        } catch (e) {
            console.warn("元数据读取失败", e)
        }
    }
    savedConfigs.forEach(async item => {
        if (item.name !== 'describes') {
            let data = await readFile(plugin.插件自身数据存储路径 + '/' + item.name)
            configs.savedConfigs.push({ name: item.name, value: JSON.parse(data) })
            configs.savedDescribes[item.name]=configs.savedDescribes[item.name]||{}
        }
    }
    )
}
// 新旧对比,只保存变化了的项目并删除已经被删除的项目对应的data
// 新旧对比,只保存变化了的项目并删除已经被删除的项目对应的data
watch(() => JSON.stringify(configs.savedConfigs), (newConfigs, oldConfigs) => {
    newConfigs = JSON.parse(newConfigs);
    oldConfigs = JSON.parse(oldConfigs);
    const addedConfigs = newConfigs.filter(newConfig => !oldConfigs.some(oldConfig => oldConfig.name === newConfig.name));
    const removedConfigs = oldConfigs.filter(oldConfig => !newConfigs.some(newConfig => newConfig.name === oldConfig.name));
    addedConfigs.forEach(async item => {
        await plugin.saveData(item.name, item.value);
    });
    removedConfigs.forEach(async item => {
        await plugin.removeData(item.name);
    });
}, { deep: true });
watch(() => JSON.stringify(configs.savedDescribes), async () => {
    await plugin.saveData("describes", JSON.stringify(configs.savedDescribes));

})
watch(() => configs.savedConfigs.map(config => JSON.stringify(config)), (newConfigs, oldConfigs) => {
    newConfigs.forEach(async (newConfig, index) => {
        if (!oldConfigs[index] || newConfig !== JSON.parse(JSON.stringify(oldConfigs[index]))) {
            await plugin.saveData(configs.savedConfigs[index].name, configs.savedConfigs[index].value);
        }
    });
}, { deep: true });
plugin.data.configs = configs