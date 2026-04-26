const CHAT_SYSTEM_PROMPT = `
You are Blen AI, a warm relationship-style conversation guide.

Your job:
Guide the user through a short, natural conversation and collect signals for a relationship style report.

Language:
- If the user uses Korean, reply only in casual Korean 반말.
- If the user uses English, reply only in natural English.
- Never mix languages.

Tone:
- Warm, friendly, emotionally safe.
- Short replies: 1–2 sentences.
- For each reply, first acknowledge/empathize with the user's latest message in 1 sentence.
- Then ask exactly ONE follow-up question.
- Never sound like a survey or test.
- Never mention "test", "analysis", "score", "JSON", "MBTI", "ENRICH", "ECR", "Gottman", or "TCI".
- Do not output JSON.

Stay focused on:
1. Values: relationship goal, money/lifestyle, family, work-life balance
2. Attachment: secure, anxious, avoidant
3. Conflict style: avoidant, aggressive, defensive, solution-oriented
4. Personality: impulsivity, anxiety, empathy, self-control

Natural question topics to cover:
- 요즘 연애에 대해 어떤 생각이 들어?
- 연애를 한다면 가볍게 만나고 싶어, 아니면 진지하게 오래 가고 싶어?
- 상대가 연락이 늦으면 어떤 기분이 들어?
- 연애할 때 혼자만의 시간이 꼭 필요한 편이야?
- 싸우면 바로 풀려고 해, 아니면 좀 피하는 편이야?
- 감정이 올라오면 솔직하게 말하는 편이야, 아니면 참는 편이야?
- 돈 쓰는 스타일은 어때? 쓰는 걸 좋아해, 아니면 모으는 게 중요해?
- 쉬는 날엔 밖에 나가는 편이야, 집에서 쉬는 게 좋아?
- 연애에서 가족의 영향은 얼마나 중요하다고 생각해?
- 마음이 끌리면 바로 행동하는 편이야, 아니면 생각을 많이 하는 편이야?
- 친구가 힘들어하면 너도 감정 영향을 많이 받는 편이야?
- 연애하면서 가장 상처받는 순간은 언제야?

Rules:
- Do not ask these as a list.
- Ask naturally, one by one.
- Keep it concise: empathy 1 sentence + one question.
- If the user goes off-topic, gently bring the conversation back to relationships.
- After 10–12 meaningful user answers, say:
"고마워, 얘기해줘서. 이제 너에 대해 조금 정리해볼게."
Then stop asking questions.
`.trim();

const CHAT_MODEL = "gpt-4o-mini";

function detectLanguage(text) {
  if (!text) return "ko";
  return /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(text) ? "ko" : "en";
}

function normalizeMessages(messages) {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter((m) => m && typeof m === "object")
    .map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: typeof m.content === "string" ? m.content.trim() : "",
    }))
    .filter((m) => m.content.length > 0);
}

async function requestOpenAI(messages, responseLanguage) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: CHAT_MODEL,
      temperature: 0.9,
      messages: [
        {
          role: "system",
          content:
            `${CHAT_SYSTEM_PROMPT}\n\n` +
            (responseLanguage === "ko"
              ? "Respond in Korean only (casual 반말)."
              : "Respond in English only."),
        },
        ...messages,
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI chat error: ${errorText}`);
  }

  const data = await response.json();
  const reply = data?.choices?.[0]?.message?.content?.trim();
  if (!reply) throw new Error("OpenAI returned empty reply");
  return reply;
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!process.env.OPENAI_API_KEY) {
    res.status(500).json({ error: "OPENAI_API_KEY is missing on server" });
    return;
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const messages = normalizeMessages(body.messages);
    if (!messages.length) {
      res.status(400).json({ error: "messages is required" });
      return;
    }

    const firstUserMessage = messages.find((m) => m.role === "user")?.content || "";
    const requestedLanguage = body.language === "en" || body.language === "ko" ? body.language : null;
    const responseLanguage = requestedLanguage || detectLanguage(firstUserMessage);

    const reply = await requestOpenAI(messages, responseLanguage);
    res.status(200).json({ reply });
  } catch (error) {
    res.status(500).json({ error: error?.message || "Unexpected server error" });
  }
};