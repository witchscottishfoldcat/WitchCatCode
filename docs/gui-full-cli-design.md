# GUI 全功能化设计文档（GUI ≈ CLI，对标 Codex Desktop）

> 目标：让 `src/gui` 的 Web 界面具备 CLI 几乎全部的能力——能真正调用工具（读写文件、执行命令、搜索、子代理、MCP、斜杠命令），而不只是裸聊天。产品形态对标 **Codex Desktop 的 Web**：任务中心、三档审批、改动可视（见 §1.4）。
>
> 状态：设计稿，待评审。编码尚未开始。
> 关联：本设计取代当前 `src/gui/services/chatService.ts` 的「裸 `queryModelWithStreaming` + `tools: []`」实现。

---

## 1. 背景与现状

### 1.1 当前 GUI 的能力边界

`chatService.ts` 直接调用 `queryModelWithStreaming`，且：

```ts
tools: [], agents: [], mcpTools: [],
async getToolPermissionContext() { return getEmptyToolPermissionContext() }
```

结果：**只是一个纯文本聊天框**。不能读写文件、不能跑 Bash、没有权限流、没有 MCP、没有斜杠命令、没有子代理。前端引导语（「帮我分析项目结构」「写工具函数」）与实际能力严重不符。

### 1.2 CLI 能力的来源（可复用积木）

| 能力 | 复用点 | 位置 |
|---|---|---|
| Agent 主循环（多轮 + 工具调用 + 压缩 + 子代理） | `query()` | `src/query.ts:239` |
| 完整工具集 | `getTools(permissionContext)` | `src/tools.ts:271` |
| 权限决策（询问步骤可插拔） | `hasPermissionsToUseTool` / `CanUseToolFn` | `src/utils/permissions/permissions.ts`、`src/hooks/useCanUseTool.tsx` |
| 非交互驱动参考 | `runHeadless` | `src/cli/print.ts:475` |
| MCP / agents / commands | 同 `runHeadless` 装配路径 | `src/cli/print.ts` |

### 1.3 关键约束：运行时是「单进程单活跃会话」

调研结论（已验证，见 §11）：

- `getSessionId()` 是**全局单例**（`STATE.sessionId`），`switchSession()` 全局切换并广播事件；`getTranscriptPath()`（`sessionStorage.ts:202`）在写入时从全局 `getSessionId()`/`getSessionProjectDir()` 派生 `.jsonl` 路径。`getSessionId` 有 **91 处调用**。
- AppState / settings / MCP 连接同样以进程级单例存在。

**含义**：在**同一进程内**并发跑多个 `query()` 会互相污染 transcript、plan slug、AppState——无法做到真正的会话隔离，除非把 sessionId/AppState 线程化穿过 90+ 调用点（巨型重构，不可行）。

### 1.4 架构决策：子进程隔离（对标 Codex Desktop / Agent SDK）

CLI **本身**已完整支持以 Agent SDK 的 **stream-json 控制协议**被无头驱动（已验证，见 §11）：

```
witchcat --print \
  --input-format stream-json --output-format stream-json --verbose \
  --replay-user-messages [--permission-mode <mode>]
```

- **stdout**：NDJSON 事件流（`assistant` / `user`(replay) / `stream_event` / `result` / `control_request`）。
- **stdin**：写用户消息；写 `control_response` 应答权限；写 `set_permission_mode` 控制请求**运行时切换模式**。
- **权限**：子进程需要批准时发 `control_request {subtype:'can_use_tool', tool_name, input, tool_use_id}`（`print.ts:637/2850`），宿主回 `control_response {behavior:'allow'|'deny', updatedInput?, message?}`（`print.ts:2761`）。

`bridge/sessionRunner.ts` 已用此协议实现「**每会话一个 CLI 子进程**」（远程场景）。GUI 复用同一模型，去掉远程专属参数（`--sdk-url` / CCR / access token），跑**本地**子进程即可。

**最终架构**：**每个 GUI 会话 = 一个 CLI 子进程**，GUI 服务器通过 stdio ↔ WebSocket 做协议转译。这样：

1. 会话隔离天然成立（每个子进程有自己的全局 sessionId/AppState/transcript）——**直接消解 §1.3 的硬约束**。
2. 复用整个 CLI（工具、权限、MCP、斜杠命令、压缩、子代理），GUI 侧几乎不碰 agent 内核。
3. 与 Codex Desktop「UI ↔ 后端 agent 进程」的形态一致。

> 放弃方案：在 `query()` 层自建 in-process 驱动（`guiAgentService`）。原因即 §1.3——进程内无法隔离会话。

### 1.4 设计理念：对标 Codex Desktop

本 Web 的产品形态对标 **Codex Desktop 的 Web**，核心范式：

1. **任务中心**：用户给一个任务/需求，agent 自主运行到完成；用户在转录中观察推理、命令、文件改动，而非一问一答的纯聊天。
2. **三档审批模式**：`Read Only` / `Auto` / `Full Access`（见 §5），取代 CLI 那套五模式的复杂度；模式直观、随时可切。
3. **改动可视优先**：突出「本次改动了哪些文件」的 diff 审阅面板，让用户能像 review PR 一样审查 agent 的工作。
4. **审批内联、低打扰**：仅在越权（越出工作区 / 需网络 / 危险命令）时就地弹出批准，其余自动放行以保持流畅。
5. **简洁克制的 UI**：转录 + 改动面板双栏，弱化装饰，强调内容与状态。

下文 §5（权限）与 §10（前端）据此收敛。

---

## 2. 目标与非目标

### 2.1 目标（用户已确认）

- GUI 对话能真正调用工具，覆盖 CLI 几乎全部能力。
- **权限：默认需要用户手动批准**；同时提供多种权限模式，**包含完全访问模式**（见 §5）。
- 多会话并发安全（工具会真改磁盘/跑命令，隔离是硬要求）。

### 2.2 非目标（本期不做）

- 不追求像素级复刻 TUI 的终端渲染。
- 不做多用户鉴权体系（仍是单用户 + token，见 §9）。
- 不做远程/teleport 模式。

---

## 3. 总体架构（子进程隔离模型）

```
浏览器 (chat.html — 转录 + 改动双栏)
   │  WebSocket (JSON 事件，见 §4)
   ▼
gui/server/websocket.ts  ── 路由 chat:* / perm:* / mode:* / slash:*
   │
   ▼
gui/services/sessionManager.ts   ★ 新增核心
   │  · 每个 GUI 会话 = 一个 CLI 子进程（spawn）
   │  · 维护 sessionId → SessionProcess 映射、生命周期、并发上限
   │
   ▼
gui/services/sessionProcess.ts   ★ 新增（单会话子进程封装）
   │  spawn: witchcat --print --input-format stream-json
   │         --output-format stream-json --verbose --replay-user-messages
   │         [--permission-mode <mode>]   (cwd = 项目目录)
   │
   │  ── stdin  ──►  用户消息 / control_response(权限) / set_permission_mode
   │  ◄── stdout ──  NDJSON: assistant / stream_event / result / control_request
   │
   ▼
              [ 子进程：完整 CLI 内核 ]
              query() · getTools() · 权限 · MCP · 斜杠命令 · 子代理 · 压缩
              自己的全局 sessionId / AppState / transcript(.jsonl)
```

GUI 服务器只做三件事：**进程生命周期管理**、**stream-json ↔ WebSocket 协议转译**、**权限 control_request 转发到浏览器并把应答写回**。agent 内核完全在子进程里，GUI 侧不碰。

核心改动：删除 `chatService.ts` 的裸流式与 in-process 设想，新增 `sessionManager.ts` + `sessionProcess.ts`。

---

## 4. WebSocket 事件协议

统一信封：`{ type: string, payload: object }`（沿用现有风格，data→payload 统一）。所有事件带 `sessionId`。

### 4.1 客户端 → 服务端

| type | payload | 说明 |
|---|---|---|
| `chat:start` | `{ sessionId?, message, cwd? }` | 发起一轮对话；首轮可带工作目录 |
| `chat:abort` | `{ sessionId }` | 中断当前轮（触发 abortController） |
| `chat:clear` | `{ sessionId }` | 清空/新建会话 |
| `chat:history` | `{ sessionId }` | 拉取历史消息 |
| `perm:response` | `{ sessionId, requestId, decision, scope }` | 权限应答；`decision`: `allow`/`deny`；`scope`: `once`/`always`（always 写入会话级允许规则） |
| `mode:set` | `{ sessionId, mode }` | 切换权限模式（§5），`mode`: `read-only`/`auto`/`full-access`（内部映射到 PermissionMode） |
| `slash:list` | `{}` | 拉取可用斜杠命令 |
| `slash:run` | `{ sessionId, command, args }` | 执行斜杠命令 |

### 4.2 服务端 → 客户端（子进程 stdout NDJSON 映射）

宿主把子进程 stdout 的 stream-json 行转译为下列 WS 事件：

| type | payload | NDJSON 来源 |
|---|---|---|
| `chat:started` | `{ sessionId, userMessage }` | `user`(replay，`--replay-user-messages`) |
| `msg:text` | `{ blockId, delta }` | `stream_event` text_delta |
| `msg:thinking` | `{ blockId, delta }` | `stream_event` thinking_delta |
| `tool:use` | `{ toolUseId, name, input, title }` | `assistant` 消息内 `tool_use` 块 |
| `tool:result` | `{ toolUseId, ok, content, isError, durationMs }` | `user` 消息内 `tool_result` 块 |
| `tool:diff` | `{ toolUseId, path, patch }` | 宿主对 Edit/Write 的 input 生成（`diff` 包） |
| `perm:request` | `{ requestId, toolUseId, name, input, suggestions, riskLevel }` | `control_request{can_use_tool}`（§5） |
| `todo:update` | `{ todos }` | `assistant` 内 TodoWrite 的 tool_use |
| `cost:update` | `{ inputTokens, outputTokens, costUSD }` | `result` / usage 字段 |
| `chat:done` | `{ sessionId, stopReason }` | `result`（轮结束） |
| `chat:error` | `{ sessionId, error }` | 子进程 stderr / 非 0 退出 / `result.is_error` |

> 解析参考 `bridge/sessionRunner.ts:107 extractActivities`（已有同款 NDJSON 解析逻辑可借鉴）。

> 映射实现：遍历 `query()` 的 `for await`，按 yield 出的 `StreamEvent`（text/thinking delta）、`Message`（assistant 含 tool_use、user 含 tool_result）分类转译。工具开始/结束可借 `setInProgressToolUseIDs` 与消息内容推断。

---

## 5. 权限流（核心设计）

### 5.1 权限模式（对标 Codex Desktop 三档）

对外只暴露 **Codex 的三档模式**，内部映射到 CLI 既有 `PermissionMode`（`src/types/permissions.ts`），用户无需感知底层五模式的复杂度。

| GUI 模式（对外） | 行为 | 内部映射（PermissionMode） |
|---|---|---|
| **Read Only**（**GUI 默认**，手动批准） | 只读工具（Read/Grep/Glob 等）自动放行；任何文件改动、Bash、网络等**每次弹窗批准** | `default` |
| **Auto** | 工作区内的文件编辑与命令自动放行；**越出工作区 / 需要网络 / 危险命令**才弹窗批准 | `acceptEdits` + 工作区内 Bash 自动放行（cwd 前缀校验） |
| **Full Access**（完全访问） | 全部自动放行，不弹窗，可读写任意路径、可联网 | `bypassPermissions` |

要点：
- **默认 Read Only**，满足用户「默认需手动批准」的要求。
- 切到 **Full Access** 时前端**二次确认** + 持久**红色标识**（顶栏 banner），明确告知「已把本机交给模型」。
- 模式由前端 `mode:set` 切换，存于会话状态，轮次间保持。
- **Auto 模式的工作区判定**：以会话 cwd 为边界。文件路径 / Bash 的工作目录在 cwd 子树内 → 自动放行；否则降级为弹窗。网络类工具（WebFetch 等）在 Auto 下仍弹窗。

### 5.2 权限决策路径（子进程模型）

权限的**计算**发生在子进程内部（CLI 的 `hasPermissionsToUseTool` 按 `--permission-mode` + 规则裁决，已涵盖只读放行、acceptEdits 自动放行、规则匹配）。子进程只在裁决为 `ask` 时，向 GUI 宿主发出 `control_request {subtype:'can_use_tool'}`。

因此 GUI 宿主**不实现 `canUseTool`**，而是做「**模式策略 + 转发**」：

```
收到 control_request(can_use_tool, tool_name, input, tool_use_id)：
  根据当前会话模式：
    Full Access  → 一般不会收到（子进程以 bypassPermissions 启动，自动放行）；
                   若收到也直接回 allow。
    Auto         → 工作区判定：file_path / Bash 的 cwd 在会话 cwd 子树内，
                   且非网络类工具 → 直接回 control_response(allow)；
                   否则 → 转发浏览器。
    Read Only    → 一律转发浏览器。
  转发：生成 requestId，推 perm:request 给浏览器，挂 pending；
       与子进程退出/中断竞速；
       等 perm:response：
         allow, once   → control_response(allow)
         allow, always → 记录会话级 allow（下次同工具同类输入本地直接放行）+ allow
         deny          → control_response(deny, message:'用户拒绝')
         中断/超时      → control_response(deny)
```

> 模式与 `--permission-mode` 的关系：启动时按模式传 `--permission-mode`（Read Only→`default`、Auto→`acceptEdits`、Full Access→`bypassPermissions`）以减少噪声；运行时切换发 `set_permission_mode` 控制请求（`print.ts:2950`）。Codex「Auto 自动跑工作区命令」这层语义由**宿主在 control_request 上叠加 cwd 策略**实现，无需改 CLI 内核。
> `updatedInput`：宿主转发/回应时保持 `input` 原样（如需在 UI 编辑参数后再放行，可回带 `updatedInput`）。

### 5.3 权限请求的信息量

`perm:request` 应携带足够上下文供用户判断：工具名、关键参数（如 Bash 的 command、Edit 的 path + diff 预览）、风险等级（写/删/网络/执行）。前端渲染为内联对话框：`允许一次` / `本会话总是允许` / `拒绝`。diff 预览可由宿主对 Edit/Write 的 input 用 `diff` 包生成。

---

## 6. 会话上下文（由子进程拥有）

> 子进程模型下，`ToolUseContext`（`src/Tool.ts:158`）、`getTools()`、MCP 装配、AppState **全部在子进程内部构建**——正是 CLI 正常 `-p` 启动所做的事。GUI 宿主**不再**手工拼 `ToolUseContext`（这正是放弃 in-process 方案后省掉的复杂度）。

GUI 宿主只需在 spawn 时通过 **CLI flag / 子进程 env** 传入会话参数：

- `--session-id <uuid>`：固定会话 id（与 §7 落盘对齐）。
- `--permission-mode <mode>`：初始模式。
- `cwd`：子进程工作目录 = 项目根。
- `env`：provider 配置（baseURL / apiKey / model）等。**每个子进程独立 env，天然隔离**（见 §8）。
- 可选 `--append-system-prompt`、`--model` 等沿用 CLI flag。

---

## 7. 会话存储与统一

**问题**：现状有两套割裂的「会话」——`chatService` 内存级（重启即丢） vs `sessionService` 读磁盘 `.jsonl`（CLI 历史）。

**方案**：子进程就是标准 CLI 会话，其 transcript 由子进程自己落盘到 `<project>/<sessionId>.jsonl`（`sessionStorage.ts:202`，基于该子进程自身的全局 sessionId）。因此：
- GUI 对话天然出现在「会话」列表，可被 CLI `--resume`。
- 重启不丢历史；GUI 重连可用 `--resume <sessionId>` 让子进程恢复。
- 消除评审 #5 的割裂。

§1.3 的「全局 sessionId」约束在这里**不再是问题**：每个子进程一个会话，宿主用 `--session-id` 指定，落盘路径在子进程内派生，互不干扰。

---

## 8. 并发隔离（已由进程隔离解决，含修复评审 #8）

现状 `chatService` 把 provider 配置写进**当前进程**全局 `process.env`（`ANTHROPIC_BASE_URL` / `WITCHCAT_API_KEY`），多会话并发互相覆盖。

**子进程模型下彻底解决**：provider 配置写入**各子进程自己的 `env`**（spawn 时传入），互不影响；sessionId / AppState / transcript / MCP / 权限规则全部是各子进程的进程级单例，物理隔离。GUI 宿主进程自身不再写这些全局 env。

需管理的只剩**进程资源**：并发子进程数上限、空闲回收、异常退出重启（见 §11）。

---

## 9. 工作目录与安全

- **工作目录**：GUI 需要选择项目根（工具的 cwd）。首期：`chat:start` 带 `cwd`，或在设置页选目录；默认取 CLI 启动时的 cwd。
- **安全边界**：工具能跑 Bash、改磁盘——风险等同 CLI。维持现有 token 鉴权（已加固为定长比较），并：
  - `bypassPermissions` 模式需前端二次确认 + 持久红色标识。
  - 服务器仍绑 `127.0.0.1`，不对外暴露。
  - 文档明确告知用户：开启完全访问 = 把本机交给模型。

---

## 10. 前端（chat.html 重写，对标 Codex Desktop）

从「气泡聊天」升级为 Codex Desktop 式的**任务中心双栏**布局：

```
┌──────────────────────────────────────────────────────────┐
│ 顶栏：项目/cwd · 模式切换[Read Only▾] · 成本/token · 中断  │  ← Full Access 时整条变红
├───────────────────────────────┬──────────────────────────┤
│ 转录区（左，主）              │ 改动面板（右，可折叠）   │
│  · 用户任务                   │  本轮改动的文件列表       │
│  · 推理/思考（可折叠）        │  点击 → 该文件 diff       │
│  · 工具卡片（命令/读写）      │  「全部接受 / 查看」      │
│  · 命令输出（折叠+等宽）      │                          │
│  · 内联权限对话框             │                          │
│  · Todo 进度                  │                          │
├───────────────────────────────┴──────────────────────────┤
│ 输入框（任务/追问）· `/` 唤出斜杠命令                      │
└──────────────────────────────────────────────────────────┘
```

组件清单：

- **转录区**（左、主）：
  - 文本/思考块：流式渲染，思考默认折叠。
  - 工具卡片：工具名 + 摘要、参数、状态（运行中/成功/失败）、可展开结果。
  - 命令输出：Bash 的 stdout/stderr，折叠 + 等宽。
  - 内联权限对话框：`允许一次 / 本会话总是允许 / 拒绝`（仅 Read Only 或 Auto 越权时出现）。
  - Todo 进度：TodoWrite 实时列表。
- **改动面板**（右、可折叠）★ Codex 标志性：
  - 汇总本会话/本轮被 Edit/Write 的文件列表。
  - 点击查看单文件 diff（高亮）。
  - 顶部「查看全部改动」入口，像 review PR 一样审阅 agent 的工作。
- **顶栏**：cwd、三档模式切换（Full Access 二次确认 + 红色标识）、实时成本/token、中断按钮。
- **斜杠命令**：输入 `/` 唤出命令列表（来自 `slash:list`）。

技术：保持纯静态 HTML + 原生 JS（与现状一致，无构建步骤），渲染函数模块化。markdown 改用项目已依赖的 `marked`（现状手写正则，脆弱）。diff 渲染用项目已依赖的 `diff` 包生成、前端高亮。

---

## 11. 调研结论与剩余风险项

### 已解决（子进程模型消解）

1. ~~**sessionId 隔离**~~ ✅ **已解决**。验证：`getTranscriptPath()`（`sessionStorage.ts:202`）从全局 `getSessionId()` 派生路径，`getSessionId` 91 处调用，运行时是单进程单活跃会话。**结论**：不在进程内并发 `query()`；改为每会话一个子进程，宿主用 `--session-id` 指定，落盘在各子进程内派生，互不干扰。
2. ~~**AppState 会话化成本**~~ ✅ **已解决**。AppState/MCP/settings 均为进程级单例；子进程模型下每个子进程自带独立 AppState，宿主无需会话化任何全局状态。

### 阶段 0 spike 实测结论（已跑通，`scripts/gui-spike.mjs`）

4. ✅ **本地非远程可行**。纯本地 provider（实测 `deepseek-v4-pro`）直接跑通，无需 `--sdk-url`/CCR/access token。确定的 spawn 命令：
   ```
   bun src/bootstrap-entry.ts --print \
     --input-format stream-json --output-format stream-json --verbose \
     --replay-user-messages --permission-mode <mode> \
     --permission-prompt-tool stdio
   ```
   **关键**：`--permission-prompt-tool stdio` 必带——否则 `ask` 决策在无头模式下被内部自动拒绝（`print.ts:822-825`：`sdkUrl ? 'stdio' : permissionPromptToolName`），不会发 control_request。
5. ✅ **control 封套已实测确定**：
   - 输入（stdin，NDJSON）用户轮：`{"type":"user","session_id":"","message":{"role":"user","content":"..."},"parent_tool_use_id":null}`
   - 权限请求（子进程→宿主，stdout）：`{"type":"control_request","request_id":"<id>","request":{"subtype":"can_use_tool","tool_name":"Write","input":{...},"permission_suggestions":[{"type":"setMode","mode":"acceptEdits"}],"tool_use_id":"..."}}`
   - 权限应答（宿主→stdin）：
     - 允许一次：`{"type":"control_response","response":{"subtype":"success","request_id":"<id>","response":{"behavior":"allow","updatedInput":{...原 input...}}}}`
     - 总是允许：allow + `updatedPermissions:[...]` + `decisionClassification:"user_permanent"`
     - 拒绝：`{...,"response":{"behavior":"deny","message":"用户拒绝","interrupt":false}}`
   - 实测：allow 后工具真的执行，`tool_result` 返回 `File created successfully...`，文件落盘成功。
   - 事件流：`system`(init，带 cwd/session_id/tools) → `user`(replay) → `assistant`(thinking/text/tool_use) → `user`(tool_result) → `result`(cost/usage/stop_reason)。

### 剩余风险（实现中处理）

6. ⚠️ **provider thinking 多轮 bug（实测发现）**：deepseek 在 thinking 模式下、工具结果回传后的收尾轮报 `400: The reasoning_content in the thinking mode must be passed back to the API`。文件已写成功，仅收尾总结轮失败。属 CLI↔deepseek 适配缺陷（与 GUI 架构无关）。缓解：对此类 provider 禁用 thinking，或修 provider 适配层。**独立跟踪**。
7. **子进程启动开销与资源**：每会话一个进程，冷启动有延迟。需并发上限、空闲回收（idle TTL 后 kill）、`windowsHide`、信号处理（参考 `sessionRunner.ts:335`）。
8. **plan 模式落地**：子进程发相应 control_request/消息，GUI 需「展示计划 → 批准 → `set_permission_mode` 切回执行」。
9. **斜杠命令的 UI 依赖**：部分命令依赖 TUI（返回 JSX）。需筛选 stream-json 下可用集。
10. **可执行入口**：spawn 的 `execPath`+`scriptArgs`——npm 安装是 node+脚本路径，编译二进制是 binary 自身（参考 `sessionRunner.ts:45-54`）。GUI 宿主在同一包内，可定位 `bootstrap-entry.ts`。

---

## 12. 分阶段实施计划

### 阶段 0：技术验证（spike）✅ 已完成
- [x] 手动 spawn 本地 provider，确认 stdout NDJSON 与 control_request 行为（§11.4）。
- [x] 实测 control_response 封套，跑通「写文件需批准 → 回 allow → 落盘」（§11.5）。产物 `scripts/gui-spike.mjs`。

### 阶段 1：真正的 Agent 对话（MVP）✅ 已完成
- [x] `sessionProcess.ts`：spawn + stdio + NDJSON 解析 + control 协议（累积快照重建增量、tool_use 去重）
- [x] `sessionManager.ts`：sessionId→进程映射、并发上限、空闲回收、三档模式映射
- [x] stdout NDJSON → WS 事件映射（session:init / msg:text / msg:thinking / tool:use / tool:result / chat:done / chat:error）
- [x] 权限转发：`control_request` → `perm:request` → `perm:response` → `control_response`（allow-once / always / deny）
- [x] chat.html 重写为 Codex 双栏：转录（文本/思考/工具卡片/内联权限对话框）+ 改动面板（diff）+ 三档模式切换
- [x] 验证通过：manager 集成测试 + 完整 GUI server WS 烟测，均成功读/写文件、跑通权限往返、文件落盘
- [x] 删除旧 `chatService.ts`（in-process 裸流式）

> ✅ **已修复：deepseek thinking 多轮 bug**。根因：`openaiCompat.ts` 的 `convertAnthropicRequestToOpenAI` 在重建 assistant 消息时丢弃了 thinking 块，导致 deepseek 收尾轮报 `400 reasoning_content must be passed back`。修法：把 thinking 块作为 `reasoning_content` 回传到该 assistant 消息（仅当存在 thinking 时附加，对不消费该字段的 provider 无影响）。验证：spike 单/多工具轮均 `is_error:false / end_turn`；单测 `openaiCompat.reasoning.test.ts`（2 passed）覆盖「有 thinking→回传」「无 thinking→不附加」。**此修复同时惠及普通 CLI 用 deepseek+工具的场景。**

### 阶段 2：模式 + 改动面板 + 历史/模型/思考 ✅ 大部分完成
- [x] 三档模式：启动 `--permission-mode` + 运行时 `set_permission_mode`；Full Access 二次确认 + 红色标识
- [x] 改动面板（右栏）：文件 diff 审阅
- [x] **会话历史侧栏**：列出 `/api/sessions`，点击经 `--resume` 重开并渲染历史，继续对话
- [x] **模型选择**：顶栏下拉，来源 `/api/config/providers`+`current`；新会话传 `--model`，运行时 `set_model`
- [x] **思考设置**：顶栏 自动/关闭；新会话传 `MAX_THINKING_TOKENS`，运行时 `set_max_thinking_tokens`
- [x] 思考折叠、中断（`interrupt` 控制请求）
- [ ] 工作目录选择（当前默认 GUI 启动 cwd；跨项目 resume 的 cwd 仍用默认）
- [ ] Auto 模式的 cwd 越界策略叠加（当前直接用 acceptEdits 语义）
- [ ] 命令输出专门渲染（当前在工具卡片内）

### 阶段 3：调研 + 部分交付
**调研结论（实测）**：
- 斜杠命令：clean 输入下子进程**会拦截**斜杠命令（不当作文本发给模型，实测 `/status` 产出 `stop:null` 无内容），但内置命令输出是 TUI 导向、**不映射到 stream-json**——做成面板价值有限、体验割裂。自定义 prompt 命令（`.claude/commands/*.md`）会展开为模型 prompt、能正常出文本。
- 命令/MCP 清单来自 SDK `initialize` 握手，但实测向子进程发 `initialize` control_request **未回包**（可能需作为首条且有更多协议约束），需进一步逆向，ROI 低。
- 结论：**slash/MCP 经子进程模型短期 ROI 低，暂缓**；优先交付更贴近 Codex Desktop 的稳健功能。

**已交付**：
- [x] **Todo/计划面板**：`TodoWrite` 工具调用渲染为实时勾选清单（pending/in_progress/completed，含 activeForm），每轮独立、原地更新
- [x] **工作目录选择**：点击顶栏 cwd 设置新对话的工作目录（`chat:start` 带 `cwd`）
- [x] 成本实时显示（`chat:done` 的 costUSD）
- [ ] slash/MCP（暂缓，见上）

### 阶段 2.x：UI 重构 review（用户改稿）
- [x] 修复用户改稿引入的 DOM 嵌套 bug：两处多余 `</div>` 使 `.changes`/`.input-area` 逃出 `.layout`（浮动输入会盖住侧栏）。已删除，div 66→68 配平。
- [x] 校验：所有 JS 依赖的元素 id 仍在；`resetTranscript` 已重建新版欢迎页；JS 语法检查通过。

### 阶段 4：打磨
- [ ] plan 模式完整交互
- [ ] markdown 改用 `marked`、错误恢复、多会话标签页等

---

## 13. 受影响文件清单（预估）

| 文件 | 改动 |
|---|---|
| `src/gui/services/sessionProcess.ts` | **新增**，单会话子进程封装（spawn + stdio + NDJSON 解析 + control 协议） |
| `src/gui/services/sessionManager.ts` | **新增**，多会话进程池 / 生命周期 |
| `src/gui/services/chatService.ts` | 删除（in-process 裸流式被子进程模型取代） |
| `src/gui/server/websocket.ts` | 扩展消息类型（perm:* / mode:* / slash:*），对接 sessionManager |
| `src/gui/web/chat.html` | 重写为「转录 + 改动」双栏 |
| `src/gui/services/sessionService.ts` | 与子进程 transcript（`.jsonl`）对齐，统一会话列表 |
| `src/gui/server/api/*` | 新增 cwd / commands / 模式 接口（按需） |

> 注：原计划的 `guiAgentService.ts`（in-process 驱动 `query()`）与 `permissionBroker` 内的 `canUseTool` **不再需要**——子进程模型把 agent 内核与权限计算都放进子进程，宿主只做协议转译与权限转发。

---

*评审通过后，从阶段 0 spike 开始。*
