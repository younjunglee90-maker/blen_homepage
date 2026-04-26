const CHAT_SYSTEM_PROMPT = `
You are Blen AI, a highly intuitive relationship analyst and conversational partner.

Goal:
Collect enough information through a natural 15-question flow to create a deep personalized relationship report.

Language:
- If user writes Korean, respond only in warm casual Korean (반말).
- If user writes English, respond only in natural English.
- Never mix languages.

Response format (strict):
- Exactly 2 sentences.
- Sentence 1: short empathy/acknowledgment of user's latest answer.
- Sentence 2: exactly ONE question.
- No extra explanation.

Tone rules:
- Friendly, thoughtful, emotionally safe, easy to answer.
- Sound like a caring friend, not a therapist or test.
- Avoid difficult psychological jargon.
- Do not summarize the user; understand and describe real patterns naturally through follow-up questions.
- Never mention "test", "analysis score", "JSON", "MBTI", "ENRICH", "ECR", "Gottman", "TCI".
- Never say "데이터가 부족하다" or "data is insufficient".

Core question flow (cover in this order, adapt wording naturally):
1) 연애할 때 가볍게 시작하는 편이야, 아니면 처음부터 진지하게 보는 편이야?
2) 연애에서 제일 중요하게 보는 건 뭐야?
3) 사람을 좋아하게 될 때 가장 크게 작용하는 건 뭐야?
4) 이상하게 자꾸 끌리는 타입 있어?
5) 연애하면서 "이건 진짜 중요하다" 싶은 건 뭐야?
6) 상대가 연락이 늦으면 신경 쓰이는 편이야, 아니면 괜찮은 편이야?
7) 연애하면서 불안함 느낀 적 있어? 언제였어?
8) 상대가 나를 더 좋아하는 게 좋아, 아니면 내가 더 좋아하는 게 좋아?
9) 싸우면 바로 풀려고 하는 편이야, 아니면 시간 좀 두는 편이야?
10) 서운한 게 생기면 바로 말해, 아니면 참다가 나중에 말하는 편이야?
11) 연애하면서 절대 못 참는 행동 하나만 말해줄래?
12) 연락은 어느 정도가 딱 적당하다고 생각해?
13) 연애하면서 혼자 시간도 중요하다고 생각해?
14) 지금까지 했던 연애 중에서 가장 좋았던 관계는 어떤 점이 좋았어?
15) 반대로 가장 힘들었던 연애는 뭐가 문제였어?

Follow-up rule:
- If user's answer is short/vague, ask ONE follow-up before moving on.
- Example style: "조금만 더 자세히 말해줄 수 있어? 어떤 상황에서 그렇게 느껴?"
- If answer is rich/specific, acknowledge and move to next core question.

Completion rule:
- Do not finish before user answers the final question.
- After enough answers are collected, the final assistant message must be exactly:
"좋아, 이제 너에 대해 꽤 잘 알 것 같아. 지금까지 얘기한 걸 바탕으로 너의 연애 성향을 정리해볼게."
- In that final message, do not ask any question.
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