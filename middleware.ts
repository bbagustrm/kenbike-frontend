import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  // Ambil token dari cookie (nanti bisa JWT / session)
  const token = req.cookies.get("token")?.value

  // Case: belum login → biarkan akses (kosong dulu)
  if (!token) {
    return NextResponse.next()
  }

  // Decode JWT sederhana (anggap payload JSON di middle part)
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString()
    )
    const role = payload.role

    // Dapatkan path yg sedang diakses
    const { pathname } = req.nextUrl

    // Cek role vs route
    if (pathname.startsWith("/(admin)") && role !== "admin") {
      return NextResponse.redirect(new URL("/not-authorized", req.url))
    }

    if (pathname.startsWith("/(owner)") && role !== "owner") {
      return NextResponse.redirect(new URL("/not-authorized", req.url))
    }

    if (pathname.startsWith("/(user)") && role !== "user") {
      return NextResponse.redirect(new URL("/not-authorized", req.url))
    }
  } catch (err) {
    console.error("Token invalid:", err)
    return NextResponse.next()
  }

  return NextResponse.next()
}

// Tentukan route mana saja yg dilindungi middleware
export const config = {
  matcher: [
    "/(user)/:path*",
    "/(admin)/:path*",
    "/(owner)/:path*",
  ],
}
