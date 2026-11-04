import { NextResponse } from "next/server";
import { requireAdmin, serviceClient } from "@/lib/server/supabase-admin";

/** Enrol a student who paid outside Razorpay. Admins only. */
export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { studentEmail, courseId } = await request.json();
    const email = String(studentEmail ?? "").trim().toLowerCase();

    if (!email || !courseId) {
      return NextResponse.json(
        { error: "studentEmail and courseId are required" },
        { status: 400 }
      );
    }

    const supabase = serviceClient();

    // Find the account, or invite one. listUsers returns one page (50 by
    // default), so walk every page — otherwise anyone past the first page looks
    // new, the invite fails with "already been registered", and they can't be
    // enrolled.
    const PER_PAGE = 1000;
    let userId: string | undefined;
    for (let page = 1; !userId; page++) {
      const { data: found, error: listError } = await supabase.auth.admin.listUsers({ page, perPage: PER_PAGE });
      if (listError) throw listError;
      userId = found.users.find((u) => u.email?.toLowerCase() === email)?.id;
      if (found.users.length < PER_PAGE) break;
    }

    if (!userId) {
      const { data: invited, error: inviteError } =
        await supabase.auth.admin.inviteUserByEmail(email);
      if (inviteError || !invited?.user) {
        return NextResponse.json(
          { error: inviteError?.message ?? "Could not invite this student" },
          { status: 500 }
        );
      }
      userId = invited.user.id;
    }

    // The signup trigger creates the profile, but an invited user may not have
    // one yet — make sure it exists and is active either way.
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (profile) {
      await supabase.from("profiles").update({ is_active: true }).eq("id", userId);
    } else {
      await supabase.from("profiles").insert({
        id: userId,
        email,
        full_name: email.split("@")[0],
        role: "student",
        is_active: true,
      });
    }

    const { error: enrollError } = await supabase.from("enrollments").upsert(
      {
        student_id: userId,
        course_id: courseId,
        source: "manual",
        status: "active",
        enrolled_at: new Date().toISOString(),
        // The row is written as service role, so the acting admin is recorded
        // here or not at all.
        granted_by: auth.user.id,
      },
      { onConflict: "student_id, course_id" }
    );

    if (enrollError) {
      return NextResponse.json({ error: enrollError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `${email} now has access. They can sign in to their dashboard.`,
    });
  } catch (error) {
    console.error("Grant access failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not grant access" },
      { status: 500 }
    );
  }
}
