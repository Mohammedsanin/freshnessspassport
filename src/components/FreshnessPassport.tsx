import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";

/* =========================================================================
   PALETTE / TOKENS
   ========================================================================= */
const C = {
  primary: "#1B3A6B",
  accent: "#2563EB",
  light: "#EFF6FF",
  white: "#FFFFFF",
  border: "#E2E8F0",
  text: "#0F172A",
  text2: "#475569",
  muted: "#94A3B8",
  green: "#16A34A",
  amber: "#D97706",
  red: "#DC2626",
  bgPage: "#F8FAFC",
  badgeBlueBg: "#DBEAFE",
  badgeBlueText: "#1E40AF",
  label: "#374151",
};

const FONT = `'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif`;

/* =========================================================================
   HELPERS
   ========================================================================= */
const formatGBP = (n: number) =>
  "£" + Math.round(n).toLocaleString("en-GB");
const formatPct = (n: number) => `${n.toFixed(1)}%`;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const formatDate = (d: Date | number) => {
  const dt = typeof d === "number" ? new Date(d) : d;
  return `${String(dt.getDate()).padStart(2, "0")} ${MONTHS[dt.getMonth()]} ${dt.getFullYear()}`;
};
const daysAgo = (n: number) => Date.now() - n * 86400000;

type Batch = {
  id: string;
  product: string;
  sku: string;
  category: string;
  storeId: string;
  productionDate: number;
  printedExpiry: number;
  units: number;
  unitSize: string;
  supplier: string;
  origin: string;
  baseShelfLife: number;
  dwellDays: number;
  tempExcursion: boolean;
  tempPenaltyDays: number;
  maxTemp: number;
  tempHistory: { day: string; temp: number }[];
  logoUrl?: string;
  createdAt?: number;
};

const computeRSL = (b: Batch) => {
  const daysSinceProduction = Math.floor((Date.now() - b.productionDate) / 86400000);
  const tempPenalty = b.tempExcursion ? b.tempPenaltyDays : 0;
  const dwellPenalty = Math.max(0, b.dwellDays - 2);
  const rslDays = Math.max(0, b.baseShelfLife - daysSinceProduction - tempPenalty - dwellPenalty);
  const score = Math.max(0, Math.min(100, Math.round((rslDays / b.baseShelfLife) * 100)));
  return { rslDays, score, daysSinceProduction, tempPenalty, dwellPenalty };
};
const freshnessColor = (score: number) =>
  score >= 75 ? C.green : score >= 45 ? C.amber : C.red;
const statusFromScore = (score: number) =>
  score >= 75 ? "Fresh" : score >= 45 ? "At Risk" : "Critical";
const rslToAction = (days: number) =>
  days < 1
    ? "Trigger 50% markdown immediately"
    : days <= 2
    ? "Move to front shelf + trigger markdown"
    : days <= 3
    ? "FEFO rotation recommended"
    : days <= 5
    ? "Monitor — check allocation"
    : "No action needed";

/* =========================================================================
   SEED DATA
   ========================================================================= */
type Store = {
  id: string;
  code: string;
  name: string;
  city: string;
  region: string;
  address: string;
  country: string;
  postcode: string;
  manager: string;
  email: string;
  phone: string;
  activeSince: number;
  tier: "Pilot" | "Standard" | "Enterprise";
  type: string;
  logoUrl?: string;
};

const SEED_STORES: Store[] = [
  {
    id: "DC", code: "DC-001", name: "Main Distribution Centre", city: "Birmingham",
    region: "Midlands", address: "Unit 14, Logistics Park", country: "UK", postcode: "B7 4AA",
    manager: "Helena Park", email: "helena@freshpass.co", phone: "+44 121 555 0144",
    activeSince: new Date("2024-02-10").getTime(), tier: "Enterprise", type: "Distribution Centre",
  },
  {
    id: "S1", code: "STR-001", name: "Store #1 Bristol", city: "Bristol", region: "South West",
    address: "22 Park Street", country: "UK", postcode: "BS1 5JA",
    manager: "Tom Whitfield", email: "tom@freshpass.co", phone: "+44 117 555 0211",
    activeSince: new Date("2024-04-01").getTime(), tier: "Standard", type: "Supermarket",
  },
  {
    id: "S2", code: "STR-002", name: "Store #2 Cardiff", city: "Cardiff", region: "Wales",
    address: "5 Queen Street", country: "UK", postcode: "CF10 2BU",
    manager: "Megan Howells", email: "megan@freshpass.co", phone: "+44 29 555 0322",
    activeSince: new Date("2024-05-15").getTime(), tier: "Standard", type: "Supermarket",
  },
  {
    id: "S3", code: "STR-003", name: "Store #3 Leeds", city: "Leeds", region: "Yorkshire",
    address: "88 Briggate", country: "UK", postcode: "LS1 6LY",
    manager: "Daniel Okoye", email: "daniel@freshpass.co", phone: "+44 113 555 0433",
    activeSince: new Date("2024-07-09").getTime(), tier: "Pilot", type: "Supermarket",
  },
  {
    id: "S4", code: "STR-004", name: "Store #4 Manchester", city: "Manchester", region: "North West",
    address: "12 Market Street", country: "UK", postcode: "M1 1WT",
    manager: "Priya Shah", email: "priya@freshpass.co", phone: "+44 161 555 0544",
    activeSince: new Date("2024-09-22").getTime(), tier: "Enterprise", type: "Flagship",
  },
  {
    id: "S5", code: "STR-005", name: "Store #5 Edinburgh", city: "Edinburgh", region: "Scotland",
    address: "44 Princes Street", country: "UK", postcode: "EH2 2BY",
    manager: "Callum Reid", email: "callum@freshpass.co", phone: "+44 131 555 0655",
    activeSince: new Date("2025-01-12").getTime(), tier: "Standard", type: "Convenience",
  },
];

const tempHist = (avg: number, spikes: number[] = []) =>
  Array.from({ length: 6 }, (_, i) => ({
    day: `D${i + 1}`,
    temp: +(avg + (spikes[i] ?? (Math.sin(i) * 0.6))).toFixed(1),
  }));

const SEED_BATCHES: Batch[] = [
  {
    id: "#A14", product: "Strawberries", sku: "PRD-2241", category: "Produce", storeId: "S2",
    productionDate: daysAgo(2), printedExpiry: daysAgo(-6), units: 120, unitSize: "400g",
    supplier: "Berry Farms Ltd", origin: "UK", baseShelfLife: 8, dwellDays: 2,
    tempExcursion: false, tempPenaltyDays: 0, maxTemp: 8, tempHistory: tempHist(5),
  },
  {
    id: "#B07", product: "Salad Mix", sku: "PRD-1184", category: "Produce", storeId: "S4",
    productionDate: daysAgo(4), printedExpiry: daysAgo(-2), units: 80, unitSize: "200g",
    supplier: "GreenLeaf Co", origin: "Spain", baseShelfLife: 7, dwellDays: 4,
    tempExcursion: true, tempPenaltyDays: 2, maxTemp: 8,
    tempHistory: tempHist(7, [0, 1, 3, 4, 2, 1]),
  },
  {
    id: "#C22", product: "Whole Milk", sku: "DRY-0451", category: "Dairy", storeId: "DC",
    productionDate: daysAgo(1), printedExpiry: daysAgo(-9), units: 240, unitSize: "1L",
    supplier: "Dairyworks UK", origin: "UK", baseShelfLife: 10, dwellDays: 1,
    tempExcursion: false, tempPenaltyDays: 0, maxTemp: 5, tempHistory: tempHist(3),
  },
  {
    id: "#D09", product: "Greek Yogurt", sku: "DRY-0732", category: "Dairy", storeId: "S3",
    productionDate: daysAgo(5), printedExpiry: daysAgo(-5), units: 60, unitSize: "500g",
    supplier: "Olympus Dairy", origin: "UK", baseShelfLife: 12, dwellDays: 5,
    tempExcursion: false, tempPenaltyDays: 0, maxTemp: 5, tempHistory: tempHist(4),
  },
  {
    id: "#E31", product: "Ready Meals — Lasagne", sku: "RMM-0998", category: "Ready Meals", storeId: "S1",
    productionDate: daysAgo(3), printedExpiry: daysAgo(-4), units: 140, unitSize: "400g",
    supplier: "MealCraft", origin: "UK", baseShelfLife: 9, dwellDays: 3,
    tempExcursion: false, tempPenaltyDays: 0, maxTemp: 5, tempHistory: tempHist(4),
  },
  {
    id: "#F18", product: "Sliced Bread", sku: "BAK-0322", category: "Bakery", storeId: "S5",
    productionDate: daysAgo(6), printedExpiry: daysAgo(-1), units: 90, unitSize: "800g",
    supplier: "Hearth Bakery", origin: "UK", baseShelfLife: 7, dwellDays: 6,
    tempExcursion: false, tempPenaltyDays: 0, maxTemp: 22, tempHistory: tempHist(18),
  },
  {
    id: "#G04", product: "Free-Range Eggs", sku: "DRY-0145", category: "Dairy", storeId: "S2",
    productionDate: daysAgo(2), printedExpiry: daysAgo(-12), units: 200, unitSize: "x12",
    supplier: "Hen Acres", origin: "UK", baseShelfLife: 18, dwellDays: 2,
    tempExcursion: false, tempPenaltyDays: 0, maxTemp: 8, tempHistory: tempHist(6),
  },
  {
    id: "#H27", product: "Blueberries", sku: "PRD-2298", category: "Produce", storeId: "S4",
    productionDate: daysAgo(3), printedExpiry: daysAgo(-4), units: 110, unitSize: "150g",
    supplier: "Berry Farms Ltd", origin: "UK", baseShelfLife: 9, dwellDays: 3,
    tempExcursion: false, tempPenaltyDays: 0, maxTemp: 8, tempHistory: tempHist(6),
  },
  {
    id: "#I12", product: "Croissants", sku: "BAK-0501", category: "Bakery", storeId: "S1",
    productionDate: daysAgo(2), printedExpiry: daysAgo(-3), units: 70, unitSize: "x6",
    supplier: "Hearth Bakery", origin: "UK", baseShelfLife: 5, dwellDays: 2,
    tempExcursion: false, tempPenaltyDays: 0, maxTemp: 22, tempHistory: tempHist(20),
  },
  {
    id: "#J33", product: "Chicken Fillets", sku: "MTF-0118", category: "Meat & Fish", storeId: "S3",
    productionDate: daysAgo(2), printedExpiry: daysAgo(-3), units: 55, unitSize: "500g",
    supplier: "Cluck & Co", origin: "UK", baseShelfLife: 6, dwellDays: 4,
    tempExcursion: true, tempPenaltyDays: 1, maxTemp: 4,
    tempHistory: tempHist(3, [0, 0, 1.5, 2.4, 0.5, 0]),
  },
];

type Task = {
  id: string;
  priority: "URGENT" | "HIGH" | "MEDIUM";
  type: string;
  product: string;
  batchId: string;
  storeId: string;
  instruction: string;
  rslDays: number;
  assignee: string;
  status: "todo" | "inprogress" | "done";
  assignedAt: number;
};

const SEED_TASKS: Task[] = [
  { id: "T1", priority: "URGENT", type: "Markdown", product: "Salad Mix", batchId: "#B07", storeId: "S4", instruction: "Trigger 50% markdown — 1 day RSL remaining.", rslDays: 1, assignee: "PS", status: "todo", assignedAt: daysAgo(0) },
  { id: "T2", priority: "HIGH", type: "FEFO Rotation", product: "Strawberries", batchId: "#A14", storeId: "S2", instruction: "Move Batch A14 to front shelf before newer Batch A19.", rslDays: 3, assignee: "MH", status: "todo", assignedAt: daysAgo(1) },
  { id: "T3", priority: "HIGH", type: "Allocation Adjust", product: "Greek Yogurt", batchId: "#D09", storeId: "S3", instruction: "Reduce next dispatch by 18 units — slow rotation detected.", rslDays: 4, assignee: "DO", status: "todo", assignedAt: daysAgo(3) },
  { id: "T4", priority: "MEDIUM", type: "Cold Chain Alert", product: "DC Cold Room 3", batchId: "—", storeId: "DC", instruction: "Temperature 2.4°C above threshold — check equipment.", rslDays: 0, assignee: "HP", status: "todo", assignedAt: daysAgo(0) },
  { id: "T5", priority: "HIGH", type: "Markdown", product: "Sliced Bread", batchId: "#F18", storeId: "S5", instruction: "Apply 30% markdown on 22 remaining units.", rslDays: 1, assignee: "CR", status: "inprogress", assignedAt: daysAgo(1) },
  { id: "T6", priority: "MEDIUM", type: "FEFO Rotation", product: "Whole Milk", batchId: "#C22", storeId: "DC", instruction: "Pick older pallet first on next dispatch.", rslDays: 5, assignee: "HP", status: "inprogress", assignedAt: daysAgo(0) },
  { id: "T7", priority: "HIGH", type: "Store Task", product: "Croissants", batchId: "#I12", storeId: "S1", instruction: "Move to bakery clearance shelf and re-label.", rslDays: 2, assignee: "TW", status: "inprogress", assignedAt: daysAgo(0) },
  { id: "T8", priority: "URGENT", type: "Cold Chain Alert", product: "Chicken Fillets", batchId: "#J33", storeId: "S3", instruction: "Quarantine batch — verify pre-shelf temperature.", rslDays: 1, assignee: "DO", status: "done", assignedAt: daysAgo(1) },
  { id: "T9", priority: "MEDIUM", type: "Markdown", product: "Blueberries", batchId: "#H27", storeId: "S4", instruction: "20% markdown — slow rotation on aisle 3.", rslDays: 3, assignee: "PS", status: "done", assignedAt: daysAgo(2) },
  { id: "T10", priority: "HIGH", type: "FEFO Rotation", product: "Free-Range Eggs", batchId: "#G04", storeId: "S2", instruction: "Rotate stock — older trays to front.", rslDays: 8, assignee: "MH", status: "done", assignedAt: daysAgo(3) },
  { id: "T11", priority: "MEDIUM", type: "Allocation Adjust", product: "Ready Meals", batchId: "#E31", storeId: "S1", instruction: "Reduce next allocation by 12 units.", rslDays: 4, assignee: "TW", status: "done", assignedAt: daysAgo(4) },
];

type Activity = { id: string; ts: number; icon: string; text: string; storeId: string };
const SEED_ACTIVITY: Activity[] = [
  { id: "a1", ts: daysAgo(0), icon: "🚚", text: "Batch #A14 — Strawberries dispatched to Store #2", storeId: "S2" },
  { id: "a2", ts: daysAgo(0), icon: "🏷️", text: "Markdown triggered — Yogurt (8 units) — Store #4", storeId: "S4" },
  { id: "a3", ts: daysAgo(0), icon: "🌡️", text: "Temperature excursion detected — Cold Chain #3 — +2.4°C above threshold", storeId: "DC" },
  { id: "a4", ts: daysAgo(1), icon: "⏳", text: "FEFO alert — Salad Mix Batch #B07 — 1 day remaining", storeId: "S4" },
  { id: "a5", ts: daysAgo(1), icon: "📦", text: "New passport created — Ready Meals batch — 140 units", storeId: "S1" },
  { id: "a6", ts: daysAgo(2), icon: "🗑️", text: "Waste event logged — Sliced Bread — Store #1 — £42 lost", storeId: "S1" },
];

const WASTE_INCIDENTS = [
  { date: daysAgo(0), product: "Salad Mix", batch: "#B07", storeId: "S4", driver: "Temperature Excursion", units: 24, cost: 96, preventable: true },
  { date: daysAgo(1), product: "Sliced Bread", batch: "#F18", storeId: "S1", driver: "Forecast Bias", units: 30, cost: 42, preventable: true },
  { date: daysAgo(1), product: "Croissants", batch: "#I12", storeId: "S1", driver: "Markdown Delay", units: 18, cost: 36, preventable: true },
  { date: daysAgo(2), product: "Greek Yogurt", batch: "#D09", storeId: "S3", driver: "Store Rotation", units: 14, cost: 56, preventable: true },
  { date: daysAgo(2), product: "Strawberries", batch: "#A11", storeId: "S2", driver: "Late Delivery", units: 22, cost: 88, preventable: true },
  { date: daysAgo(3), product: "Blueberries", batch: "#H21", storeId: "S4", driver: "Forecast Bias", units: 26, cost: 104, preventable: true },
  { date: daysAgo(3), product: "Whole Milk", batch: "#C18", storeId: "DC", driver: "Cold Chain", units: 40, cost: 80, preventable: false },
  { date: daysAgo(4), product: "Ready Meals", batch: "#E28", storeId: "S1", driver: "Markdown Delay", units: 9, cost: 54, preventable: true },
  { date: daysAgo(4), product: "Chicken Fillets", batch: "#J29", storeId: "S3", driver: "Temperature Excursion", units: 12, cost: 96, preventable: true },
  { date: daysAgo(5), product: "Salad Mix", batch: "#B04", storeId: "S4", driver: "Late Delivery", units: 18, cost: 72, preventable: false },
];

const RSL_TREND_14D = Array.from({ length: 14 }, (_, i) => ({
  day: `D${i + 1}`,
  atRisk: Math.max(8, Math.round(58 - i * 2.6 + Math.sin(i) * 4)),
}));

const WASTE_TREND_8W = Array.from({ length: 8 }, (_, i) => ({
  week: `W${i + 1}`,
  total: 3200 - i * 180 + Math.round(Math.sin(i) * 80),
  preventable: 2400 - i * 170 + Math.round(Math.cos(i) * 60),
  interventions: 12 + i * 7,
}));

const MONTHLY_IMPACT_12M = Array.from({ length: 12 }, (_, i) => ({
  month: MONTHS[i],
  waste: 1400 - i * 60 + Math.round(Math.sin(i) * 90),
  trend: 1400 - i * 70,
}));

const INTERVENTION_STACK_6M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((m, i) => ({
  month: m,
  fefo: 800 + i * 80,
  markdown: 600 + i * 60,
  allocation: 400 + i * 50,
  coldchain: 250 + i * 30,
}));

const STORE_LEAGUE = (stores: Store[]) =>
  stores
    .filter((s) => s.id !== "DC")
    .map((s, i) => ({
      store: s,
      reduction: 28 - i * 3 + Math.round(Math.sin(i) * 2),
      trend: Array.from({ length: 8 }, (_, k) => 30 - k - i + Math.round(Math.sin(k) * 3)),
      arrow: i % 2 === 0 ? "↑" : "↓",
    }))
    .sort((a, b) => b.reduction - a.reduction);

/* =========================================================================
   TOOLTIP REGISTRY
   ========================================================================= */
const TIPS: Record<string, string> = {
  overview:
    "The Overview Dashboard pulls together freshness, waste, and operational KPIs across your whole network. Use it as your daily command centre — drill into any tile to investigate the underlying batches and actions.",
  passports:
    "A Freshness Digital Passport is assigned to every product batch entering the supply chain. It records every movement event, temperature exposure, handling condition, and dwell time from the Distribution Centre through to the store shelf. This gives retailers a real-time, traceable view of how logistics operations are affecting product freshness and shelf life — going far beyond a static printed expiry date.",
  rsl:
    "Remaining Shelf Life (RSL) estimation moves beyond printed expiry dates. The system analyses each batch's time-temperature history combined with handling and logistics events to calculate a probabilistic freshness score from 0–100. This allows retailers to identify which products will expire before their label date due to real-world handling conditions, enabling smarter inventory, allocation, and markdown decisions.",
  waste:
    "The Waste Root-Cause Analytics engine analyses your operational data to identify exactly why food waste is occurring. Rather than just reporting waste events, the system traces each instance back to its operational driver — whether that's a forecast error, a late delivery, a cold-chain failure, or a store execution delay. It ranks these drivers by impact so your teams know precisely where to intervene.",
  action:
    "The Operational Action Engine converts freshness intelligence into specific, executable tasks for your store and DC teams. Rather than presenting data and leaving action to interpretation, the system automatically generates prioritised task lists — FEFO rotation instructions, markdown triggers, allocation adjustments, and store shelf tasks — and tracks their completion to measure real impact.",
  impact:
    "The Impact & Sustainability Report quantifies the real-world results of the platform's interventions. Every action taken — a markdown triggered, an allocation adjusted, a rotation completed — is tracked and its downstream impact measured. This gives retailers clear evidence of cost savings, waste reduction, and environmental benefits that can be reported to sustainability teams, boards, and ESG stakeholders.",
  storeProfile:
    "A Store Profile centralises all operational, contact, and preference data for each location. This information feeds directly into freshness analytics, action routing, and sustainability reporting — ensuring every insight and task is mapped to the right store and team.",
  freshnessByStore:
    "Aggregate freshness score per location, computed as a weighted average of every active batch's RSL score. Green stores are performing above 80%, amber 60–79%, red below 60%.",
  wasteDrivers:
    "Breakdown of waste cost by operational root cause across the last 7 days. Click into Waste Analytics to drill in by store and category.",
  activity:
    "Live operational events from across your network — dispatches, markdowns, cold-chain alerts and new passports.",
  passportTable:
    "Every active batch in the network with its current freshness score, location and recommended next step.",
  rslSummary:
    "Network-wide bucketing of every batch by remaining shelf life so you can see at a glance where to focus.",
  rslTable:
    "Sorted by urgency — rows with less than 2 days RSL get a red border so they are impossible to miss.",
  rslTrend:
    "14-day trend of at-risk product count. A declining curve indicates the platform's interventions are working.",
  wasteByDriver: "Cost of waste attributed to each operational driver over the last 7 days.",
  wasteByCategory: "Share of waste cost by product category.",
  wasteLog: "Every logged waste event with its root cause and whether it was preventable with timely action.",
  wasteWeekly: "Weekly waste cost vs preventable cost vs interventions taken.",
  actionSummary: "Live counts of tasks generated by the engine.",
  kanban: "Each card is an executable task — Start it, then Mark Complete to close the loop.",
  esg: "A board-ready summary of the platform's environmental and financial impact this month.",
  league: "Stores ranked by month-on-month waste reduction.",
};

/* =========================================================================
   PRIMITIVES
   ========================================================================= */
type SetTooltip = (k: string) => void;

const Card = ({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) => (
  <div
    className={className}
    style={{
      background: C.white,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      padding: 24,
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      ...style,
    }}
  >
    {children}
  </div>
);

const InfoButton = ({ open, onClick }: { open: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    aria-label="Explain this feature"
    style={{
      width: 18,
      height: 18,
      borderRadius: 999,
      background: open ? C.accent : "transparent",
      color: open ? C.white : C.accent,
      border: `1px solid ${C.accent}`,
      fontSize: 11,
      fontWeight: 700,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      transition: "all 150ms",
    }}
  >
    ?
  </button>
);

const SectionHeader = ({
  eyebrow,
  title,
  tipKey,
  openTips,
  toggleTip,
  right,
}: {
  eyebrow?: string;
  title: string;
  tipKey: string;
  openTips: Set<string>;
  toggleTip: SetTooltip;
  right?: ReactNode;
}) => {
  const isOpen = openTips.has(tipKey);
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          {eyebrow && (
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.08em",
                color: C.accent,
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              {eyebrow}
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: C.text,
                letterSpacing: "-0.02em",
                margin: 0,
              }}
            >
              {title}
            </h2>
            <InfoButton open={isOpen} onClick={() => toggleTip(tipKey)} />
          </div>
        </div>
        {right}
      </div>
      {isOpen && (
        <div
          style={{
            marginTop: 12,
            background: C.light,
            borderLeft: `3px solid ${C.accent}`,
            color: C.primary,
            padding: "12px 16px",
            borderRadius: 6,
            fontSize: 13,
            lineHeight: 1.6,
          }}
        >
          {TIPS[tipKey] ?? "Feature explanation coming soon."}
        </div>
      )}
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { bg: string; fg: string; dot: string }> = {
    Fresh: { bg: "#DCFCE7", fg: "#166534", dot: C.green },
    "At Risk": { bg: "#FEF3C7", fg: "#92400E", dot: C.amber },
    Critical: { bg: "#FEE2E2", fg: "#991B1B", dot: C.red },
  };
  const s = map[status] ?? map.Fresh;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: s.bg,
        color: s.fg,
        fontSize: 11,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        padding: "4px 10px",
        borderRadius: 999,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: 999, background: s.dot }} />
      {status}
    </span>
  );
};

const PrimaryButton = ({
  children, onClick, type = "button", style,
}: { children: ReactNode; onClick?: () => void; type?: "button" | "submit"; style?: CSSProperties }) => (
  <button
    type={type}
    onClick={onClick}
    style={{
      background: C.primary, color: C.white, border: "none", borderRadius: 8,
      padding: "10px 20px", fontWeight: 600, fontSize: 14, cursor: "pointer",
      transition: "all 150ms", fontFamily: FONT, ...style,
    }}
    onMouseEnter={(e) => (e.currentTarget.style.background = "#142d54")}
    onMouseLeave={(e) => (e.currentTarget.style.background = C.primary)}
  >
    {children}
  </button>
);

const SecondaryButton = ({
  children, onClick, style,
}: { children: ReactNode; onClick?: () => void; style?: CSSProperties }) => (
  <button
    onClick={onClick}
    style={{
      background: C.white, color: C.primary, border: `1px solid ${C.primary}`, borderRadius: 8,
      padding: "9px 18px", fontWeight: 600, fontSize: 14, cursor: "pointer",
      transition: "all 150ms", fontFamily: FONT, ...style,
    }}
    onMouseEnter={(e) => (e.currentTarget.style.background = C.light)}
    onMouseLeave={(e) => (e.currentTarget.style.background = C.white)}
  >
    {children}
  </button>
);

const Label = ({ children, required }: { children: ReactNode; required?: boolean }) => (
  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.label, marginBottom: 6 }}>
    {children}
    {required && <span style={{ color: C.red, marginLeft: 4 }}>*</span>}
  </label>
);

const inputStyle: CSSProperties = {
  width: "100%",
  height: 40,
  border: `1px solid ${C.border}`,
  borderRadius: 8,
  padding: "0 12px",
  fontSize: 14,
  color: C.text,
  background: C.white,
  fontFamily: FONT,
  outline: "none",
  transition: "border-color 150ms, box-shadow 150ms",
};
const focusOn = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
  e.currentTarget.style.borderColor = C.accent;
  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.12)";
};
const focusOff = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>, err?: boolean) => {
  e.currentTarget.style.borderColor = err ? C.red : C.border;
  e.currentTarget.style.boxShadow = "none";
};

const TextInput = ({
  value, onChange, placeholder, type = "text", error, name,
}: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string; error?: boolean; name?: string }) => (
  <input
    name={name}
    type={type}
    value={value}
    placeholder={placeholder}
    onChange={(e) => onChange(e.target.value)}
    onFocus={focusOn}
    onBlur={(e) => focusOff(e, error)}
    style={{ ...inputStyle, borderColor: error ? C.red : C.border }}
  />
);

const SelectInput = ({
  value, onChange, options, error, name,
}: { value: string; onChange: (v: string) => void; options: string[]; error?: boolean; name?: string }) => (
  <select
    name={name}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    onFocus={focusOn}
    onBlur={(e) => focusOff(e, error)}
    style={{ ...inputStyle, borderColor: error ? C.red : C.border, paddingRight: 28, appearance: "none",
      backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'><polyline points='6 9 12 15 18 9'/></svg>")`,
      backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}
  >
    <option value="">Select…</option>
    {options.map((o) => (
      <option key={o} value={o}>{o}</option>
    ))}
  </select>
);

const TextArea = ({
  value, onChange, placeholder, rows = 3,
}: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) => (
  <textarea
    value={value}
    placeholder={placeholder}
    rows={rows}
    onChange={(e) => onChange(e.target.value)}
    onFocus={focusOn}
    onBlur={(e) => focusOff(e)}
    style={{ ...inputStyle, height: "auto", padding: "10px 12px", resize: "vertical", lineHeight: 1.5 }}
  />
);

const ErrorText = ({ children }: { children: ReactNode }) => (
  <div style={{ fontSize: 12, color: C.red, marginTop: 4 }}>{children}</div>
);

const RadioPills = ({
  options, value, onChange, colorMap,
}: { options: string[]; value: string; onChange: (v: string) => void; colorMap?: Record<string, string> }) => (
  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
    {options.map((o) => {
      const sel = value === o;
      const c = colorMap?.[o];
      return (
        <button
          key={o}
          onClick={() => onChange(o)}
          style={{
            border: `1.5px solid ${sel ? (c ?? C.primary) : C.border}`,
            background: sel ? (c ? `${c}1A` : C.light) : C.white,
            color: sel ? (c ?? C.primary) : C.text2,
            borderRadius: 8,
            padding: "10px 18px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontFamily: FONT,
            transition: "all 150ms",
          }}
        >
          <span style={{ width: 14, height: 14, borderRadius: 999, border: `1.5px solid ${sel ? (c ?? C.primary) : C.muted}`, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            {sel && <span style={{ width: 6, height: 6, borderRadius: 999, background: c ?? C.primary }} />}
          </span>
          {o}
        </button>
      );
    })}
  </div>
);

const CheckboxPills = ({
  options, value, onChange,
}: { options: string[]; value: string[]; onChange: (v: string[]) => void }) => (
  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
    {options.map((o) => {
      const sel = value.includes(o);
      return (
        <button
          key={o}
          onClick={() => onChange(sel ? value.filter((x) => x !== o) : [...value, o])}
          style={{
            border: `1px solid ${sel ? C.accent : C.border}`,
            background: sel ? C.badgeBlueBg : C.white,
            color: sel ? C.badgeBlueText : C.text2,
            borderRadius: 8,
            padding: "8px 14px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: FONT,
            transition: "all 150ms",
          }}
        >
          {o}
        </button>
      );
    })}
  </div>
);

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
  <button
    onClick={() => onChange(!checked)}
    style={{
      width: 42, height: 24, borderRadius: 999, background: checked ? C.primary : C.border,
      position: "relative", border: "none", cursor: "pointer", transition: "background 150ms",
    }}
  >
    <span
      style={{
        position: "absolute", top: 2, left: checked ? 20 : 2, width: 20, height: 20,
        borderRadius: 999, background: C.white, transition: "left 150ms", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
      }}
    />
  </button>
);

const Stepper = ({ value, onChange, min = 1, max = 30 }: { value: number; onChange: (v: number) => void; min?: number; max?: number }) => (
  <div style={{ display: "inline-flex", alignItems: "center", border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden", height: 40 }}>
    <button onClick={() => onChange(Math.max(min, value - 1))} style={{ width: 36, height: 40, border: "none", background: C.white, cursor: "pointer", color: C.primary, fontSize: 18, fontWeight: 600 }}>−</button>
    <div style={{ width: 48, textAlign: "center", fontWeight: 600, color: C.text, borderLeft: `1px solid ${C.border}`, borderRight: `1px solid ${C.border}`, lineHeight: "40px" }}>{value}</div>
    <button onClick={() => onChange(Math.min(max, value + 1))} style={{ width: 36, height: 40, border: "none", background: C.white, cursor: "pointer", color: C.primary, fontSize: 18, fontWeight: 600 }}>+</button>
  </div>
);

/* =========================================================================
   ICONS (inline SVG)
   ========================================================================= */
const Icon = {
  Leaf: (p: { size?: number; color?: string }) => (
    <svg width={p.size ?? 22} height={p.size ?? 22} viewBox="0 0 24 24" fill="none" stroke={p.color ?? C.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19.2 2.96c1.1 4.55.43 8.85-1.5 11.27a7 7 0 0 1-6.7 5.77z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6" />
    </svg>
  ),
  Bell: (p: { size?: number }) => (
    <svg width={p.size ?? 18} height={p.size ?? 18} viewBox="0 0 24 24" fill="none" stroke={C.text2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  ),
  Building: ({ size = 36, color = C.muted }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
    </svg>
  ),
  Box: ({ size = 36, color = C.muted }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="M3.3 7 12 12l8.7-5" />
      <path d="M12 22V12" />
    </svg>
  ),
  Pencil: ({ size = 12 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={C.white} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  ),
  X: ({ size = 18, color = C.muted }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  ),
  Search: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
    </svg>
  ),
  Person: ({ size = 14, color = C.text2 }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Download: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  Share: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  ),
  Menu: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.text2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  Check: ({ size = 14, color = C.green }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
};

const NAV: { id: PageId; label: string; emoji: string }[] = [
  { id: "overview", label: "Overview Dashboard", emoji: "🏠" },
  { id: "passports", label: "Product Passports", emoji: "📦" },
  { id: "rsl", label: "RSL Monitor", emoji: "📉" },
  { id: "waste", label: "Waste Analytics", emoji: "🔬" },
  { id: "action", label: "Action Engine", emoji: "⚡" },
  { id: "impact", label: "Impact Report", emoji: "🌿" },
];
type PageId = "overview" | "passports" | "rsl" | "waste" | "action" | "impact";

/* =========================================================================
   MAIN COMPONENT
   ========================================================================= */
export default function FreshnessPassport() {
  const [stores, setStores] = useState<Store[]>(SEED_STORES);
  const [batches, setBatches] = useState<Batch[]>(SEED_BATCHES);
  const [tasks, setTasks] = useState<Task[]>(SEED_TASKS);
  const [activity, setActivity] = useState<Activity[]>(SEED_ACTIVITY);

  const [activePage, setActivePage] = useState<PageId>("overview");
  const [activeStoreId, setActiveStoreId] = useState<string>("all");
  const [storeProfileId, setStoreProfileId] = useState<string | null>(null);
  const [drawerBatchId, setDrawerBatchId] = useState<string | null>(null);
  const [storeModalOpen, setStoreModalOpen] = useState(false);
  const [passportModalOpen, setPassportModalOpen] = useState(false);
  const [passportPrefillStoreId, setPassportPrefillStoreId] = useState<string | undefined>();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [storeDropdownOpen, setStoreDropdownOpen] = useState(false);

  const [tooltipsOpen, setTooltipsOpen] = useState<Set<string>>(new Set());
  const toggleTip = (k: string) =>
    setTooltipsOpen((s) => {
      const next = new Set(s);
      next.has(k) ? next.delete(k) : next.add(k);
      return next;
    });

  const [toasts, setToasts] = useState<{ id: number; kind: "success" | "error" | "info"; msg: string }[]>([]);
  const pushToast = (kind: "success" | "error" | "info", msg: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [{ id, kind, msg }, ...t]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  };

  const [flashId, setFlashId] = useState<string | null>(null);

  /* Loading skeleton per page switch */
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, [activePage, storeProfileId]);

  /* Browser back handling for store profile */
  useEffect(() => {
    const onPop = () => setStoreProfileId(null);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  const openStoreProfile = (id: string) => {
    window.history.pushState({ storeProfileId: id }, "", "");
    setStoreProfileId(id);
    setStoreDropdownOpen(false);
  };
  const closeStoreProfile = () => {
    setStoreProfileId(null);
    setActivePage("overview");
  };

  const navigate = (p: PageId) => {
    setActivePage(p);
    setStoreProfileId(null);
    setSidebarOpen(false);
  };

  const visibleBatches =
    activeStoreId === "all" ? batches : batches.filter((b) => b.storeId === activeStoreId);

  /* Passport drawer state */
  const drawerBatch = batches.find((b) => b.id === drawerBatchId) ?? null;
  useEffect(() => {
    if (!drawerBatch) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawerBatchId(null);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [drawerBatch]);

  const onAddStore = (s: Store) => {
    setStores((arr) => [...arr, s]);
    pushToast("success", `Store ${s.code} created successfully`);
    setStoreModalOpen(false);
    setActiveStoreId(s.id);
    openStoreProfile(s.id);
  };
  const onAddBatch = (b: Batch) => {
    setBatches((arr) => [b, ...arr]);
    const store = stores.find((s) => s.id === b.storeId);
    pushToast("success", `Passport ${b.id} created — ${b.product}${store ? ` — ${store.name}` : ""}`);
    setActivity((a) => [
      { id: `act-${Date.now()}`, ts: Date.now(), icon: "📦", text: `New passport ${b.id} created — ${b.product}`, storeId: b.storeId },
      ...a,
    ]);
    setPassportModalOpen(false);
    setPassportPrefillStoreId(undefined);
    setFlashId(b.id);
    setTimeout(() => setFlashId(null), 3000);
  };

  const headerStore = stores.find((s) => s.id === activeStoreId);
  const activeStoreLabel = activeStoreId === "all" ? "All Stores" : headerStore?.name ?? "All Stores";

  /* PAGE CONTENT */
  const renderPage = () => {
    if (storeProfileId) {
      const store = stores.find((s) => s.id === storeProfileId);
      if (!store) return null;
      return (
        <StoreProfilePage
          store={store}
          batches={batches}
          tasks={tasks}
          activity={activity}
          stores={stores}
          openTips={tooltipsOpen}
          toggleTip={toggleTip}
          onBack={closeStoreProfile}
          onOpenDrawer={(id) => setDrawerBatchId(id)}
          onOpenPassportModal={() => {
            setPassportPrefillStoreId(store.id);
            setPassportModalOpen(true);
          }}
          flashId={flashId}
        />
      );
    }

    if (loading) return <SkeletonPage page={activePage} />;

    switch (activePage) {
      case "overview":
        return <OverviewPage batches={visibleBatches} stores={stores} activity={activity} openTips={tooltipsOpen} toggleTip={toggleTip} />;
      case "passports":
        return (
          <PassportsPage
            batches={visibleBatches}
            stores={stores}
            openTips={tooltipsOpen}
            toggleTip={toggleTip}
            onOpenDrawer={(id) => setDrawerBatchId(id)}
            onNewPassport={() => setPassportModalOpen(true)}
            flashId={flashId}
          />
        );
      case "rsl":
        return <RSLPage batches={visibleBatches} stores={stores} openTips={tooltipsOpen} toggleTip={toggleTip} />;
      case "waste":
        return <WastePage stores={stores} openTips={tooltipsOpen} toggleTip={toggleTip} />;
      case "action":
        return (
          <ActionPage
            tasks={tasks}
            stores={stores}
            setTasks={setTasks}
            openTips={tooltipsOpen}
            toggleTip={toggleTip}
          />
        );
      case "impact":
        return <ImpactPage stores={stores} openTips={tooltipsOpen} toggleTip={toggleTip} pushToast={pushToast} />;
    }
  };

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        background: C.bgPage,
        fontFamily: FONT,
        color: C.text,
        display: "flex",
      }}
    >
      <style>{`
        @keyframes fp-pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes fp-slide-in { from{transform:translateX(100%)} to{transform:translateX(0)} }
        @keyframes fp-fade-in { from{opacity:0} to{opacity:1} }
        @keyframes fp-flash { 0%{box-shadow: inset 4px 0 0 ${C.accent}, 0 0 0 ${C.accent}40} 100%{box-shadow: inset 0 0 0 transparent} }
        .fp-skeleton { background:${C.border}; border-radius:8px; animation: fp-pulse 1.4s ease infinite; }
        .fp-row:hover { background:${C.light} !important; }
        .fp-no-print { }
        @media print {
          .fp-no-print { display:none !important; }
          body { background: white !important; }
        }
        @media (max-width: 768px) {
          .fp-sidebar-desktop { display:none !important; }
          .fp-hamburger { display:inline-flex !important; }
          .fp-main { padding: 20px !important; }
        }
      `}</style>

      {/* Sidebar (desktop) */}
      <aside
        className="fp-sidebar-desktop fp-no-print"
        style={{
          width: 240, background: C.white, borderRight: `1px solid ${C.border}`,
          minHeight: "100vh", padding: "20px 12px", position: "sticky", top: 0,
        }}
      >
        <SidebarNav activePage={activePage} navigate={navigate} />
      </aside>

      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
        <div className="fp-no-print" style={{ position: "fixed", inset: 0, zIndex: 9000 }}>
          <div
            onClick={() => setSidebarOpen(false)}
            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", animation: "fp-fade-in 200ms ease" }}
          />
          <div
            style={{
              position: "absolute", top: 0, left: 0, bottom: 0, width: 240, background: C.white,
              padding: "20px 12px", animation: "fp-slide-in 200ms ease", boxShadow: "2px 0 12px rgba(0,0,0,0.1)",
            }}
          >
            <button
              onClick={() => setSidebarOpen(false)}
              style={{ position: "absolute", top: 14, right: 14, background: "none", border: "none", cursor: "pointer" }}
              aria-label="Close menu"
            >
              <Icon.X />
            </button>
            <SidebarNav activePage={activePage} navigate={navigate} />
          </div>
        </div>
      )}

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Header */}
        <header
          className="fp-no-print"
          style={{
            background: C.white, borderBottom: `1px solid ${C.border}`,
            padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: 16, position: "sticky", top: 0, zIndex: 50,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              className="fp-hamburger"
              onClick={() => setSidebarOpen(true)}
              style={{ display: "none", background: "none", border: "none", cursor: "pointer", padding: 4 }}
              aria-label="Open menu"
            >
              <Icon.Menu />
            </button>
            <Icon.Leaf size={24} />
            <span style={{ fontWeight: 700, color: C.primary, fontSize: 17, letterSpacing: "-0.01em" }}>
              Freshness Passport
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <SecondaryButton onClick={() => setStoreModalOpen(true)} style={{ padding: "8px 14px", fontSize: 13 }}>
              + Add Store
            </SecondaryButton>

            <div style={{ position: "relative" }}>
              <button
                onClick={() => setStoreDropdownOpen((v) => !v)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8, background: C.white,
                  border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", fontSize: 13,
                  color: C.text2, cursor: "pointer", fontFamily: FONT, fontWeight: 500,
                }}
              >
                📍 {activeStoreLabel} ▾
              </button>
              {storeDropdownOpen && (
                <div
                  style={{
                    position: "absolute", top: "calc(100% + 6px)", right: 0, minWidth: 280,
                    background: C.white, border: `1px solid ${C.border}`, borderRadius: 10,
                    boxShadow: "0 10px 30px rgba(0,0,0,0.08)", padding: 6, zIndex: 100,
                  }}
                >
                  <button
                    onClick={() => { setActiveStoreId("all"); setStoreDropdownOpen(false); }}
                    style={dropdownItemStyle(activeStoreId === "all")}
                  >
                    <span>📍 All Stores</span>
                  </button>
                  {stores.map((s) => (
                    <div key={s.id} style={{ display: "flex", alignItems: "center" }}>
                      <button
                        onClick={() => { setActiveStoreId(s.id); setStoreDropdownOpen(false); }}
                        style={{ ...dropdownItemStyle(activeStoreId === s.id), flex: 1 }}
                      >
                        <span>{s.name}</span>
                      </button>
                      <button
                        onClick={() => openStoreProfile(s.id)}
                        style={{
                          background: "none", border: "none", color: C.accent, fontSize: 12,
                          cursor: "pointer", padding: "0 10px", whiteSpace: "nowrap", fontWeight: 500,
                        }}
                      >
                        → Profile
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              style={{
                position: "relative", background: "none", border: "none", cursor: "pointer", padding: 8,
              }}
              aria-label="Notifications"
            >
              <Icon.Bell />
              <span
                style={{
                  position: "absolute", top: 4, right: 4, background: C.red, color: C.white,
                  borderRadius: 999, fontSize: 9, width: 16, height: 16,
                  display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700,
                }}
              >
                3
              </span>
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 36, height: 36, borderRadius: 999, background: C.badgeBlueBg,
                  color: C.primary, display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, fontSize: 13,
                }}
              >
                AV
              </div>
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Abdul Varis</div>
                <div
                  style={{
                    fontSize: 10, fontWeight: 600, color: C.primary, background: C.badgeBlueBg,
                    padding: "1px 6px", borderRadius: 4, display: "inline-block", marginTop: 2,
                    textTransform: "uppercase", letterSpacing: "0.06em",
                  }}
                >
                  Admin
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="fp-main" style={{ padding: 32, flex: 1 }}>
          {renderPage()}
        </main>
      </div>

      {/* Drawer */}
      {drawerBatch && (
        <PassportDrawer
          batch={drawerBatch}
          store={stores.find((s) => s.id === drawerBatch.storeId)}
          onClose={() => setDrawerBatchId(null)}
        />
      )}

      {/* Modals */}
      {storeModalOpen && (
        <StoreModal
          onClose={() => setStoreModalOpen(false)}
          onSubmit={onAddStore}
          existingIds={stores.map((s) => s.code)}
        />
      )}
      {passportModalOpen && (
        <PassportModal
          onClose={() => { setPassportModalOpen(false); setPassportPrefillStoreId(undefined); }}
          onSubmit={onAddBatch}
          stores={stores}
          batches={batches}
          prefillStoreId={passportPrefillStoreId}
        />
      )}

      {/* Toasts */}
      <div
        className="fp-no-print"
        style={{
          position: "absolute", top: 20, right: 20, zIndex: 9999,
          display: "flex", flexDirection: "column", gap: 10,
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              background: C.white,
              borderLeft: `4px solid ${t.kind === "success" ? C.green : t.kind === "error" ? C.red : C.accent}`,
              borderRadius: 8, padding: "12px 16px", fontSize: 13, color: C.text,
              minWidth: 280, maxWidth: 360, boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
              animation: "fp-fade-in 200ms ease",
            }}
          >
            <span>{t.msg}</span>
            <button
              onClick={() => setToasts((ts) => ts.filter((x) => x.id !== t.id))}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}
              aria-label="Dismiss"
            >
              <Icon.X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const dropdownItemStyle = (active: boolean): CSSProperties => ({
  display: "block", width: "100%", textAlign: "left", padding: "8px 12px",
  borderRadius: 6, background: active ? C.light : "transparent", border: "none",
  color: active ? C.primary : C.text2, fontSize: 13, cursor: "pointer", fontFamily: FONT, fontWeight: active ? 600 : 500,
});

/* =========================================================================
   SIDEBAR NAV
   ========================================================================= */
function SidebarNav({ activePage, navigate }: { activePage: PageId; navigate: (p: PageId) => void }) {
  return (
    <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ padding: "8px 12px 16px", fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
        Platform
      </div>
      {NAV.map((n) => {
        const active = activePage === n.id;
        return (
          <button
            key={n.id}
            onClick={() => navigate(n.id)}
            style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
              borderRadius: 8, border: "none", background: active ? C.light : "transparent",
              color: active ? C.primary : C.text2, fontWeight: active ? 600 : 500,
              borderLeft: `3px solid ${active ? C.accent : "transparent"}`,
              cursor: "pointer", fontFamily: FONT, fontSize: 14, textAlign: "left",
              transition: "all 150ms",
            }}
            onMouseEnter={(e) => !active && (e.currentTarget.style.background = "#F1F5F9")}
            onMouseLeave={(e) => !active && (e.currentTarget.style.background = "transparent")}
          >
            <span style={{ fontSize: 16 }}>{n.emoji}</span>
            {n.label}
          </button>
        );
      })}
    </nav>
  );
}

/* =========================================================================
   SKELETON
   ========================================================================= */
function SkeletonPage({ page }: { page: PageId }) {
  return (
    <div>
      <div className="fp-skeleton" style={{ width: 200, height: 24, marginBottom: 24 }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        {[0, 1, 2, 3].map((i) => <div key={i} className="fp-skeleton" style={{ height: 110 }} />)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: page === "overview" ? "3fr 2fr" : "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <div className="fp-skeleton" style={{ height: 280 }} />
        <div className="fp-skeleton" style={{ height: 280 }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="fp-skeleton" style={{ height: 48 }} />)}
      </div>
    </div>
  );
}

/* =========================================================================
   OVERVIEW PAGE
   ========================================================================= */
function OverviewPage({
  batches, stores, activity, openTips, toggleTip,
}: {
  batches: Batch[]; stores: Store[]; activity: Activity[]; openTips: Set<string>; toggleTip: SetTooltip;
}) {
  const atRiskCount = batches.filter((b) => computeRSL(b).score < 75).length;
  const wasteThisWeek = 1840;
  const co2 = 2.3;

  const storeData = stores
    .filter((s) => s.id !== "DC")
    .map((s) => {
      const sb = batches.filter((b) => b.storeId === s.id);
      const avg = sb.length ? sb.reduce((a, b) => a + computeRSL(b).score, 0) / sb.length : 70 + Math.random() * 20;
      return { name: s.name.replace("Store #", "#"), score: Math.round(avg) };
    });

  const drivers = [
    { name: "Forecast Bias", value: 32, color: C.primary },
    { name: "Late Deliveries", value: 24, color: C.accent },
    { name: "Temp Excursions", value: 19, color: C.amber },
    { name: "Store Rotation", value: 15, color: "#60A5FA" },
    { name: "Markdown Delays", value: 10, color: "#93C5FD" },
  ];

  return (
    <div>
      <PageTitle eyebrow="Network Command" title="Overview Dashboard" tipKey="overview" openTips={openTips} toggleTip={toggleTip} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: 16, marginBottom: 24 }}>
        <KpiCard label="Active Passports" value={String(batches.length * 25)} subtitle="Across 1 DC + 5 stores" />
        <KpiCard label="At-Risk Products" value={String(atRiskCount + 30)} badge={{ text: "⚠ Needs Action", color: C.amber }} />
        <KpiCard label="Waste This Week" value={formatGBP(wasteThisWeek)} subtitle="↓ 12.0% vs last week" subtitleColor={C.green} />
        <KpiCard label="CO₂ Avoided" value={`${co2} tonnes`} subtitle="This month" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,3fr) minmax(0,2fr)", gap: 16, marginBottom: 24 }}>
        <Card>
          <SectionHeader title="Freshness Performance by Store" tipKey="freshnessByStore" openTips={openTips} toggleTip={toggleTip} />
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={storeData} layout="vertical" margin={{ left: 30, right: 20 }}>
              <CartesianGrid stroke={C.border} horizontal={false} />
              <XAxis type="number" domain={[0, 100]} stroke={C.muted} fontSize={12} />
              <YAxis type="category" dataKey="name" stroke={C.text2} fontSize={12} width={80} />
              <RTooltip cursor={{ fill: C.light }} contentStyle={{ borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12 }} />
              <Bar dataKey="score" radius={[0, 6, 6, 0]}>
                {storeData.map((d, i) => (
                  <Cell key={i} fill={d.score >= 80 ? C.green : d.score >= 60 ? C.amber : C.red} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <SectionHeader title="Waste Driver Breakdown" tipKey="wasteDrivers" openTips={openTips} toggleTip={toggleTip} />
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={drivers} dataKey="value" innerRadius={55} outerRadius={90} paddingAngle={2}>
                {drivers.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <RTooltip contentStyle={{ borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 12 }}>
            {drivers.map((d) => (
              <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.text2 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: d.color }} />
                {d.name} · <b style={{ color: C.text }}>{d.value}%</b>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <SectionHeader title="Recent Activity Feed" tipKey="activity" openTips={openTips} toggleTip={toggleTip} />
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {activity.slice(0, 8).map((a) => {
            const store = stores.find((s) => s.id === a.storeId);
            return (
              <div
                key={a.id}
                style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
                  borderRadius: 8, borderLeft: `2px solid ${C.border}`,
                }}
              >
                <span style={{ fontSize: 18 }}>{a.icon}</span>
                <div style={{ flex: 1, fontSize: 13, color: C.text }}>{a.text}</div>
                {store && (
                  <span
                    style={{
                      background: C.badgeBlueBg, color: C.badgeBlueText, fontSize: 11,
                      fontWeight: 600, padding: "3px 8px", borderRadius: 999,
                    }}
                  >
                    {store.name}
                  </span>
                )}
                <span style={{ fontSize: 12, color: C.muted, minWidth: 90, textAlign: "right" }}>
                  {timeAgo(a.ts)}
                </span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function timeAgo(ts: number) {
  const d = Math.floor((Date.now() - ts) / 86400000);
  if (d === 0) {
    const h = Math.max(1, Math.floor((Date.now() - ts) / 3600000));
    return `${h}h ago`;
  }
  if (d === 1) return "1d ago";
  return `${d}d ago`;
}

function PageTitle({
  eyebrow, title, tipKey, openTips, toggleTip, right,
}: { eyebrow: string; title: string; tipKey: string; openTips: Set<string>; toggleTip: SetTooltip; right?: ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: C.accent, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
        {eyebrow}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", color: C.text, margin: 0 }}>{title}</h1>
          <InfoButton open={openTips.has(tipKey)} onClick={() => toggleTip(tipKey)} />
        </div>
        {right}
      </div>
      {openTips.has(tipKey) && (
        <div
          style={{
            marginTop: 12, background: C.light, borderLeft: `3px solid ${C.accent}`,
            color: C.primary, padding: "14px 18px", borderRadius: 6, fontSize: 13, lineHeight: 1.6, maxWidth: 880,
          }}
        >
          {TIPS[tipKey]}
        </div>
      )}
    </div>
  );
}

function KpiCard({
  label, value, subtitle, subtitleColor, badge,
}: { label: string; value: string; subtitle?: string; subtitleColor?: string; badge?: { text: string; color: string } }) {
  return (
    <Card>
      <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
        {label}
      </div>
      <div style={{ fontSize: 30, fontWeight: 700, color: C.text, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
        {value}
      </div>
      {subtitle && (
        <div style={{ fontSize: 12, color: subtitleColor ?? C.text2, marginTop: 8 }}>{subtitle}</div>
      )}
      {badge && (
        <div
          style={{
            marginTop: 10, display: "inline-block", background: `${badge.color}1A`, color: badge.color,
            fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 999,
          }}
        >
          {badge.text}
        </div>
      )}
    </Card>
  );
}

/* =========================================================================
   PASSPORTS PAGE
   ========================================================================= */
function PassportsPage({
  batches, stores, openTips, toggleTip, onOpenDrawer, onNewPassport, flashId,
}: {
  batches: Batch[]; stores: Store[]; openTips: Set<string>; toggleTip: SetTooltip;
  onOpenDrawer: (id: string) => void; onNewPassport: () => void; flashId: string | null;
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");

  const filtered = useMemo(() => {
    return batches.filter((b) => {
      const { score } = computeRSL(b);
      const st = statusFromScore(score);
      if (search) {
        const s = search.toLowerCase();
        if (
          !b.product.toLowerCase().includes(s) &&
          !b.sku.toLowerCase().includes(s) &&
          !b.id.toLowerCase().includes(s)
        ) return false;
      }
      if (status && st !== status) return false;
      if (location && b.storeId !== location) return false;
      if (category && b.category !== category) return false;
      return true;
    });
  }, [batches, search, status, location, category]);

  const clearAll = () => { setSearch(""); setStatus(""); setLocation(""); setCategory(""); };

  return (
    <div>
      <PageTitle
        eyebrow="Traceability"
        title="Product Passports"
        tipKey="passports"
        openTips={openTips}
        toggleTip={toggleTip}
        right={<PrimaryButton onClick={onNewPassport}>+ New Passport</PrimaryButton>}
      />

      <Card style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(220px,1fr) repeat(3,minmax(160px,1fr))", gap: 12 }}>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 12, top: 12 }}><Icon.Search /></span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by product, SKU, or batch ID..."
              onFocus={focusOn}
              onBlur={(e) => focusOff(e)}
              style={{ ...inputStyle, paddingLeft: 34 }}
            />
          </div>
          <SelectInput value={status} onChange={setStatus} options={["Fresh", "At Risk", "Critical"]} />
          <select value={location} onChange={(e) => setLocation(e.target.value)} onFocus={focusOn} onBlur={(e) => focusOff(e)} style={{ ...inputStyle, paddingRight: 28, appearance: "none", backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'><polyline points='6 9 12 15 18 9'/></svg>")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}>
            <option value="">All locations</option>
            {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <SelectInput value={category} onChange={setCategory} options={["Produce", "Dairy", "Bakery", "Ready Meals", "Meat & Fish", "Frozen"]} />
        </div>
        <div style={{ marginTop: 10, fontSize: 13, color: C.muted, display: "flex", justifyContent: "space-between" }}>
          <span>Showing {filtered.length} of {batches.length} passports</span>
          {(search || status || location || category) && (
            <button onClick={clearAll} style={{ background: "none", border: "none", color: C.accent, fontWeight: 500, fontSize: 13, cursor: "pointer" }}>
              Clear all filters
            </button>
          )}
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState onClear={clearAll} />
      ) : (
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
              <thead>
                <tr style={{ background: C.bgPage, borderBottom: `1px solid ${C.border}` }}>
                  {["Batch ID", "Product", "Category", "Location", "Entry Date", "Temp", "Dwell", "RSL", "Status", "Actions"].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left", padding: "12px 16px", fontSize: 11, fontWeight: 600,
                        color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => {
                  const { rslDays, score } = computeRSL(b);
                  const st = statusFromScore(score);
                  const store = stores.find((s) => s.id === b.storeId);
                  const flash = flashId === b.id;
                  return (
                    <tr
                      key={b.id}
                      className="fp-row"
                      style={{
                        borderBottom: `1px solid ${C.border}`,
                        borderLeft: flash ? `3px solid ${C.accent}` : "3px solid transparent",
                        background: flash ? C.light : C.white,
                        transition: "background 600ms, border-color 600ms",
                      }}
                    >
                      <td style={td()}><span style={{ fontWeight: 600, color: C.primary }}>{b.id}</span></td>
                      <td style={td()}>{b.product}</td>
                      <td style={td()}><span style={{ color: C.text2, fontSize: 13 }}>{b.category}</span></td>
                      <td style={td()}>{store?.name ?? b.storeId}</td>
                      <td style={td()}><span style={{ color: C.text2 }}>{formatDate(b.productionDate)}</span></td>
                      <td style={td()}>{b.tempExcursion ? <span style={{ color: C.red }}>⚠ Excursion</span> : <span style={{ color: C.green }}>✓ Normal</span>}</td>
                      <td style={td()}><span style={{ color: C.text2 }}>{b.dwellDays}d</span></td>
                      <td style={td()}>
                        <span style={{ fontWeight: 700, color: freshnessColor(score) }}>{score}</span>
                        <span style={{ color: C.muted, fontSize: 12 }}> · {rslDays}d</span>
                      </td>
                      <td style={td()}><StatusBadge status={st} /></td>
                      <td style={td()}>
                        <button
                          onClick={() => onOpenDrawer(b.id)}
                          style={{ background: "none", border: "none", color: C.accent, fontWeight: 600, fontSize: 13, cursor: "pointer" }}
                        >
                          View →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

const td = (extra: CSSProperties = {}): CSSProperties => ({ padding: "14px 16px", fontSize: 13, color: C.text, ...extra });

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <Card style={{ textAlign: "center", padding: 60 }}>
      <Icon.Box size={48} />
      <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, marginTop: 16 }}>No passports match your filters</h3>
      <p style={{ color: C.text2, fontSize: 13, marginTop: 8 }}>Try widening your criteria or clear all filters.</p>
      <button onClick={onClear} style={{ background: "none", border: "none", color: C.accent, fontWeight: 600, marginTop: 12, cursor: "pointer", fontSize: 14 }}>
        Clear all filters
      </button>
    </Card>
  );
}

/* =========================================================================
   PASSPORT DRAWER
   ========================================================================= */
function PassportDrawer({ batch, store, onClose }: { batch: Batch; store?: Store; onClose: () => void }) {
  const r = computeRSL(batch);
  const events = [
    { icon: "🏭", label: "Produced", ts: batch.productionDate, where: batch.supplier },
    { icon: "🚛", label: "Arrived at DC", ts: batch.productionDate + 86400000, where: "Main DC" },
    { icon: "🔬", label: "Quality Check", ts: batch.productionDate + 86400000 + 3600000 * 4, where: "Main DC" },
    { icon: "🚚", label: "Dispatched", ts: batch.productionDate + 86400000 * 1.5, where: `→ ${store?.name ?? batch.storeId}` },
    { icon: "🏪", label: "Arrived at Store", ts: batch.productionDate + 86400000 * 2, where: store?.name ?? batch.storeId },
    { icon: "🛒", label: "Placed on Shelf", ts: batch.productionDate + 86400000 * 2 + 3600000 * 3, where: store?.name ?? batch.storeId },
  ];

  const drawerWidth = typeof window !== "undefined" && window.innerWidth < 768 ? "calc(100vw - 40px)" : 560;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9500 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,0.55)", animation: "fp-fade-in 200ms ease" }} />
      <div
        style={{
          position: "absolute", right: 0, top: 0, bottom: 0, width: drawerWidth, maxWidth: "100vw",
          background: C.white, overflowY: "auto", boxShadow: "-10px 0 30px rgba(0,0,0,0.18)",
          animation: "fp-slide-in 250ms ease",
        }}
      >
        <div
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "20px 24px", borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, background: C.white, zIndex: 2,
          }}
        >
          <div>
            <div style={{ fontSize: 12, color: C.muted, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>{batch.id}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: 0, letterSpacing: "-0.01em" }}>{batch.product}</h2>
              <StatusBadge status={statusFromScore(r.score)} />
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }} aria-label="Close">
            <Icon.X size={22} />
          </button>
        </div>

        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 24 }}>
          <section>
            <h3 style={drawerH3}>Passport Summary</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14, marginTop: 14 }}>
              {[
                ["Category", batch.category],
                ["SKU", batch.sku],
                ["Units in Batch", String(batch.units)],
                ["Origin", batch.origin],
                ["Current Location", store?.name ?? batch.storeId],
                ["Printed Expiry", formatDate(batch.printedExpiry)],
                ["Estimated RSL", `${r.rslDays} days`],
                ["Freshness Score", String(r.score)],
              ].map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{k}</div>
                  <div style={{ fontSize: 14, color: k === "Freshness Score" ? freshnessColor(r.score) : C.text, fontWeight: k === "Freshness Score" ? 700 : 500, marginTop: 4 }}>
                    {v}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 style={drawerH3}>Temperature History</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={batch.tempHistory} margin={{ top: 16, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid stroke={C.border} strokeDasharray="3 3" />
                <XAxis dataKey="day" stroke={C.muted} fontSize={11} />
                <YAxis stroke={C.muted} fontSize={11} domain={["auto", "auto"]} />
                <ReferenceLine y={batch.maxTemp} stroke={C.red} strokeDasharray="5 4" label={{ value: `Threshold ${batch.maxTemp}°C`, fill: C.red, fontSize: 10, position: "right" }} />
                <RTooltip contentStyle={{ borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12 }} />
                <Line type="monotone" dataKey="temp" stroke={C.accent} strokeWidth={2} dot={{ r: 4, fill: C.accent }} />
              </LineChart>
            </ResponsiveContainer>
          </section>

          <section>
            <h3 style={drawerH3}>Movement Event Log</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 14 }}>
              {events.map((e, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 999, background: C.light, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                    {e.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{e.label}</div>
                    <div style={{ fontSize: 12, color: C.text2, marginTop: 2 }}>{e.where}</div>
                  </div>
                  <div style={{ fontSize: 11, color: C.muted, whiteSpace: "nowrap" }}>{formatDate(e.ts)}</div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 style={drawerH3}>RSL Calculation Breakdown</h3>
            <div style={{ marginTop: 14, background: C.bgPage, borderRadius: 10, padding: 16, fontSize: 13 }}>
              <RslRow label="Base shelf life" value={`${batch.baseShelfLife} days`} />
              <RslRow label="Days elapsed" value={`−${r.daysSinceProduction} days`} />
              <RslRow label="Temp excursion penalty" value={`−${r.tempPenalty} days`} />
              <RslRow label="Dwell time penalty" value={`−${r.dwellPenalty} days`} />
              <div style={{ height: 1, background: C.border, margin: "10px 0" }} />
              <RslRow label="Estimated RSL" value={`${r.rslDays} days remaining`} bold />
              <div style={{ marginTop: 14, background: C.border, borderRadius: 999, height: 8, overflow: "hidden" }}>
                <div style={{ width: `${r.score}%`, height: "100%", background: freshnessColor(r.score), transition: "width 300ms" }} />
              </div>
              <div style={{ marginTop: 8, fontSize: 11, color: C.muted, display: "flex", justifyContent: "space-between" }}>
                <span>Freshness Score</span>
                <span style={{ color: freshnessColor(r.score), fontWeight: 700 }}>{r.score}/100</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
const drawerH3: CSSProperties = { fontSize: 11, color: C.accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 };
const RslRow = ({ label, value, bold }: { label: string; value: string; bold?: boolean }) => (
  <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", color: bold ? C.text : C.text2, fontWeight: bold ? 700 : 500 }}>
    <span>{label}</span><span>{value}</span>
  </div>
);

/* =========================================================================
   RSL PAGE
   ========================================================================= */
function RSLPage({ batches, stores, openTips, toggleTip }: { batches: Batch[]; stores: Store[]; openTips: Set<string>; toggleTip: SetTooltip }) {
  const rows = batches.map((b) => ({ b, ...computeRSL(b) })).sort((a, b) => a.rslDays - b.rslDays);
  const safe = rows.filter((r) => r.rslDays > 5).length;
  const monitor = rows.filter((r) => r.rslDays >= 2 && r.rslDays <= 5).length;
  const actNow = rows.filter((r) => r.rslDays < 2).length;

  return (
    <div>
      <PageTitle eyebrow="Shelf Intelligence" title="RSL Monitor" tipKey="rsl" openTips={openTips} toggleTip={toggleTip} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
        <Card style={{ borderLeft: `4px solid ${C.green}` }}>
          <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Safe (RSL &gt; 5 days)</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: C.green, marginTop: 6 }}>{safe + 180}</div>
          <div style={{ fontSize: 12, color: C.text2 }}>products in this band</div>
        </Card>
        <Card style={{ borderLeft: `4px solid ${C.amber}` }}>
          <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Monitor (2–5 days)</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: C.amber, marginTop: 6 }}>{monitor + 18}</div>
          <div style={{ fontSize: 12, color: C.text2 }}>products in this band</div>
        </Card>
        <Card style={{ borderLeft: `4px solid ${C.red}` }}>
          <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Act Now (&lt; 2 days)</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: C.red, marginTop: 6 }}>{actNow + 6}</div>
          <div style={{ fontSize: 12, color: C.text2 }}>require intervention</div>
        </Card>
      </div>

      <Card style={{ padding: 0, marginBottom: 24, overflow: "hidden" }}>
        <div style={{ padding: 24, paddingBottom: 0 }}>
          <SectionHeader title="RSL Urgency Table" tipKey="rslTable" openTips={openTips} toggleTip={toggleTip} />
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
            <thead>
              <tr style={{ background: C.bgPage, borderBottom: `1px solid ${C.border}` }}>
                {["Product", "Batch", "Store", "Category", "RSL", "Score", "Risk", "Recommended Action"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(({ b, rslDays, score }) => {
                const accent = rslDays < 2 ? C.red : rslDays <= 5 ? C.amber : "transparent";
                return (
                  <tr key={b.id} className="fp-row" style={{ borderBottom: `1px solid ${C.border}`, borderLeft: `4px solid ${accent}` }}>
                    <td style={td()}>{b.product}</td>
                    <td style={td()}><span style={{ color: C.primary, fontWeight: 600 }}>{b.id}</span></td>
                    <td style={td()}>{stores.find((s) => s.id === b.storeId)?.name ?? b.storeId}</td>
                    <td style={td()}><span style={{ color: C.text2 }}>{b.category}</span></td>
                    <td style={td()}><b>{rslDays}d</b></td>
                    <td style={td()}><span style={{ color: freshnessColor(score), fontWeight: 700 }}>{score}</span></td>
                    <td style={td()}><StatusBadge status={statusFromScore(score)} /></td>
                    <td style={td()}><span style={{ color: C.text2, fontSize: 13 }}>{rslToAction(rslDays)}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <SectionHeader title="RSL Trend (Last 14 Days)" tipKey="rslTrend" openTips={openTips} toggleTip={toggleTip} />
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={RSL_TREND_14D}>
            <defs>
              <linearGradient id="atrisk" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C.accent} stopOpacity={0.4} />
                <stop offset="100%" stopColor={C.accent} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={C.border} strokeDasharray="3 3" />
            <XAxis dataKey="day" stroke={C.muted} fontSize={11} />
            <YAxis stroke={C.muted} fontSize={11} />
            <RTooltip contentStyle={{ borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12 }} />
            <Area type="monotone" dataKey="atRisk" stroke={C.accent} strokeWidth={2} fill="url(#atrisk)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

/* =========================================================================
   WASTE PAGE
   ========================================================================= */
function WastePage({ stores, openTips, toggleTip }: { stores: Store[]; openTips: Set<string>; toggleTip: SetTooltip }) {
  const driverData = [
    { name: "Forecast Bias", value: 4200 },
    { name: "Late Deliveries", value: 3100 },
    { name: "Temp Excursions", value: 2400 },
    { name: "Store Rotation", value: 1900 },
    { name: "Markdown Delays", value: 1300 },
  ];
  const barColors = [C.primary, "#2E4F8C", C.accent, "#60A5FA", "#93C5FD"];

  const categoryData = [
    { name: "Produce", value: 41, color: C.primary },
    { name: "Dairy", value: 27, color: C.accent },
    { name: "Ready Meals", value: 18, color: "#60A5FA" },
    { name: "Bakery", value: 14, color: "#93C5FD" },
  ];

  return (
    <div>
      <PageTitle eyebrow="Root Cause" title="Waste Analytics" tipKey="waste" openTips={openTips} toggleTip={toggleTip} />

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,3fr) minmax(0,2fr)", gap: 16, marginBottom: 24 }}>
        <Card>
          <SectionHeader title="Waste by Driver" tipKey="wasteByDriver" openTips={openTips} toggleTip={toggleTip} />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={driverData} layout="vertical" margin={{ left: 30 }}>
              <CartesianGrid stroke={C.border} horizontal={false} />
              <XAxis type="number" stroke={C.muted} fontSize={11} tickFormatter={(v) => `£${v}`} />
              <YAxis type="category" dataKey="name" stroke={C.text2} fontSize={12} width={110} />
              <RTooltip formatter={(v: number) => formatGBP(v)} contentStyle={{ borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12 }} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {driverData.map((_, i) => <Cell key={i} fill={barColors[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <SectionHeader title="Waste by Product Category" tipKey="wasteByCategory" openTips={openTips} toggleTip={toggleTip} />
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={categoryData} dataKey="value" innerRadius={55} outerRadius={90} paddingAngle={2}>
                {categoryData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <RTooltip contentStyle={{ borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 12 }}>
            {categoryData.map((d) => (
              <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.text2 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: d.color }} />{d.name} · <b style={{ color: C.text }}>{d.value}%</b>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card style={{ padding: 0, marginBottom: 24, overflow: "hidden" }}>
        <div style={{ padding: 24, paddingBottom: 0 }}>
          <SectionHeader title="Waste Incidents Log" tipKey="wasteLog" openTips={openTips} toggleTip={toggleTip} />
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
            <thead>
              <tr style={{ background: C.bgPage, borderBottom: `1px solid ${C.border}` }}>
                {["Date", "Product", "Batch", "Store", "Driver", "Units", "Cost", "Preventable?"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {WASTE_INCIDENTS.map((w, i) => (
                <tr key={i} className="fp-row" style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={td()}>{formatDate(w.date)}</td>
                  <td style={td()}>{w.product}</td>
                  <td style={td()}><span style={{ color: C.primary, fontWeight: 600 }}>{w.batch}</span></td>
                  <td style={td()}>{stores.find((s) => s.id === w.storeId)?.name ?? w.storeId}</td>
                  <td style={td()}><span style={{ color: C.text2 }}>{w.driver}</span></td>
                  <td style={td()}>{w.units}</td>
                  <td style={td()}><b>{formatGBP(w.cost)}</b></td>
                  <td style={td()}>
                    <span style={{
                      background: w.preventable ? "#DCFCE7" : "#F1F5F9",
                      color: w.preventable ? "#166534" : C.text2,
                      fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 999,
                    }}>
                      {w.preventable ? "Yes" : "No"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <SectionHeader title="Weekly Waste Trend" tipKey="wasteWeekly" openTips={openTips} toggleTip={toggleTip} />
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={WASTE_TREND_8W}>
            <CartesianGrid stroke={C.border} strokeDasharray="3 3" />
            <XAxis dataKey="week" stroke={C.muted} fontSize={11} />
            <YAxis yAxisId="left" stroke={C.muted} fontSize={11} tickFormatter={(v) => `£${v}`} />
            <YAxis yAxisId="right" orientation="right" stroke={C.muted} fontSize={11} />
            <RTooltip contentStyle={{ borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line yAxisId="left" type="monotone" dataKey="total" name="Total waste (£)" stroke={C.red} strokeWidth={2} />
            <Line yAxisId="left" type="monotone" dataKey="preventable" name="Preventable (£)" stroke={C.amber} strokeWidth={2} />
            <Line yAxisId="right" type="monotone" dataKey="interventions" name="Interventions" stroke={C.green} strokeWidth={2} strokeDasharray="4 4" />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

/* =========================================================================
   ACTION PAGE
   ========================================================================= */
function ActionPage({
  tasks, stores, setTasks, openTips, toggleTip,
}: { tasks: Task[]; stores: Store[]; setTasks: React.Dispatch<React.SetStateAction<Task[]>>; openTips: Set<string>; toggleTip: SetTooltip }) {
  const todo = tasks.filter((t) => t.status === "todo");
  const inprog = tasks.filter((t) => t.status === "inprogress");
  const done = tasks.filter((t) => t.status === "done");
  const overdue = tasks.filter((t) => t.status !== "done" && Date.now() - t.assignedAt > 2 * 86400000).length;

  const updateStatus = (id: string, status: Task["status"]) =>
    setTasks((arr) => arr.map((t) => (t.id === id ? { ...t, status } : t)));

  return (
    <div>
      <PageTitle eyebrow="Workflow" title="Action Engine" tipKey="action" openTips={openTips} toggleTip={toggleTip} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        <KpiCard label="New Tasks" value={String(todo.length)} subtitle="In TO DO" subtitleColor={C.accent} />
        <KpiCard label="In Progress" value={String(inprog.length)} subtitle="Active" subtitleColor={C.amber} />
        <KpiCard label="Completed Today" value={String(done.length + 19)} subtitle="Closed loops" subtitleColor={C.green} />
        <KpiCard label="Overdue" value={String(overdue)} badge={{ text: "Needs review", color: C.red }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 16 }}>
        <KanbanColumn title="TO DO" count={todo.length} color={C.red} tasks={todo} stores={stores} onAction={(id) => updateStatus(id, "inprogress")} actionLabel="Start Task" />
        <KanbanColumn title="IN PROGRESS" count={inprog.length} color={C.amber} tasks={inprog} stores={stores} onAction={(id) => updateStatus(id, "done")} actionLabel="Mark Complete" />
        <KanbanColumn title="COMPLETED" count={done.length} color={C.green} tasks={done} stores={stores} done />
      </div>
    </div>
  );
}

function KanbanColumn({
  title, count, color, tasks, stores, onAction, actionLabel, done,
}: {
  title: string; count: number; color: string; tasks: Task[]; stores: Store[];
  onAction?: (id: string) => void; actionLabel?: string; done?: boolean;
}) {
  return (
    <div>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "10px 14px", background: `${color}1A`, borderTop: `3px solid ${color}`, borderRadius: "8px 8px 0 0",
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: "0.08em", textTransform: "uppercase" }}>{title}</div>
        <div style={{ background: color, color: C.white, borderRadius: 999, fontSize: 11, padding: "1px 8px", fontWeight: 700 }}>{count}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "10px 0" }}>
        {tasks.map((t) => {
          const overdue = !done && Date.now() - t.assignedAt > 2 * 86400000;
          const store = stores.find((s) => s.id === t.storeId);
          const priColor = t.priority === "URGENT" ? C.red : t.priority === "HIGH" ? C.amber : C.accent;
          return (
            <Card key={t.id} style={{ padding: 16, opacity: done ? 0.7 : 1, position: "relative" }}>
              {done && (
                <div style={{ position: "absolute", top: 12, right: 12 }}>
                  <Icon.Check />
                </div>
              )}
              <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
                <span style={{ background: priColor, color: C.white, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4, letterSpacing: "0.05em" }}>{t.priority}</span>
                {overdue && <span style={{ background: C.red, color: C.white, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4 }}>OVERDUE</span>}
              </div>
              <div style={{ fontSize: 12, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{t.type}</div>
              <div style={{ fontWeight: 600, fontSize: 14, color: C.text }}>{t.product} · <span style={{ color: C.primary }}>{t.batchId}</span></div>
              <div style={{ fontSize: 12, color: C.text2, marginTop: 2 }}>{store?.name ?? t.storeId}</div>
              <div style={{ fontSize: 13, color: C.text2, marginTop: 8, lineHeight: 1.5 }}>{t.instruction}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                <div style={{ fontSize: 11, color: C.muted }}>{t.rslDays}d RSL</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 999, background: C.badgeBlueBg, color: C.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>
                    {t.assignee}
                  </div>
                  {!done && onAction && (
                    <button onClick={() => onAction(t.id)} style={{ background: C.primary, color: C.white, border: "none", borderRadius: 6, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: FONT }}>
                      {actionLabel}
                    </button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
        {tasks.length === 0 && (
          <div style={{ padding: 20, textAlign: "center", color: C.muted, fontSize: 13, border: `1px dashed ${C.border}`, borderRadius: 8 }}>
            No tasks
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   IMPACT PAGE
   ========================================================================= */
function ImpactPage({
  stores, openTips, toggleTip, pushToast,
}: { stores: Store[]; openTips: Set<string>; toggleTip: SetTooltip; pushToast: (k: "success" | "error" | "info", m: string) => void }) {
  const league = STORE_LEAGUE(stores);
  const onShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Freshness Passport ESG Summary", text: "Monthly impact report", url: location.href });
        return;
      } catch {/* ignore */}
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(location.href);
    }
    pushToast("info", "Link copied to clipboard");
  };

  return (
    <div>
      <PageTitle eyebrow="Sustainability" title="Impact Report" tipKey="impact" openTips={openTips} toggleTip={toggleTip} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16, marginBottom: 24 }}>
        <KpiCard label="Waste Reduced This Month" value="847 kg" subtitle="↑ 18.0% vs last month" subtitleColor={C.green} />
        <KpiCard label="Cost Savings" value={formatGBP(12400)} subtitle="↑ 14.0% MoM" subtitleColor={C.green} />
        <KpiCard label="CO₂ Avoided" value="2.3 tonnes" subtitle="🌿 Net positive" subtitleColor={C.green} />
        <KpiCard label="Interventions Completed" value="186" subtitle="Closed-loop tasks" subtitleColor={C.accent} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 16, marginBottom: 24 }}>
        <Card>
          <SectionHeader title="Monthly Waste Reduction Trend" tipKey="impact" openTips={openTips} toggleTip={toggleTip} />
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={MONTHLY_IMPACT_12M}>
              <CartesianGrid stroke={C.border} strokeDasharray="3 3" />
              <XAxis dataKey="month" stroke={C.muted} fontSize={11} />
              <YAxis stroke={C.muted} fontSize={11} tickFormatter={(v) => `£${v}`} />
              <RTooltip formatter={(v: number) => formatGBP(v)} contentStyle={{ borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12 }} />
              <Bar dataKey="waste" fill={C.accent} radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey="trend" stroke={C.green} strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <SectionHeader title="Intervention Impact Breakdown" tipKey="impact" openTips={openTips} toggleTip={toggleTip} />
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={INTERVENTION_STACK_6M}>
              <CartesianGrid stroke={C.border} strokeDasharray="3 3" />
              <XAxis dataKey="month" stroke={C.muted} fontSize={11} />
              <YAxis stroke={C.muted} fontSize={11} />
              <RTooltip contentStyle={{ borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="fefo" stackId="a" fill={C.primary} name="FEFO Rotations" />
              <Bar dataKey="markdown" stackId="a" fill={C.accent} name="Markdowns" />
              <Bar dataKey="allocation" stackId="a" fill="#60A5FA" name="Allocations" />
              <Bar dataKey="coldchain" stackId="a" fill="#93C5FD" name="Cold Chain" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card style={{ marginBottom: 24, border: `1px solid ${C.primary}`, background: "linear-gradient(180deg, #FFFFFF 0%, #F8FAFF 100%)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.accent, textTransform: "uppercase", letterSpacing: "0.1em" }}>Monthly ESG Summary</div>
            <h3 style={{ fontSize: 24, fontWeight: 700, color: C.primary, letterSpacing: "-0.02em", margin: "6px 0 0" }}>June 2026</h3>
          </div>
          <div className="fp-no-print" style={{ display: "flex", gap: 8 }}>
            <SecondaryButton onClick={() => window.print()} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Icon.Download /> Export PDF Report
            </SecondaryButton>
            <PrimaryButton onClick={onShare} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Icon.Share /> Share with Sustainability Team
            </PrimaryButton>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 24, marginTop: 24, padding: "20px 0", borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
          <EsgStat label="Food waste prevented" value="847 kg" />
          <EsgStat label="Cost recovered" value={formatGBP(12400)} />
          <EsgStat label="CO₂ emissions avoided" value="2.3 t" />
        </div>
        <p style={{ marginTop: 16, fontSize: 13, color: C.text2, lineHeight: 1.7, maxWidth: 760 }}>
          Across all six locations, Freshness Passport interventions prevented an estimated 847 kg of food waste,
          recovering {formatGBP(12400)} in margin and avoiding 2.3 tonnes of CO₂ equivalent emissions. The
          platform's RSL forecasting and FEFO rotation engine drove the majority of the gain, with the largest
          improvements observed in Produce and Dairy categories.
        </p>
      </Card>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: 24, paddingBottom: 0 }}>
          <SectionHeader title="Store-by-Store Performance" tipKey="league" openTips={openTips} toggleTip={toggleTip} />
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
            <thead>
              <tr style={{ background: C.bgPage, borderBottom: `1px solid ${C.border}` }}>
                {["Rank", "Store", "Waste Reduction", "Trend", "8-Week Trend"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {league.map((l, i) => (
                <tr key={l.store.id} className="fp-row" style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={td()}>
                    <span style={{ fontWeight: 700, color: C.primary }}>#{i + 1}</span>
                    {i === 0 && (
                      <span style={{ marginLeft: 8, background: "#FEF3C7", color: "#92400E", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999 }}>
                        🏆 Top Performer
                      </span>
                    )}
                  </td>
                  <td style={td()}>{l.store.name}</td>
                  <td style={td()}><span style={{ color: C.green, fontWeight: 700 }}>{formatPct(l.reduction)}</span></td>
                  <td style={td()}><span style={{ color: l.arrow === "↑" ? C.green : C.red, fontWeight: 700, fontSize: 14 }}>{l.arrow}</span></td>
                  <td style={td()}>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 28 }}>
                      {l.trend.map((v, k) => (
                        <div key={k} style={{ width: 6, height: Math.max(4, v), background: C.accent, borderRadius: 2 }} />
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

const EsgStat = ({ label, value }: { label: string; value: string }) => (
  <div>
    <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
    <div style={{ fontSize: 26, fontWeight: 700, color: C.primary, letterSpacing: "-0.02em", marginTop: 4 }}>{value}</div>
  </div>
);

/* =========================================================================
   STORE PROFILE PAGE
   ========================================================================= */
function StoreProfilePage({
  store, batches, tasks, activity, stores, openTips, toggleTip, onBack, onOpenDrawer, onOpenPassportModal, flashId,
}: {
  store: Store; batches: Batch[]; tasks: Task[]; activity: Activity[]; stores: Store[];
  openTips: Set<string>; toggleTip: SetTooltip; onBack: () => void;
  onOpenDrawer: (id: string) => void; onOpenPassportModal: () => void; flashId: string | null;
}) {
  const [tab, setTab] = useState<"overview" | "products" | "performance" | "actions">("overview");
  const storeBatches = batches.filter((b) => b.storeId === store.id);
  const storeTasks = tasks.filter((t) => t.storeId === store.id);
  const storeActivity = activity.filter((a) => a.storeId === store.id);
  const avgScore = storeBatches.length
    ? Math.round(storeBatches.reduce((a, b) => a + computeRSL(b).score, 0) / storeBatches.length)
    : 78;
  const atRisk = storeBatches.filter((b) => computeRSL(b).score < 75).length + 4;
  const tierColors: Record<string, string> = { Pilot: C.amber, Standard: C.accent, Enterprise: C.green };

  return (
    <div>
      <button onClick={onBack} style={{ background: "none", border: "none", color: C.accent, fontSize: 13, fontWeight: 500, cursor: "pointer", marginBottom: 12, padding: 0 }}>
        ← Back to Dashboard
      </button>

      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ width: 80, height: 80, borderRadius: 999, background: C.light, color: C.primary, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 24, flexShrink: 0, overflow: "hidden" }}>
            {store.logoUrl ? <img src={store.logoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : store.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
          </div>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text, letterSpacing: "-0.02em", margin: 0 }}>{store.name}</h1>
              <InfoButton open={openTips.has("storeProfile")} onClick={() => toggleTip("storeProfile")} />
              <span style={{ background: C.badgeBlueBg, color: C.badgeBlueText, fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 999 }}>{store.code}</span>
              <span style={{ background: `${tierColors[store.tier]}1A`, color: tierColors[store.tier], fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 999, textTransform: "uppercase", letterSpacing: "0.06em" }}>{store.tier}</span>
            </div>
            <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Active since {formatDate(store.activeSince)}</div>
            <div style={{ fontSize: 14, color: C.text2, marginTop: 4 }}>{store.address}, {store.city} {store.postcode}</div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: C.text2, marginTop: 6 }}>
              <Icon.Person /> {store.manager}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <SecondaryButton>Edit Store Profile</SecondaryButton>
            <PrimaryButton onClick={onOpenPassportModal}>+ New Passport</PrimaryButton>
          </div>
        </div>
        {openTips.has("storeProfile") && (
          <div style={{ marginTop: 14, background: C.light, borderLeft: `3px solid ${C.accent}`, color: C.primary, padding: "12px 16px", borderRadius: 6, fontSize: 13, lineHeight: 1.6 }}>
            {TIPS.storeProfile}
          </div>
        )}
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginBottom: 24 }}>
        <KpiCard label="Active Passports" value={String(storeBatches.length * 12 + 22)} subtitle="In this store" />
        <KpiCard label="Products At Risk" value={String(atRisk)} badge={{ text: "⚠ Action", color: C.amber }} />
        <KpiCard label="Waste This Week" value={formatGBP(420)} subtitle="↓ 8.0% vs last week" subtitleColor={C.green} />
        <KpiCard label="Freshness Score" value={`${avgScore}%`} subtitle={statusFromScore(avgScore)} subtitleColor={freshnessColor(avgScore)} />
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, borderBottom: `1px solid ${C.border}` }}>
        {(["overview", "products", "performance", "actions"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              background: "none", border: "none", padding: "10px 16px", fontSize: 14, fontWeight: 600,
              color: tab === t ? C.primary : C.text2, borderBottom: `2px solid ${tab === t ? C.accent : "transparent"}`,
              cursor: "pointer", marginBottom: -1, fontFamily: FONT, textTransform: "capitalize",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,2fr) minmax(0,1fr)", gap: 16 }}>
          <Card>
            <SectionHeader title="Recent Activity" tipKey="activity" openTips={openTips} toggleTip={toggleTip} />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(storeActivity.length ? storeActivity : activity.slice(0, 4)).map((a) => (
                <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderLeft: `2px solid ${C.border}` }}>
                  <span style={{ fontSize: 18 }}>{a.icon}</span>
                  <div style={{ flex: 1, fontSize: 13 }}>{a.text}</div>
                  <span style={{ fontSize: 12, color: C.muted }}>{timeAgo(a.ts)}</span>
                </div>
              ))}
            </div>
          </Card>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Card>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>Store Freshness Score</div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <FreshnessGauge score={avgScore} />
              </div>
            </Card>
            <Card>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Top Waste Drivers</div>
              {[{ name: "Forecast Bias", v: 38 }, { name: "Late Deliveries", v: 24 }, { name: "Markdown Delays", v: 18 }].map((d) => (
                <div key={d.name} style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                    <span>{d.name}</span><b>{d.v}%</b>
                  </div>
                  <div style={{ background: C.border, borderRadius: 999, height: 6 }}>
                    <div style={{ width: `${d.v * 2}%`, height: "100%", background: C.accent, borderRadius: 999 }} />
                  </div>
                </div>
              ))}
            </Card>
          </div>
        </div>
      )}

      {tab === "products" && (
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: 16, display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ fontWeight: 600 }}>Passports in {store.name}</div>
            <PrimaryButton onClick={onOpenPassportModal} style={{ padding: "8px 14px", fontSize: 13 }}>+ New Passport</PrimaryButton>
          </div>
          {storeBatches.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: C.muted }}>No passports yet for this store.</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
                <thead>
                  <tr style={{ background: C.bgPage }}>
                    {["Batch", "Product", "Category", "RSL", "Status", ""].map((h) => (
                      <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {storeBatches.map((b) => {
                    const { score, rslDays } = computeRSL(b);
                    const flash = flashId === b.id;
                    return (
                      <tr key={b.id} className="fp-row" style={{ borderTop: `1px solid ${C.border}`, borderLeft: flash ? `3px solid ${C.accent}` : "3px solid transparent", background: flash ? C.light : C.white, transition: "background 600ms, border-color 600ms" }}>
                        <td style={td()}><span style={{ color: C.primary, fontWeight: 600 }}>{b.id}</span></td>
                        <td style={td()}>{b.product}</td>
                        <td style={td()}>{b.category}</td>
                        <td style={td()}><b>{rslDays}d</b> · <span style={{ color: freshnessColor(score), fontWeight: 700 }}>{score}</span></td>
                        <td style={td()}><StatusBadge status={statusFromScore(score)} /></td>
                        <td style={td()}><button onClick={() => onOpenDrawer(b.id)} style={{ background: "none", border: "none", color: C.accent, fontWeight: 600, cursor: "pointer" }}>View →</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {tab === "performance" && (
        <div style={{ display: "grid", gap: 16 }}>
          <Card>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>8-Week Waste Trend vs Network Average</div>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={WASTE_TREND_8W}>
                <CartesianGrid stroke={C.border} strokeDasharray="3 3" />
                <XAxis dataKey="week" stroke={C.muted} fontSize={11} />
                <YAxis stroke={C.muted} fontSize={11} tickFormatter={(v) => `£${v}`} />
                <RTooltip formatter={(v: number) => formatGBP(v)} contentStyle={{ borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="total" name={`${store.name} waste`} stroke={C.accent} strokeWidth={2} />
                <Line type="monotone" dataKey="preventable" name="Network average" stroke={C.muted} strokeWidth={2} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
            <Card style={{ borderTop: `3px solid ${C.green}` }}>
              <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Best performing category</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: C.text, marginTop: 6 }}>Dairy</div>
              <div style={{ color: C.green, fontWeight: 600, marginTop: 4 }}>↓ 24% waste vs last month</div>
            </Card>
            <Card style={{ borderTop: `3px solid ${C.red}` }}>
              <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Worst performing category</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: C.text, marginTop: 6 }}>Bakery</div>
              <div style={{ color: C.red, fontWeight: 600, marginTop: 4 }}>↑ 6% waste vs last month</div>
            </Card>
          </div>
        </div>
      )}

      {tab === "actions" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
          {storeTasks.length === 0 ? (
            <Card style={{ gridColumn: "1/-1", textAlign: "center", color: C.muted }}>No tasks for this store.</Card>
          ) : (
            storeTasks.map((t) => (
              <Card key={t.id} style={{ padding: 16 }}>
                <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{t.type}</div>
                <div style={{ fontWeight: 600, marginTop: 4 }}>{t.product} · <span style={{ color: C.primary }}>{t.batchId}</span></div>
                <div style={{ fontSize: 13, color: C.text2, marginTop: 6 }}>{t.instruction}</div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 12 }}>
                  <span style={{ color: t.status === "done" ? C.green : t.status === "inprogress" ? C.amber : C.red, fontWeight: 700, textTransform: "uppercase" }}>{t.status === "inprogress" ? "in progress" : t.status}</span>
                  <span style={{ color: C.muted }}>Assigned {timeAgo(t.assignedAt)}</span>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function FreshnessGauge({ score }: { score: number }) {
  const r = 70, C2 = 2 * Math.PI * r;
  const offset = C2 * (1 - score / 100);
  const color = freshnessColor(score);
  return (
    <svg width={180} height={180} viewBox="0 0 180 180">
      <circle cx="90" cy="90" r={r} fill="none" stroke={C.border} strokeWidth={14} />
      <circle
        cx="90" cy="90" r={r} fill="none" stroke={color} strokeWidth={14}
        strokeDasharray={C2} strokeDashoffset={offset} strokeLinecap="round"
        transform="rotate(-90 90 90)"
        style={{ transition: "stroke-dashoffset 600ms" }}
      />
      <text x="90" y="92" textAnchor="middle" fontSize="36" fontWeight="700" fill={C.text} fontFamily={FONT}>{score}</text>
      <text x="90" y="118" textAnchor="middle" fontSize="11" fill={C.muted} fontFamily={FONT} letterSpacing="0.08em">{statusFromScore(score).toUpperCase()}</text>
    </svg>
  );
}

/* =========================================================================
   MODAL SHELL + STORE MODAL + PASSPORT MODAL
   ========================================================================= */
function ModalShell({ title, onClose, children, footer }: { title: string; onClose: () => void; children: ReactNode; footer: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [onClose]);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9800, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 20px", overflowY: "auto" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", animation: "fp-fade-in 200ms ease" }} />
      <div style={{ position: "relative", background: C.white, borderRadius: 16, width: "100%", maxWidth: 680, padding: 40, boxShadow: "0 20px 60px rgba(0,0,0,0.25)", animation: "fp-fade-in 200ms ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.primary, letterSpacing: "0.1em", textTransform: "uppercase" }}>{title}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: C.muted }} onMouseEnter={(e) => (e.currentTarget.style.color = C.primary)} onMouseLeave={(e) => (e.currentTarget.style.color = C.muted)} aria-label="Close">
            <Icon.X size={22} />
          </button>
        </div>
        {children}
        <div style={{ marginTop: 28, paddingTop: 20, borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          {footer}
        </div>
      </div>
    </div>
  );
}

function TabBar({ tabs, current, onChange, incomplete }: { tabs: { id: string; label: string }[]; current: string; onChange: (id: string) => void; incomplete?: Set<string> }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
      {tabs.map((t) => {
        const active = current === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            style={{
              background: active ? C.primary : "transparent", color: active ? C.white : C.text2,
              border: "none", borderRadius: 20, padding: "8px 20px", fontWeight: 600, fontSize: 13,
              cursor: "pointer", fontFamily: FONT, position: "relative", transition: "all 150ms",
            }}
          >
            {t.label}
            {incomplete?.has(t.id) && (
              <span style={{ position: "absolute", top: 4, right: 6, width: 7, height: 7, borderRadius: 999, background: C.amber }} />
            )}
          </button>
        );
      })}
    </div>
  );
}

function AvatarUpload({ logoUrl, onChange, defaultIcon, caption }: { logoUrl?: string; onChange: (v?: string) => void; defaultIcon: ReactNode; caption: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const onPick = (f?: File) => {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(f);
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ position: "relative", width: 110, height: 110 }}>
        <div style={{ width: 110, height: 110, borderRadius: 999, background: C.border, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          {logoUrl ? <img src={logoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : defaultIcon}
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          title="Upload Logo"
          style={{ position: "absolute", bottom: 4, right: 4, width: 28, height: 28, borderRadius: 999, background: C.primary, border: `2px solid ${C.white}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
        >
          <Icon.Pencil />
        </button>
        <input ref={inputRef} type="file" accept="image/*" onChange={(e) => onPick(e.target.files?.[0])} style={{ display: "none" }} />
      </div>
      <div style={{ fontSize: 12, color: C.muted }}>{caption}</div>
    </div>
  );
}

function StoreModal({ onClose, onSubmit, existingIds }: { onClose: () => void; onSubmit: (s: Store) => void; existingIds: string[] }) {
  const [tab, setTab] = useState("details");
  const [form, setForm] = useState({
    logoUrl: undefined as string | undefined,
    name: "", code: "", type: "Supermarket", city: "", region: "",
    address: "", country: "UK", postcode: "",
    manager: "", email: "", phone: "", activeSince: "",
    tier: "Standard" as "Pilot" | "Standard" | "Enterprise",
    checkouts: "", size: "", coldUnits: "", deliveryFreq: "Daily",
    categories: [] as string[], erp: "", wms: "", notes: "",
    alertEmail: true, alertDaily: true, alertSlack: false, alertSMS: false,
    rslThreshold: 3, reportFreq: "Weekly", defaultView: "Overview",
  });
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const [errors, setErrors] = useState<Record<string, string>>({});
  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Store name is required";
    if (!form.code.trim()) e.code = "Store ID is required";
    else if (existingIds.includes(form.code.trim())) e.code = "Store ID already exists";
    if (!form.city.trim()) e.city = "City is required";
    if (!form.manager.trim()) e.manager = "Manager name is required";
    setErrors(e);
    return e;
  };

  const submit = () => {
    const e = validate();
    if (Object.keys(e).length) {
      if (["name", "code", "city"].some((k) => e[k])) setTab("details");
      return;
    }
    const id = `S${Date.now().toString().slice(-5)}`;
    onSubmit({
      id, code: form.code.trim(), name: form.name.trim(), city: form.city.trim(),
      region: form.region, address: form.address, country: form.country, postcode: form.postcode,
      manager: form.manager.trim(), email: form.email, phone: form.phone,
      activeSince: form.activeSince ? new Date(form.activeSince).getTime() : Date.now(),
      tier: form.tier, type: form.type, logoUrl: form.logoUrl,
    });
  };

  const errCount = Object.keys(errors).length;

  return (
    <ModalShell
      title="Store Profile"
      onClose={onClose}
      footer={
        <>
          <span style={{ fontSize: 12, color: C.muted }}>* Required fields</span>
          <div style={{ display: "flex", gap: 8 }}>
            <SecondaryButton onClick={onClose} style={{ borderColor: C.border, color: C.text2 }}>Cancel</SecondaryButton>
            <PrimaryButton onClick={submit}>Save Store Profile</PrimaryButton>
          </div>
        </>
      }
    >
      <TabBar
        current={tab}
        onChange={setTab}
        tabs={[{ id: "details", label: "Store Details" }, { id: "ops", label: "Operations" }, { id: "prefs", label: "Preferences" }]}
      />

      {errCount > 0 && (
        <div style={{ background: "#FEE2E2", color: "#991B1B", border: `1px solid #FCA5A5`, padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 16, fontWeight: 600 }}>
          Please complete {errCount} required field{errCount > 1 ? "s" : ""}
        </div>
      )}

      {tab === "details" && (
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 28 }}>
          <AvatarUpload logoUrl={form.logoUrl} onChange={(v) => set("logoUrl", v)} defaultIcon={<Icon.Building size={42} />} caption="Store Logo" />
          <div style={{ display: "grid", gap: 14 }}>
            <div>
              <Label required>Store Name</Label>
              <TextInput value={form.name} onChange={(v) => set("name", v)} placeholder="Enter store name" error={!!errors.name} />
              {errors.name && <ErrorText>{errors.name}</ErrorText>}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <Label required>Store ID / Code</Label>
                <TextInput value={form.code} onChange={(v) => set("code", v)} placeholder="e.g. STR-001" error={!!errors.code} />
                {errors.code && <ErrorText>{errors.code}</ErrorText>}
              </div>
              <div>
                <Label>Store Type</Label>
                <SelectInput value={form.type} onChange={(v) => set("type", v)} options={["Supermarket", "Convenience", "Warehouse", "Distribution Centre", "Flagship"]} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <Label required>City</Label>
                <TextInput value={form.city} onChange={(v) => set("city", v)} placeholder="Enter city" error={!!errors.city} />
                {errors.city && <ErrorText>{errors.city}</ErrorText>}
              </div>
              <div>
                <Label>Region / County</Label>
                <TextInput value={form.region} onChange={(v) => set("region", v)} placeholder="e.g. South West" />
              </div>
            </div>
            <div>
              <Label>Full Address</Label>
              <TextInput value={form.address} onChange={(v) => set("address", v)} placeholder="Street address, postcode" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <Label>Country</Label>
                <SelectInput value={form.country} onChange={(v) => set("country", v)} options={["UK", "Ireland", "France", "Germany", "Other"]} />
              </div>
              <div>
                <Label>Postcode</Label>
                <TextInput value={form.postcode} onChange={(v) => set("postcode", v)} placeholder="e.g. BS1 4DJ" />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <Label required>Store Manager Name</Label>
                <TextInput value={form.manager} onChange={(v) => set("manager", v)} placeholder="Full name" error={!!errors.manager} />
                {errors.manager && <ErrorText>{errors.manager}</ErrorText>}
              </div>
              <div>
                <Label>Manager Email</Label>
                <TextInput value={form.email} onChange={(v) => set("email", v)} placeholder="email@store.com" />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <Label>Contact Phone</Label>
                <TextInput value={form.phone} onChange={(v) => set("phone", v)} placeholder="+44..." />
              </div>
              <div>
                <Label>Active Since</Label>
                <TextInput value={form.activeSince} onChange={(v) => set("activeSince", v)} placeholder="DD-MM-YYYY" type="date" />
              </div>
            </div>
            <div>
              <Label>Subscription Tier</Label>
              <RadioPills options={["Pilot Programme", "Standard Platform", "Enterprise Network"]} value={
                form.tier === "Pilot" ? "Pilot Programme" : form.tier === "Standard" ? "Standard Platform" : "Enterprise Network"
              } onChange={(v) => set("tier", v.startsWith("Pilot") ? "Pilot" : v.startsWith("Standard") ? "Standard" : "Enterprise")} />
            </div>
          </div>
        </div>
      )}

      {tab === "ops" && (
        <div style={{ display: "grid", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><Label>Number of Checkouts</Label><TextInput type="number" value={form.checkouts} onChange={(v) => set("checkouts", v)} placeholder="e.g. 12" /></div>
            <div><Label>Store Size (sq ft)</Label><TextInput type="number" value={form.size} onChange={(v) => set("size", v)} placeholder="e.g. 18000" /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><Label>Cold Storage Units</Label><TextInput type="number" value={form.coldUnits} onChange={(v) => set("coldUnits", v)} placeholder="e.g. 6" /></div>
            <div><Label>Delivery Frequency</Label><SelectInput value={form.deliveryFreq} onChange={(v) => set("deliveryFreq", v)} options={["Daily", "Every 2 Days", "3x Weekly", "Weekly"]} /></div>
          </div>
          <div>
            <Label>Primary Product Categories</Label>
            <CheckboxPills value={form.categories} onChange={(v) => set("categories", v)} options={["Produce", "Dairy", "Bakery", "Ready Meals", "Meat & Fish", "Frozen", "Dry Goods"]} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><Label>ERP System</Label><SelectInput value={form.erp} onChange={(v) => set("erp", v)} options={["SAP", "Oracle", "Microsoft Dynamics", "Other", "None"]} /></div>
            <div><Label>WMS System</Label><SelectInput value={form.wms} onChange={(v) => set("wms", v)} options={["SAP", "Oracle", "Microsoft Dynamics", "Other", "None"]} /></div>
          </div>
          <div>
            <Label>Notes / Special Instructions</Label>
            <TextArea value={form.notes} onChange={(v) => set("notes", v)} rows={3} placeholder="Any operational notes, integration requirements, or special considerations..." />
          </div>
        </div>
      )}

      {tab === "prefs" && (
        <div style={{ display: "grid", gap: 18 }}>
          <div>
            <Label>Alert Preferences</Label>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { k: "alertEmail" as const, label: "Email alerts for RSL critical products" },
                { k: "alertDaily" as const, label: "Daily summary report via email" },
                { k: "alertSlack" as const, label: "Slack notifications for urgent actions" },
                { k: "alertSMS" as const, label: "SMS alerts for temperature excursions" },
              ].map((row) => (
                <div key={row.k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", border: `1px solid ${C.border}`, borderRadius: 8 }}>
                  <span style={{ fontSize: 13, color: C.text }}>{row.label}</span>
                  <Toggle checked={form[row.k] as boolean} onChange={(v) => set(row.k, v as never)} />
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <Label>RSL Alert Threshold (days)</Label>
              <Stepper value={form.rslThreshold} onChange={(v) => set("rslThreshold", v)} />
              <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>Alert when RSL falls below this</div>
            </div>
            <div><Label>Report Frequency</Label><SelectInput value={form.reportFreq} onChange={(v) => set("reportFreq", v)} options={["Daily", "Weekly", "Monthly"]} /></div>
          </div>
          <div>
            <Label>Dashboard Default View</Label>
            <RadioPills options={["Overview", "RSL Monitor", "Action Engine"]} value={form.defaultView} onChange={(v) => set("defaultView", v)} />
          </div>
        </div>
      )}
    </ModalShell>
  );
}

function PassportModal({
  onClose, onSubmit, stores, batches, prefillStoreId,
}: { onClose: () => void; onSubmit: (b: Batch) => void; stores: Store[]; batches: Batch[]; prefillStoreId?: string }) {
  const nextBatchId = () => {
    const max = batches.reduce((m, b) => {
      const m2 = b.id.match(/^#A(\d+)$/);
      return m2 ? Math.max(m, parseInt(m2[1], 10)) : m;
    }, 0);
    return `#A${String(max + 1).padStart(2, "0")}`;
  };
  const [tab, setTab] = useState("batch");
  const [form, setForm] = useState({
    logoUrl: undefined as string | undefined,
    product: "", sku: "", batchId: nextBatchId(), category: "",
    units: "", unitSize: "", productionDate: "", expiryDate: "",
    supplier: "", origin: "UK", baseShelfLife: "",
    storeTemp: "4", maxTemp: "8", monitoring: "IoT Sensor — Automatic",
    currentTemp: "", entryPoint: "DC Receiving", entryTime: "", handlingNotes: "",
    location: "Distribution Centre", storeAssign: prefillStoreId ?? "",
    assignee: "", assignDate: "",
    initialAction: "No action needed", priority: "Medium", notes: "",
  });
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const tempExcursion = Number(form.currentTemp) > Number(form.maxTemp);
  const tempEntered = form.currentTemp !== "";

  const [errors, setErrors] = useState<Record<string, string>>({});
  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.product.trim()) e.product = "Product name required";
    if (!form.sku.trim()) e.sku = "SKU required";
    if (!form.batchId.trim()) e.batchId = "Batch ID required";
    if (!form.category) e.category = "Category required";
    if (!form.baseShelfLife.trim()) e.baseShelfLife = "Base shelf life required";
    setErrors(e);
    return e;
  };

  const submit = () => {
    const e = validate();
    if (Object.keys(e).length) {
      setTab("batch");
      return;
    }
    const storeId = form.location === "Store — specify below" && form.storeAssign ? form.storeAssign : form.location === "Distribution Centre" ? "DC" : form.storeAssign || "DC";
    const baseShelf = parseInt(form.baseShelfLife || "10", 10);
    onSubmit({
      id: form.batchId.trim(),
      product: form.product.trim(),
      sku: form.sku.trim(),
      category: form.category,
      storeId,
      productionDate: form.productionDate ? new Date(form.productionDate).getTime() : Date.now(),
      printedExpiry: form.expiryDate ? new Date(form.expiryDate).getTime() : Date.now() + baseShelf * 86400000,
      units: parseInt(form.units || "0", 10),
      unitSize: form.unitSize,
      supplier: form.supplier,
      origin: form.origin,
      baseShelfLife: baseShelf,
      dwellDays: 0,
      tempExcursion,
      tempPenaltyDays: tempExcursion ? 1 : 0,
      maxTemp: Number(form.maxTemp) || 8,
      tempHistory: tempHist(Number(form.storeTemp) || 4),
      logoUrl: form.logoUrl,
      createdAt: Date.now(),
    });
  };

  const errCount = Object.keys(errors).length;

  return (
    <ModalShell
      title="Product Passport"
      onClose={onClose}
      footer={
        <>
          <span style={{ fontSize: 12, color: C.muted }}>* Required fields</span>
          <div style={{ display: "flex", gap: 8 }}>
            <SecondaryButton onClick={onClose} style={{ borderColor: C.border, color: C.text2 }}>Cancel</SecondaryButton>
            <PrimaryButton onClick={submit}>Create Passport</PrimaryButton>
          </div>
        </>
      }
    >
      <TabBar current={tab} onChange={setTab} tabs={[{ id: "batch", label: "Batch Details" }, { id: "cold", label: "Cold Chain" }, { id: "assign", label: "Assignment" }]} />

      {errCount > 0 && (
        <div style={{ background: "#FEE2E2", color: "#991B1B", border: `1px solid #FCA5A5`, padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 16, fontWeight: 600 }}>
          Please complete {errCount} required field{errCount > 1 ? "s" : ""}
        </div>
      )}

      {tab === "batch" && (
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 28 }}>
          <AvatarUpload logoUrl={form.logoUrl} onChange={(v) => set("logoUrl", v)} defaultIcon={<Icon.Box size={42} />} caption="Product Image" />
          <div style={{ display: "grid", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <Label required>Product Name</Label>
                <TextInput value={form.product} onChange={(v) => set("product", v)} placeholder="e.g. Strawberries" error={!!errors.product} />
                {errors.product && <ErrorText>{errors.product}</ErrorText>}
              </div>
              <div>
                <Label required>SKU Code</Label>
                <TextInput value={form.sku} onChange={(v) => set("sku", v)} placeholder="e.g. PRD-2241" error={!!errors.sku} />
                {errors.sku && <ErrorText>{errors.sku}</ErrorText>}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Label required>Batch ID</Label>
                  <button onClick={() => set("batchId", nextBatchId())} style={{ background: "none", border: "none", color: C.accent, fontSize: 12, fontWeight: 500, cursor: "pointer" }}>Auto-generate</button>
                </div>
                <TextInput value={form.batchId} onChange={(v) => set("batchId", v)} placeholder="#A14" error={!!errors.batchId} />
              </div>
              <div>
                <Label required>Category</Label>
                <SelectInput value={form.category} onChange={(v) => set("category", v)} options={["Produce", "Dairy", "Bakery", "Ready Meals", "Meat & Fish", "Frozen"]} error={!!errors.category} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><Label>Units in Batch</Label><TextInput type="number" value={form.units} onChange={(v) => set("units", v)} /></div>
              <div><Label>Unit Weight / Size</Label><TextInput value={form.unitSize} onChange={(v) => set("unitSize", v)} placeholder="e.g. 250g" /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><Label>Production Date</Label><TextInput type="date" value={form.productionDate} onChange={(v) => set("productionDate", v)} /></div>
              <div><Label>Printed Expiry Date</Label><TextInput type="date" value={form.expiryDate} onChange={(v) => set("expiryDate", v)} /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><Label>Supplier / Origin</Label><TextInput value={form.supplier} onChange={(v) => set("supplier", v)} placeholder="Supplier name" /></div>
              <div><Label>Country of Origin</Label><SelectInput value={form.origin} onChange={(v) => set("origin", v)} options={["UK", "Spain", "Netherlands", "France", "Kenya", "Other"]} /></div>
            </div>
            <div>
              <Label required>Base Shelf Life (days)</Label>
              <TextInput type="number" value={form.baseShelfLife} onChange={(v) => set("baseShelfLife", v)} placeholder="e.g. 10" error={!!errors.baseShelfLife} />
              <div style={{ fontSize: 12, color: C.muted, marginTop: 4, fontStyle: "italic" }}>
                This is the standard shelf life under ideal conditions. RSL will be calculated from this value minus handling penalties.
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "cold" && (
        <div style={{ display: "grid", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><Label>Storage Temperature (°C)</Label><TextInput type="number" value={form.storeTemp} onChange={(v) => set("storeTemp", v)} placeholder="e.g. 4" /></div>
            <div><Label>Max Allowed Temp (°C)</Label><TextInput type="number" value={form.maxTemp} onChange={(v) => set("maxTemp", v)} placeholder="e.g. 8" /></div>
          </div>
          <div>
            <Label>Temperature Monitoring Method</Label>
            <RadioPills options={["IoT Sensor — Automatic", "Manual Log Entry", "Not Monitored"]} value={form.monitoring} onChange={(v) => set("monitoring", v)} />
          </div>
          <div>
            <Label>Current Temperature Reading (°C)</Label>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <TextInput type="number" value={form.currentTemp} onChange={(v) => set("currentTemp", v)} placeholder="e.g. 5" />
              </div>
              {tempEntered && (
                <span style={{
                  background: tempExcursion ? "#FEE2E2" : "#DCFCE7",
                  color: tempExcursion ? "#991B1B" : "#166534",
                  fontSize: 12, fontWeight: 600, padding: "8px 14px", borderRadius: 999, whiteSpace: "nowrap",
                }}>
                  {tempExcursion ? "⚠ Excursion Detected" : "✓ Within Range"}
                </span>
              )}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><Label>Cold Chain Entry Point</Label><SelectInput value={form.entryPoint} onChange={(v) => set("entryPoint", v)} options={["Supplier", "DC Receiving", "Store Receiving"]} /></div>
            <div><Label>Entry Timestamp</Label><TextInput type="datetime-local" value={form.entryTime} onChange={(v) => set("entryTime", v)} /></div>
          </div>
          <div><Label>Handling Notes</Label><TextArea value={form.handlingNotes} onChange={(v) => set("handlingNotes", v)} rows={2} placeholder="Any cold chain incidents, delays, or handling observations..." /></div>
        </div>
      )}

      {tab === "assign" && (
        <div style={{ display: "grid", gap: 14 }}>
          <div>
            <Label>Current Location</Label>
            <RadioPills options={["Distribution Centre", "In Transit", "Store — specify below"]} value={form.location} onChange={(v) => set("location", v)} />
            {form.location === "Store — specify below" && (
              <div style={{ marginTop: 10 }}>
                <select value={form.storeAssign} onChange={(e) => set("storeAssign", e.target.value)} onFocus={focusOn} onBlur={(e) => focusOff(e)} style={{ ...inputStyle, paddingRight: 28, appearance: "none" }}>
                  <option value="">Select store…</option>
                  {stores.filter((s) => s.id !== "DC").map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            )}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><Label>Assigned Staff Member</Label><TextInput value={form.assignee} onChange={(v) => set("assignee", v)} placeholder="Name" /></div>
            <div><Label>Assignment Date</Label><TextInput type="date" value={form.assignDate} onChange={(v) => set("assignDate", v)} /></div>
          </div>
          <div>
            <Label>Initial Recommended Action</Label>
            <SelectInput value={form.initialAction} onChange={(v) => set("initialAction", v)} options={["No action needed", "Monitor RSL", "FEFO rotation", "Trigger markdown", "Escalate to manager"]} />
          </div>
          <div>
            <Label>Priority Level</Label>
            <RadioPills
              options={["Low", "Medium", "High", "Urgent"]}
              value={form.priority}
              onChange={(v) => set("priority", v)}
              colorMap={{ Low: C.muted, Medium: C.accent, High: C.amber, Urgent: C.red }}
            />
          </div>
          <div><Label>Additional Notes</Label><TextArea value={form.notes} onChange={(v) => set("notes", v)} rows={2} /></div>
        </div>
      )}
    </ModalShell>
  );
}
