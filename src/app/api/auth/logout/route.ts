import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("admin_session");

    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Logout failed.";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
