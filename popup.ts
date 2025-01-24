document.addEventListener('DOMContentLoaded', () => {
  const copyButton = document.getElementById('copy')
  const saveButton = document.getElementById('save')
  const contentDiv = document.getElementById('content')

  copyButton?.addEventListener('click', () => {
    const content = contentDiv?.textContent || ''
    navigator.clipboard.writeText(content)
      .then(() => alert('内容已复制到剪贴板'))
  })

  saveButton?.addEventListener('click', () => {
    const content = contentDiv?.textContent || ''
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'selected-text.txt'
    a.click()
    URL.revokeObjectURL(url)
  })
}) 