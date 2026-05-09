import { z } from 'zod'

export type LocalLlmRequest = {
  endpoint: string
  model: string
  prompt: string
}

const localLlmResponseSchema = z.object({
  response: z.string().optional(),
  message: z.object({ content: z.string().optional() }).optional(),
})

export async function requestLocalDraft({ endpoint, model, prompt }: LocalLlmRequest) {
  try {
    new URL(endpoint)
  } catch {
    throw new Error(
      'Local LLM endpoint must be a full URL, such as http://localhost:11434/api/generate.',
    )
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
    }),
  })

  if (!response.ok) {
    throw new Error(`Local LLM returned ${response.status}`)
  }

  const payload = localLlmResponseSchema.parse(await response.json())
  const text = payload.response ?? payload.message?.content
  if (!text) throw new Error('Local LLM response did not include text')
  return text.trim()
}
