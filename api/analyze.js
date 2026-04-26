const ANALYZE_MODEL = "gpt-4o-mini";

const ANALYZE_SYSTEM_PROMPT = `
You are Blen's relationship analysis engine.

Analyze the full conversation between the user and AI, then output ONLY valid JSON with this exact schema:
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
  "report_inputs": {
    "headline_keyword": "",
    "relationship_style": "",
    "core_values": [],
    "attraction_pattern": "",
    "communication_style": "",
    "emotional_pattern": "",
    "dealbreakers": [],
    "strengths": [],
    "risks": [],
    "ideal_partner_traits": [],
    "one_line_summary": ""
  },
  "confidence": {
    "overall": 0.0,
    "missing_data": []
  }
}

Rules:
- Values are categorical.
- Numeric fields are normalized 0.0 ~ 1.0.
- If evidence is weak, use 0.5 and "unclear"/"mixed" where appropriate.
- report_inputs must be in Korean and warm/personal.
- Never output markdown or extra text, only JSON.
`.trim();

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
      headline_keyword: "아직 더 알아가는 중",
      relationship_style: "대화 데이터가 충분하지 않아, 조금 더 이야기해보면 더 정확해질 거야.",
      core_values: ["핵심 가치관 판단을 위한 정보가 아직 부족해."],
      attraction_pattern: "끌림 패턴을 특정하기에는 단서가 부족해.",
      communication_style: "갈등 대화 방식 단서가 충분하지 않아.",
      emotional_pattern: "감정 패턴을 읽기엔 데이터가 부족해.",
      dealbreakers: ["상호 존중이 없는 관계", "대화를 단절하는 반복 패턴"],
      strengths: ["추가 대화를 통해 정확도를 높일 수 있어."],
      risks: ["현재 결과는 임시 해석이며 신뢰도가 낮을 수 있어."],
      ideal_partner_traits: ["대화가 성실한 사람", "감정적으로 안정적인 사람"],
      one_line_summary: "지금은 너를 더 깊게 알아가기 위한 시작 단계야.",
    },
    confidence: {
      overall: 0.2,
      missing_data: ["insufficient_conversation_depth"],
    },
  };
}

function extractJson(text) {
  const trimmed = (text || "").trim();
  try {
    return JSON.parse(trimmed);
  } catch (_) {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(trimmed.slice(start, end + 1));
      } catch (_) {
        return null;
      }
    }
    return null;
  }
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

    const sanitizedHistory = messages
      .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .slice(-60);

    const payload = {
      model: ANALYZE_MODEL,
      temperature: 0.2,
      messages: [{ role: "system", content: ANALYZE_SYSTEM_PROMPT }, ...sanitizedHistory],
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
      res.status(500).json({ error: "Analysis service is temporarily unavailable" });
      return;
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || "";
    const parsed = extractJson(content);
    if (!parsed) {
      res.status(200).json(fallbackAnalysis());
      return;
    }

    res.status(200).json(parsed);
  } catch (error) {
    res.status(500).json({ error: error?.message || "Unexpected server error" });
  }
};
