import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PageScaffold } from "@/components/page-scaffold";
import { createTask } from "../actions";
import { TaskForm } from "../task-form";
import { getAssignableUsers } from "@/lib/tasks";

export default async function NewTaskPage() {
  const assignees = await getAssignableUsers();

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
      title="New task."
      blurb="Fix a thing, plan a thing, hand a thing to Keith."
    >
      <TaskForm
        action={createTask}
        assignees={assignees}
        submitLabel="Add task"
      />
    </PageScaffold>
  );
}
