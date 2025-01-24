import type { PlasmoMessaging } from "@plasmohq/messaging"

const API_KEY = process.env.PLASMO_PUBLIC_HF_API_KEY

async function query(data) {
  const response = await fetch(
    "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
    {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(data),
    }
  )
  const result = await response.json()
  return result
}

const handler: PlasmoMessaging.MessageHandler<
  { text: string },
  { success: boolean; summary?: string; error?: string }
> = async (req, res) => {
  console.log("消息处理器被调用")
  const { text } = req.body
  console.log('收到总结请求，文本:', text)

  try {
    console.log('开始调用 API')
    const response = await query({ inputs: text })
    console.log('API 响应:', response)
    
    if (Array.isArray(response) && response[0]?.summary_text) {
      console.log('总结成功:', response[0].summary_text)
      res.send({
        success: true,
        summary: response[0].summary_text
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

export default handler 