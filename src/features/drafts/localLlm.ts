export type LocalLlmRequest = {
  endpoint: string
  model: string
  prompt: string
}

export async function requestLocalDraft({ endpoint, model, prompt }: LocalLlmRequest) {
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

  const payload = (await response.json()) as { response?: string; message?: { content?: string } }
  const text = payload.response ?? payload.message?.content
  if (!text) throw new Error('Local LLM response did not include text')
  return text.trim()
}
