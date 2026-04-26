module.exports = async (_req, res) => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    res.status(500).json({ error: "Supabase public config is missing" });
    return;
  }
  res.status(200).json({ url, anonKey });
};
