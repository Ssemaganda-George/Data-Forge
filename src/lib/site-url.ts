export function getSiteUrl() {
  const configured =
    process.env.NEXTAUTH_URL?.replace(/\/$/, "") ??
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");

  return configured || "http://localhost:3001";
}
