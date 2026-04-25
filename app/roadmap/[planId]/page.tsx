import { RoadmapClient } from "./roadmap-client";

export default async function RoadmapDetailsPage({ params }: { params: Promise<{ planId: string }> }) {
  const { planId } = await params;
  return <RoadmapClient planId={planId} />;
}
