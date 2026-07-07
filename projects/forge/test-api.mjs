import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function test() {
  try {
    const responseStream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: "Hello, what is 2+2?",
    });
    for await (const chunk of responseStream) {
      console.log(chunk.text);
    }
  } catch (err) {
    console.error("ERROR:", err.message);
  }
}
test();
