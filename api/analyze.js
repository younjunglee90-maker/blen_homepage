const ANALYZE_SYSTEM_PROMPT = `
You are Blen’s relationship analysis engine.

Your job:
Analyze the full conversation and return BOTH:
1) structured relationship JSON
2) a human-readable Korean report text

Core principle:
- Do NOT explain the user in dry analytical language.
- DESCRIBE the user like a real person.
- The user should feel: "이거 뭐야... 나인데?"

Output rules:
- Output JSON only.
- No markdown.
- No explanation.
- No comments.
- Do not continue chatting.
- Do not ask questions.
- Do not diagnose mental health conditions.
- Never say "데이터가 부족하다".
- If something is unclear, infer carefully and phrase softly.
- Do NOT overclaim certainty.

Return this exact JSON structure:

{
  "relationship_style": {
    "type": "",
    "score": 0,
    "evidence": "",
    "summary": ""
  },
  "core_values": {
    "top_values": [],
    "summary": "",
    "evidence": ""
  },
  "attraction_pattern": {
    "primary_attraction": "",
    "hidden_pattern": "",
    "summary": ""
  },
  "communication_style": {
    "type": "",
    "conflict_response": "",
    "summary": ""
  },
  "emotional_pattern": {
    "attachment_tendency": "",
    "emotional_trigger": "",
    "summary": ""
  },
  "boundaries": {
    "non_negotiables": [],
    "healthy_boundaries": "",
    "warning_signs": []
  },
  "strengths": [],
  "risks": [],
  "ideal_partner": {
    "personality": "",
    "relationship_style": "",
    "communication_style": "",
    "summary": ""
  },
  "tags": [],
  "one_line_summary": "",
  "confidence": {
    "score": 0,
    "reason": ""
  },
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
    "너를 위한 연애 조언": ""
  },
  "report_text": ""
}

Extraction rules:
1) relationship_style.type must be one closest type among:
   안정지향형, 설렘추구형, 신중탐색형, 깊은관계형, 자유로운연애형, 헌신형
2) core_values.top_values: extract 3-5 values.
3) attraction_pattern: infer primary attraction + hidden pattern.
4) communication_style: classify from conversational/conflict behavior.
5) emotional_pattern.attachment_tendency: use soft wording like "~경향이 있어".
6) boundaries: include non-negotiables, healthy boundaries, warning signs.
7) strengths: 3-5 concrete strengths.
8) risks: 3-5 gentle, practical cautions (not harsh).
9) ideal_partner: describe best-fit person and dynamic.
10) tags: 3-5 short Korean tags (e.g., 신뢰중심, 안정지향).
11) confidence.score:
   - rich answers: usually 80-95
   - short answers: usually 60-75
   - never frame confidence negatively.

Report generation rules:
- Report language: Korean only.
- Tone: warm, insightful, slightly fun, casual Korean 반말.
- Feel like a smart friend who understands relationships.
- Avoid stiff psychological jargon.
- Use real-life behavior language (e.g., 연락 패턴, 감정 반응, 싸울 때 반응).
- Use soft inference language:
  - "~인 편이야"
  - "~하는 경향이 있어"
  - "~일 가능성이 커"
- NO generic statements. Every section must include specific situations and behavior.
- Always describe WHEN/HOW the pattern appears (e.g., 연락이 느려질 때, 갈등이 생겼을 때, 상대가 애매할 때, 무시당한다고 느낄 때).
- Show inner thoughts explicitly (e.g., 겉으로는 괜찮다 해도 속으로는 이유를 찾음).
- Include outside-vs-inside contrast whenever relevant ("겉으로는..., 속으로는...").
- In attraction section, include both what sparks attraction and what quickly cools it down.
- In conflict section, describe concrete behavior sequence during conflict.
- In risk section, include emotionally vivid, slightly uncomfortable but fair insights.
- Write as flowing storytelling, not label dumping.
- "한 줄 요약": one strong, bold hook line that feels personal and slightly provocative.
- "너의 연애 핵심": summarize 3 short traits in natural sentence form.
- Each of the other final_report sections: 3-5 sentences, personal and specific.
- "너를 위한 연애 조언": practical, direct, useful, slightly sharp but kind.
- Never use generic filler sentences.
- Avoid repeating the same sentence pattern.
- final_report and report_text must be emotionally engaging, useful, shareable.
- report_text should read like one polished report that covers all 10 sections naturally.

Final quality check before output:
- Does this feel like a real person wrote it?
- Would the user want to screenshot and share it?
- Does each section feel specific and tailored?
- Ask: "이 문장이 특정 사람한테만 해당되나?" If not, rewrite.
- If not, rewrite internally before returning final JSON.
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

  return {
    values: { ...base.values, ...(raw?.values || {}) },
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
        response_format: { type: "json_object" },
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
      logAnalyzeDebug("JSON parse failed, using fallbackAnalysis", {
        raw_preview: String(rawText || "").slice(0, 320),
      });
      res.status(200).json(fallbackAnalysis());
      return;
    }
    warnIfReportShapeIncomplete(parsed);

    res.status(200).json(toClientReportShape(parsed));
  } catch (error) {
    logAnalyzeDebug("Analyze request failed, using fallbackAnalysis", {
      error: error?.message || String(error),
    });
    res.status(200).json(fallbackAnalysis());
  }
};