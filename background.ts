
let selectedText = ''

// 监听插件图标点击事件
chrome.action.onClicked.addListener((tab) => {
  // 打开侧边栏
  chrome.sidePanel.open({ windowId: tab.windowId })
})

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
