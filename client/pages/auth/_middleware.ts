import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const cookie = req.cookies;
  console.log(cookie);
}
