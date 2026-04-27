import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Trash2 } from "lucide-react";
import { PageScaffold } from "@/components/page-scaffold";
import { deleteStay, updateStay } from "../actions";
import { StayForm } from "../stay-form";
import { getStayById } from "@/lib/stays";
import type { StayFormState } from "../actions";

export default async function EditStayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const stay = await getStayById(id);
  if (!stay) notFound();

  const updateAction = async (
    prev: StayFormState,
    formData: FormData,
  ): Promise<StayFormState> => {
    "use server";
    return updateStay(id, prev, formData);
  };

  const deleteAction = async () => {
    "use server";
    await deleteStay(id);
  };

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
      title="Edit stay."
    >
      <div className="flex flex-col gap-6">
        <StayForm action={updateAction} stay={stay} submitLabel="Save changes" />

        <form action={deleteAction}>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition"
          >
            <Trash2 className="h-4 w-4" />
            Delete this stay
          </button>
        </form>
      </div>
    </PageScaffold>
  );
}
