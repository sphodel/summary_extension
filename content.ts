import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  // 允许在所有网页上使用
  matches: ["<all_urls>"]
}

// 创建浮动按钮
const button = document.createElement('button')
button.style.cssText = `
  position: fixed;
  padding: 8px 16px;
  background: linear-gradient(145deg, #2196F3, #1976D2);
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  display: none;
  z-index: 999999;
  box-shadow: 0 3px 6px rgba(33, 150, 243, 0.3);
  font-size: 14px;
  font-weight: 500;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  transition: all 0.2s ease;
  backdrop-filter: blur(8px);
  letter-spacing: 0.3px;
  user-select: none;
  white-space: nowrap;
`
button.textContent = '✨ 总结选中文字'

// 添加悬停效果
button.onmouseover = () => {
  button.style.transform = 'translateY(-2px)'
  button.style.boxShadow = '0 5px 12px rgba(33, 150, 243, 0.4)'
  button.style.background = 'linear-gradient(145deg, #1E88E5, #1565C0)'
}

button.onmouseout = () => {
  button.style.transform = 'translateY(0)'
  button.style.boxShadow = '0 3px 6px rgba(33, 150, 243, 0.3)'
  button.style.background = 'linear-gradient(145deg, #2196F3, #1976D2)'
}

// 添加点击效果
button.onmousedown = () => {
  button.style.transform = 'translateY(1px)'
  button.style.boxShadow = '0 2px 4px rgba(33, 150, 243, 0.3)'
}

button.onmouseup = () => {
  button.style.transform = 'translateY(-2px)'
  button.style.boxShadow = '0 5px 12px rgba(33, 150, 243, 0.4)'
}

document.body.appendChild(button)

// 监听选中文字事件
document.addEventListener('mouseup', (event) => {
  setTimeout(() => {
    const selection = window.getSelection()
    const selectedText = selection?.toString().trim()
    
    if (selectedText) {
      // 获取鼠标位置
      const mouseX = event.clientX
      const mouseY = event.clientY
      
      // 设置按钮位置在鼠标位置附近
      button.style.top = `${mouseY - 40}px`
      button.style.left = `${mouseX}px`
      button.style.display = 'block'
      
      // 确保按钮不会超出视窗
      const rect = button.getBoundingClientRect()
      if (rect.right > window.innerWidth) {
        button.style.left = `${window.innerWidth - rect.width - 10}px`
      }
      if (rect.top < 0) {
        button.style.top = '10px'
      }
    }
  }, 10) // 小延迟确保选择完成
})

// 点击按钮时打开侧边栏
button.addEventListener('click', () => {
  const selectedText = window.getSelection()?.toString().trim() || ""
  // 直接打开侧边栏
  chrome.runtime.sendMessage({
    action: "openSidePanel",
    text: selectedText
  })
  button.style.display = 'none'
  window.getSelection()?.removeAllRanges()
})

// 点击其他地方时隐藏按钮
document.addEventListener('click', (e) => {
  if (e.target !== button) {
    button.style.display = 'none'
  }
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "GET_SELECTED_TEXT") {
    const selectedText = window.getSelection().toString()
    sendResponse({ text: selectedText })
  }
})
