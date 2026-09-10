import { useEffect, useState } from "react";
import { fetchPlans, type Plan } from "../lib/api";
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
    return [
      "Everything in Creator",
      `${plan.teamSeatLimit ?? 5} team seats`,
      "Saved topic history",
      "Bulk export",
    ];
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
  const { user } = useAuth();
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
      .catch(() => setPaidPlans(PLANS));
  }, []);

  function handleUpgrade(planId: string) {
    if (planId === "free") return;
    if (!user) onAuthRequired();
  }

  return (
    <section className="pricing">
      <div className="pricing-inner">
        <h2>Plans</h2>
        <p style={{ opacity: 0.72, fontSize: "0.85rem" }}>
          Paid checkout is being updated for Flutterwave V4. AskLoom will not collect card, PIN, or OTP details directly.
        </p>
        <div className="plans">
          {paidPlans.map((plan) => {
            const isCurrentPlan = currentPlanCode === plan.id;
            const checkoutPending = plan.id !== "free" && Boolean(user);

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
                  disabled={isCurrentPlan || checkoutPending}
                >
                  {isCurrentPlan
                    ? "Current plan"
                    : checkoutPending
                    ? "V4 checkout setup pending"
                    : "Log in to upgrade"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
