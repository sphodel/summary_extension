import type { PlasmoMessaging } from "@plasmohq/messaging"

let selectedText = ''

// 监听来自content script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "openSidePanel") {
    selectedText = request.text
    
    // 打开侧边栏
    chrome.sidePanel.open({ windowId: sender.tab?.windowId }).then(() => {
      // 等待侧边栏加载
      setTimeout(() => {
        // 发送消息到侧边栏
        chrome.runtime.sendMessage({
          action: "updateSidePanelContent",
          text: selectedText
        })
      }, 500)
    })
  }
})

// 初始化侧边栏设置
chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setOptions({
    path: "sidepanel.html",
    enabled: true
  })
})

const HUGGINGFACE_API_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-cnn"
const API_KEY = "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" // 需要从 HuggingFace 获取

// 添加这个消息处理器的注册
export const handler: PlasmoMessaging.MessageHandler<
  { text: string },
  { success: boolean; summary?: string; error?: string }
> = async (req, res) => {
  console.log("消息处理器被调用")  // 新增日志
  const { text } = req.body
  console.log('收到总结请求，文本:', text)

  try {
    console.log('开始调用 API')
    const response = await fetch(HUGGINGFACE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: text,
        parameters: {
          max_length: 130,
          min_length: 30,
          do_sample: false
        }
      })
    })

    console.log('API 调用完成，等待响应')  // 新增日志
    const data = await response.json()
    console.log('API 响应:', data)
    
    if (Array.isArray(data) && data[0]?.summary_text) {
      console.log('总结成功:', data[0].summary_text)
      res.send({
        success: true,
        summary: data[0].summary_text
      })
    } else {
      throw new Error('无效的响应格式')
    }
  } catch (error) {
    console.error('总结失败:', error)
    res.send({
      success: false,
      error: `总结失败: ${error.message}`
    })
  }
} 