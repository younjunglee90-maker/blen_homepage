const CHAT_MODEL = "gpt-4o-mini";

const CHAT_SYSTEM_PROMPT = `
너는 Blen의 AI 대화 파트너야.
역할: 따뜻하고 감정적으로 안전한 친구처럼 대화하며, 사용자의 연애 성향을 자연스럽게 파악한다.

대화 규칙:
- 한국어 반말 톤으로 말해.
- 다정하고 비판하지 않는 태도를 유지해.
- 한 번에 질문 하나만 해.
- 설문/테스트/평가처럼 들리지 않게 해.
- "분석", "테스트", "MBTI" 같은 단어를 직접적으로 꺼내지 마.
- 너무 길게 말하지 말고 1~3문장으로 응답해.
- 사용자가 감정을 표현하면 먼저 공감하고, 이후 자연스러운 후속 질문을 해.
- 첫 사용자 메시지 언어를 기준으로 응답 언어를 고정해.
- 사용자가 한국어면 한국어 반말로만 응답해.
- 사용자가 영어면 자연스러운 영어로만 응답해.
- 한 응답 안에서 언어를 섞지 마.
- 사용자가 요청하지 않으면 번역하지 마.

목표:
- 사용자와 자연스럽게 대화하면서 관계 가치관/애착/갈등 성향/성격 단서를 점진적으로 수집한다.
- 대화는 따뜻하고 몰입감 있게 유지한다.
- 절대 JSON이나 내부 추론 과정을 사용자에게 노출하지 않는다.
`.trim();

function detectLanguage(text) {
  if (!text) return "ko";
  const hasHangul = /[가-힣]/.test(text);
  if (hasHangul) return "ko";
  const hasLatin = /[A-Za-z]/.test(text);
  if (hasLatin) return "en";
  return "ko";
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!process.env.OPENAI_API_KEY) {
    res.status(500).json({ error: "Missing OPENAI_API_KEY" });
    return;
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const messages = Array.isArray(body.messages) ? body.messages : [];
    if (!messages.length) {
      res.status(400).json({ error: "Missing messages" });
      return;
    }
    const explicitLanguage = body.language === "en" || body.language === "ko" ? body.language : null;

    const sanitizedHistory = messages
      .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .slice(-30);

    const firstUserMessage = sanitizedHistory.find((m) => m.role === "user")?.content || "";
    const userLanguage = explicitLanguage || detectLanguage(firstUserMessage);
    const languageInstruction =
      userLanguage === "en"
        ? "Language lock: Reply only in natural English. Keep it warm, conversational, and not overly formal."
        : "언어 고정: 한국어 반말로만 응답해. 따뜻하고 자연스럽게 말해.";

    const payload = {
      model: CHAT_MODEL,
      temperature: 0.8,
      messages: [
        { role: "system", content: `${CHAT_SYSTEM_PROMPT}\n\n${languageInstruction}` },
        ...sanitizedHistory,
      ],
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      res.status(500).json({ error: "AI chat service is temporarily unavailable" });
      return;
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content?.trim();
    if (!content) {
      res.status(502).json({ error: "Empty AI response" });
      return;
    }

    res.status(200).json({ reply: content });
  } catch (error) {
    res.status(500).json({ error: error?.message || "Unexpected server error" });
  }
};
