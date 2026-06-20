<div style="display:flex;">
  <img src="https://cdn.jsdelivr.net/gh/viarotel/resources@latest/logos/escrcpy.png" alt="escrcpy" width="108px">
</div>

# escrcpy-tags

> 基于 [escrcpy](https://github.com/viarotel-org/escrcpy) 的二次开发版本。
> 在原有的图形化 scrcpy 投屏 / 控制能力之上，新增 **「按设备独立的标签管理」** 与 **「一键开始录制」**，方便同时控制多台手机、录制不同内容时一眼区分每台机在做什么。

📱 使用 scrcpy 以图形化方式显示和控制你的 Android 设备。完整功能与文档请参考上游项目 [viarotel-org/escrcpy](https://github.com/viarotel-org/escrcpy)。

---

## ✨ 本版本新增 / 改动

### 1. 每台设备独立的标签
- 设备列表中，每台手机下方常驻一条**横向标签栏**（默认显示，无需展开）。
- **按设备完全独立**：在某台手机上新建 / 删除标签只影响这一台，标签不会和其它手机混在一起 —— 适合同时管理 20+ 台手机各录不同内容的场景。
- 支持给一台手机贴**多个标签**，点击任意标签即设为「当前」，自动移到最前并高亮显示（彩色实心 + ⭐）。
- 「+」按钮可**选色新建**、设为当前、删除；管理面板只显示当前这台手机的标签。

### 2. 操作列「一键开始录制」
- 在设备操作列的 ⊕ 菜单旁直接放出**「开始录制」**按钮，免去每次展开下拉菜单。

### 3. 其它修复
- 修复 pnpm 环境下 UnoCSS 图标数据加载不到、导致窗口按钮 / 工具栏图标不显示的问题。

## 🚀 开发与打包

项目结构、依赖与开发方式与上游 escrcpy 保持一致：

```bash
pnpm install
pnpm dev          # 开发调试
pnpm build:win    # 打包 Windows 版
```

> 更多平台与详细说明见上游文档：<https://github.com/viarotel-org/escrcpy>

## 👤 作者 / 致谢

- **本修改版作者**：[loadingkuu](https://github.com/loadingkuu)
- **原项目 escrcpy 作者**：[viarotel-org](https://github.com/viarotel-org/escrcpy) · [@viarotel](https://github.com/viarotel)

感谢 [viarotel](https://github.com/viarotel) 及 escrcpy 所有贡献者，以及底层的 [scrcpy](https://github.com/Genymobile/scrcpy)（by [Genymobile](https://github.com/Genymobile)）。

## 📄 许可证

本项目沿用上游的 [Apache License 2.0](./LICENSE)。

- escrcpy © [viarotel-org](https://github.com/viarotel-org)
- 本仓库为其修改版本，新增改动 © [loadingkuu](https://github.com/loadingkuu)，同样以 Apache-2.0 开源。
