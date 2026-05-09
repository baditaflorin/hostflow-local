export async function copyText(value: string) {
  if (!navigator.clipboard?.writeText) {
    throw new Error('Clipboard write is unavailable in this browser. Download the file instead.')
  }
  await navigator.clipboard.writeText(value)
}

export async function readClipboardText() {
  if (!navigator.clipboard?.readText) {
    throw new Error(
      'Clipboard read is unavailable in this browser. Paste into the import box instead.',
    )
  }
  const value = await navigator.clipboard.readText()
  if (!value.trim()) {
    throw new Error('Clipboard was empty. Copy listing HTML, CSV, or a workspace JSON file first.')
  }
  return value
}
