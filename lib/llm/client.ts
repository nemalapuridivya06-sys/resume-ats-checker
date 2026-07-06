export const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqOptions {
  messages: GroqMessage[];
  json?: boolean;
  maxTokens?: number;
  temperature?: number;
}

export async function groqChat({
  messages,
  json,
  maxTokens,
  temperature,
}: GroqOptions): Promise<string | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return null;
  }

  try {
    const body: any = {
      model: MODEL,
      messages,
      temperature: temperature ?? 0.3,
      max_tokens: maxTokens ?? 1024,
    };

    if (json) {
      body.response_format = { type: 'json_object' };
    }

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data?.choices?.[0]?.message?.content || null;
  } catch (error) {
    return null;
  }
}
