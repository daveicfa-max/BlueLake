import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Trash2 } from "lucide-react";
import { PageScaffold } from "@/components/page-scaffold";
import { deleteTask, updateTask } from "../actions";
import { TaskForm } from "../task-form";
import { BillingSection } from "../billing-section";
import { getAssignableUsers, getTaskById } from "@/lib/tasks";
import {
  getBidsForTask,
  getCurrentUserRole,
  getInvoicesForTask,
} from "@/lib/billing";
import { createClient } from "@/lib/supabase/server";
import type { TaskFormState } from "../actions";

export default async function EditTaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const [
    task,
    assignees,
    bids,
    invoices,
    role,
    {
      data: { user },
    },
  ] = await Promise.all([
    getTaskById(id),
    getAssignableUsers(),
    getBidsForTask(id),
    getInvoicesForTask(id),
    getCurrentUserRole(),
    supabase.auth.getUser(),
  ]);
  if (!task) notFound();

  const isAssignedHandyman =
    role === "handyman" && !!user && task.assigned_to === user.id;

  const updateAction = async (
    prev: TaskFormState,
    formData: FormData,
  ): Promise<TaskFormState> => {
    "use server";
    return updateTask(id, prev, formData);
  };

  const deleteAction = async () => {
    "use server";
    await deleteTask(id);
  };

  return (
    <PageScaffold
      eyebrow={
        <Link
          href="/tasks"
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition"
        >
          <ChevronLeft className="h-3 w-3" />
          Tasks
        </Link>
      }
      title="Edit task."
    >
      <div className="flex flex-col gap-8">
        <TaskForm
          action={updateAction}
          task={task}
          assignees={assignees}
          submitLabel="Save changes"
        />

        <BillingSection
          taskId={id}
          bids={bids}
          invoices={invoices}
          role={role}
          isAssignedHandyman={isAssignedHandyman}
        />

        <form action={deleteAction}>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition"
          >
            <Trash2 className="h-4 w-4" />
            Delete this task
          </button>
        </form>
      </div>
    </PageScaffold>
  );
}
