export function verifyPicVistaApiKey(req: Request): boolean {
  const key =
    process.env.PICVISTA_API_KEY ?? process.env.IMGTOOLS_API_KEY;
  if (!key) return false;
  const auth = req.headers.get("authorization") ?? "";
  const m = auth.match(/^Bearer\s+(.+)$/i);
  return Boolean(m && m[1] === key);
}
