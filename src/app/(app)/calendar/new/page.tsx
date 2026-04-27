import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PageScaffold } from "@/components/page-scaffold";
import { createStay } from "../actions";
import { StayForm } from "../stay-form";
import { todayIsoAtLake } from "@/lib/dates";

export default async function NewStayPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const today = todayIsoAtLake();
  const start = date ?? today;

  return (
    <PageScaffold
      eyebrow={
        <Link
          href="/calendar"
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition"
        >
          <ChevronLeft className="h-3 w-3" />
          Calendar
        </Link>
      }
      title="New stay."
      blurb="Block off the days, drop a note for whoever's checking the app next."
    >
      <StayForm
        action={createStay}
        stay={{
          id: "",
          user_id: "",
          guest_name: null,
          start_date: start,
          end_date: start,
          notes: null,
          created_at: "",
          updated_at: "",
        }}
        submitLabel="Add to the calendar"
      />
    </PageScaffold>
  );
}
