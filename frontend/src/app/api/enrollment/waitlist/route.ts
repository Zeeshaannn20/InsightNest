import { NextResponse } from "next/server";
import { serviceClient } from "@/lib/server/supabase-admin";

/** Public lead capture from the marketing page. */
export async function POST(request: Request) {
  try {
    const { email, course_slug } = await request.json();

    const normalised = String(email ?? "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalised)) {
      return NextResponse.json({ error: "A valid email address is required" }, { status: 400 });
    }

    const supabase = serviceClient();

    // Resolve the course so the admin list can group by programme. An unknown
    // slug still captures the lead rather than dropping it.
    const { data: course } = await supabase
      .from("courses")
      .select("id")
      .eq("slug", course_slug)
      .maybeSingle();

    const { error } = await supabase.from("waitlist").insert({
      email: normalised,
      course_slug: course_slug ?? null,
      course_id: course?.id ?? null,
    });

    // Signing up twice is not an error as far as the visitor is concerned.
    if (error && error.code !== "23505") {
      console.error("Waitlist insert failed:", error);
      return NextResponse.json({ error: "Could not join the waitlist" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Added to waitlist" });
  } catch (error) {
    console.error("Waitlist error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
