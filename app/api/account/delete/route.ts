
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Please sign in to request account deletion." },
        { status: 401 }
      );
    }

    const email = user.email;

    if (!email) {
      return NextResponse.json(
        { error: "Unable to find your account email." },
        { status: 400 }
      );
    }

    const { data: existingRequest, error: lookupError } =
      await supabase
        .from("account_deletion_requests")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "pending")
        .maybeSingle();

    if (lookupError) {
      console.error(
        "Deletion request lookup failed:",
        lookupError.message
      );

      return NextResponse.json(
        { error: "Unable to check your deletion request. Please try again." },
        { status: 500 }
      );
    }

    if (existingRequest) {
      return NextResponse.json({
        success: true,
        message: "Your account deletion request is already pending.",
      });
    }

    const { error: insertError } = await supabase
      .from("account_deletion_requests")
      .insert({
        user_id: user.id,
        email,
        full_name:
          typeof user.user_metadata?.full_name === "string"
            ? user.user_metadata.full_name
            : null,
        status: "pending",
      });

    if (insertError) {
      console.error(
        "Deletion request submission failed:",
        insertError.message
      );

      return NextResponse.json(
        {
          error:
            "Unable to submit your request. Please try again later.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Your account deletion request has been submitted. Your account will remain active until it is reviewed.",
    });
  } catch (error) {
    console.error("Account deletion request error:", error);

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
