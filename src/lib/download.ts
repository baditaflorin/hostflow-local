export function downloadText(filename: string, value: string, type: string) {
  const blob = new Blob([value], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function printTextDocument(title: string, body: string) {
  const popup = window.open('', '_blank', 'noopener,noreferrer,width=960,height=720')
  if (!popup) {
    throw new Error('Popup blocked. Allow popups for this site or use Markdown download instead.')
  }

  popup.document.write(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
    <style>
      body { margin: 32px auto; max-width: 920px; padding: 0 24px; color: #1f2937; font: 16px/1.6 ui-monospace, SFMono-Regular, Menlo, monospace; }
      pre { white-space: pre-wrap; word-break: break-word; }
    </style>
  </head>
  <body>
    <pre>${escapeHtml(body)}</pre>
  </body>
</html>`)
  popup.document.close()
  popup.focus()
  popup.print()
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}
