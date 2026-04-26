function getConfig() {
  return {
    supabaseUrl:
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    supabaseAnonKey:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY,
  };
}

function parseBearerToken(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || typeof authHeader !== "string") return null;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

async function getAuthenticatedUser(accessToken, supabaseUrl, supabaseAnonKey) {
  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    method: "GET",
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) return null;
  return response.json();
}

async function selectLatestReport(accessToken, supabaseUrl, supabaseAnonKey) {
  const query = new URLSearchParams({
    select: "id,user_id,analysis_json,created_at",
    order: "created_at.desc",
    limit: "1",
  });
  const response = await fetch(`${supabaseUrl}/rest/v1/relationship_reports?${query.toString()}`, {
    method: "GET",
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase select failed: ${errorText}`);
  }
  const rows = await response.json();
  return rows[0] || null;
}

async function insertReport(accessToken, supabaseUrl, supabaseAnonKey, payload) {
  const response = await fetch(`${supabaseUrl}/rest/v1/relationship_reports`, {
    method: "POST",
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase insert failed: ${errorText}`);
  }
  const rows = await response.json();
  return rows[0] || null;
}

module.exports = async (req, res) => {
  const { supabaseUrl, supabaseAnonKey } = getConfig();
  if (!supabaseUrl || !supabaseAnonKey) {
    res.status(500).json({ error: "Supabase config is missing" });
    return;
  }

  const accessToken = parseBearerToken(req);
  if (!accessToken) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const user = await getAuthenticatedUser(accessToken, supabaseUrl, supabaseAnonKey);
  if (!user?.id) {
    res.status(401).json({ error: "Invalid auth token" });
    return;
  }

  try {
    if (req.method === "GET") {
      const latest = await selectLatestReport(accessToken, supabaseUrl, supabaseAnonKey);
      res.status(200).json({ report: latest });
      return;
    }

    if (req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
      if (!body.analysis_json || typeof body.analysis_json !== "object") {
        res.status(400).json({ error: "Missing analysis_json" });
        return;
      }
      const inserted = await insertReport(accessToken, supabaseUrl, supabaseAnonKey, {
        user_id: user.id,
        analysis_json: body.analysis_json,
      });
      res.status(201).json({ report: inserted });
      return;
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    res.status(500).json({ error: error?.message || "Unexpected server error" });
  }
};
