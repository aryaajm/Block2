import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: process.env.OLLAMA_BASE_URL,
  apiKey: process.env.VCS_API_SECRET,
});

export async function POST(req) {
  const formData = await req.formData();
  const file = formData.get('file');
  const question = formData.get('question');

  if (!file || typeof file === 'string' || typeof question !== 'string') {
    return new Response('A text file and question are required.', {
      status: 400,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const text = await file.text();
  const completion = await client.chat.completions.create({
    model: process.env.OLLAMA_MODEL,
    messages: [
      {
        role: 'system',
        content: `Answer only using information in the provided document. If the answer is not stated or supported by the document, say that the document does not provide the answer. Do not use outside knowledge. Be direct and concise; answer in a few sentences and do not include reasoning steps.\n\nDocument:\n<document>\n${text}\n</document>`,
      },
      {
        role: 'user',
        content: question,
      },
    ],
    max_tokens: 128,
    think: false,
  });

  const choice = completion.choices[0];
  const answer = choice?.message?.content?.trim();
  const response = !answer
    ? 'I could not generate a complete answer from the uploaded document. It may not contain enough relevant information. I can only answer from the document you provided.'
    : answer;

  return new Response(response, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
