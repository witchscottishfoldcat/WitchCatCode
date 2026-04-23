# 启动卡死排查笔记 — 2026-04-23

## 现象

`npm run dev`（`bun run ./src/bootstrap-entry.ts`）启动后，终端停留在类似：

```
Starting... (validate-org)
```

永远不进 REPL，Ctrl+C 才能退。卡点随着修复过程层层浮现：先是 `validate-org`，再 `plugins`，再 `pre-initialState`。

## 根本原因

**"Source restoration" 过程中多处 `let`/`const` 被遗漏地放进了 `if (!isNonInteractiveSession) {...}` 块内部，但代码在块**外部**仍然引用这些变量。** 这些引用在运行时：

- 对 `let` 声明出的变量 → 直接 `ReferenceError`（TDZ/未声明）
- 对 `const` 声明出的变量 → `ReferenceError`（TDZ）
- `typeof x` 特例不会抛，但任何实际使用（`x ? 1 : 0`、`String(x)`）都会抛

抛出的异常被 `run()` 最外层的 `try/catch` 静默吞掉，ink 的 `Root` 实例仍然活着（持有 stdin raw mode + readline），Node/Bun 事件循环不退出；而我们加的诊断 `setInterval` 又每 400ms 重新 `root.render(<Text>Starting... ({currentStep})</Text>)`，所以终端**视觉上**停在"最后一次成功渲染的 currentStep"，给人"卡在某个具体步骤"的错觉。

真相：**不是那一步本身卡住，而是那一步之后某处 `ReferenceError` 被吞，进程静默失败。**

### 具体出问题的三个变量

| 变量 | 声明位置（旧） | 引用位置（块外） |
|---|---|---|
| `stepInterval` | `src/main.tsx:2253`（诊断 spinner，新加的） | `src/main.tsx:3815` 清理 |
| `currentStep` | `src/main.tsx:2254` | `src/main.tsx:2377+` 多处 |
| `onboardingShown` | `src/main.tsx:2254`（原代码） | `src/main.tsx:3105` `initialState.authVersion` |

`onboardingShown` 是原版 minified → restored 过程丢失的声明位置，不是新加诊断引入的。另外两个是我们自己加诊断时踩了同一个坑。

## 为什么不易察觉

1. **异常静默**：ink 已挂载 + 外层 try/catch 吞异常，既没有错误栈打印，也没有退出。
2. **诊断 spinner 误导**：`setInterval` 持续渲染 `currentStep` 的最新值，终端永远显示一个"当前步骤"。但 `currentStep` 的更新和真正执行到该行是两件事 —— 执行到 `currentStep = 'plugins'` 时，后面几十行才真正抛错；肉眼看到的是 plugins，实际错在它之后。
3. **逐步往后搬**：每修一个 scope 问题，下一次启动就推进一段，再撞下一个同类问题。所以要"修了还卡、再修又卡"。

## 修复

`src/main.tsx` 把三个变量声明提升到 `if (!isNonInteractiveSession) {...}` 块**之前**：

```ts
// Ink root is only needed for interactive sessions
let root!: Root;
let getFpsMetrics!: () => FpsMetrics | undefined;
let stats!: StatsStore;

// 以下三个原本声明在 if 块内，引用在 if 块外 → 运行时 ReferenceError
let stepInterval: ReturnType<typeof setInterval> | undefined;
let currentStep = 'post-setup';
let onboardingShown = false;

if (!isNonInteractiveSession) {
  // ...
  onboardingShown = await showSetupScreens(...);
  // 诊断 spinner 用 stepInterval / currentStep
}
```

原 `const onboardingShown = await ...` 改为对已提升的 `let` 赋值。

## 其他并入的防御性修改

虽然不是 root cause，一并加上减少误导：

1. **`validateForceLoginOrg` 5 秒超时**（`src/main.tsx`）— 本机没有 managed settings / `forceLoginOrgUUID`，该函数 1ms 内就返回 `{valid: true}`；但保留超时兜底，避免 Windows `reg query` 子进程或 OAuth profile 网络路径真的卡 10s+。
2. **`validateForceLoginOrg` 每个 early-return 加 `appendFileSync` 诊断**（`src/utils/auth.ts`）— 下次若此函数真的卡，日志直接指到具体 return 路径。
3. **`process.exitCode !== undefined` 早退路径补 `clearInterval(stepInterval)`**（`src/main.tsx`）— 避免诊断 interval 把进程吊在 gracefulShutdown 期间。

## 经验教训

- **TS/JS 块作用域是硬规则**。把声明和使用分散写在不同文件段落时（尤其是从 bundle 反向 restore 的代码），很容易把 `let`/`const` 和它的使用拆到不同 block 里。
- **静默异常 + 常驻 UI renderer 的组合最难查**。同类代码以后如果再出 "UI 卡在某字样"，优先怀疑：
  1. 外层 try/catch 是否吞了异常 —— 临时加 `console.error(e)` 或 `process.stderr.write` 看一眼
  2. `ink.Root` 是否没释放 —— 在 early-return 路径显式 clearInterval 并 `root.unmount()`
  3. 是否有 scope 外的变量引用
- **诊断性 `setInterval` 记得在所有 exit 路径 clear**。否则诊断本身会把"本来已经退出但 UI 残留"误导成"还在跑"。
- **日志驱动二分定位**：在一段不含 `await` 的同步代码里卡住时，逐行插 `appendFileSync` 打时间戳，二分到具体语句 —— 本次排查最终精确到单行 `authVersion: onboardingShown ? 1 : 0`，就是靠这个手法。

## 现状

诊断代码（`currentStep`/`stepInterval`/多处 `appendFileSync`、`[VFO]`/`[IS]` 日志、`Object.assign` 分片构建 `initialState`、5s 超时）**仍然保留在代码里**。如果要回归干净版本，建议：

- 保留 **三个变量的提升声明**（这是真实的 bug 修复）
- 保留 **`validateForceLoginOrg` 的 5s 超时**（防御性，成本极小）
- 可以清理掉所有 `[VFO]` / `[IS]` / `chunk-*` / `appendFileSync('./startup-debug.log', ...)` / 诊断 spinner `setInterval` 相关代码
- 把 `initialState` 从分片 `Object.assign` 恢复成原来的单个对象字面量（可读性更好）
