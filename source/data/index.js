import { plugin } from '../asyncModules.js'
import { reactive, watch } from '../../static/vue.esm-browser.js'
import { readDir, readFile } from '../polyfills/fs.js'
const savedConfigs = await readDir(plugin.插件自身数据存储路径)
const configs = reactive({
    currentAIConfig: globalThis.siyuan.config.ai.openAI,
    savedConfigs: []
})

if (savedConfigs) {
    savedConfigs.forEach(async item => {
        let data = await readFile(plugin.插件自身数据存储路径 + '/' + item.name)
        configs.savedConfigs.push({ name: item.name, value: JSON.parse(data) })
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

watch(() => configs.savedConfigs.map(config => JSON.stringify(config)), (newConfigs, oldConfigs) => {
    newConfigs.forEach(async (newConfig, index) => {
        if (newConfig !== JSON.stringify(oldConfigs[index])) {
            await plugin.saveData(configs.savedConfigs[index].name, configs.savedConfigs[index].value);
        }
    });
}, { deep: true });
plugin.data.configs = configs