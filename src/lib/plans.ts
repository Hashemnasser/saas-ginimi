// lib/plans.ts
import { initializePlans, PLANS } from "./stripe";

let plansCache:
  | (
      | {
          priceId: null;
          name: "BASIC" | "PRO" | "ENTERPRISE";
          description: string;
          price: number;
          interval: "month" | "year";
          projectLimit: number | "unlimited";
        }
      | {
          priceId: string;
          name: "BASIC" | "PRO" | "ENTERPRISE";
          description: string;
          price: number;
          interval: "month" | "year";
          projectLimit: number | "unlimited";
        }
    )[]
  | null = null;

export async function getPlans() {
  if (!plansCache) {
    plansCache = await initializePlans();
  }
  return plansCache;
}

export function getPlanByPriceId(priceId: string | null) {
  if (!priceId) return PLANS.find((p) => p.price === 0); // الخطة المجانية
  return plansCache?.find((p) => p.priceId === priceId);
}
