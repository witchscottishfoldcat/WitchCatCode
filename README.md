<div align="center">

# witchcatCode

**面向多 Provider 原生接入增强的代码助手 CLI** 🚀

[![npm](https://img.shields.io/npm/v/@thewitchcat/cli?color=cb3837)](https://www.npmjs.com/package/@thewitchcat/cli)
[![Bun](https://img.shields.io/badge/runtime-Bun%20%7E%201.3.5-f472b6)](https://bun.sh)
[![Node](https://img.shields.io/badge/runtime-Node%20%7E%2024-339933)](https://nodejs.org)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

</div>

---

## 2026 年 4 月 4 日最新更新

- ⭐ **支持 Responses API 的缓存命中，成本降低 90%**
- 修复上下文穿插造成的回复不连续问题
- 针对部分 OpenAI 兼容路由补充更稳的缓存键支持
- 支持多模态以及图像粘贴到对话框

> 注：`/chat/completions` 不支持缓存。请确保使用 `/responses` 方式请求，才能命中缓存。
>
> 支持缓存的模型：`gpt-5.4`, `gpt-5.2`, `gpt-5.1-codex-max`, `gpt-5.1`, `gpt-5.1-codex`, `gpt-5.1-codex-mini`, `gpt-5.1-chat-latest`, `gpt-5`, `gpt-5-codex`, `gpt-4.1` 以及兼容 `prompt_cache_key` 的其他模型。

---

## ✨ 项目简介

`witchcatCode` 是一个面向实际开发场景持续演进的 CLI 分支。核心目标不是停留在"表面兼容"，而是让**第三方模型接入、代理转发、自定义鉴权与非官方部署环境**真正做到可用、好用、易维护。

拒绝简单的外围套壳，摒弃对外部切换器的依赖，在原版代码的基础上直接深度扩展了**原生接入能力**。

**典型适用场景：**

- 🖥️ 在本地终端中直接调用自定义模型与 Provider
- 🌐 通过 Anthropic 兼容网关、OpenAI 兼容网关或 Gemini 兼容网关接入模型
- 🔐 无缝切换 API Key、OAuth 及不同 Provider 的专属鉴权模式
- 🧱 在无桌面环境（GUI）的服务器终端中高效完成配置与调用
- ⚙️ 统一集中管理配置、登录态与模型选择等行为至独立目录

---

## 🎯 核心痛点与解决方案

许多用户习惯通过 **CC Switch** 将第三方模型接入现有工具链，这固然可行；但 `witchcatCode` 更进一步，选择了体验更佳的**原生支持**。

**原生支持的不可替代性在于：**

- ⚡ **链路更短，响应更快**：省去中间切换与转接层
- 🧭 **闭环体验，直截了当**：Provider 选择、鉴权与模型切换均在工具内部一站式完成
- 🛠️ **开箱即用，降低依赖**：无需额外部署切换器即可实现基础接入
- 🖥️ **完美契合无头环境**：在无屏幕终端、远程 SSH 或容器环境中配置极其便利
- 🔄 **配置统一，易于排障**：全局语义一致，问题定位更直观

如果你的主力工作台是**云主机、跳板机、远程开发容器**或**无 GUI 的 Linux / Windows Server 终端**，这种"原生接入"将为你带来断崖式的体验提升。

---

## 🚀 核心增强特性

相比上游版本，本项目目前重点重构并增强了以下能力：

### 1. 原生多 Provider 接入

支持在程序内部直接配置并无缝切换不同的 Provider，彻底摆脱对外部切换层的依赖。

### 2. 原生多鉴权模式隔离

针对不同 Provider，支持独立持久化存储其对应的鉴权方式。有效解决"相同 Provider 却被错误复用 authMode"的历史遗留问题。

### 3. 自定义模型与列表管理

提供更便捷的非默认模型接入方案。支持轻松维护本地模型列表，并在交互进程中实现即时点选。

### 4. 深度优化的 OpenAI 兼容协议

除了完善的 Anthropic 兼容路径外，本项目正在持续深化 OpenAI 侧的协议与路由能力，已支持：

- Chat Completions
- Responses
- OAuth

### 5. 独立配置目录与数据沙盒

默认采用 `~/.Witchcat` 作为全局配置根目录，从物理层面避免与其他同类工具发生配置、缓存或登录态的碰撞与污染。

---

## ✅ 已验证模型与网关接入

本项目最核心的能力，就是**通过兼容网关直接接入不同模型**，而不是把模型切换逻辑外包给外围工具。

目前已经实际验证通过的主线路有三类：

### 1. Anthropic 兼容网关

适用于提供 **Anthropic Messages / Claude 风格请求格式** 的兼容服务、代理网关和第三方平台。

**已验证模型：**

| 模型名称 | 接入方式 | 推理努力 | 思维链显示 |
|:---|:---|:---:|:---:|
| `minimax-m2.7-highspeed` | Anthropic-compatible gateway | √ | √ |

**这一类通常可以承接的模型方向：**

- 任何被网关包装成 **Anthropic/Claude 兼容协议** 的第三方模型
- 各类自建中转、聚合网关、代理平台中映射成 Claude 风格 API 的模型
- 典型场景是：你不一定真的在调用 Anthropic 官方模型，但你可以通过 **Anthropic 兼容层** 把目标模型接进 `witchcatCode`

### 2. OpenAI 兼容网关

适用于提供 **Chat Completions / Responses / OAuth** 的 OpenAI 风格接口平台。

**已验证模型：**

| 模型名称 | 接入方式 | 推理努力 | 思维链显示 |
|:---|:---|:---:|:---:|
| `gpt-5.4` | OpenAI-compatible gateway via Chat Completions | √ | √ |
| `gpt-5.4` | OpenAI-compatible gateway via Responses | √ | √ |
| `gpt-5.4` | OpenAI-compatible gateway via OAuth | √ | √ |

**这一类可以重点接入的模型方向：**

- `gpt-5.4`
- 其他被你的网关暴露为 **OpenAI Chat Completions** 接口的模型
- 其他被你的网关暴露为 **OpenAI Responses** 接口的模型
- 各类通过 OpenAI 风格 `baseURL + apiKey` 即可调用的第三方模型

### 3. Gemini 兼容网关

适用于提供 **Gemini 风格接口** 或 Gemini CLI OAuth 路径的服务。

**已验证模型：**

| 模型名称 | 接入方式 | 推理努力 | 思维链显示 |
|:---|:---|:---:|:---:|
| `gemini-3-flash-preview` | Gemini-compatible gateway | - | √ |
| `gemini-3.1-pro-high` | Gemini-compatible gateway | - | √ |

**这一类可以重点接入的模型方向：**

- `gemini-3-flash-preview`
- `gemini-3.1-pro-high`
- 其他被网关或 CLI 入口包装成 **Gemini-compatible** 请求路径的模型

**一句话总结：**

`witchcatCode` 当前不是只验证了"某几个模型名字"，而是已经把三条关键网关接入思路打通：

- **Anthropic 兼容网关接入第三方模型**
- **OpenAI 兼容网关接入第三方模型**
- **Gemini 兼容网关接入第三方模型**

---

## 🧩 数据隔离与配置管理

为了保证多环境下的稳定性，本项目将所有用户数据严格收口至：

- **配置根目录**：`~/.Witchcat`
- **全局配置文件**：`~/.Witchcat/.claude.json`

**架构收益：**

- 杜绝历史登录态的互相污染
- 防止不同网关或 Provider 的 Endpoint 发生串联
- 确保模型列表、鉴权方式及缓存状态彼此独立
- 为多环境（开发/生产）提供极其便捷的独立配置与备份手段

---

## 📦 环境要求与安装

**前置依赖：**

- **Bun** >= `1.3.5`
- **Node.js** >= `24`

### 方式一：npm 安装（推荐，最简单）

```bash
# 全局安装
npm install -g @thewitchcat/cli

# 或通过 npx 直接运行，无需安装
npx @thewitchcat/cli
```

安装完成后，在任意终端输入 `witchcat` 即可启动。

### 方式二：bun 源码部署

```bash
# 克隆仓库
git clone https://github.com/witchscottishfoldcat/WitchCatCode.git
cd WitchCatCode

# 安装依赖
bun install

# 链接到全局
bun link
```

**⚠️ 路径确认：**

请务必确认 Bun 的可执行目录已加入当前 shell 的 `PATH` 环境变量中。

```bash
# macOS / Linux
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

# Windows PowerShell
$env:BUN_INSTALL = "$HOME\.bun"
$env:PATH = "$env:BUN_INSTALL\bin;$env:PATH"
```

### 验证安装

```bash
witchcat --version
# 输出: 1.0.1
```

---

## 🛠️ 常用命令

| 命令 | 说明 |
|:---|:---|
| `witchcat` | 启动交互式 CLI |
| `witchcat config` | 打开交互式配置面板 |
| `/model` | 切换当前对话模型 |
| `/add-model` | 添加自定义模型端点 |
| `/mcp` | 管理 MCP 工具服务 |
| `/agent` | Agent 团队管理 |
| `/session` | 会话历史与切换 |
| `/compact` | 压缩历史上下文 |
| `/commit` | AI 生成 Git Commit Message |
| `/diff` | 查看代码差异 |
| `/review` | 代码审查 |
| `/chrome` | Chrome 远程控制 |
| `/doctor` | 运行环境诊断 |
| `/theme` | 切换 TUI 主题 |

> 💡 在交互界面中输入 `/` 即可触发命令补全提示。

---

## 🔐 灵活的鉴权与登录体系

根据你选择的 Provider，支持以下鉴权策略：

### 1. API Key 模式（核心推荐）

- **适用场景**：Anthropic 兼容服务、OpenAI 兼容服务、各类代理/网关及第三方模型中转平台
- **优势**：最稳定、最易于自动化集成。完美适配服务器、容器、远程终端等纯无头（Headless）环境

```bash
# macOS / Linux
export WITCHCAT_API_KEY="your-api-key"

# Windows PowerShell
$env:WITCHCAT_API_KEY="your-api-key"

# Windows CMD
set WITCHCAT_API_KEY=your-api-key
```

### 2. OAuth 模式

- **适用场景**：部分原生支持 OAuth 的 Provider 或特殊接入路径
- **优势**：当运行环境已具备相应图形化或浏览器回调条件时，可作为 API Key 的补充方案，允许你使用你的 Codex 额度或 Gemini CLI 额度

### 3. Provider 级独立鉴权沙盒

系统会对 **"Provider + authMode"** 的组合关系进行严格的持久化绑定。彻底终结以下痛点：

- 切换 Provider 后错误沿用上一家的鉴权令牌
- 同一 Provider 下，不同鉴权模式的数据被互相覆盖
- 重启 CLI 后初始鉴权选项识别紊乱

---

## 🧭 Provider 路由与选择指南

### 1. Anthropic 兼容线路

- **目标场景**：自建网关、代理服务、第三方兼容平台，以及已验证的 `minimax-m2.7-highspeed` 接入
- **特点**：追求极致稳定与极简路径的首选

### 2. OpenAI 兼容线路

- **目标场景**：提供 Chat Completions / Responses 标准接口的平台，接入 `gpt-5.4` 等核心模型，或需要兼容 OAuth 工作流的场景
- **典型模型方向**：`gpt-5.4`，以及任意被你的网关映射成 OpenAI 风格协议的第三方模型

### 3. Gemini 兼容线路

- **目标场景**：提供 Gemini 风格接口或 Gemini CLI OAuth 工作流的平台，接入 `gemini-3-flash-preview`、`gemini-3.1-pro-high` 等模型
- **特点**：适合需要接入 Gemini 系模型，但又希望统一纳入同一套 CLI 交互、配置与模型选择逻辑的场景

### 4. 相同 Provider 的多路鉴权分化

即使是同一个 Provider，只要支持多种鉴权模式，`witchcatCode` 就会在底层将其处理为**相互独立的配置实体**，绝不进行粗暴的状态混合。

---

## 🔄 深度 OpenAI 协议支持

本项目绝非仅仅在前端界面增加一个 `Base URL` 输入框，而是在底层网络层面对齐了更为完整的 OpenAI 协议规范。当前重点支持：

- 全面接管 OpenAI Chat Completions 路由
- 全面接管 OpenAI Responses 路由
- 精准匹配相应的模型选择器与鉴权中间件
- 针对不同协议路径的智能请求转发与载荷适配

---

## 📚 推荐工作流

### 首次拉取与初始化

```bash
git clone https://github.com/witchscottishfoldcat/WitchCatCode.git
cd WitchCatCode
bun install
bun link
witchcat
```

### 日常迭代与更新

```bash
git pull
bun install
bun link
witchcat
```

---

## 🖥️ 为什么它是服务器环境的理想选择？

在真实的服务器生产环境中，传统的"外部切换器 + 图形登录 + 多层转发"方案往往会暴露诸多短板：

- 需额外引入并长期维护脆弱的切换组件
- 登录流程强依赖 GUI 环境或繁琐的跨端人工拷贝
- 配置文件散落在系统各处，排障链路极长
- 在纯 CLI 工具（如 SSH / tmux / Docker）中即时切换 Provider 体验割裂

`witchcatCode` 坚持将核心操作收敛回 CLI 内部闭环，因此在以下场景中展现出压倒性的优势：

- 纯无头 Linux 远程服务器
- Windows Server Core 终端
- WSL (Windows Subsystem for Linux)
- Docker / Dev Container 开发容器
- 基于 SSH 的极客运维流

---

## ⚠️ 免责与声明

- 本项目为一个处于持续演进中的非官方分支，不代表任何官方立场。
- 部分核心能力已在生产级场景验证稳定，但个别冷门协议与 Provider 适配仍在敏捷迭代中。
- 如果你追求对第三方模型接入过程的"绝对掌控权"，这个项目方向将比"单纯复刻官方行为"释放出更大的定制价值。

---

## 🙏 致谢

特别感谢 **doge-code** 项目及其作者提供的宝贵灵感与架构参考。

- 参考项目：[https://github.com/HELPMEEADICE/doge-code](https://github.com/HELPMEEADICE/doge-code)

---

## 📜 许可证

[MIT](LICENSE) © [witchscottishfoldcat](https://github.com/witchscottishfoldcat)
