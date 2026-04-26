module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    res.status(500).json({ error: "Supabase auth config is missing" });
    return;
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const email = (body.email || "").trim();
    const password = (body.password || "").trim();
    if (!email || !password) {
      res.status(400).json({ error: "Missing email or password" });
      return;
    }

    const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        apikey: supabaseAnonKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const payload = await response.json();
    if (!response.ok) {
      res.status(401).json({ error: payload?.msg || payload?.error_description || "Invalid credentials" });
      return;
    }

    res.status(200).json({ session: payload });
  } catch (error) {
    res.status(500).json({ error: error?.message || "Unexpected server error" });
  }
};
