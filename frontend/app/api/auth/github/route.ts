import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

type BackendAuthResponse = {
  ok: true
  data: {
    token: string
  }
} | {
  ok: false
  error: {
    message: string
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

function parseState(state: string) {
  try {
    return JSON.parse(Buffer.from(state, "base64").toString("utf8")) as {
      nonce?: string
      walletAddress?: string
    }
  } catch {
    return {}
  }
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state")
  const origin = url.origin

  if (!code || !state) {
    return NextResponse.redirect(`${origin}/auth/github/complete?error=missing_code`)
  }

  const parsedState = parseState(state)
  const cookieStore = await cookies()
  const expectedNonce = cookieStore.get("gitrap.oauthState")?.value

  if (!parsedState.nonce || !parsedState.walletAddress || parsedState.nonce !== expectedNonce) {
    return NextResponse.redirect(`${origin}/auth/github/complete?error=invalid_state`)
  }

  const backendResponse = await fetch(`${API_URL}/api/auth/github`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code,
      walletAddress: parsedState.walletAddress,
    }),
  })

  const payload = (await backendResponse.json()) as BackendAuthResponse

  if (!payload.ok) {
    return NextResponse.redirect(
      `${origin}/auth/github/complete?error=${encodeURIComponent(payload.error.message)}`
    )
  }

  const response = NextResponse.redirect(`${origin}/auth/github/complete`)
  response.cookies.set("gitrap.sessionToken", payload.data.token, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  })
  response.cookies.delete("gitrap.oauthState")

  return response
}
