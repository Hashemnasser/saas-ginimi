import { auth } from "@/auth";
import PricingCard from "@/components/PricingCard";
import { getPlans } from "@/lib/plans";

export default async function PricingPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const plans = await getPlans(); // الخطط مع priceId

  return (
    <div className="max-w-6xl mx-auto p-12">
      <h1 className="text-3xl font-bold text-center mb-8">Choose Your Plan</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <PricingCard key={plan.name} plan={plan} userId={userId} />
        ))}
      </div>
    </div>
  );
}
