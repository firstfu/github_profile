import OpenAI from "openai";

let openai: OpenAI | null = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "INIT_OPENAI") {
    openai = new OpenAI({
      apiKey: request.apiKey,
    });
    sendResponse({ success: true });
  }

  if (request.type === "GENERATE_PROFILE") {
    if (!openai) {
      sendResponse({ error: "OpenAI API 尚未初始化" });
      return;
    }

    generateProfile(request.data)
      .then(response => sendResponse({ success: true, data: response }))
      .catch(error => sendResponse({ error: error.message }));

    return true; // 非同步回應
  }
});

async function generateProfile(data: any) {
  if (!openai) throw new Error("OpenAI API 尚未初始化");

  const prompt = `請根據以下資訊生成一個 GitHub Profile README.md：
風格：${data.style}
使用者資料：${JSON.stringify(data.userData)}
請生成一個專業的 Markdown 格式的 GitHub Profile。`;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "你是一個專業的 GitHub Profile 生成助手。",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return response.choices[0]?.message?.content;
}
