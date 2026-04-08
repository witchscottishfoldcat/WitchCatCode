
# 🐀 WitchcatCode

**面向多 Provider 原生接入增强的代码助手 CLI** 🚀**

专业、务实、可落地。适合需要稳定接入第三方模型、代理服务与自定义网关的开发环境。 🛠

[![Runtime](https://img.shields.io/badge/runtime-Bun%20%2BNode)](README.md)
[![Config](https://img.shields.io/badge/config-~/.witchcat-8b5cf6)](README.md)
[![Providers](https://img.shields.io/badge/providers-Anthropic%20%2BOpenAI%20compatible%20%2bGLM-like-10b981)](README.md)
[![Status](https://img.shields.io/badge/status-active%20fork-f59e0b)](README.md)

[![GitHub](https://img.shields.io/badge/Gateway-https://github.com/witchscottishfoldcat/WitchCatCode)](README.md)
[![License](https://img.shields.io/badge/license-MIT)](README.md)

---

## 核心特性

- **原生多 Provider 接入** - 支持 Anthropic、 OpenAI、 Gemini、 GLM 协议
- **多鉴权模式隔离** - API Key / OAuth 模式，独立持久化
- **自定义模型与列表管理** - 支持维护本地模型列表
- **OpenAI 协议深度支持** - Chat Completions / Responses / OAuth
- **独立配置目录** - `~/.witchcat`
- **思维链流式输出**

## 支持的网络类型

| 类型 | 说明 |
| --- | --- |
| `anthropic-like` | Anthropic 兼容 | `~/.anthropic/v1/messages` |
| `openai-like` | OpenAI 兼容 | `https://api.openai.com` / 自定义 |
| `gemini-like` | Gemini 兼容 | Gemini API / OAuth |
| `glm-like` | 智谱AI GLM 系列 | `https://open.bigmodel.cn/api/anthropic` |

## 环境要求

- **Bun** >= 1.3.5
- **Node.js** >= 24

## 快速开始

```bash
git clone https://github.com/witchscottishfoldcat/WitchCatCode
cd WitchCatCode
bun install
bun link
witchcat
```

## 配置

配置文件位于 `~/.witchcat/.claude.json`

**环境变量:**

| 变量 | 说明 |
| --- | --- |
| `WITCHCAT_API_KEY` | API Key |
| `ANTHROPIC_BASE_URL` | Anthropic 兼容网关地址 |
| `OPENAI_BASE_URL` | OpenAI 兼容网关地址 (可选) |

## 其他特性

- 原生 Chrome 集成
- 远程开发环境支持 (SSH / Docker / WSL)
- 多语言支持 (中文 / 英文)
- 主题定制
- Vim 模式

## 致谢

感谢 [doge-code](https://github.com/HELPMEEADICE/doge-code) 项目提供的灵感与参考。

## License

MIT
