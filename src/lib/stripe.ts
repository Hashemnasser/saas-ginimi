import Stripe from "stripe";
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY environment variable");
}
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  typescript: true,
});

// دالة لجلب أو إنشاء منتج
async function getOrCreateProduct(name: string, description: string) {
  // نبحث عن المنتج بالاسم (قد يكون هناك عدة منتجات بنفس الاسم، نبسطها)
  const products = await stripe.products.list({
    limit: 100,
    active: true,
  });

  let product = products.data.find((p) => p.name === name);

  if (!product) {
    product = await stripe.products.create({
      name,
      description,
    });
  }

  return product;
}

// دالة لجلب أو إنشاء سعر لمنتج معين
async function getOrCreatePrice(
  productId: string,
  unitAmount: number,
  interval: "month" | "year"
) {
  const prices = await stripe.prices.list({
    product: productId,
    active: true,
    limit: 10,
  });

  // نبحث عن سعر بنفس المبلغ والفترة
  let price = prices.data.find(
    (p) => p.unit_amount === unitAmount && p.recurring?.interval === interval
  );

  if (!price) {
    price = await stripe.prices.create({
      product: productId,
      unit_amount: unitAmount,
      currency: "usd",
      recurring: { interval },
    });
  }

  return price;
}

export type PlanConfig = {
  name: string;
  description: string;
  price: number; // بالسنت
  interval: "month" | "year";
  projectLimit: number | "unlimited";
};

export const PLANS: PlanConfig[] = [
  {
    name: "Basic",
    description: "For individuals just getting started",
    price: 0,
    interval: "month",
    projectLimit: 5,
  },
  {
    name: "Pro",
    description: "For professionals and small teams",
    price: 2000, // 20 دولار
    interval: "month",
    projectLimit: "unlimited",
  },
  {
    name: "Enterprise",
    description: "For large organizations",
    price: 5000, // 50 دولار
    interval: "month",
    projectLimit: "unlimited",
  },
];

export async function initializePlans() {
  const plansWithIds = [];

  for (const plan of PLANS) {
    // المنتج المجاني (Basic) لا ننشئ له سعر لأنه مجاني
    if (plan.price === 0) {
      plansWithIds.push({
        ...plan,
        priceId: null, // لا يوجد priceId للخطة المجانية
      });
      continue;
    }

    // للخطط المدفوعة، ننشئ المنتج والسعر
    const product = await getOrCreateProduct(plan.name, plan.description);
    const price = await getOrCreatePrice(product.id, plan.price, plan.interval);

    plansWithIds.push({
      ...plan,
      priceId: price.id,
    });
  }

  return plansWithIds;
}
