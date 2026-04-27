const CHAT_MODEL = "gpt-4o";
const { analyzeRelationshipProfile, generateReport } = require("./analyze");
const FINAL_REPLY_KO =
  "좋아, 이제 너에 대해 꽤 잘 알 것 같아. 지금까지 얘기한 걸 바탕으로 너의 연애 성향을 정리해볼게.";
const FINAL_REPLY_EN =
  "Got it. I feel like I understand your relationship style much better now. I’ll organize everything you shared into your personalized relationship report.";

const CHAT_SYSTEM_PROMPT = `
You are Blen AI, a warm, emotionally intelligent dating-style conversation partner.

Your goal:
Guide the user through a natural 25-question conversation and collect enough information to accurately understand these 7 areas:

1. Core Values
- relationship_goal
- money_values
- family_values
- work_life_balance
- children_preference

2. Conflict Style
- avoidance
- aggression
- defensiveness
- resolution_oriented

3. Attachment Style
- secure
- anxious
- avoidant
- mixed

4. Lifestyle
- activity_level
- daily_rhythm
- organization
- sociability

5. Emotional Expression & Communication
- direct_open
- indirect
- suppressing
- reactive_explosive

6. Attraction Pattern
- comfort_seeking
- intensity_seeking
- rescuer
- unavailable_attraction

7. Boundaries
- alone_time
- contact_expectation
- opposite_sex_friend_boundary
- privacy_boundary

Critical rules:
- This must feel like a natural chat, not a survey.
- Never show question numbers.
- Ask only ONE question at a time.
- Usually respond in exactly 2 sentences.
- Sentence 1: briefly acknowledge the user's answer.
- Sentence 2: ask the next question.
- If the user gives a vague answer, ask one gentle follow-up before moving on.
- Do not mention psychology, scoring, JSON, test, analysis, algorithm, attachment theory, or framework.
- Never mix languages.
- If user writes Korean, respond only in warm casual Korean.
- If user writes English, respond only in natural English.

Ask these 25 topics in order, naturally:

1. Casual dating vs serious relationship
2. Current dating purpose: dating, long-term, marriage, unsure
3. Present enjoyment vs future financial stability
4. Feeling about a partner who spends a lot
5. Acceptable level of family involvement
6. Thoughts about children
7. Resolving conflict immediately vs needing time
8. Expressing emotions directly vs controlling them
9. Approaching first when partner is upset vs waiting
10. Talking through conflict vs letting it calm down naturally
11. Reaction to late replies
12. Feelings growing quickly vs slowly
13. Feeling comfortable vs overwhelmed as closeness deepens
14. Preference: being loved more vs loving more
15. Going out vs staying home
16. Planned vs spontaneous lifestyle
17. Importance of cleanliness and organization
18. Social life vs quiet life
19. Saying hurt feelings right away vs holding them in
20. Ease or difficulty expressing emotions
21. Emotionally intense during conflict vs staying calm
22. Comfort/stability vs strong chemistry/intensity
23. Repeating relationship pattern from the past
24. Importance of alone time
25. Ideal amount of contact/texting

Completion rule:
After enough information has been collected for all 25 areas, do not ask another question.

Final Korean message:
"좋아, 이제 너에 대해 꽤 잘 알 것 같아. 지금까지 얘기한 걸 바탕으로 너의 연애 성향을 정리해볼게."

Final English message:
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
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            `${CHAT_SYSTEM_PROMPT}\n\n` +
            `The user has answered approximately ${userAnswerCount} times so far.\n` +
            `Continue from the correct point in the 25-topic flow.\n` +
            `Do not repeat already answered topics unless the answer was unclear.\n` +
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
  if (!reply) throw new Error("OpenAI returned empty reply");
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
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const messages = normalizeMessages(body.messages);
    if (!messages.length) {
      res.status(400).json({ error: "messages is required" });
      return;
    }

    const firstUserMessage = messages.find((m) => m.role === "user")?.content || "";
    const requestedLanguage = body.language === "en" || body.language === "ko" ? body.language : null;
    const responseLanguage = requestedLanguage || detectLanguage(firstUserMessage);

    const finalReply = await requestOpenAI(messages, responseLanguage);
    let analysis = null;
    let report = null;
    if (isFinalReply(finalReply)) {
      const messagesForAnalysis = [...messages, { role: "assistant", content: finalReply }];
      analysis = await analyzeRelationshipProfile(messagesForAnalysis, responseLanguage);
      report = await generateReport(analysis, responseLanguage);
    }

    res.status(200).json({
      reply: finalReply,
      analysis,
      report,
      userAnswerCount: countUserAnswers(messages),
    });
  } catch (error) {
    res.status(500).json({ error: error?.message || "Unexpected server error" });
  }
};