import { PageScaffold, PhasePlaceholder } from "@/components/page-scaffold";

export default function CalendarPage() {
  return (
    <PageScaffold
      eyebrow="The lake"
      title="Who's at the lake."
      blurb="Family weekends, summer stretches, the quiet weeks in between."
    >
      <PhasePlaceholder
        phase="Building this first"
        blurb="Stays come together here. Who's pulling in, who's pulling out, who has the place to themselves."
      />
    </PageScaffold>
  );
}
