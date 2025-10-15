
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { Content } from '../types';

// FIX: Per Gemini API guidelines, the API key must be obtained from `process.env.API_KEY`. This change also fixes the TypeScript error on `import.meta.env`.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const model = 'gemini-2.5-flash';

export async function generateGroundedResponseStream(history: Content[], newMessage: string): Promise<AsyncGenerator<GenerateContentResponse, any, any>> {
  // Append the site operator to the user's message to restrict the search domain.
  const groundedMessage = `${newMessage} site:docs.zama.ai`;

  const result = await ai.models.generateContentStream({
    model: model,
    contents: [...history, { role: 'user', parts: [{ text: groundedMessage }] }],
    config: {
      systemInstruction: 'You are a helpful AI assistant for Zama.ai. Your knowledge is strictly limited to the content from the docs.zama.ai website. Answer user questions based *only* on the provided search results. If the answer is not in the context, say you cannot find the information on the Zama documentation. Always cite your sources.',
      tools: [{googleSearch: {}}],
    },
  });
  return result;
}
