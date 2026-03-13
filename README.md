# 🪵 Firewood

面向开发者的跨平台桌面工具集，基于 [Tauri](https://tauri.app) + React + TypeScript 构建。

## ✨ 功能

| 工具 | 说明 |
|------|------|
| JSON 格式化 | 格式化、压缩与语法校验 |
| 文本 Diff | 逐行差异对比 |
| Base64 编解码 | 文本 Base64 编码/解码 |
| URL 编解码 | URLEncode / URLDecode |
| 时间戳转换 | Unix timestamp ↔ 日期 |
| Hash 计算 | MD5 / SHA-1 / SHA-256 |

## 🛠 技术栈

- **桌面框架**: Tauri 1.x (Rust)
- **前端**: React 18 + TypeScript + Vite
- **UI**: Ant Design 5.x
- **编辑器**: Monaco Editor

## 🚀 开发

```bash
# 安装依赖
npm install

# 启动 Web 开发模式（仅前端）
npm run dev

# 启动 Tauri 开发模式（完整桌面应用）
npm run tauri dev

# 构建
npm run tauri build
```

## 📦 扩展工具

在 `src/tools/` 下新建目录，实现工具组件，然后在 `src/router/tools.tsx` 中注册 `ToolMeta` 即可。

详细设计参见 [DESIGN.md](./DESIGN.md)。

## 📄 License

MIT
