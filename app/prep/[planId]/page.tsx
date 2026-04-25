import { PrepClient } from "./prep-client";

export default async function PrepPage({ params }: { params: Promise<{ planId: string }> }) {
  const { planId } = await params;
  return <PrepClient planId={planId} />;
}
