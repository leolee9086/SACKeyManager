<template>
    <div data-type="openai" v-if="configItem">
        <div class="fn__flex b3-label">
            <div class="fn__block">
                保存的名称:{{ configItem.name }}
                <div class="b3-label__text">保存的配置文件名</div>
                <span class="fn__hr"></span>
            </div>
        </div>
        <div class="fn__flex b3-label">
            <div class="fn__block">
                用途描述
                <div class="b3-label__text">可以用来简单描述一下这个配置的功能</div>
                <span class="fn__hr"></span>
                <input v-model="plugin.data.configs.savedDescribes[configItem.name].useAge" class="b3-text-field fn__block" id="apiModel" >

            </div>
        </div>
        <div class="fn__flex b3-label config__item">
            <div class="fn__flex-1">
                API 提供商
                <div class="b3-label__text">选择后将使用该提供商的 API 服务实现 AI 相关功能</div>
            </div>
            <span class="fn__space"></span>
            <select id="apiProvider" v-model="configItem.value.apiProvider" class="b3-select fn__flex-center fn__size200">
                <option value="OpenAI" selected="">OpenAI</option>
                <option value="Azure">Azure</option>
            </select>
        </div>
        <div class="fn__flex b3-label">
            <div class="fn__flex-1">
                超时时间
                <div class="b3-label__text">发起请求的超时时间，单位：秒</div>
            </div>
            <span class="fn__space"></span>
            <input v-model="configItem.value.apiTimeout" class="b3-text-field fn__flex-center fn__size200" type="number" step="1" min="5" max="600"
                id="apiTimeout" value="30">
        </div>
        <div class="fn__flex b3-label">
            <div class="fn__flex-1">
                最大 Token 数
                <div class="b3-label__text">请求 API 时传入的 <code class="fn__code">max_tokens</code> 参数，用于控制生成的文本长度</div>
            </div>
            <span class="fn__space"></span>
            <input v-model="configItem.value.apiMaxTokens" class="b3-text-field fn__flex-center fn__size200" type="number" step="1" min="0" id="apiMaxTokens"
                value="0">
        </div>
        <div class="fn__flex b3-label">
            <div class="fn__flex-1">
                温度
                <div class="b3-label__text">请求 API 时传入的 <code class="fn__code">temperature</code> 参数，用于控制生成的文本随机性</div>
            </div>
            <span class="fn__space"></span>
            <input v-model="configItem.value.apiTemperature" class="b3-text-field fn__flex-center fn__size200" type="number" step="0.1" min="0" max="2"
                id="apiTemperature" value="1">
        </div>
        <div class="fn__flex b3-label">
            <div class="fn__flex-1">
                最大上下文数
                <div class="b3-label__text">请求 API 时传入的最大上下文数</div>
            </div>
            <span class="fn__space"></span>
            <input v-model="configItem.value.apiMaxContexts" class="b3-text-field fn__flex-center fn__size200" type="number" step="1" min="1" max="64"
                id="apiMaxContexts" value="7">
        </div>
        <div class="fn__flex b3-label">
            <div class="fn__block">
                模型
                <div class="b3-label__text">请求 API 时传入的 <code class="fn__code">model</code> 参数，用于控制生成的文本风格（使用 Azure
                    OpenAI 服务时需填入 Deployment ID）</div>
                <div class="fn__hr"></div>
                <input v-model="configItem.value.apiModel" class="b3-text-field fn__block" id="apiModel" >
            </div>
        </div>
        <div class="fn__flex b3-label">
            <div class="fn__block">
                API Key
                <div class="b3-label__text">建议为思源单独分配 API Key 以便于后续管理。该项留空则禁用 AI 相关功能</div>
                <div class="fn__hr"></div>
                <div class="b3-form__icona fn__block">
                    <input v-model="configItem.value.apiKey"  id="apiKey" type="password" class="b3-text-field b3-form__icona-input"
                        value="sk-23WREcsgPwZ1xIkpmGsWAuNz1iiylfyvYLtyoMzACayUC606">
                    <svg class="b3-form__icona-icon" data-action="togglePassword">
                        <use xlink:href="#iconEye"></use>
                    </svg>
                </div>
            </div>
        </div>
        <div class="fn__flex b3-label">
            <div class="fn__block">
                网络代理
                <div class="b3-label__text">发起请求的网络代理，如 <code class="fn__code">socks://127.0.0.1:1080</code></div>
                <span class="fn__hr"></span>
                <input v-model="configItem.value.apiProxy" class="b3-text-field fn__block" id="apiProxy" value="">
            </div>
        </div>
        <div class="fn__flex b3-label">
            <div class="fn__block">
                API 基础地址
                <div class="b3-label__text">发起请求的基础地址，如 <code class="fn__code">https://api.openai.com/v1</code></div>
                <span class="fn__hr"></span>
                <input v-model="configItem.value.apiBaseURL" class="b3-text-field fn__block" id="apiBaseURL" >
            </div>
        </div>
        <div class="fn__flex b3-label">
            <div class="fn__block">
                API 版本
                <div class="b3-label__text">仅在使用 Azure OpenAI 服务时需要设置</div>
                <span class="fn__hr"></span>
                <input class="b3-text-field fn__block"  v-model="configItem.value.apiVersion" id="apiVersion" value="">
            </div>
        </div>
        <div class="fn__flex b3-label">
            <div class="fn__block">
                User-Agent
                <div class="b3-label__text">发起请求的用户代理，即 HTTP 标头 <code class="fn__code">User-Agent</code></div>
                <span class="fn__hr"></span>
                <input  v-model="configItem.value.apiUserAgent" class="b3-text-field fn__block" id="apiUserAgent" >
            </div>
        </div>
    </div>
</template>
<script setup>
import {plugin,clientApi} from 'runtime'
import {inject} from 'vue'
const appData =inject('appData')
const configItem = plugin.data.configs.savedConfigs.find(
    item=>{
        return item.name ===appData.configName
    }
)
console.log(configItem)
</script>