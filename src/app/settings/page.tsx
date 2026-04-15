import { auth } from "@/auth";
import ApiKeySection from "@/components/ApiKeySection";
import SettingsForm from "@/components/SettingsForm";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { name: true, apiKey: true, apiKeyEnabled: true },
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-10">
      <h1 className="text-3xl font-bold">Settings</h1>
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
        <SettingsForm initialName={user?.name || ""} />
      </div>

      {/* قسم API Key */}
      <ApiKeySection
        initialKey={user?.apiKey}
        initialEnabled={user?.apiKeyEnabled}
      />
    </div>
  );
}
