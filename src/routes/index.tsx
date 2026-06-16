import { createFileRoute } from "@tanstack/react-router";
import FreshnessPassport from "@/components/FreshnessPassport";

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
  return <FreshnessPassport />;
}
