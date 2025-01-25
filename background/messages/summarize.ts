import type { PlasmoMessaging } from "@plasmohq/messaging"
import { OpenAI } from "openai";

const client = new OpenAI({
	baseURL: "https://api.deepseek.com",
	apiKey: "sk-e0c1096af22f435eb77ee856a84ebf3f"
});

async function query(data) {
	const chatCompletion = await client.chat.completions.create({
		model: "deepseek-chat",
		messages: [
			{
				role: "user",
				content: `请用中文总结以下内容，要求简洁明了：\n\n${data.inputs}`
			}
		],
		max_tokens: 500
	});
	return chatCompletion.choices[0].message;
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
    
    if (Array.isArray(response)) {
      const summary = response[0]?.generated_text || response[0]?.text || response[0]
      if (summary) {
        console.log('总结成功:', summary)
        res.send({
          success: true,
          summary: summary
        })
        return
      }
    }
    
    throw new Error('无效的响应格式：' + JSON.stringify(response))
  } catch (error) {
    console.error('总结失败:', error)
    res.send({
      success: false,
      error: `总结失败: ${error.message}`
    })
  }
}

export default handler 