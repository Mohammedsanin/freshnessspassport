import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import FreshnessPassport from "@/components/FreshnessPassport";
import LoginGate, { useFpSession } from "@/components/LoginGate";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Freshness Passport — Food Waste Intelligence for Grocery Retailers" },
      {
        name: "description",
        content:
          "Operational intelligence platform tracking remaining shelf life, cold-chain integrity and waste root-causes across every store and DC.",
      },
      { property: "og:title", content: "Freshness Passport" },
      {
        property: "og:description",
        content:
          "Operational intelligence platform tracking remaining shelf life, cold-chain integrity and waste root-causes across every store and DC.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const { session, setSession } = useFpSession();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  if (!session) return <LoginGate onAuthenticated={setSession} />;
  return <FreshnessPassport />;
}
