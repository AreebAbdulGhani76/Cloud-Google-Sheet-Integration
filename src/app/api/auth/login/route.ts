import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password, remember } = await request.json();

    const adminEmail = process.env.ADMIN_EMAIL || "abdulghaniareeb@gmail.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin123";

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required." }, { status: 400 });
    }

    if (email.trim().toLowerCase() !== adminEmail.trim().toLowerCase() || password !== adminPassword) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password. Please verify your credentials." },
        { status: 401 },
      );
    }

    // Set authenticated session cookie
    const cookieStore = await cookies();
    const maxAge = remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 1; // 30 days or 1 day

    cookieStore.set("admin_session", "authenticated_admin", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      message: "Authentication successful",
      user: {
        email: adminEmail,
        name: "Abdul Ghani",
        role: "Administrator",
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Authentication error.";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
