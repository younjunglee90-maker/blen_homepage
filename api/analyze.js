const ANALYZE_MODEL = "gpt-4o";

const ANALYZE_SYSTEM_PROMPT = `
You are Blen AI's internal relationship analysis engine.

Your task:
Analyze the full conversation between the user and Blen AI, then extract structured relationship indicators.

Important:
- Output JSON only.
- Do not include markdown.
- Do not explain.
- Do not include comments.
- Use scores from 1.0 to 5.0.
- 1.0 = very low / strongly opposite
- 3.0 = neutral / unclear / balanced
- 5.0 = very high / strongly present
- Use one decimal place.
- If evidence is weak, use 3.0 and lower confidence.
- Do not overdiagnose.
- Do not use clinical labels beyond the schema.
- Base your judgment only on what the user actually said.

Return this exact JSON structure:

{
  "core_values": {
    "relationship_goal": {
      "type": "casual | serious | marriage | unsure",
      "confidence": 0.0
    },
    "money_values": {
      "present_enjoyment": 3.0,
      "future_stability": 3.0,
      "spending_tolerance": 3.0,
      "primary": "present_enjoyment | future_stability | balanced",
      "confidence": 0.0
    },
    "family_values": {
      "family_centered": 3.0,
      "individual_centered": 3.0,
      "family_involvement_tolerance": 3.0,
      "primary": "family_centered | individual_centered | balanced",
      "confidence": 0.0
    },
    "work_life_balance": {
      "career_priority": 3.0,
      "life_balance_priority": 3.0,
      "relationship_priority": 3.0,
      "primary": "career_priority | life_balance_priority | relationship_priority | balanced",
      "confidence": 0.0
    },
    "children_preference": {
      "type": "wants_children | open_to_children | does_not_want_children | unsure",
      "confidence": 0.0
    }
  },

  "conflict_style": {
    "scores": {
      "avoidant": 3.0,
      "aggressive": 3.0,
      "defensive": 3.0,
      "resolution_oriented": 3.0
    },
    "primary": "avoidant | aggressive | defensive | resolution_oriented | mixed",
    "mixed": false,
    "confidence": 0.0
  },

  "attachment_style": {
    "scores": {
      "secure": 3.0,
      "anxious": 3.0,
      "avoidant": 3.0
    },
    "primary": "secure | anxious | avoidant | mixed",
    "mixed": false,
    "confidence": 0.0
  },

  "lifestyle": {
    "activity_level": {
      "active": 3.0,
      "homebody": 3.0,
      "primary": "active | homebody | balanced",
      "confidence": 0.0
    },
    "daily_rhythm": {
      "morning_type": 3.0,
      "night_type": 3.0,
      "primary": "morning_type | night_type | flexible",
      "confidence": 0.0
    },
    "organization": {
      "clean_organized": 3.0,
      "relaxed_flexible": 3.0,
      "primary": "clean_organized | relaxed_flexible | balanced",
      "confidence": 0.0
    },
    "sociability": {
      "social": 3.0,
      "quiet": 3.0,
      "primary": "social | quiet | balanced",
      "confidence": 0.0
    }
  },

  "communication": {
    "scores": {
      "direct_open": 3.0,
      "indirect": 3.0,
      "emotion_suppressing": 3.0,
      "reactive_explosive": 3.0
    },
    "primary": "direct_open | indirect | emotion_suppressing | reactive_explosive | mixed",
    "mixed": false,
    "confidence": 0.0
  },

  "attraction_pattern": {
    "scores": {
      "comfort_seeking": 3.0,
      "intensity_seeking": 3.0,
      "rescuer": 3.0,
      "unavailable_attraction": 3.0
    },
    "primary": "comfort_seeking | intensity_seeking | rescuer | unavailable_attraction | mixed",
    "mixed": false,
    "confidence": 0.0
  },

  "boundaries": {
    "alone_time_need": 3.0,
    "contact_expectation": 3.0,
    "opposite_sex_friend_boundary": 3.0,
    "privacy_boundary": 3.0,
    "primary": "high_boundary | moderate_boundary | low_boundary",
    "confidence": 0.0
  },

  "summary": {
    "relationship_style_title": "",
    "one_sentence_summary": "",
    "strengths": [],
    "possible_challenges": [],
    "best_match_traits": [],
    "risk_match_traits": []
  }
}

Scoring guide:

Conflict style:
- avoidant high: avoids talking, needs long silence, waits for problems to disappear.
- aggressive high: uses sharp words, raises voice, attacks, blames.
- defensive high: feels accused easily, explains/protects self before listening.
- resolution_oriented high: wants to understand, repair, talk calmly, solve together.

Attachment style:
- secure high: comfortable with closeness, trusts partner, communicates needs.
- anxious high: worries about replies, fears losing partner, needs reassurance.
- avoidant high: feels overwhelmed by closeness, needs distance, dislikes dependency.

Communication:
- direct_open high: says feelings clearly and early.
- indirect high: hints, expects partner to notice.
- emotion_suppressing high: holds feelings in, avoids burdening partner.
- reactive_explosive high: emotions come out suddenly or intensely.

Attraction pattern:
- comfort_seeking high: drawn to stability, kindness, calmness, safety.
- intensity_seeking high: drawn to chemistry, excitement, emotional highs.
- rescuer high: drawn to people they want to fix, help, or save.
- unavailable_attraction high: drawn to emotionally distant or inconsistent people.

Boundary:
- alone_time_need: 1 = wants constant togetherness, 5 = strongly needs personal time.
- contact_expectation: 1 = low contact, 5 = frequent contact.
- opposite_sex_friend_boundary: 1 = very open, 5 = strict boundary.
- privacy_boundary: 1 = shares almost everything, 5 = needs strong privacy.

Mixed rule:
If the highest score and second-highest score are within 0.5, set primary to "mixed" and mixed to true.

Confidence:
- 0.9 to 1.0 = very clear evidence
- 0.7 to 0.8 = clear evidence
- 0.5 to 0.6 = moderate evidence
- 0.3 to 0.4 = weak evidence
- 0.0 to 0.2 = insufficient evidence
`.trim();

const REPORT_SYSTEM_PROMPT = `
You are Blen AI, an expert relationship analyst.

Your task:
Turn structured JSON data into a highly personal, emotionally engaging, story-driven relationship report.

Rules:
- Write like a human, not a robot.
- Make it feel personal, warm, and insightful.
- Do NOT mention scores, numbers, or JSON.
- Do NOT sound like a psychologist.
- Do NOT explain the analysis process.
- Make it feel like you truly understand the person.
- Avoid abstract generic statements.
- Use concrete emotional situations and behavior patterns.
- If data is incomplete, infer carefully and phrase softly.

Structure:
Return exactly these 14 sections as keys inside "final_report":
1. "한 줄 요약"
2. "너의 연애 핵심"
3. "너의 연애 스타일"
4. "너가 사랑에 빠지는 방식"
5. "연애할 때 너의 모습"
6. "갈등 생기면 너는 이렇게 함"
7. "너의 연애 강점"
8. "너의 연애 리스크"
9. "너랑 잘 맞는 사람"
10. "너를 위한 연애 조언"
11. "갈등을 다루는 방식 설명"
12. "애착 흐름 설명"
13. "대화 스타일 설명"
14. "관계 경계선 설명"

Output JSON shape:
{
  "report_text": "full readable report in markdown-like plain text",
  "core_keywords": ["", "", ""],
  "final_report": {
    "한 줄 요약": "",
    "너의 연애 핵심": "",
    "너의 연애 스타일": "",
    "너가 사랑에 빠지는 방식": "",
    "연애할 때 너의 모습": "",
    "갈등 생기면 너는 이렇게 함": "",
    "너의 연애 강점": "",
    "너의 연애 리스크": "",
    "너랑 잘 맞는 사람": "",
    "너를 위한 연애 조언": "",
    "갈등을 다루는 방식 설명": "",
    "애착 흐름 설명": "",
    "대화 스타일 설명": "",
    "관계 경계선 설명": ""
  }
}

core_keywords rules:
- 반드시 3개를 반환해.
- 각 키워드는 2~6글자(영문은 2~14자) 정도의 짧은 핵심 단어/짧은 구로 작성.
- 태그 UI에 들어갈 표현이라 문장형 금지.
- 서로 겹치지 않게 성향의 다른 측면을 반영.
- 한국어 보고서면 한국어 키워드, 영어 보고서면 영어 키워드.

Tone:
- Warm, insightful, slightly emotional and shareable
- Clear and easy to read
- Slightly premium / “wow this is me” feeling

Language:
- Korean if user is Korean
- English if user is English

Important:
- Make it feel like "this is exactly me"
- Avoid generic phrases
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
      headline_keyword: "선명한 감정 기준형",
      relationship_style: "너는 가볍게 흘러가는 관계보다, 신뢰와 일관성이 쌓이는 관계에서 훨씬 편안함을 느끼는 편이야.",
      core_values: ["솔직한 대화", "감정적 안정감", "서로에 대한 존중"],
      attraction_pattern: "처음의 강한 자극보다 오래 함께 있어도 편안한 사람에게 더 깊게 끌리는 경향이 있어.",
      communication_style: "서운함을 오래 묵히기보다, 타이밍을 보고 핵심을 꺼내서 대화로 풀고 싶어 하는 편이야.",
      emotional_pattern: "겉으로는 침착해도 관계의 온도 변화는 빠르게 감지해서 마음속에서 먼저 정리하려는 성향이 보여.",
      dealbreakers: ["말과 행동이 반복해서 달라지는 태도", "존중 없는 말투"],
      strengths: ["감정 공감력", "관계를 지키는 책임감", "대화 회복 의지"],
      risks: ["애매한 신호를 오래 붙잡으면 혼자 소모될 수 있어."],
      ideal_partner_traits: ["감정적으로 안정적인 사람", "말보다 행동이 일관된 사람"],
      one_line_summary: "너는 확신 없는 관계를 오래 버티기보다, 진심이 보이는 사람에게 깊게 몰입하는 타입이야.",
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

function detectLanguage(text) {
  if (!text) return "ko";
  return /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(text) ? "ko" : "en";
}

async function generateReport(analysis, language = "ko") {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      temperature: 0.8,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            REPORT_SYSTEM_PROMPT +
            (language === "ko"
              ? "\nWrite the report in Korean."
              : "\nWrite the report in English."),
        },
        {
          role: "user",
          content: JSON.stringify(analysis),
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI report error: ${errorText}`);
  }

  const data = await response.json();
  const raw = data?.choices?.[0]?.message?.content?.trim();
  if (!raw) {
    throw new Error("OpenAI returned empty report payload");
  }
  const parsed = extractJson(raw);
  if (!parsed || typeof parsed !== "object") {
    throw new Error("OpenAI returned invalid report JSON");
  }
  warnIfReportShapeIncomplete(parsed);
  return parsed;
}

async function analyzeRelationshipProfile(messages, responseLanguage = "ko") {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: ANALYZE_MODEL,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            `${ANALYZE_SYSTEM_PROMPT}\n\n${REPORT_SYSTEM_PROMPT}` +
            "\n\nReturn summary text in " +
            (responseLanguage === "ko" ? "Korean." : "English."),
        },
        {
          role: "user",
          content: JSON.stringify({
            conversation: messages,
          }),
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI analysis error: ${errorText}`);
  }

  const data = await response.json();
  const raw = data?.choices?.[0]?.message?.content;

  if (!raw) {
    throw new Error("OpenAI returned empty analysis");
  }

  return JSON.parse(raw);
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

function warnIfReportShapeIncomplete(parsed) {
  if (!parsed || typeof parsed !== "object") return;
  if (process.env.NODE_ENV === "production") return;
  const missing = [];
  if (!parsed.final_report || typeof parsed.final_report !== "object") {
    missing.push("final_report");
  }
  if (!parsed.report_text || typeof parsed.report_text !== "string" || !parsed.report_text.trim()) {
    missing.push("report_text");
  }
  if (missing.length) {
    console.warn(
      `[Blen][analyze] Missing expected report fields: ${missing.join(", ")}`
    );
  }
}

function logAnalyzeDebug(message, extra) {
  if (process.env.NODE_ENV === "production") return;
  if (extra) {
    console.warn(`[Blen][analyze] ${message}`, extra);
  } else {
    console.warn(`[Blen][analyze] ${message}`);
  }
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function toFivePointScore(raw, fallback = 3) {
  if (typeof raw !== "number" || Number.isNaN(raw)) return fallback;
  const normalized = raw <= 1 ? raw * 5 : raw;
  return Math.round(clamp(normalized, 1, 5) * 10) / 10;
}

function getLevelLabel(score, leftLabel, rightLabel) {
  if (score <= 1.7) return `${leftLabel} 강함`;
  if (score <= 2.6) return `${leftLabel} 성향`;
  if (score <= 3.4) return `균형형`;
  if (score <= 4.3) return `${rightLabel} 성향`;
  return `${rightLabel} 강함`;
}

function getRelationshipGoalLabel(score, openness) {
  if (score <= 1.7) return "가벼운 만남 선호";
  if (score <= 2.6) return "부담 없는 관계 중심";
  if (score <= 3.4) return "진지한 관계 중심";

  if (score <= 4.3) {
    if (openness) {
      return "진지한 관계 중심 (결혼 가능성 열려 있음)";
    }
    return "장기 관계 지향";
  }

  return "결혼 지향형";
}

function getMoneyLabel(score) {
  if (score <= 1.7) return "현재 행복 우선형";
  if (score <= 2.6) return "즐김 중심 소비형";
  if (score <= 3.4) return "균형 소비형";
  if (score <= 4.3) return "안정 지향 소비형";
  return "미래 안정 우선형";
}

function getFamilyLabel(score) {
  if (score <= 1.7) return "가족 중심형";
  if (score <= 2.6) return "가족 유대 중시형";
  if (score <= 3.4) return "가족-개인 균형형";
  if (score <= 4.3) return "커플 독립 중시형";
  return "개인/커플 중심형";
}

function getWorkLifeLabel(score) {
  if (score <= 1.7) return "커리어 몰입형";
  if (score <= 2.6) return "성장 지향형";
  if (score <= 3.4) return "일과 삶 균형형";
  if (score <= 4.3) return "삶의 여유 지향형";
  return "라이프 중심형";
}

function getChildrenLabel(score) {
  if (score <= 1.7) return "딩크 지향형";
  if (score <= 2.6) return "자녀 계획 낮음";
  if (score <= 3.4) return "상황에 따라 열려 있음";
  if (score <= 4.3) return "자녀 가능성 열려 있음";
  return "자녀 지향형";
}

function buildInsightLabels({ structured, values }) {
  const scoreSource = structured?.scores || structured?.scoring || {};
  const relationshipGoalScore = toFivePointScore(
    scoreSource.relationship_goal ??
      scoreSource.relationshipGoal ??
      structured?.relationship_style?.score,
    3
  );
  const moneyScore = toFivePointScore(
    scoreSource.money ??
      scoreSource.money_values ??
      scoreSource.spending,
    3
  );
  const familyScore = toFivePointScore(
    scoreSource.family ??
      scoreSource.family_values,
    3
  );
  const workLifeScore = toFivePointScore(
    scoreSource.work_life_balance ??
      scoreSource.workLifeBalance,
    3
  );
  const childrenScore = toFivePointScore(
    scoreSource.children ??
      scoreSource.children_preference,
    3
  );
  const opennessToMarriage =
    Boolean(scoreSource.openness_to_marriage) ||
    values?.relationship_goal === "marriage";

  return {
    relationship_goal: {
      score: relationshipGoalScore,
      label: getRelationshipGoalLabel(relationshipGoalScore, opennessToMarriage),
      summary:
        relationshipGoalScore >= 3.8
          ? "진지하게 시작하고, 잘 맞으면 장기적인 미래까지 자연스럽게 떠올리는 편이야."
          : relationshipGoalScore <= 2.2
            ? "처음부터 무겁게 묶이기보다 부담 없이 서로를 알아가는 흐름을 더 편하게 느껴."
            : "가볍기만 한 관계보다는 서로 맞춰가며 의미를 쌓는 쪽에 더 마음이 가는 편이야.",
    },
    money: {
      score: moneyScore,
      label: getMoneyLabel(moneyScore),
      summary:
        moneyScore >= 3.8
          ? "지금의 즐거움도 보지만, 지출이 미래 안정에 어떤 영향을 줄지까지 함께 생각하는 편이야."
          : moneyScore <= 2.2
            ? "현재의 경험과 행복을 우선 두는 소비 감각이 강해서, 관계에서도 즐거운 순간의 가치를 크게 봐."
            : "현재 만족과 미래 안정 사이에서 무리 없이 균형을 맞추려는 현실적인 타입이야.",
    },
    family: {
      score: familyScore,
      label: getFamilyLabel(familyScore),
      summary:
        familyScore >= 3.8
          ? "가족의 의견도 듣되 결국은 커플의 기준으로 관계를 세우는 독립적인 성향이 보여."
          : familyScore <= 2.2
            ? "연애에서도 가족과의 정서적 연결을 중요하게 여겨서, 배경과 태도를 세심하게 보는 편이야."
            : "가족과 커플의 경계를 한쪽으로 치우치지 않게 맞추려는 균형 감각이 있어.",
    },
    work_life: {
      score: workLifeScore,
      label: getWorkLifeLabel(workLifeScore),
      summary:
        workLifeScore >= 3.8
          ? "관계에서도 일 성과보다 삶의 여유와 정서적 안정이 유지되는 흐름을 더 중요하게 생각해."
          : workLifeScore <= 2.2
            ? "성장과 커리어 목표를 분명히 두는 편이라, 연애도 그 리듬을 존중해주는 사람이 잘 맞아."
            : "일과 관계 둘 다 놓치지 않으려는 현실적인 균형 감각이 강한 편이야.",
    },
    children: {
      score: childrenScore,
      label: getChildrenLabel(childrenScore),
      summary:
        childrenScore >= 3.8
          ? "관계가 안정되면 아이에 대한 가능성도 자연스럽게 열어두는 편이야."
          : childrenScore <= 2.2
            ? "삶의 형태를 유연하게 가져가고 싶어 해서 자녀 계획에는 비교적 신중한 태도를 보여."
            : "지금 당장 결론 내리기보다 관계의 질과 상황을 보며 판단하려는 편이야.",
    },
    expression_style: {
      score: toFivePointScore(
        scoreSource.expression ?? scoreSource.emotional_expression,
        3
      ),
      label: getLevelLabel(
        toFivePointScore(scoreSource.expression ?? scoreSource.emotional_expression, 3),
        "직접표현",
        "신중표현"
      ),
      summary: "감정 표현에서는 상황과 상대 반응을 보며 톤을 조절하는 경향이 있어.",
    },
  };
}

function toClientReportShape(raw) {
  const base = fallbackAnalysis();
  const structured = raw?.relationship_style ? raw : raw?.structured_json || raw || {};
  const report = raw?.report || {};
  const finalReport = raw?.final_report || {};
  const coreValues = Array.isArray(structured?.core_values?.top_values)
    ? structured.core_values.top_values.filter((item) => typeof item === "string" && item.trim().length > 0)
    : [];
  const nonNegotiables = Array.isArray(structured?.boundaries?.non_negotiables)
    ? structured.boundaries.non_negotiables.filter((item) => typeof item === "string" && item.trim().length > 0)
    : [];
  const warningSigns = Array.isArray(structured?.boundaries?.warning_signs)
    ? structured.boundaries.warning_signs.filter((item) => typeof item === "string" && item.trim().length > 0)
    : [];
  const strengths = Array.isArray(structured?.strengths)
    ? structured.strengths.filter((item) => typeof item === "string" && item.trim().length > 0)
    : [];
  const risks = Array.isArray(structured?.risks)
    ? structured.risks.filter((item) => typeof item === "string" && item.trim().length > 0)
    : [];
  const confidenceScore =
    typeof structured?.confidence?.score === "number"
      ? Math.max(0, Math.min(1, structured.confidence.score > 1 ? structured.confidence.score / 100 : structured.confidence.score))
      : base.confidence.overall;
  const tags = Array.isArray(structured?.tags)
    ? structured.tags.filter((item) => typeof item === "string" && item.trim().length > 0).slice(0, 5)
    : [];
  const headlineFromType = structured?.relationship_style?.type || "";
  const relationshipStyleText =
    finalReport["너의 연애 스타일"] ||
    finalReport["연애 스타일"] ||
    structured?.relationship_style?.summary ||
    report.relationship_style ||
    base.report_inputs.relationship_style;
  const coreValuesText =
    finalReport["핵심 가치관"] || structured?.core_values?.summary || report.core_values || "";
  const attractionText =
    finalReport["너가 사랑에 빠지는 방식"] ||
    finalReport["끌림 패턴"] ||
    structured?.attraction_pattern?.summary ||
    report.attraction_pattern ||
    base.report_inputs.attraction_pattern;
  const communicationText =
    finalReport["연애할 때 너의 모습"] ||
    finalReport["커뮤니케이션 스타일"] ||
    structured?.communication_style?.summary ||
    report.communication_style ||
    base.report_inputs.communication_style;
  const emotionalText =
    finalReport["감정 패턴"] || structured?.emotional_pattern?.summary || report.emotional_pattern || base.report_inputs.emotional_pattern;
  const boundaryText =
    finalReport["갈등 생기면 너는 이렇게 함"] ||
    finalReport["관계 속 경계선"] ||
    structured?.boundaries?.healthy_boundaries ||
    "";
  const strengthText =
    finalReport["너의 연애 강점"] || finalReport["강점"] || (strengths.length ? strengths.join(" ") : "");
  const riskText =
    finalReport["너의 연애 리스크"] || finalReport["리스크"] || (risks.length ? risks.join(" ") : "");
  const idealText =
    finalReport["너랑 잘 맞는 사람"] ||
    finalReport["이상적인 인연"] ||
    structured?.ideal_partner?.summary ||
    report.ideal_partner ||
    base.report_inputs.ideal_partner_traits.join(", ");
  const oneLineSummary =
    finalReport["한 줄 요약"] || structured?.one_line_summary || report.one_line_summary || base.report_inputs.one_line_summary;
  const adviceText =
    finalReport["너를 위한 연애 조언"] ||
    "너는 애매한 신호를 오래 붙잡고 있으면 마음이 빨리 지칠 수 있어. 관계 초반에 기준을 솔직하게 말하고, 맞지 않으면 빨리 선을 정해주는 게 너를 더 편하게 해줄 거야.";
  const mergedValues = { ...base.values, ...(raw?.values || {}) };
  const insightLabels = buildInsightLabels({
    structured,
    values: mergedValues,
  });

  return {
    values: mergedValues,
    attachment: { ...base.attachment, ...(raw?.attachment || {}) },
    conflict_style: { ...base.conflict_style, ...(raw?.conflict_style || {}) },
    personality: { ...base.personality, ...(raw?.personality || {}) },
    report_inputs: {
      ...base.report_inputs,
      headline_keyword: headlineFromType || report.headline || base.report_inputs.headline_keyword,
      relationship_style: relationshipStyleText,
      core_values: (() => {
        if (coreValues.length) return coreValues;
        if (coreValuesText && typeof coreValuesText === "string") return [coreValuesText];
        if (Array.isArray(report.core_values)) {
          const items = report.core_values.filter((item) => typeof item === "string" && item.trim().length > 0);
          return items.length ? items : base.report_inputs.core_values;
        }
        if (typeof report.core_values === "string" && report.core_values.trim().length > 0) {
          return [report.core_values];
        }
        return base.report_inputs.core_values;
      })(),
      attraction_pattern: attractionText,
      communication_style: communicationText,
      emotional_pattern: emotionalText,
      dealbreakers: (() => {
        if (nonNegotiables.length || warningSigns.length) {
          return [...nonNegotiables, ...warningSigns].slice(0, 5);
        }
        if (boundaryText && typeof boundaryText === "string") return [boundaryText];
        if (Array.isArray(report.dealbreakers)) {
          const items = report.dealbreakers.filter((item) => typeof item === "string" && item.trim().length > 0);
          return items.length ? items : base.report_inputs.dealbreakers;
        }
        if (typeof report.dealbreakers === "string" && report.dealbreakers.trim().length > 0) {
          return [report.dealbreakers];
        }
        return base.report_inputs.dealbreakers;
      })(),
      strengths: strengths.length
        ? strengths
        : typeof strengthText === "string" && strengthText.trim().length > 0
          ? [strengthText]
          : typeof report.strengths === "string" && report.strengths.trim().length > 0
            ? [report.strengths]
            : typeof report.strength_and_risk === "string" && report.strength_and_risk.trim().length > 0
              ? [report.strength_and_risk]
              : base.report_inputs.strengths,
      risks: risks.length
        ? risks
        : typeof riskText === "string" && riskText.trim().length > 0
          ? [riskText]
          : typeof report.risks === "string" && report.risks.trim().length > 0
            ? [report.risks]
            : base.report_inputs.risks,
      ideal_partner_traits: typeof idealText === "string" && idealText.trim().length > 0
        ? [idealText]
        : typeof report.ideal_partner === "string"
          ? [report.ideal_partner]
          : base.report_inputs.ideal_partner_traits,
      one_line_summary: oneLineSummary,
      dating_advice: adviceText,
    },
    confidence: { ...base.confidence, ...(raw?.confidence || {}), overall: confidenceScore },
    tags,
    insight_labels: insightLabels,
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
    const firstUserMessage =
      messages.find((m) => m.role === "user")?.content || "";
    const requestedLanguage =
      body.language === "en" || body.language === "ko" ? body.language : null;
    const responseLanguage = requestedLanguage || detectLanguage(firstUserMessage);
    const analysis = await analyzeRelationshipProfile(messages, responseLanguage);
    const reportPayload = await generateReport(analysis, responseLanguage);
    res.status(200).json({
      analysis: {
        ...analysis,
        ai_report: reportPayload,
      },
    });
  } catch (error) {
    logAnalyzeDebug("Analyze request failed", {
      error: error?.message || String(error),
    });
    res.status(500).json({
      error: error?.message || "Failed to analyze conversation",
    });
  }
};

module.exports.analyzeRelationshipProfile = analyzeRelationshipProfile;
module.exports.generateReport = generateReport;