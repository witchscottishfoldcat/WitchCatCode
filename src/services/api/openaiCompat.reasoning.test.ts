import { describe, expect, test } from 'bun:test'
import { convertAnthropicRequestToOpenAI } from './openaiCompat.js'

// Regression: DeepSeek (and other reasoning-returning OpenAI-compatible
// providers) reject a follow-up request unless the reasoning that accompanied
// a prior assistant turn's tool calls is echoed back as `reasoning_content`.

describe('convertAnthropicRequestToOpenAI reasoning_content', () => {
  test('echoes thinking blocks back as reasoning_content on assistant turns', () => {
    const out = convertAnthropicRequestToOpenAI({
      model: 'deepseek-chat',
      messages: [
        { role: 'user', content: 'create a file' },
        {
          role: 'assistant',
          content: [
            { type: 'thinking', thinking: 'I should call Write.', signature: '' },
            { type: 'text', text: 'Sure.' },
            { type: 'tool_use', id: 'call_1', name: 'Write', input: { file_path: 'a.txt', content: 'hi' } },
          ],
        } as any,
        {
          role: 'user',
          content: [{ type: 'tool_result', tool_use_id: 'call_1', content: 'ok' }],
        } as any,
      ],
    })

    const assistant = out.messages.find(m => m.role === 'assistant')
    expect(assistant).toBeDefined()
    expect(assistant!.reasoning_content).toBe('I should call Write.')
    expect(assistant!.tool_calls?.[0]?.function.name).toBe('Write')
    expect(assistant!.content).toBe('Sure.')
  })

  test('omits reasoning_content when the turn had no thinking (no impact on other providers)', () => {
    const out = convertAnthropicRequestToOpenAI({
      model: 'some-openai-like',
      messages: [
        { role: 'user', content: 'hi' },
        { role: 'assistant', content: [{ type: 'text', text: 'hello' }] as any },
      ],
    })
    const assistant = out.messages.find(m => m.role === 'assistant')
    expect(assistant).toBeDefined()
    expect('reasoning_content' in assistant!).toBe(false)
  })
})
