import { auth } from "@/auth";
import WebhooksManager from "@/components/WebhooksManager";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function WebhooksSettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const subscriptions = await db.webhookSubscription.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Webhook Subscriptions</h1>
      <WebhooksManager initialSubscriptions={subscriptions} />
    </div>
  );
}
