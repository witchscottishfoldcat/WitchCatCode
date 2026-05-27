
## Kimi 的接入方式

Kimi 官方提供了 `https://api.kimi.com/coding/` 端点，兼容 **Anthropic Messages API** 格式，因此使用 `anthropic-like` 类型接入，模型名为 `kimi-for-coding`。

## 配置 JSON

```json
{
  "customApiEndpoint": {
    "activeProvider": "api.kimi.com",
    "activeModel": "kimi-for-coding",
    "activeAuthMode": "api-key",
    "providers": [
      {
        "id": "api.kimi.com",
        "kind": "anthropic-like",
        "authMode": "api-key",
        "baseURL": "https://api.kimi.com/coding/",
        "apiKey": "sk-kimi-你的API密钥",
        "models": ["kimi-for-coding"]
      }
    ]
  }
}
```

### 字段说明

| 字段 | 必填 | 说明 |
|------|------|------|
| `id` | 是 | Provider 唯一标识，通常用域名 |
| `kind` | 是 | 协议类型，Kimi 用 `anthropic-like` |
| `authMode` | 是 | 认证方式，Kimi 用 `api-key` |
| `baseURL` | 是 | API 地址：`https://api.kimi.com/coding/` |
| `apiKey` | 是 | Kimi API Key，`sk-kimi-` 开头 |
| `models` | 是 | 可用模型列表 |

## 环境变量方式（快速测试）

不想改配置文件的话，可以直接设环境变量：

```bash
export WITCHCAT_API_KEY="sk-kimi-你的API密钥"
export ANTHROPIC_BASE_URL="https://api.kimi.com/coding/"
export ANTHROPIC_MODEL="kimi-for-coding"
```

## 多 Provider 共存

配置文件支持同时配置多个 Provider，通过 `activeProvider` + `activeModel` 指定当前使用哪个：

```json
{
  "customApiEndpoint": {
    "activeProvider": "api.kimi.com",
    "activeModel": "kimi-for-coding",
    "providers": [
      {
        "id": "api.kimi.com",
        "kind": "anthropic-like",
        "authMode": "api-key",
        "baseURL": "https://api.kimi.com/coding/",
        "apiKey": "sk-kimi-xxx",
        "models": ["kimi-for-coding"]
      },
      {
        "id": "api.deepseek.com",
        "kind": "openai-like",
        "authMode": "chat-completions",
        "baseURL": "https://api.deepseek.com/v1",
        "apiKey": "sk-xxx",
        "models": ["deepseek-v4-pro", "deepseek-v4-flash"],
        "contextWindow": 1000000
      },
      {
        "id": "open.bigmodel.cn/api/anthropic",
        "kind": "glm-like",
        "authMode": "api-key",
        "baseURL": "https://open.bigmodel.cn/api/anthropic",
        "apiKey": "xxx",
        "models": ["glm-4.5-air", "glm-5-turbo", "glm-5.1"]
      }
    ]
  }
}
```


## 可选参数

Provider 配置还支持以下可选字段：

```json
{
  "id": "api.kimi.com",
  "kind": "anthropic-like",
  "authMode": "api-key",
  "baseURL": "https://api.kimi.com/coding/",
  "apiKey": "sk-kimi-xxx",
  "models": ["kimi-for-coding"],
  "contextWindow": 128000,
  "maxTokens": 8192,
  "reasoning": {
    "reasoningEffort": "medium"
  }
}
```

| 可选字段 | 类型 | 说明 |
|----------|------|------|
| `contextWindow` | number | 自定义上下文窗口大小（tokens） |
| `maxTokens` | number | 单次回复最大 tokens |
| `reasoning` | object | 推理配置，`reasoningEffort` 可选 `minimal/low/medium/high/xhigh` |

不设 `contextWindow` 的话，系统会根据模型名自动识别。Kimi 系列的自动识别规则：`kimi-k1.5` → 256K，其余 `kimi`/`moonshot` → 128K。
