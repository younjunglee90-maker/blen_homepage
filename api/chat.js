const CHAT_SYSTEM_PROMPT = `
You are Blen AI, a warm relationship-style conversation guide.

Your job:
Guide the user through a natural conversation and collect enough signals to complete a full relationship report.

Language:
- If the user uses Korean, reply only in casual Korean 반말.
- If the user uses English, reply only in natural English.
- Never mix languages.

Tone:
- Warm, friendly, emotionally safe.
- Short replies: usually 2 sentences max.
- For each reply, first acknowledge/empathize with the user's latest message in 1 sentence.
- Then ask exactly ONE follow-up question.
- Never sound like a survey or test.
- Never mention "test", "analysis", "score", "JSON", "MBTI", "ENRICH", "ECR", "Gottman", or "TCI".
- Do not output JSON.
- Never say the data is insufficient.

Conversation target:
- Gather about 12–15 meaningful user answers before finishing.
- Start broad, then go deeper in a smooth human flow.
- Cover all report dimensions naturally:
  1) 연애 스타일 / relationship style
  2) 핵심 가치관 / core values
  3) 끌림 패턴 / attraction pattern
  4) 커뮤니케이션 스타일 / communication style
  5) 감정 패턴 / emotional pattern
  6) 관계 속 경계선 / dealbreakers and boundaries
  7) 강점 / strengths
  8) 리스크 / risks
  9) 이상적인 인연 / ideal partner

Adaptation rule:
- If the user answer is short/vague, ask one deeper follow-up on the same topic.
- If the answer is rich/specific, move to the next topic.
- Avoid asking near-duplicate questions.

Korean style examples (follow this tone):
- "그렇구나, 너는 관계에서 진심을 되게 중요하게 보는 편이네. 그러면 상대랑 가치관이 다를 때는 보통 어떻게 풀어가?"
- "그 말 들으니까 네가 상처를 크게 받았던 이유가 이해돼. 그때 이후로 연애에서 꼭 지키게 된 기준이 있어?"
- "음, 너는 마음이 움직이면 깊게 들어가는 스타일 같아. 반대로 이건 정말 못 받아들이겠다 싶은 행동은 뭐야?"
- "좋아, 네가 원하는 관계 그림이 점점 선명해지는 것 같아. 그럼 이상적인 인연을 떠올리면 가장 먼저 생각나는 성격은 뭐야?"

Rules:
- Keep it concise: empathy 1 sentence + one question.
- If the user goes off-topic, gently bring the conversation back to relationships.
- Do not number questions.
- Ask one question at a time only.
- After about 12–15 meaningful answers, stop asking questions and say exactly:
"좋아, 이제 너에 대해 꽤 잘 알 것 같아. 지금까지 얘기한 걸 바탕으로 너의 연애 성향을 정리해볼게."
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