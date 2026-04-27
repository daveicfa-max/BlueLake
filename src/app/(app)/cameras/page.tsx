import { PageScaffold, PhasePlaceholder } from "@/components/page-scaffold";

export default function CamerasPage() {
  return (
    <PageScaffold
      eyebrow="The lake"
      title="Eyes on the place."
      blurb="Nest snapshots from the dock, the drive, the porch."
    >
      <PhasePlaceholder
        phase="Phase four"
        blurb="Pipes haven't burst. The boat's still on the lift. You'll see for yourself."
      />
    </PageScaffold>
  );
}
