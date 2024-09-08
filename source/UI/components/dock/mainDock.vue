<template>
    <div class="fn__flex fn__flex-column" style="max-height: 100%;">
        <div class="block__icons">
            <div class="block__logo">
                <svg class="block__logoicon">
                    <use xlink:href="#iconKeyManage"></use>
                </svg>API设置管理
            </div>
            <span class="fn__flex-1 fn__space"></span>
            <span data-type="min" class="block__icon b3-tooltips b3-tooltips__sw" aria-label="最小化 Ctrl+W"><svg>
                    <use xlink:href="#iconMin"></use>
                </svg>
            </span>

        </div>

        <div class="fn__flex fn__flex-column fn__flex-1">
            <label class="fn__flex b3-label">
                <div class="fn__flex-1">
                    当前配置
                    <div class="b3-label__text">当前思源使用的配置</div>
                </div>
                <span class="fn__space"></span>
                <input v-model="currentAIConfigName" class="b3-text-field fn__flex-center fn__size100" id="pdfFooter">
                <button @click.stop="saveCurrentConfig" class="b3-button b3-button--outline fn__flex-center fn__size50">
                    保存
                </button>

            </label>
            <template v-for="(configItem, i) in configs.savedConfigs" :key="`config-${i}`">
                <label class="fn__flex b3-label">
                    <div class="fn__flex-1">
                        {{ configItem.name }}
                        <div class="b3-label__text" >{{ (plugin.data.configs.savedDescribes[configItem.name]&&plugin.data.configs.savedDescribes[configItem.name].useAge) || '这个设置没有说明' }}</div>
                        <div class="b3-label__text">{{ configItem.value.apiProvider }}</div>

                    </div>
                    <span class="fn__space"></span>
                    <div class=" config__item-line fn__flex-center">
                        <div class="fn__flex">
                            <button @click="() => openConfigTab(configItem)"
                                class="b3-button b3-button--outline fn__flex-center fn__size50">
                                编辑
                            </button>
                            <div class="fn__space"></div>
                            <button @click="() => applyConfigItem(configItem)"
                                class="b3-button b3-button--outline fn__flex-center fn__size50">
                                应用
                            </button>
                        </div>
                        <div class="fn__hr"></div>
                        <div class="fn__flex">
                            <button @click="deleteConfig(i)"
                                class="b3-button b3-button--outline fn__flex-center fn__size50">
                                删除
                            </button>
                            <div class="fn__space"></div>
                            <button @click="copyConfig(configItem)"
                                class="b3-button b3-button--outline fn__flex-center fn__size50">
                                复制
                            </button>
                        </div>
                    </div>
                </label>
            </template>
        </div>
    </div>
</template>
<script setup>

import { inject, onMounted, ref } from 'vue'
import { readDir, readFile } from '/plugins/SACKeyManager/source/polyfills/fs.js';
import { plugin, clientApi, kernelApi } from 'runtime'
let currentAIConfigName = ref('')
console.log(clientApi)
const configs = plugin.data.configs
const dateNowChina = () => {
    return new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\/|:|\s|,/g, '-')
}
const copyConfig =  (configItem) => {
    clientApi.confirm('是否确定复制?', '其实你也可以直接复制文件', () => {
        let item = JSON.parse(JSON.stringify(configItem))
        item.name = item.name + "_" + dateNowChina()
        configs.savedConfigs.push(item)
    })
}
const saveCurrentConfig =  () => {
    if (currentAIConfigName.value && !compareConfig(globalThis.siyuan.config.ai.openAI)) {
        configs.savedConfigs.push(
            {
                name: currentAIConfigName.value,
                value: structuredClone(globalThis.siyuan.config.ai.openAI)

            }
        )
    } else {
        clientApi.confirm('已经存在一模一样或者重名的配置啦', '如果你一定要保存就保存吧', async () => {
            configs.savedConfigs.push(
                {
                    name: currentAIConfigName.value + "_" + dateNowChina(),
                    value: structuredClone(globalThis.siyuan.config.ai.openAI)
                }
            )
        })
    }
}
const applyConfigItem = async (configItem) => {
    globalThis.siyuan.config.ai.openAI = JSON.parse(JSON.stringify(configItem.value))
    await kernelApi.setAI(
        { openAI: configItem.value }
    )
}
const deleteConfig =  (i) => {
    configs.savedConfigs.splice(i, 1)
}
const compareConfig = (configValue) => {
    const sameConfigExisted = configs.savedConfigs.find(
        item => {
            return JSON.stringify(item.value) == JSON.stringify(configValue) || item.name == currentAIConfigName.value
        }
    )
    return sameConfigExisted
}
const openConfigTab = (configName) => {
    plugin.eventBus.emit('open_config_tab', configName.name+"")
}

</script>