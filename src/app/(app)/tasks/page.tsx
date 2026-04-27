import { PageScaffold, PhasePlaceholder } from "@/components/page-scaffold";

export default function TasksPage() {
  return (
    <PageScaffold
      eyebrow="The lake"
      title="What needs doing."
      blurb="Open the cabin in May, close it in October, patch the dock in between."
    >
      <PhasePlaceholder
        phase="Phase one"
        blurb="Seasonal lists, handyman bids, who paid Keith last. All of it lives here soon."
      />
    </PageScaffold>
  );
}
