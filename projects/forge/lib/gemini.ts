import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

export async function streamAgent(
  systemPrompt: string,
  userMessage: string,
  enableSearch: boolean = false
) {
  const tools = enableSearch ? [{ googleSearch: {} }] : undefined;

  const responseStream = await ai.models.generateContentStream({
    model: "gemini-2.5-flash",
    contents: userMessage,
    config: {
      systemInstruction: systemPrompt,
      tools: tools,
    },
  });

  return new ReadableStream({
    async start(controller) {
      for await (const chunk of responseStream) {
        if (chunk.text) {
          controller.enqueue(new TextEncoder().encode(chunk.text));
        }
      }
      controller.close();
    },
  });
}
