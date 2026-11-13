# Ykcx.js

用于补全 Android 横屏 PAD WebView 中缺失的软键盘和长按文本选择能力。项目完全离线、零依赖，直接通过 `<script>` 加载。

## 功能

- 适合横屏 PAD 的英文/符号键盘，支持吸附底端和可拖动悬浮窗。
- 可选中文拼音插件；加载插件后自动显示语言切换键。
- 支持 `input`、`textarea` 和 `contenteditable`。
- 触摸长按或鼠标长按选择词语，显示 Android 风格的蓝色选区、双手柄、复制和全选菜单。
- 优先使用 Clipboard API，不可用时自动回退到 `document.execCommand('copy')`。

## 快速使用

把运行时文件放到 WebView 可以访问的本地目录：

```html
<script>
  window.YkcxOptions = {
    mode: 'dock',          // 'dock' 或 'floating'
    keyboardHeight: 300,   // 吸底键盘高度
    longPressDelay: 520,   // 长按触发时间（毫秒）
    mouseLongPress: true   // 发布调试时保留鼠标长按
  };
</script>
<script src="ykcx.js"></script>
<script src="ykcx.zh.js"></script> <!-- 自动加载同目录的 ykcx.zh.dict.js -->
```

只需要英文和符号时，不加载 `ykcx.zh.js` 即可。脚本默认在 DOM 就绪后自动初始化，并在可编辑控件获得焦点时显示键盘。

## API

```js
Ykcx.show(element);             // 显示键盘；element 可省略
Ykcx.hide();                    // 隐藏键盘
Ykcx.setMode('floating');       // 切换悬浮窗
Ykcx.setMode('dock');           // 切换吸底
Ykcx.on('copy', handler);       // 监听事件
Ykcx.off('copy', handler);
Ykcx.destroy();                 // 移除创建的界面
```

可监听事件：`ready`、`show`、`hide`、`modechange`、`languagechange`、`selectionshow`、`selectionhide`、`copy`。同一事件也会在 `document` 上以 `ykcx:<事件名>` 的形式派发。

不希望某个输入框唤起键盘时，添加 `data-ykcx-disabled` 属性。

## 中文插件

`ykcx.zh.js` 是独立的离线拼音引擎，会自动加载同目录的 `ykcx.zh.dict.js`。词库包含 114,144 条带词频的单字、词语和长词条；连续拼音使用动态规划切分，并支持整句组合候选。输入拼音后点击候选词，或按空格选择第一候选。插件既可以在主脚本前加载，也可以在主脚本后加载。

三个运行时文件必须一起放置：

```text
ykcx.js
ykcx.zh.js
ykcx.zh.dict.js
```

若词库不与插件同目录，可以在加载插件前指定本地地址：

```html
<script>window.YkcxZhOptions = { dictionaryUrl: 'assets/ykcx.zh.dict.js' };</script>
```

主脚本也暴露 `Ykcx.registerLanguage(plugin)`，可用同一接口增加其他离线输入法。

## 本地演示

直接用浏览器打开 `demo.html` 即可。演示不请求任何公网资源。

## WebView 集成提示

- 页面应包含正确的 viewport meta，并允许 JavaScript 执行。
- 若宿主完全禁用了系统剪贴板，库仍会尝试旧版复制接口；最终是否允许写入由 WebView 宿主策略决定。
- 吸底模式会在 `html` 上增加底部内边距，避免页面最后一行被键盘遮住。
- 宿主应保留 Pointer Events。现代 Android System WebView 默认支持；过旧内核需要升级或自行提供触摸事件兼容层。

## 词库来源

中文词库由 [OpenIME](https://github.com/luwinter111/OpenIME) 的 `dict.txt` 转换生成，固定到提交 `d80c32831f9a496a2c375dab404db16974531f8d`，依据 GPL-3.0 使用。转换脚本位于 `tools/build-zh-dictionary.mjs`，详细信息见 `THIRD_PARTY_NOTICES.md`。
