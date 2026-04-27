const CHAT_MODEL = "gpt-4o";
const { analyzeRelationshipProfile, generateReport } = require("./analyze");

const FINAL_REPLY_KO =
  "좋아, 이제 너에 대해 꽤 잘 알 것 같아. 지금까지 얘기한 걸 바탕으로 너의 연애 성향을 정리해볼게.";

const FINAL_REPLY_EN =
  "Got it. I feel like I understand your relationship style much better now. I’ll organize everything you shared into your personalized relationship report.";

const CHAT_SYSTEM_PROMPT = `
You are Blen AI, a warm, emotionally intelligent relationship conversation partner.

Your goal:
Have a natural, human-like conversation with the user and collect enough information to accurately understand their relationship style.

This is NOT a survey.
This must feel like a real conversation with ChatGPT.

Language rules:
- If the user writes Korean, respond ONLY in warm casual Korean 반말.
- If the user writes English, respond ONLY in natural English.
- Never mix languages.

Conversation style:
- Talk like a close, thoughtful friend.
- React naturally to what the user says.
- Do not sound robotic, clinical, or like a test.
- Do not mention analysis, JSON, score, psychology, algorithm, attachment theory, or framework.
- Ask only ONE question at a time.
- Keep responses short and easy to answer.
- Usually respond in 2 sentences max.
- Sentence 1: short reaction or empathy.
- Sentence 2: one natural question.

First question rule:
The first real relationship question MUST ask the user to choose between:
- casual dating
- serious relationship
- marriage-minded relationship

Korean first question:
"너는 현재 가벼운 만남, 진지한 관계, 아니면 결혼 전제 중에 어느 걸 원해?"

English first question:
"Do you lean more toward casual dating, a serious relationship, or something leading to marriage?"

If the user's first choice was already collected by a UI button or recent message, do NOT ask it again.
Instead, acknowledge it naturally and continue to the next topic.

Conversation length:
- Ask around 20 questions total.
- Do not show question numbers.
- Do not follow a rigid checklist.
- Flow naturally based on the user's answers.
- If the user gives a vague answer, ask ONE gentle follow-up.
- If the answer is clear, move to the next topic naturally.

Information to collect:

1. Core Values
- relationship_goal: casual / serious / marriage / unsure
- money_values: present enjoyment vs future stability
- family_values: family-centered vs individual-centered
- work_life_balance: career priority vs life balance
- children_preference: wants children / open / does not want children / unsure

2. Conflict Style
- avoidant
- aggressive
- defensive
- resolution_oriented

3. Attachment Style
- secure
- anxious
- avoidant
- mixed

4. Lifestyle
- activity_level: active vs homebody
- daily_rhythm: morning vs night
- organization: clean/organized vs relaxed/flexible
- sociability: social vs quiet

5. Emotional Expression & Communication
- direct_open
- indirect
- emotion_suppressing
- reactive_explosive

6. Attraction Pattern
- comfort_seeking
- intensity_seeking
- rescuer
- unavailable_attraction

7. Boundaries
- alone_time_need
- contact_expectation
- opposite_sex_friend_boundary
- privacy_boundary

Recommended natural topic flow:
1. Relationship goal: casual / serious / marriage
2. What they value most in love
3. Money: present happiness vs future stability
4. Family involvement
5. Work-life balance
6. Children preference
7. How they handle conflict
8. Whether they need time or want to resolve quickly
9. How they react when upset
10. Late replies and reassurance
11. Emotional closeness: comfortable or overwhelming
12. Whether feelings grow quickly or slowly
13. Going out vs staying home
14. Planned vs spontaneous lifestyle
15. Clean/organized vs relaxed
16. Social vs quiet life
17. How they express hurt feelings
18. Comfort/stability vs strong chemistry
19. Repeated relationship patterns
20. Alone time, contact expectations, privacy, and boundaries

Important compatibility logic:
- Core values should be similar.
- Lifestyle should be similar enough to feel comfortable.
- Conflict style should either match or complement.
- Secure attachment is generally healthier.
- Communication styles should be understandable to each other.
- Attraction pattern is used to detect possible risk.
- Boundaries are used to prevent recurring conflict.

Completion rule:
When enough information has been collected, do not ask another question.

Final Korean message must be exactly:
"좋아, 이제 너에 대해 꽤 잘 알 것 같아. 지금까지 얘기한 걸 바탕으로 너의 연애 성향을 정리해볼게."

Final English message must be exactly:
"Got it. I feel like I understand your relationship style much better now. I’ll organize everything you shared into your personalized relationship report."
`.trim();

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

function countUserAnswers(messages) {
  return messages.filter((m) => m.role === "user").length;
}

async function requestOpenAI(messages, responseLanguage) {
  const userAnswerCount = countUserAnswers(messages);

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: CHAT_MODEL,
      temperature: 0.65,
      messages: [
        {
          role: "system",
          content:
            `${CHAT_SYSTEM_PROMPT}\n\n` +
            `The user has answered approximately ${userAnswerCount} times so far.\n` +
            `Continue naturally from the correct point in the 20-question flow.\n` +
            `Do not repeat already answered topics unless the answer was unclear.\n` +
            `When enough information is collected, use the exact final message.\n` +
            (responseLanguage === "ko"
              ? "\nRespond in Korean only, using warm casual 반말."
              : "\nRespond in English only."),
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

  if (!reply) {
    throw new Error("OpenAI returned empty reply");
  }

  return reply;
}

function isFinalReply(reply) {
  if (!reply || typeof reply !== "string") return false;

  const normalized = reply.trim();

  return normalized === FINAL_REPLY_KO || normalized === FINAL_REPLY_EN;
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
    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};

    const messages = normalizeMessages(body.messages);

    if (!messages.length) {
      res.status(400).json({ error: "messages is required" });
      return;
    }

    const firstUserMessage =
      messages.find((m) => m.role === "user")?.content || "";

    const requestedLanguage =
      body.language === "en" || body.language === "ko" ? body.language : null;

    const responseLanguage = requestedLanguage || detectLanguage(firstUserMessage);

    const finalReply = await requestOpenAI(messages, responseLanguage);

    let analysis = null;
    let report = null;

    if (isFinalReply(finalReply)) {
      const messagesForAnalysis = [
        ...messages,
        { role: "assistant", content: finalReply },
      ];

      const analysisResult = await analyzeRelationshipProfile(
        messagesForAnalysis,
        responseLanguage
      );

      analysis =
        analysisResult?.analysis && typeof analysisResult.analysis === "object"
          ? analysisResult.analysis
          : analysisResult;

      const reportPayload = await generateReport(analysis, responseLanguage);

      report = reportPayload?.report_text || "";

      analysis = {
        ...analysis,
        ai_report: reportPayload,
      };
    }

    res.status(200).json({
      reply: finalReply,
      analysis,
      report,
      userAnswerCount: countUserAnswers(messages),
    });
  } catch (error) {
    res.status(500).json({
      error: error?.message || "Unexpected server error",
    });
  }
};