import { useEffect, useState } from "react";
import { fetchPlans, startCheckout, type Plan } from "../lib/api";
import { useAuth } from "../lib/auth";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "",
    features: ["5 searches/day", "Radial view + data view", "CSV export (30 rows)"],
  },
  {
    id: "creator",
    name: "Creator",
    price: "$7",
    period: "/mo",
    featured: true,
    features: [
      "Unlimited searches",
      "Full CSV export",
      "AI script-hook generator",
      "Google + YouTube sources",
    ],
  },
  {
    id: "agency",
    name: "Agency",
    price: "$29",
    period: "/mo",
    features: [
      "Everything in Creator",
      "Team seats",
      "Saved topic history",
      "Bulk export",
    ],
  },
];

function featuresForPlan(plan: Plan): string[] {
  if (plan.code === "agency") {
    return ["Everything in Creator", "Team seats", "Saved topic history", "Bulk export"];
  }

  return [
    plan.dailySearchLimit === null
      ? "Unlimited searches"
      : `${plan.dailySearchLimit} searches/day`,
    plan.scriptHookLimit === null
      ? "AI script-hook generator"
      : `${plan.scriptHookLimit} script hooks/day`,
    "Full CSV export",
    "Google + YouTube sources",
  ];
}

function intervalLabel(interval: string): string {
  return interval === "MONTH" ? "/mo" : `/${interval.toLowerCase()}`;
}

function formatPrice(plan: Plan): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: plan.currency,
    maximumFractionDigits: 0,
  }).format(Number(plan.price));
}

interface Props {
  onAuthRequired: () => void;
}

export default function Pricing({ onAuthRequired }: Props) {
  const { user, token } = useAuth();
  const [busyPlan, setBusyPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const currentPlanCode = user?.currentPlan?.code ?? "free";
  const [paidPlans, setPaidPlans] = useState<typeof PLANS>(PLANS);

  useEffect(() => {
    fetchPlans()
      .then((plans) => {
        const nextPlans = plans.map((plan) => ({
          id: plan.code,
          name: plan.name,
          price: formatPrice(plan),
          period: intervalLabel(plan.billingInterval),
          featured: plan.code === "creator",
          features: featuresForPlan(plan),
        }));

        setPaidPlans([PLANS[0], ...nextPlans]);
      })
      .catch(() => {
        setPaidPlans(PLANS);
      });
  }, []);

  async function handleUpgrade(planId: string) {
    if (planId === "free") return;
    if (!user) {
      onAuthRequired();
      return;
    }
    setError(null);
    setBusyPlan(planId);
    try {
      const checkoutUrl = await startCheckout(planId, token);
      window.location.href = checkoutUrl;
    } catch (e: any) {
      setError(e.message);
      setBusyPlan(null);
    }
  }

  return (
    <section className="pricing">
      <div className="pricing-inner">
        <h2>Plans</h2>
        {error && <p style={{ color: "#c76b6b", fontSize: "0.85rem" }}>{error}</p>}
        <div className="plans">
          {paidPlans.map((plan) => {
            const isCurrentPlan = currentPlanCode === plan.id;

            return (
              <div className={`plan-card ${plan.featured ? "featured" : ""}`} key={plan.id}>
                <div>{plan.name}</div>
                <div className="price">
                  {plan.price}
                  <small>{plan.period}</small>
                </div>
                <ul>
                  {plan.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={busyPlan === plan.id || isCurrentPlan}
                >
                  {isCurrentPlan
                    ? "Current plan"
                    : busyPlan === plan.id
                    ? "Redirecting..."
                    : "Pay with Flutterwave"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
