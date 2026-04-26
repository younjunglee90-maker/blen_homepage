const ANALYZE_SYSTEM_PROMPT = `
You are Blen’s relationship analysis engine.

Your job:
Analyze the full conversation and convert the user's answers into structured JSON for a relationship report.

Output rules:
- Output JSON only.
- No markdown.
- No explanation.
- No comments.
- Do not continue chatting.
- Do not ask questions.
- Do not diagnose mental health conditions.

Analyze these areas:
1. Values: relationship goal, money/lifestyle, family values, work-life balance
2. Attachment: secure, anxious, avoidant
3. Conflict style: avoidant, aggressive, defensive, solution-oriented
4. Personality: impulsivity, anxiety, empathy, self-control

Scoring:
- Numeric scores must be 0.0 to 1.0.
- If evidence is unclear, use 0.5.
- Strong repeated emotional evidence should increase confidence.

Return this exact JSON structure:

{
  "values": {
    "relationship_goal": "casual | serious | marriage | unclear",
    "money_values": "saving | spending | balance | unclear",
    "lifestyle": "active | relaxed | work_focused | balanced | unclear",
    "family_values": "important | neutral | independent | unclear",
    "work_life_balance": "career_first | balanced | life_first | unclear"
  },
  "attachment": {
    "secure": 0.0,
    "anxious": 0.0,
    "avoidant": 0.0,
    "primary_attachment": "secure | anxious | avoidant | mixed | unclear"
  },
  "conflict_style": {
    "avoidant": 0.0,
    "aggressive": 0.0,
    "defensive": 0.0,
    "solution_oriented": 0.0,
    "primary_conflict_style": "avoidant | aggressive | defensive | solution_oriented | mixed | unclear"
  },
  "personality": {
    "impulsivity": 0.0,
    "anxiety": 0.0,
    "empathy": 0.0,
    "self_control": 0.0
  },
  "report": {
    "headline": "",
    "relationship_style": "",
    "core_values": "",
    "attraction_pattern": "",
    "communication_style": "",
    "emotional_pattern": "",
    "dealbreakers": "",
    "strength_and_risk": "",
    "ideal_partner": "",
    "one_line_summary": ""
  },
  "confidence": {
    "overall": 0.0,
    "missing_data": []
  }
}

Report writing rules:
- Write the report in the user's language.
- If user spoke Korean, write warm natural Korean.
- If user spoke English, write natural English.
- Make it clear, readable, emotionally insightful, and premium.
- Avoid generic statements.
- Do not mention ENRICH, ECR, Gottman, TCI, JSON, or scores.
- Do not label the user negatively.
- Never say data is insufficient.
- Always provide complete content for every report section, using best-fit inference from conversation context.
- "strength_and_risk" should include both strength and gentle caution.
- "one_line_summary" should feel like an emotional closing sentence.
`.trim();

const ANALYZE_MODEL = "gpt-4o-mini";

function fallbackAnalysis() {
  return {
    values: {
      relationship_goal: "unclear",
      money_values: "unclear",
      lifestyle: "unclear",
      family_values: "unclear",
      work_life_balance: "unclear",
    },
    attachment: {
      secure: 0.5,
      anxious: 0.5,
      avoidant: 0.5,
      primary_attachment: "unclear",
    },
    conflict_style: {
      avoidant: 0.5,
      aggressive: 0.5,
      defensive: 0.5,
      solution_oriented: 0.5,
      primary_conflict_style: "unclear",
    },
    personality: {
      impulsivity: 0.5,
      anxiety: 0.5,
      empathy: 0.5,
      self_control: 0.5,
    },
    report_inputs: {
      headline_keyword: "천천히 맞춰가는 연결",
      relationship_style: "너는 관계에서 안정감과 진심을 중요하게 여기는 편이야.",
      core_values: ["상호 존중", "일상 속 꾸준한 신뢰", "감정 표현의 진정성"],
      attraction_pattern: "편안함과 배려가 느껴지는 사람에게 더 깊게 끌리는 패턴이 있어.",
      communication_style: "감정이 생기면 피하기보다 대화로 풀어가려는 성향이 보여.",
      emotional_pattern: "겉으로는 차분해도 마음속으로는 관계의 균형을 섬세하게 살피는 편이야.",
      dealbreakers: ["상호 존중이 없는 관계"],
      strengths: ["감정 공감 능력", "관계를 지키려는 책임감"],
      risks: ["상대 반응에 과하게 신경 쓰며 스스로 지칠 수 있어."],
      ideal_partner_traits: ["감정적으로 안정적인 사람", "갈등을 대화로 풀 수 있는 사람"],
      one_line_summary: "너는 진심을 오래 지켜줄 수 있는 관계에서 가장 빛나는 사람이야.",
    },
    confidence: {
      overall: 0.2,
      missing_data: ["conversation_depth"],
    },
  };
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

function extractJson(text) {
  if (!text || typeof text !== "string") return null;
  try {
    return JSON.parse(text);
  } catch (_) {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) return null;
    try {
      return JSON.parse(text.slice(start, end + 1));
    } catch (_) {
      return null;
    }
  }
}

function toClientReportShape(raw) {
  const base = fallbackAnalysis();
  const report = raw?.report || {};
  return {
    values: { ...base.values, ...(raw?.values || {}) },
    attachment: { ...base.attachment, ...(raw?.attachment || {}) },
    conflict_style: { ...base.conflict_style, ...(raw?.conflict_style || {}) },
    personality: { ...base.personality, ...(raw?.personality || {}) },
    report_inputs: {
      ...base.report_inputs,
      headline_keyword: report.headline || base.report_inputs.headline_keyword,
      relationship_style: report.relationship_style || base.report_inputs.relationship_style,
      core_values:
        typeof report.core_values === "string"
          ? [report.core_values]
          : base.report_inputs.core_values,
      attraction_pattern: report.attraction_pattern || base.report_inputs.attraction_pattern,
      communication_style: report.communication_style || base.report_inputs.communication_style,
      emotional_pattern: report.emotional_pattern || base.report_inputs.emotional_pattern,
      dealbreakers:
        typeof report.dealbreakers === "string"
          ? [report.dealbreakers]
          : base.report_inputs.dealbreakers,
      strengths:
        typeof report.strength_and_risk === "string"
          ? [report.strength_and_risk]
          : base.report_inputs.strengths,
      risks: base.report_inputs.risks,
      ideal_partner_traits:
        typeof report.ideal_partner === "string"
          ? [report.ideal_partner]
          : base.report_inputs.ideal_partner_traits,
      one_line_summary: report.one_line_summary || base.report_inputs.one_line_summary,
    },
    confidence: { ...base.confidence, ...(raw?.confidence || {}) },
  };
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

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: ANALYZE_MODEL,
        temperature: 0.2,
        messages: [
          { role: "system", content: ANALYZE_SYSTEM_PROMPT },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI analyze error: ${errorText}`);
    }

    const data = await response.json();
    const rawText = data?.choices?.[0]?.message?.content || "";
    const parsed = extractJson(rawText);
    if (!parsed || typeof parsed !== "object") {
      res.status(200).json(fallbackAnalysis());
      return;
    }

    res.status(200).json(toClientReportShape(parsed));
  } catch (_) {
    res.status(200).json(fallbackAnalysis());
  }
};