<div align="center">

# WitchcatCode

**多 Provider 原生接入的 AI 编程助手 CLI**

[![Bun](https://img.shields.io/badge/runtime-Bun%20%7E%201.3.5-f472b6)](https://bun.sh)
[![Node](https://img.shields.io/badge/runtime-Node%20%7E%2024-339933)](https://nodejs.org)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![npm](https://img.shields.io/npm/v/@thewitchcat/cli?color=cb3837)](https://www.npmjs.com/package/@thewitchcat/cli)

[English](#english) · [中文](#中文)

</div>

---

## 中文

WitchcatCode 是一个面向多 Provider 原生接入的 AI 编程助手命令行工具。支持 Anthropic、OpenAI、Gemini、GLM 等多种模型协议，内置 Agent 团队协作、MCP 工具生态、文件操作、Chrome 集成等能力，适合需要稳定接入第三方模型或自定义网关的开发环境。

### 核心特性

- **多 Provider 原生接入** — 支持 Anthropic、OpenAI、Gemini、GLM 四种协议，每种协议支持多种认证模式
- **自定义网关** — 可配置任意兼容 API 端点，支持 Base URL、API Key、模型列表管理
- **Agent 团队系统** — Swarm 多 Agent 协作，支持进程内生成、权限同步、断线重连
- **MCP 工具生态** — 完整的 MCP 客户端/服务端支持，含 OAuth 认证、资源管理、插件桥接
- **文件操作工具链** — 读取、编辑、写入、搜索（Glob/Grep）、LSP 集成、Shell 执行
- **Chrome 集成** — 远程控制浏览器，支持 Computer Use
- **远程开发** — SSH / Docker / WSL / Windows Server 全环境支持

### 支持的 Provider

| 类型 | 说明 | 默认端点 | 认证模式 |
|---|---|---|---|
| `anthropic-like` | Anthropic 兼容 | `https://api.anthropic.com` | API Key |
| `openai-like` | OpenAI 兼容 | `https://api.openai.com` | Chat Completions / Responses / OAuth |
| `gemini-like` | Gemini 兼容 | `https://generativelanguage.googleapis.com` | API / OAuth / Vertex AI |
| `glm-like` | 智谱 AI GLM | `https://open.bigmodel.cn/api/anthropic` | API Key (Anthropic 兼容) |

### 安装

**环境要求：** Bun >= 1.3.5，Node.js >= 24

#### 方式一：通过 npm 安装（推荐）

```bash
# 全局安装
npm install -g @thewitchcat/cli

# 或通过 npx 直接运行（无需安装）
npx @thewitchcat/cli
```

#### 方式二：通过 bun 安装

```bash
# 从 GitHub 安装
bun install -g witchscottishfoldcat/WitchCatCode

# 或通过 tgz 文件离线安装
bun install -g thewitchcat-cli-1.0.1.tgz
```

安装完成后在终端输入 `witchcat` 即可启动。

### 快速配置

```bash
# 设置 API Key
export WITCHCAT_API_KEY="your-api-key"

# Windows PowerShell
$env:WITCHCAT_API_KEY="your-api-key"

# 或通过交互式配置
witchcat config
```

配置文件位于 `~/.witchcat/.claude.json`

### 常用命令

| 命令 | 说明 |
|---|---|
| `/model` | 切换模型 |
| `/add-model` | 添加自定义模型端点 |
| `/mcp` | 管理 MCP 服务 |
| `/agent` | Agent 团队管理 |
| `/session` | 会话管理 |
| `/compact` | 压缩上下文 |
| `/commit` | AI 生成 commit |
| `/diff` | 查看代码差异 |
| `/review` | 代码审查 |
| `/chrome` | Chrome 集成控制 |
| `/doctor` | 环境诊断 |
| `/theme` | 主题切换 |

---

## English

WitchcatCode is a multi-provider native CLI for AI coding assistants. It supports Anthropic, OpenAI, Gemini, and GLM protocols with multiple authentication modes, built-in Agent swarm collaboration, MCP tool ecosystem, file operations, Chrome integration, and more.

### Key Features

- **Multi-Provider** — Anthropic, OpenAI, Gemini, GLM with custom gateway support
- **Agent Swarm** — Multi-agent collaboration with in-process spawning and permission sync
- **MCP Ecosystem** — Full MCP client/server support with OAuth, resources, and plugin bridge
- **File Tools** — Read, edit, write, search (Glob/Grep), LSP integration, Shell execution
- **Chrome Integration** — Remote browser control with Computer Use
- **Remote Dev** — SSH / Docker / WSL / Windows Server support

### Install

**Via npm (recommended):**
```bash
npm install -g @thewitchcat/cli
```

**Via bun:**
```bash
bun install -g witchscottishfoldcat/WitchCatCode
```

Run `witchcat` to start.

---

## 致谢

感谢 [doge-code](https://github.com/HELPMEEADICE/doge-code) 项目提供的灵感与参考。

## License

[MIT](LICENSE)
