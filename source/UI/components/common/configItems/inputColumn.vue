<template>
    <div class="fn__flex b3-label">
        <div class="fn__flex-1">
            超时时间
            <div class="b3-label__text">发起请求的超时时间，单位：秒</div>
        </div>
        <span class="fn__space"></span>
        <input class="b3-text-field fn__flex-center fn__size200" type="number" step="1" min="5" max="600"
            id="apiTimeout" value="30">
    </div>
</template>
<script>
    import {defineProps} from 'vue'
</script>