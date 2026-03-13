# Firewood — 设计文档

## 一、项目概述

**Firewood** 是一款面向开发者的跨平台桌面工具集客户端，集成多种常用开发辅助工具，旨在提升日常开发效率。

- 跨平台：支持 macOS、Windows、Linux
- 轻量快速：基于 Tauri，无需内嵌 Chromium
- 可扩展：插件化工具模块，方便后续新增功能

---

## 二、目标功能（Roadmap）

| 优先级 | 工具模块 | 说明 |
|--------|----------|------|
| P0 | JSON 格式化 / 校验 | 格式化、压缩、语法高亮、错误提示 |
| P0 | 文本 Diff 对比 | 逐行/字符级对比，左右双栏展示 |
| P1 | Base64 编解码 | 文本 & 文件 Base64 互转 |
| P1 | URL 编解码 | URLEncode / URLDecode |
| P1 | 时间戳转换 | Unix timestamp ↔ 人类可读时间 |
| P1 | Hash 计算 | MD5 / SHA1 / SHA256 |
| P2 | 正则测试器 | 实时匹配高亮 |
| P2 | JWT 解析 | 解码 Header / Payload |
| P2 | 颜色选择器 | HEX / RGB / HSL 互转 |
| P3 | 二维码生成/解析 | 输入文本生成 QR Code |

---

## 三、技术选型

### 3.1 核心框架

| 层级 | 技术 | 版本 | 理由 |
|------|------|------|------|
| 桌面框架 | [Tauri](https://tauri.app) | v1.x | Rust 后端 + WebView，包体积小（< 10MB），性能优异 |
| 前端框架 | React | 18.x | 生态丰富，组件模型适合工具集扩展 |
| 语言 | TypeScript | 5.x | 类型安全，提升可维护性 |
| 构建工具 | Vite | 5.x | 极速 HMR，与 Tauri 官方集成良好 |

### 3.2 UI & 样式

| 库 | 用途 |
|----|------|
| Ant Design 5.x | 主 UI 组件库（布局、菜单、表单等）|
| @ant-design/icons | 图标 |
| CSS Modules / Less | 样式隔离 |

### 3.3 编辑器 & 核心功能

| 库 | 用途 |
|----|------|
| Monaco Editor (`@monaco-editor/react`) | JSON 编辑器、代码高亮 |
| diff (`diff`) | 文本 diff 算法 |
| js-base64 | Base64 编解码 |
| dayjs | 时间戳转换 |
| js-sha256 / spark-md5 | Hash 计算 |

### 3.4 工程规范

| 工具 | 用途 |
|------|------|
| ESLint + Prettier | 代码风格统一 |
| Husky + lint-staged | 提交前检查 |
| Vitest | 单元测试 |

---

## 四、项目架构

```
firewood/
├── src-tauri/              # Tauri/Rust 后端
│   ├── src/
│   │   └── main.rs         # 主进程入口
│   ├── Cargo.toml
│   └── tauri.conf.json
├── src/                    # React 前端
│   ├── main.tsx            # 应用入口
│   ├── App.tsx             # 根组件（布局）
│   ├── tools/              # 工具模块目录
│   │   ├── json-formatter/ # JSON 格式化工具
│   │   ├── text-diff/      # 文本 Diff 工具
│   │   ├── base64/         # Base64 工具
│   │   └── ...
│   ├── components/         # 公共组件
│   │   ├── ToolLayout/     # 工具统一布局包装
│   │   └── Sidebar/        # 侧边栏导航
│   ├── router/             # 路由配置
│   └── styles/             # 全局样式
├── public/                 # 静态资源
├── DESIGN.md               # 本文档
├── README.md
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## 五、可扩展性设计

### 工具模块接口

每个工具模块遵循统一接口，注册到工具注册表即可出现在侧边栏：

```typescript
// src/types/tool.ts
export interface ToolMeta {
  id: string;           // 唯一 ID，作为路由 key
  name: string;         // 显示名称
  icon: ReactNode;      // 图标
  description: string;  // 简短描述
  component: React.LazyExoticComponent<React.FC>; // 懒加载组件
}
```

新增工具只需：
1. 在 `src/tools/` 下创建目录并实现组件
2. 在 `src/router/tools.ts` 注册 `ToolMeta`

---

## 六、开发计划

- **Phase 1**：项目初始化 + 框架搭建 + 侧边栏导航
- **Phase 2**：实现 P0 工具（JSON 格式化、文本 Diff）
- **Phase 3**：实现 P1 工具（Base64、URL、时间戳、Hash）
- **Phase 4**：打包 & 发布（GitHub Releases + 自动更新）
