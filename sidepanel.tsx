import React, { useEffect, useState, useRef } from 'react'
import './style.css'
import { sendToBackground } from "@plasmohq/messaging"

const SidePanel = () => {
  const [selectedText, setSelectedText] = useState('')
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)
  const [displayedSummary, setDisplayedSummary] = useState('')
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    // 监听来自 background 的消息
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === "updateSidePanelContent") {
        setSelectedText(request.text || '')
        setSummary('')
        setDisplayedSummary('')
      }
    })
  }, [])

  // 打字机效果
  useEffect(() => {
    if (summary) {
      let index = 0
      const timer = setInterval(() => {
        if (index <= summary.length) {
          setDisplayedSummary(summary.slice(0, index))
          index++
        } else {
          clearInterval(timer)
        }
      }, 50) // 每50ms显示一个字符

      return () => clearInterval(timer)
    }
  }, [summary])

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedText)
      .then(() => alert('内容已复制到剪贴板'))
  }

  const handleSave = () => {
    const blob = new Blob([selectedText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'selected-text.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleSummarize = async () => {
    if (!selectedText) {
      alert("请先选择要总结的文本")
      return
    }

    try {
      setLoading(true)
      // 创建新的 AbortController
      abortControllerRef.current = new AbortController()

      const response = await sendToBackground<
        { text: string },
        { success: boolean; summary?: string; error?: string }
      >({
        name: "summarize",
        body: {
          text: selectedText
        }
      })

      if (response.success && response.summary) {
        setSummary(response.summary)
      } else {
        alert(response.error || "总结失败")
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('总结被取消')
      } else {
        console.error('请求错误:', error)
        alert(`请求错误: ${error.message}`)
      }
    } finally {
      setLoading(false)
      abortControllerRef.current = null
    }
  }

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setLoading(false)
    }
  }

  return (
    <div className="sidepanel-container">
      <div className="top-panel">
        <div className="button-group">
          {loading ? (
            <button 
              className="cancel-button"
              onClick={handleCancel}
            >
              取消总结
            </button>
          ) : (
            <button
              className="summarize-button"
              onClick={handleSummarize}
              disabled={!selectedText}
            >
              总结内容
            </button>
          )}
        </div>

        {displayedSummary && (
          <div className="summary-container">
            <h3>总结结果：</h3>
            <div className="summary-content">{displayedSummary}</div>
          </div>
        )}
      </div>
      <div className="bottom-panel">
        <div className="controls">
          <button onClick={handleCopy}>复制内容</button>
          <button onClick={handleSave}>保存为文件</button>
        </div>
        {selectedText || '请选择文字'}
      </div>
    </div>
  )
}

export default SidePanel