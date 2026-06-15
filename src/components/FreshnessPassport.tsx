import {
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type CSSProperties,
  type Dispatch,
  type ReactNode,
} from "react";
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

/* ============================================================
   TOKENS
   ============================================================ */
const C = {
  primary: "#1B3A6B",
  accent: "#2563EB",
  light: "#EFF6FF",
  border: "#E2E8F0",
  text: "#0F172A",
  text2: "#475569",
  muted: "#94A3B8",
  green: "#16A34A",
  amber: "#D97706",
  red: "#DC2626",
  bg: "#F8FAFC",
  label: "#374151",
  badgeBlueBg: "#DBEAFE",
  badgeBlueText: "#1E40AF",
};
const FONT = `'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif`;
const DAY = 86400000;

/* ============================================================
   HELPERS
   ============================================================ */
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const formatGBP = (n: number) => "£" + Math.round(n).toLocaleString("en-GB");
const formatPct = (n: number) => `${n.toFixed(1)}%`;
const formatDate = (d: Date | number) => {
  const dt = typeof d === "number" ? new Date(d) : d;
  return `${String(dt.getDate()).padStart(2,"0")} ${MONTHS[dt.getMonth()]} ${dt.getFullYear()}`;
};
const timeAgo = (ts: number, now: number = Date.now()) => {
  const d = now - ts;
  if (d < 60000) return "Just now";
  if (d < 3600000) return `${Math.floor(d/60000)}m ago`;
  if (d < 86400000) return `${Math.floor(d/3600000)}h ago`;
  if (d < 7*86400000) return `${Math.floor(d/86400000)}d ago`;
  return formatDate(ts);
};
const daysAgo = (n: number) => Date.now() - n * DAY;

/* ============================================================
   TYPES
   ============================================================ */
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
  logoUrl?: string | null;
  erp?: string;
  wms?: string;
  deliveryFreq?: string;
  categories?: string[];
  coldStorage?: number;
  storeSize?: number;
  checkouts?: number;
  alertPrefs?: { emailRSL: boolean; dailySummary: boolean; slack: boolean; sms: boolean };
  rslThreshold?: number;
  reportFreq?: string;
  defaultView?: string;
  isNew?: boolean;
};

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
  storageTemp?: number;
  maxTemp: number;
  tempHistory: { day: string; temp: number }[];
  monitoringMethod?: string;
  entryPoint?: string;
  assignedStaff?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  recommendedAction?: string;
  logoUrl?: string | null;
  createdAt?: number;
  sourceDocument?: {
    fileName: string;
    invoiceNumber: string | null;
    scannedAt: number;
    confidence: "high" | "medium" | "low";
    mediaType: string;
    dataUrl: string;
  } | null;
};

type Task = {
  id: string;
  status: "todo" | "inprogress" | "done";
  priority: "URGENT" | "HIGH" | "MEDIUM";
  type: string;
  product: string;
  batchId: string;
  storeId: string;
  instruction: string;
  rslDays: number;
  assignee: string;
  assignedAt: number;
  completedAt?: number;
};

type ActivityType =
  | "passport_created"
  | "task_completed"
  | "markdown_triggered"
  | "temp_excursion"
  | "waste_logged"
  | "store_created"
  | "rsl_alert"
  | "bill_scanned";

type Activity = {
  id: string;
  ts: number;
  type: ActivityType;
  text: string;
  storeId: string;
  batchId?: string;
  taskId?: string;
};

type Toast = { id: string; kind: "success" | "error" | "info"; text: string };

type Page = "overview" | "passports" | "rsl" | "analytics" | "actions" | "impact";

/* ============================================================
   COMPUTE RSL
   ============================================================ */
const computeRSL = (b: Batch, nowMs: number) => {
  const daysSinceProduction = Math.floor((nowMs - b.productionDate) / DAY);
  const tempPenalty = b.tempExcursion ? b.tempPenaltyDays : 0;
  const dwellPenalty = Math.max(0, b.dwellDays - 2);
  const rslDays = Math.max(0, b.baseShelfLife - daysSinceProduction - tempPenalty - dwellPenalty);
  const score = Math.max(0, Math.min(100, Math.round((rslDays / b.baseShelfLife) * 100)));
  return { rslDays, score, daysSinceProduction, tempPenalty, dwellPenalty };
};
const freshnessColor = (s: number) => (s >= 75 ? C.green : s >= 45 ? C.amber : C.red);
const statusFromScore = (s: number) => (s >= 75 ? "Fresh" : s >= 45 ? "At Risk" : "Critical");
const rslToAction = (d: number) =>
  d < 1
    ? "Trigger 50% markdown immediately"
    : d <= 2
    ? "Move to front shelf + trigger markdown"
    : d <= 3
    ? "FEFO rotation recommended"
    : d <= 5
    ? "Monitor — check allocation"
    : "No action needed";
const rslActionType = (d: number) =>
  d < 1 ? "Markdown" : d <= 2 ? "Markdown" : d <= 3 ? "FEFO Rotation" : d <= 5 ? "Allocation Adjust" : "Monitor";

/* ============================================================
   SEED
   ============================================================ */
const SEED_STORES: Store[] = [
  { id: "DC", code: "DC-001", name: "Main Distribution Centre", city: "Birmingham", region: "Midlands", address: "Unit 14, Logistics Park", country: "UK", postcode: "B7 4AA", manager: "Helena Park", email: "helena@freshpass.co", phone: "+44 121 555 0144", activeSince: new Date("2024-02-10").getTime(), tier: "Enterprise", type: "Distribution Centre", categories:["Produce","Dairy","Bakery","Meat & Fish","Ready Meals"], rslThreshold:3 },
  { id: "S1", code: "STR-001", name: "Store #1 Bristol", city: "Bristol", region: "South West", address: "22 Park Street", country: "UK", postcode: "BS1 5JA", manager: "Tom Whitfield", email: "tom@freshpass.co", phone: "+44 117 555 0211", activeSince: new Date("2024-04-01").getTime(), tier: "Standard", type: "Supermarket", categories:["Produce","Dairy","Bakery"], rslThreshold:3 },
  { id: "S2", code: "STR-002", name: "Store #2 Cardiff", city: "Cardiff", region: "Wales", address: "5 Queen Street", country: "UK", postcode: "CF10 2BU", manager: "Megan Howells", email: "megan@freshpass.co", phone: "+44 29 555 0322", activeSince: new Date("2024-05-15").getTime(), tier: "Standard", type: "Supermarket", categories:["Produce","Dairy"], rslThreshold:3 },
  { id: "S3", code: "STR-003", name: "Store #3 Leeds", city: "Leeds", region: "Yorkshire", address: "88 Briggate", country: "UK", postcode: "LS1 6LY", manager: "Daniel Okoye", email: "daniel@freshpass.co", phone: "+44 113 555 0433", activeSince: new Date("2024-07-09").getTime(), tier: "Pilot", type: "Supermarket", categories:["Dairy","Meat & Fish"], rslThreshold:3 },
  { id: "S4", code: "STR-004", name: "Store #4 Manchester", city: "Manchester", region: "North West", address: "12 Market Street", country: "UK", postcode: "M1 1WT", manager: "Priya Shah", email: "priya@freshpass.co", phone: "+44 161 555 0544", activeSince: new Date("2024-09-22").getTime(), tier: "Enterprise", type: "Flagship", categories:["Produce","Bakery","Ready Meals"], rslThreshold:3 },
  { id: "S5", code: "STR-005", name: "Store #5 Edinburgh", city: "Edinburgh", region: "Scotland", address: "44 Princes Street", country: "UK", postcode: "EH2 2BY", manager: "Callum Reid", email: "callum@freshpass.co", phone: "+44 131 555 0655", activeSince: new Date("2025-01-12").getTime(), tier: "Standard", type: "Convenience", categories:["Bakery","Produce"], rslThreshold:3 },
];

const tempHist = (avg: number, spikes: number[] = []) =>
  Array.from({ length: 6 }, (_, i) => ({
    day: ["Mon","Tue","Wed","Thu","Fri","Sat"][i],
    temp: +(avg + (spikes[i] ?? Math.sin(i) * 0.6)).toFixed(1),
  }));

const SEED_BATCHES: Batch[] = [
  { id:"#A14", product:"Strawberries", sku:"PRD-2241", category:"Produce", storeId:"S2", productionDate:daysAgo(2), printedExpiry:daysAgo(-6), units:120, unitSize:"400g", supplier:"Berry Farms Ltd", origin:"UK", baseShelfLife:8, dwellDays:2, tempExcursion:false, tempPenaltyDays:0, maxTemp:8, storageTemp:5, tempHistory:tempHist(5), priority:"medium" },
  { id:"#B07", product:"Salad Mix", sku:"PRD-1184", category:"Produce", storeId:"S4", productionDate:daysAgo(4), printedExpiry:daysAgo(-2), units:80, unitSize:"200g", supplier:"GreenLeaf Co", origin:"Spain", baseShelfLife:7, dwellDays:4, tempExcursion:true, tempPenaltyDays:2, maxTemp:8, storageTemp:5, tempHistory:tempHist(7,[0,1,3,4,2,1]), priority:"urgent" },
  { id:"#C22", product:"Whole Milk", sku:"DRY-0451", category:"Dairy", storeId:"DC", productionDate:daysAgo(1), printedExpiry:daysAgo(-9), units:240, unitSize:"1L", supplier:"Dairyworks UK", origin:"UK", baseShelfLife:10, dwellDays:1, tempExcursion:false, tempPenaltyDays:0, maxTemp:5, storageTemp:3, tempHistory:tempHist(3), priority:"low" },
  { id:"#D09", product:"Greek Yogurt", sku:"DRY-0732", category:"Dairy", storeId:"S3", productionDate:daysAgo(5), printedExpiry:daysAgo(-5), units:60, unitSize:"500g", supplier:"Olympus Dairy", origin:"UK", baseShelfLife:12, dwellDays:5, tempExcursion:false, tempPenaltyDays:0, maxTemp:5, storageTemp:4, tempHistory:tempHist(4), priority:"medium" },
  { id:"#E31", product:"Ready Meals — Lasagne", sku:"RMM-0998", category:"Ready Meals", storeId:"S1", productionDate:daysAgo(3), printedExpiry:daysAgo(-4), units:140, unitSize:"400g", supplier:"MealCraft", origin:"UK", baseShelfLife:9, dwellDays:3, tempExcursion:false, tempPenaltyDays:0, maxTemp:5, storageTemp:4, tempHistory:tempHist(4), priority:"medium" },
  { id:"#F18", product:"Sliced Bread", sku:"BAK-0322", category:"Bakery", storeId:"S5", productionDate:daysAgo(6), printedExpiry:daysAgo(-1), units:90, unitSize:"800g", supplier:"Hearth Bakery", origin:"UK", baseShelfLife:7, dwellDays:6, tempExcursion:false, tempPenaltyDays:0, maxTemp:22, storageTemp:18, tempHistory:tempHist(18), priority:"high" },
  { id:"#G04", product:"Free-Range Eggs", sku:"DRY-0145", category:"Dairy", storeId:"S2", productionDate:daysAgo(2), printedExpiry:daysAgo(-12), units:200, unitSize:"x12", supplier:"Hen Acres", origin:"UK", baseShelfLife:18, dwellDays:2, tempExcursion:false, tempPenaltyDays:0, maxTemp:8, storageTemp:6, tempHistory:tempHist(6), priority:"low" },
  { id:"#H27", product:"Blueberries", sku:"PRD-2298", category:"Produce", storeId:"S4", productionDate:daysAgo(3), printedExpiry:daysAgo(-4), units:110, unitSize:"150g", supplier:"Berry Farms Ltd", origin:"UK", baseShelfLife:9, dwellDays:3, tempExcursion:false, tempPenaltyDays:0, maxTemp:8, storageTemp:6, tempHistory:tempHist(6), priority:"medium" },
  { id:"#I12", product:"Croissants", sku:"BAK-0501", category:"Bakery", storeId:"S1", productionDate:daysAgo(2), printedExpiry:daysAgo(-3), units:70, unitSize:"x6", supplier:"Hearth Bakery", origin:"UK", baseShelfLife:5, dwellDays:2, tempExcursion:false, tempPenaltyDays:0, maxTemp:22, storageTemp:20, tempHistory:tempHist(20), priority:"high" },
  { id:"#J33", product:"Chicken Fillets", sku:"MTF-0118", category:"Meat & Fish", storeId:"S3", productionDate:daysAgo(2), printedExpiry:daysAgo(-3), units:55, unitSize:"500g", supplier:"Cluck & Co", origin:"UK", baseShelfLife:6, dwellDays:4, tempExcursion:true, tempPenaltyDays:1, maxTemp:4, storageTemp:3, tempHistory:tempHist(3,[0,0,1.5,2.4,0.5,0]), priority:"urgent" },
];

const SEED_TASKS: Task[] = [
  { id:"T1", status:"todo", priority:"URGENT", type:"Markdown", product:"Salad Mix", batchId:"#B07", storeId:"S4", instruction:"Trigger 50% markdown — 1 day RSL remaining.", rslDays:1, assignee:"PS", assignedAt:Date.now()-3600000 },
  { id:"T2", status:"todo", priority:"HIGH", type:"FEFO Rotation", product:"Strawberries", batchId:"#A14", storeId:"S2", instruction:"Move Batch A14 to front shelf before newer Batch A19.", rslDays:3, assignee:"MH", assignedAt:daysAgo(1) },
  { id:"T3", status:"todo", priority:"HIGH", type:"Allocation Adjust", product:"Greek Yogurt", batchId:"#D09", storeId:"S3", instruction:"Reduce next dispatch by 18 units.", rslDays:4, assignee:"DO", assignedAt:daysAgo(3) },
  { id:"T5", status:"inprogress", priority:"HIGH", type:"Markdown", product:"Sliced Bread", batchId:"#F18", storeId:"S5", instruction:"Apply 30% markdown on 22 units.", rslDays:1, assignee:"CR", assignedAt:daysAgo(1) },
  { id:"T6", status:"inprogress", priority:"MEDIUM", type:"FEFO Rotation", product:"Whole Milk", batchId:"#C22", storeId:"DC", instruction:"Pick older pallet first on next dispatch.", rslDays:5, assignee:"HP", assignedAt:Date.now()-7200000 },
  { id:"T8", status:"done", priority:"URGENT", type:"Cold Chain Alert", product:"Chicken Fillets", batchId:"#J33", storeId:"S3", instruction:"Quarantine batch — verify temperature.", rslDays:1, assignee:"DO", assignedAt:daysAgo(1), completedAt:Date.now()-7200000 },
  { id:"T9", status:"done", priority:"MEDIUM", type:"Markdown", product:"Blueberries", batchId:"#H27", storeId:"S4", instruction:"20% markdown — slow rotation aisle 3.", rslDays:3, assignee:"PS", assignedAt:daysAgo(2), completedAt:daysAgo(1) },
  { id:"T10", status:"done", priority:"HIGH", type:"FEFO Rotation", product:"Free-Range Eggs", batchId:"#G04", storeId:"S2", instruction:"Rotate stock — older trays to front.", rslDays:8, assignee:"MH", assignedAt:daysAgo(3), completedAt:daysAgo(2) },
];

const SEED_ACTIVITY: Activity[] = [
  { id:"a1", ts:Date.now()-900000, type:"markdown_triggered", text:"Markdown triggered — Yogurt (8 units) — Store #4", storeId:"S4" },
  { id:"a2", ts:Date.now()-2700000, type:"temp_excursion", text:"Temperature excursion — Cold Chain #3 — +2.4°C above threshold", storeId:"DC" },
  { id:"a3", ts:Date.now()-5400000, type:"rsl_alert", text:"FEFO alert — Salad Mix #B07 — 1 day remaining", storeId:"S4", batchId:"#B07" },
  { id:"a4", ts:daysAgo(1), type:"passport_created", text:"New passport created — Ready Meals — 140 units", storeId:"S1", batchId:"#E31" },
  { id:"a5", ts:daysAgo(2), type:"waste_logged", text:"Waste event — Sliced Bread — Store #1 — £42 lost", storeId:"S1" },
];

const WASTE_INCIDENTS = [
  { date:daysAgo(0), product:"Salad Mix", batch:"#B07", storeId:"S4", driver:"Temperature Excursion", units:24, cost:96, preventable:true },
  { date:daysAgo(1), product:"Sliced Bread", batch:"#F18", storeId:"S1", driver:"Forecast Bias", units:30, cost:42, preventable:true },
  { date:daysAgo(1), product:"Croissants", batch:"#I12", storeId:"S1", driver:"Markdown Delay", units:18, cost:36, preventable:true },
  { date:daysAgo(2), product:"Greek Yogurt", batch:"#D09", storeId:"S3", driver:"Store Rotation", units:14, cost:56, preventable:true },
  { date:daysAgo(2), product:"Strawberries", batch:"#A14", storeId:"S2", driver:"Late Delivery", units:22, cost:88, preventable:true },
  { date:daysAgo(3), product:"Blueberries", batch:"#H27", storeId:"S4", driver:"Forecast Bias", units:26, cost:104, preventable:true },
  { date:daysAgo(3), product:"Whole Milk", batch:"#C22", storeId:"DC", driver:"Cold Chain", units:40, cost:80, preventable:false },
  { date:daysAgo(4), product:"Ready Meals", batch:"#E31", storeId:"S1", driver:"Markdown Delay", units:9, cost:54, preventable:true },
  { date:daysAgo(4), product:"Chicken Fillets", batch:"#J33", storeId:"S3", driver:"Temperature Excursion", units:12, cost:96, preventable:true },
  { date:daysAgo(5), product:"Salad Mix", batch:"#B07", storeId:"S4", driver:"Late Delivery", units:18, cost:72, preventable:false },
];

const MONTHLY_IMPACT_12M = Array.from({ length: 12 }, (_, i) => ({
  month: MONTHS[i],
  waste: 1400 - i * 60 + Math.round(Math.sin(i) * 90),
  trend: 1400 - i * 70,
}));
const INTERVENTION_STACK_6M = ["Jan","Feb","Mar","Apr","May","Jun"].map((m, i) => ({
  month: m,
  fefo: 800 + i * 80, markdown: 600 + i * 60, allocation: 400 + i * 50, coldchain: 250 + i * 30,
}));

/* ============================================================
   TIPS
   ============================================================ */
const TIPS: Record<string, string> = {
  overview: "The Overview Dashboard pulls together freshness, waste, and operational KPIs across your whole network.",
  passports: "A Freshness Digital Passport is assigned to every product batch — recording movement, temperature exposure, handling and dwell time.",
  rsl: "Remaining Shelf Life estimation analyses each batch's time-temperature history combined with handling events to calculate a freshness score from 0–100.",
  waste: "The Waste Root-Cause Analytics engine traces each waste instance back to its operational driver and ranks drivers by impact.",
  action: "The Operational Action Engine converts freshness intelligence into specific, executable tasks for your store and DC teams.",
  impact: "The Impact & Sustainability Report quantifies the real-world results of the platform's interventions in cost, waste and CO₂.",
  storeProfile: "A Store Profile centralises all operational, contact, and preference data for each location. This information feeds directly into freshness analytics, action routing, and sustainability reporting — ensuring every insight and task is mapped to the right store and team.",
};

/* ============================================================
   STATE + REDUCER
   ============================================================ */
type State = {
  activePage: Page;
  previousPage: Page;
  activeStoreFilter: string; // 'all' | storeId
  storeProfileId: string | null;
  drawerBatchId: string | null;
  taskHighlightId: string | null;
  storeModalOpen: boolean;
  passportModalOpen: false | { prefilledStoreId: string | null };
  activityLogOpen: boolean;
  isSidebarOpen: boolean;
  bellOpen: boolean;
  storeDropdownOpen: boolean;
  tooltipsOpen: string[];
  newPassportFlashId: string | null;
  toasts: Toast[];
  stores: Store[];
  batches: Batch[];
  tasks: Task[];
  activity: Activity[];
  timeOffset: number;
  notificationsReadAt: number;
};

const initialState: State = {
  activePage: "overview",
  previousPage: "overview",
  activeStoreFilter: "all",
  storeProfileId: null,
  drawerBatchId: null,
  taskHighlightId: null,
  storeModalOpen: false,
  passportModalOpen: false,
  activityLogOpen: false,
  isSidebarOpen: false,
  bellOpen: false,
  storeDropdownOpen: false,
  tooltipsOpen: [],
  newPassportFlashId: null,
  toasts: [],
  stores: SEED_STORES,
  batches: SEED_BATCHES,
  tasks: SEED_TASKS,
  activity: SEED_ACTIVITY,
  timeOffset: 0,
  notificationsReadAt: 0,
};

type Action =
  | { type: "NAVIGATE"; page: Page }
  | { type: "SET_STORE_FILTER"; storeId: string }
  | { type: "OPEN_STORE_PROFILE"; storeId: string }
  | { type: "BACK_FROM_PROFILE" }
  | { type: "OPEN_DRAWER"; batchId: string }
  | { type: "CLOSE_DRAWER" }
  | { type: "OPEN_STORE_MODAL" }
  | { type: "OPEN_PASSPORT_MODAL"; prefilledStoreId: string | null }
  | { type: "CLOSE_MODALS" }
  | { type: "OPEN_ACTIVITY_LOG" }
  | { type: "CLOSE_ACTIVITY_LOG" }
  | { type: "ADD_STORE"; store: Store }
  | { type: "ADD_BATCH"; batch: Batch }
  | { type: "ADD_TASK"; task: Task }
  | { type: "UPDATE_TASK"; id: string; status: Task["status"] }
  | { type: "ADD_ACTIVITY"; activity: Activity }
  | { type: "PUSH_TOAST"; toast: Toast }
  | { type: "DISMISS_TOAST"; id: string }
  | { type: "TOGGLE_SIDEBAR"; open?: boolean }
  | { type: "TOGGLE_BELL"; open?: boolean }
  | { type: "TOGGLE_STORE_DD"; open?: boolean }
  | { type: "TOGGLE_TIP"; key: string }
  | { type: "CLEAR_FLASH" }
  | { type: "HIGHLIGHT_TASK"; id: string | null }
  | { type: "ADVANCE_TIME"; days: number }
  | { type: "RESET_TIME" }
  | { type: "MARK_NOTIFS_READ" };

let _id = 1000;
const uid = () => `x${++_id}`;

const reducer = (s: State, a: Action): State => {
  switch (a.type) {
    case "NAVIGATE":
      return { ...s, activePage: a.page, isSidebarOpen: false };
    case "SET_STORE_FILTER":
      return { ...s, activeStoreFilter: a.storeId, storeDropdownOpen: false };
    case "OPEN_STORE_PROFILE":
      return { ...s, previousPage: s.activePage, storeProfileId: a.storeId, storeDropdownOpen: false };
    case "BACK_FROM_PROFILE":
      return { ...s, storeProfileId: null, activePage: s.previousPage };
    case "OPEN_DRAWER":
      return { ...s, drawerBatchId: a.batchId };
    case "CLOSE_DRAWER":
      return { ...s, drawerBatchId: null };
    case "OPEN_STORE_MODAL":
      return { ...s, storeModalOpen: true };
    case "OPEN_PASSPORT_MODAL":
      return { ...s, passportModalOpen: { prefilledStoreId: a.prefilledStoreId } };
    case "CLOSE_MODALS":
      return { ...s, storeModalOpen: false, passportModalOpen: false };
    case "OPEN_ACTIVITY_LOG":
      return { ...s, activityLogOpen: true };
    case "CLOSE_ACTIVITY_LOG":
      return { ...s, activityLogOpen: false };
    case "ADD_STORE": {
      const act: Activity = { id: uid(), ts: Date.now(), type: "store_created", text: `New store created — ${a.store.name}`, storeId: a.store.id };
      return {
        ...s,
        stores: [...s.stores, a.store],
        activity: [act, ...s.activity],
        storeModalOpen: false,
        previousPage: s.activePage,
        storeProfileId: a.store.id,
        toasts: [{ id: uid(), kind: "success", text: `Store "${a.store.name}" created` }, ...s.toasts],
      };
    }
    case "ADD_BATCH": {
      const nowMs = Date.now() + s.timeOffset;
      const r = computeRSL(a.batch, nowMs);
      const acts: Activity[] = [
        { id: uid(), ts: Date.now(), type: "passport_created", text: `New passport — ${a.batch.product} (${a.batch.units} units)`, storeId: a.batch.storeId, batchId: a.batch.id },
      ];
      if (a.batch.tempExcursion) {
        acts.unshift({ id: uid(), ts: Date.now(), type: "temp_excursion", text: `Temperature excursion on new batch — ${a.batch.product}`, storeId: a.batch.storeId, batchId: a.batch.id });
      }
      const newTasks: Task[] = [];
      if (a.batch.priority === "urgent" || r.rslDays < 3) {
        newTasks.push({
          id: uid(),
          status: "todo",
          priority: a.batch.priority === "urgent" ? "URGENT" : r.rslDays < 2 ? "URGENT" : "HIGH",
          type: rslActionType(r.rslDays),
          product: a.batch.product,
          batchId: a.batch.id,
          storeId: a.batch.storeId,
          instruction: rslToAction(r.rslDays),
          rslDays: r.rslDays,
          assignee: a.batch.assignedStaff || "Unassigned",
          assignedAt: Date.now(),
        });
      }
      return {
        ...s,
        batches: [a.batch, ...s.batches],
        tasks: [...newTasks, ...s.tasks],
        activity: [...acts, ...s.activity],
        passportModalOpen: false,
        newPassportFlashId: a.batch.id,
        toasts: [{ id: uid(), kind: "success", text: `Passport ${a.batch.id} created` }, ...s.toasts],
      };
    }
    case "ADD_TASK": {
      const act: Activity = { id: uid(), ts: Date.now(), type: "rsl_alert", text: `Action created — ${a.task.product} — ${a.task.type}`, storeId: a.task.storeId, batchId: a.task.batchId, taskId: a.task.id };
      const toasts = a.task.rslDays < 2
        ? [{ id: uid(), kind: "error" as const, text: `${a.task.product} ${a.task.batchId} — urgent task created` }, ...s.toasts]
        : s.toasts;
      return { ...s, tasks: [a.task, ...s.tasks], activity: [act, ...s.activity], toasts };
    }
    case "UPDATE_TASK": {
      const task = s.tasks.find((t) => t.id === a.id);
      if (!task) return s;
      const updated: Task = { ...task, status: a.status, completedAt: a.status === "done" ? Date.now() : task.completedAt };
      const tasks = s.tasks.map((t) => (t.id === a.id ? updated : t));
      if (a.status === "done") {
        const act: Activity = { id: uid(), ts: Date.now(), type: "task_completed", text: `Task completed — ${task.type} — ${task.product}`, storeId: task.storeId, batchId: task.batchId, taskId: task.id };
        return { ...s, tasks, activity: [act, ...s.activity] };
      }
      return { ...s, tasks };
    }
    case "ADD_ACTIVITY":
      return { ...s, activity: [a.activity, ...s.activity] };
    case "PUSH_TOAST":
      return { ...s, toasts: [a.toast, ...s.toasts] };
    case "DISMISS_TOAST":
      return { ...s, toasts: s.toasts.filter((t) => t.id !== a.id) };
    case "TOGGLE_SIDEBAR":
      return { ...s, isSidebarOpen: a.open ?? !s.isSidebarOpen };
    case "TOGGLE_BELL":
      return { ...s, bellOpen: a.open ?? !s.bellOpen, storeDropdownOpen: false };
    case "TOGGLE_STORE_DD":
      return { ...s, storeDropdownOpen: a.open ?? !s.storeDropdownOpen, bellOpen: false };
    case "TOGGLE_TIP": {
      const has = s.tooltipsOpen.includes(a.key);
      return { ...s, tooltipsOpen: has ? s.tooltipsOpen.filter((k) => k !== a.key) : [...s.tooltipsOpen, a.key] };
    }
    case "CLEAR_FLASH":
      return { ...s, newPassportFlashId: null };
    case "HIGHLIGHT_TASK":
      return { ...s, taskHighlightId: a.id };
    case "ADVANCE_TIME": {
      const newOffset = s.timeOffset + a.days * DAY;
      const nowMs = Date.now() + newOffset;
      const newTasks: Task[] = [];
      const newActs: Activity[] = [];
      s.batches.forEach((b) => {
        const r = computeRSL(b, nowMs);
        const has = s.tasks.some((t) => t.batchId === b.id && t.status !== "done");
        if (r.rslDays < 3 && r.rslDays > 0 && !has) {
          const t: Task = {
            id: uid(), status: "todo",
            priority: r.rslDays < 2 ? "URGENT" : "HIGH",
            type: rslActionType(r.rslDays), product: b.product, batchId: b.id, storeId: b.storeId,
            instruction: rslToAction(r.rslDays), rslDays: r.rslDays,
            assignee: b.assignedStaff || "Unassigned", assignedAt: Date.now(),
          };
          newTasks.push(t);
          newActs.push({ id: uid(), ts: Date.now(), type: "rsl_alert", text: `RSL alert — ${b.product} at ${r.rslDays}d`, storeId: b.storeId, batchId: b.id, taskId: t.id });
        }
        if (r.rslDays === 0) {
          newActs.push({ id: uid(), ts: Date.now(), type: "waste_logged", text: `Waste logged — ${b.product} ${b.id} expired`, storeId: b.storeId, batchId: b.id });
        }
      });
      return { ...s, timeOffset: newOffset, tasks: [...newTasks, ...s.tasks], activity: [...newActs, ...s.activity] };
    }
    case "RESET_TIME":
      return { ...s, timeOffset: 0 };
    case "MARK_NOTIFS_READ":
      return { ...s, notificationsReadAt: Date.now(), bellOpen: false };
    default:
      return s;
  }
};

/* ============================================================
   SELECTORS
   ============================================================ */
const nowOf = (s: State) => Date.now() + s.timeOffset;
const getBatchesForStore = (s: State, storeId: string) =>
  storeId === "all" ? s.batches : s.batches.filter((b) => b.storeId === storeId);
const getAtRiskBatches = (s: State, storeId: string) => {
  const n = nowOf(s);
  return getBatchesForStore(s, storeId).filter((b) => computeRSL(b, n).rslDays < 3);
};
const getWasteThisWeek = (s: State, storeId: string) => {
  const cutoff = nowOf(s) - 7 * DAY;
  return WASTE_INCIDENTS
    .filter((w) => (storeId === "all" || w.storeId === storeId) && w.date >= cutoff)
    .reduce((sum, w) => sum + w.cost, 0);
};
const getFreshnessScore = (s: State, storeId: string) => {
  const n = nowOf(s);
  const bs = getBatchesForStore(s, storeId);
  if (!bs.length) return 0;
  return +(bs.reduce((a, b) => a + computeRSL(b, n).score, 0) / bs.length).toFixed(1);
};
const getTasksForStore = (s: State, storeId: string) =>
  storeId === "all" ? s.tasks : s.tasks.filter((t) => t.storeId === storeId);
const getOverdueTaskIds = (s: State) => {
  const cutoff = Date.now() - 2 * DAY;
  return new Set(s.tasks.filter((t) => t.status !== "done" && t.assignedAt < cutoff).map((t) => t.id));
};

type Notification = { id: string; kind: "expiry" | "overdue" | "temp"; text: string; ts: number; batchId?: string; taskId?: string };
const getNotifications = (s: State): Notification[] => {
  const n = nowOf(s);
  const cutoff = Date.now() - 2 * DAY;
  const out: Notification[] = [];
  s.batches.forEach((b) => {
    const r = computeRSL(b, n);
    if (r.rslDays < 2) {
      const store = s.stores.find((x) => x.id === b.storeId);
      out.push({ id: `n-exp-${b.id}`, kind: "expiry", text: `${b.product} expiring in ${Math.max(0, r.rslDays * 24)}h — ${store?.name ?? b.storeId}`, ts: Date.now(), batchId: b.id });
    }
    if (b.tempExcursion) {
      const store = s.stores.find((x) => x.id === b.storeId);
      out.push({ id: `n-tmp-${b.id}`, kind: "temp", text: `Temp excursion — ${b.product} — ${store?.name ?? b.storeId}`, ts: Date.now(), batchId: b.id });
    }
  });
  s.tasks.forEach((t) => {
    if (t.status !== "done" && t.assignedAt < cutoff) {
      const store = s.stores.find((x) => x.id === t.storeId);
      out.push({ id: `n-od-${t.id}`, kind: "overdue", text: `Task overdue — ${t.type} — ${store?.name ?? t.storeId}`, ts: Date.now(), taskId: t.id });
    }
  });
  return out;
};

/* ============================================================
   PRIMITIVES
   ============================================================ */
const Card = ({ children, className = "", style }: { children: ReactNode; className?: string; style?: CSSProperties }) => (
  <div className={`bg-white border rounded-xl ${className}`} style={{ borderColor: C.border, ...style }}>{children}</div>
);

const Btn = ({ children, onClick, kind = "secondary", className = "", disabled, title }: { children: ReactNode; onClick?: () => void; kind?: "primary" | "secondary" | "ghost" | "danger" | "success"; className?: string; disabled?: boolean; title?: string }) => {
  const styles: Record<string, CSSProperties> = {
    primary: { background: C.primary, color: "#fff", border: `1px solid ${C.primary}` },
    secondary: { background: "#fff", color: C.text2, border: `1px solid ${C.border}` },
    ghost: { background: "transparent", color: C.accent, border: "none" },
    danger: { background: C.red, color: "#fff", border: `1px solid ${C.red}` },
    success: { background: C.green, color: "#fff", border: `1px solid ${C.green}` },
  };
  return (
    <button onClick={onClick} disabled={disabled} title={title} className={`px-3 py-2 rounded-lg text-[13px] font-medium transition disabled:opacity-50 ${className}`} style={styles[kind]}>
      {children}
    </button>
  );
};

const Pill = ({ children, bg, color, className = "" }: { children: ReactNode; bg: string; color: string; className?: string }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${className}`} style={{ background: bg, color }}>{children}</span>
);

const StatusBadge = ({ score }: { score: number }) => {
  const status = statusFromScore(score);
  const color = freshnessColor(score);
  return <Pill bg={`${color}1A`} color={color}>{status}</Pill>;
};

const SectionHeader = ({ title, tipKey, state, dispatch, action }: { title: string; tipKey?: string; state: State; dispatch: Dispatch<Action>; action?: ReactNode }) => {
  const isOpen = tipKey && state.tooltipsOpen.includes(tipKey);
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-[15px] font-semibold" style={{ color: C.text }}>{title}</h3>
          {tipKey && (
            <button onClick={() => dispatch({ type: "TOGGLE_TIP", key: tipKey })} className="w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center" style={{ background: C.light, color: C.accent }} title="What is this?">?</button>
          )}
        </div>
        {action}
      </div>
      {isOpen && tipKey && TIPS[tipKey] && (
        <div className="mt-2 p-3 rounded-lg text-[13px]" style={{ background: C.light, borderLeft: `3px solid ${C.accent}`, color: C.primary }}>
          {TIPS[tipKey]}
        </div>
      )}
    </div>
  );
};

const KpiCard = ({ label, value, sub, accent, onClick }: { label: string; value: ReactNode; sub?: ReactNode; accent?: string; onClick?: () => void }) => (
  <Card className={`p-4 ${onClick ? "cursor-pointer hover:shadow-md transition" : ""}`} style={accent ? { borderLeft: `3px solid ${accent}` } : {}}>
    <button onClick={onClick} className="w-full text-left" disabled={!onClick}>
      <div className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: C.muted }}>{label}</div>
      <div className="text-[28px] font-bold mt-1" style={{ color: C.text }}>{value}</div>
      {sub && <div className="text-[12px] mt-1" style={{ color: C.text2 }}>{sub}</div>}
    </button>
  </Card>
);

/* ============================================================
   FRESHNESS GAUGE (G7)
   ============================================================ */
const FreshnessGauge = ({ score, size = 180 }: { score: number; size?: number }) => {
  const r = 70;
  const C2 = 2 * Math.PI * r;
  const clamped = Math.min(98, Math.max(2, score));
  const offset = C2 * (1 - clamped / 100);
  const color = freshnessColor(score);
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox="0 0 180 180" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="90" cy="90" r={r} stroke={C.border} strokeWidth="12" fill="none" />
        <circle cx="90" cy="90" r={r} stroke={color} strokeWidth="12" fill="none" strokeDasharray={C2} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div className="-mt-[120px] flex flex-col items-center" style={{ width: size }}>
        <div className="text-[28px] font-bold" style={{ color: C.text }}>{Math.round(score)}<span className="text-[14px] font-medium" style={{ color: C.muted }}>/100</span></div>
      </div>
      <div className="mt-[78px] text-[12px]" style={{ color: C.muted }}>Freshness Score</div>
    </div>
  );
};

/* ============================================================
   MODAL SHELL
   ============================================================ */
const Modal = ({ title, onClose, children, footer, banner }: { title: string; onClose: () => void; children: ReactNode; footer?: ReactNode; banner?: ReactNode }) => (
  <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 no-print" style={{ background: "rgba(0,0,0,0.35)" }} onClick={onClose}>
    <div data-modal-scroll="true" className="bg-white rounded-2xl shadow-2xl w-full max-w-[680px] max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between p-6 pb-4">
        <h2 className="text-[13px] font-bold uppercase tracking-wider" style={{ color: C.primary }}>{title}</h2>
        <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 text-[18px]" style={{ color: C.text2 }}>×</button>
      </div>
      {banner && <div className="px-10">{banner}</div>}
      <div className="px-10 pb-6">{children}</div>
      {footer && <div className="border-t px-10 py-4 flex items-center justify-between" style={{ borderColor: C.border }}>{footer}</div>}
    </div>
  </div>
);

const TabPills = ({ tabs, active, onChange, incomplete }: { tabs: { key: string; label: string }[]; active: string; onChange: (k: string) => void; incomplete?: Set<string> }) => (
  <div className="flex gap-2 mb-5">
    {tabs.map((t) => {
      const isActive = t.key === active;
      return (
        <button key={t.key} onClick={() => onChange(t.key)} className="px-4 py-2 rounded-full text-[13px] font-semibold flex items-center gap-2" style={{ background: isActive ? C.primary : "transparent", color: isActive ? "#fff" : C.text2, border: `1px solid ${isActive ? C.primary : C.border}` }}>
          {t.label}
          {incomplete?.has(t.key) && <span className="w-2 h-2 rounded-full" style={{ background: C.amber }} />}
        </button>
      );
    })}
  </div>
);

const Field = ({ label, required, error, children, hint }: { label: string; required?: boolean; error?: string; children: ReactNode; hint?: ReactNode }) => (
  <div className="mb-4">
    <div className="flex items-center justify-between mb-1">
      <label className="text-[13px] font-semibold" style={{ color: C.label }}>
        {label}{required && <span style={{ color: C.red }}> *</span>}
      </label>
      {hint}
    </div>
    {children}
    {error && <div className="text-[12px] mt-1" style={{ color: C.red }}>{error}</div>}
  </div>
);

const inputCls = "w-full h-10 px-3 rounded-lg text-[13px] outline-none transition";
const inputStyle = (err?: boolean): CSSProperties => ({ border: `1px solid ${err ? C.red : C.border}`, color: C.text, background: "#fff" });

/* ============================================================
   STORE MODAL
   ============================================================ */
function StoreModal({ state, dispatch }: { state: State; dispatch: Dispatch<Action> }) {
  const [tab, setTab] = useState("details");
  const [form, setForm] = useState({
    name: "", code: "", type: "Supermarket", city: "", region: "", address: "", country: "UK", postcode: "",
    manager: "", email: "", phone: "", activeSince: new Date().toISOString().slice(0, 10),
    tier: "Standard" as Store["tier"], logoUrl: null as string | null,
    checkouts: 8, storeSize: 1200, coldStorage: 3, deliveryFreq: "Daily",
    categories: [] as string[], erp: "SAP", wms: "Manhattan", notes: "",
    emailRSL: true, dailySummary: true, slack: false, sms: false,
    rslThreshold: 3, defaultView: "overview",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const upd = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => upd("logoUrl", r.result as string);
    r.readAsDataURL(f);
  };

  const save = () => {
    const e: Record<string, string> = {};
    if (!form.name) e.name = "Required";
    if (!form.code) e.code = "Required";
    if (!form.city) e.city = "Required";
    if (!form.manager) e.manager = "Required";
    setErrors(e);
    if (Object.keys(e).length) return;
    const id = `S${state.stores.length + 1}-${Date.now().toString(36).slice(-3)}`;
    const store: Store = {
      id, code: form.code, name: form.name, city: form.city, region: form.region, address: form.address, country: form.country, postcode: form.postcode,
      manager: form.manager, email: form.email, phone: form.phone, activeSince: new Date(form.activeSince).getTime(),
      tier: form.tier, type: form.type, logoUrl: form.logoUrl,
      erp: form.erp, wms: form.wms, deliveryFreq: form.deliveryFreq, categories: form.categories,
      coldStorage: form.coldStorage, storeSize: form.storeSize, checkouts: form.checkouts,
      alertPrefs: { emailRSL: form.emailRSL, dailySummary: form.dailySummary, slack: form.slack, sms: form.sms },
      rslThreshold: form.rslThreshold, defaultView: form.defaultView, isNew: true,
    };
    dispatch({ type: "ADD_STORE", store });
  };

  const incomplete = useMemo(() => {
    const s = new Set<string>();
    if (!form.name || !form.code || !form.city || !form.manager) s.add("details");
    return s;
  }, [form]);

  const CATS = ["Produce", "Dairy", "Bakery", "Meat & Fish", "Ready Meals", "Frozen", "Beverages"];

  return (
    <Modal
      title="Create Store Profile"
      onClose={() => dispatch({ type: "CLOSE_MODALS" })}
      banner={Object.keys(errors).length ? <div className="mb-3 p-3 rounded-lg text-[13px]" style={{ background: "#FEE2E2", color: C.red }}>Please complete {Object.keys(errors).length} required field(s)</div> : null}
      footer={
        <>
          <span className="text-[12px]" style={{ color: C.muted }}>* Required fields</span>
          <div className="flex gap-2">
            <Btn onClick={() => dispatch({ type: "CLOSE_MODALS" })}>Cancel</Btn>
            <Btn kind="primary" onClick={save}>Save Store</Btn>
          </div>
        </>
      }
    >
      <TabPills tabs={[{ key: "details", label: "Store Details" }, { key: "ops", label: "Operations" }, { key: "prefs", label: "Preferences" }]} active={tab} onChange={setTab} incomplete={incomplete} />

      {tab === "details" && (
        <div className="flex gap-6">
          <div className="flex-shrink-0">
            <div className="relative w-[110px] h-[110px] rounded-full flex items-center justify-center overflow-hidden" style={{ background: C.light, border: `1px solid ${C.border}` }}>
              {form.logoUrl ? <img src={form.logoUrl} alt="" className="w-full h-full object-cover" /> : <span className="text-[40px]">🏪</span>}
              <button onClick={() => fileRef.current?.click()} className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-white shadow flex items-center justify-center text-[12px]" title="Upload logo">✏️</button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
            </div>
          </div>
          <div className="flex-1">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Store Name" required error={errors.name}><input className={inputCls} style={inputStyle(!!errors.name)} value={form.name} onChange={(e) => upd("name", e.target.value)} /></Field>
              <Field label="Store ID" required error={errors.code}><input className={inputCls} style={inputStyle(!!errors.code)} value={form.code} onChange={(e) => upd("code", e.target.value)} placeholder="STR-006" /></Field>
              <Field label="Type"><select className={inputCls} style={inputStyle()} value={form.type} onChange={(e) => upd("type", e.target.value)}><option>Supermarket</option><option>Convenience</option><option>Flagship</option><option>Distribution Centre</option></select></Field>
              <Field label="City" required error={errors.city}><input className={inputCls} style={inputStyle(!!errors.city)} value={form.city} onChange={(e) => upd("city", e.target.value)} /></Field>
              <Field label="Region"><input className={inputCls} style={inputStyle()} value={form.region} onChange={(e) => upd("region", e.target.value)} /></Field>
              <Field label="Postcode"><input className={inputCls} style={inputStyle()} value={form.postcode} onChange={(e) => upd("postcode", e.target.value)} /></Field>
              <Field label="Address"><input className={inputCls} style={inputStyle()} value={form.address} onChange={(e) => upd("address", e.target.value)} /></Field>
              <Field label="Country"><input className={inputCls} style={inputStyle()} value={form.country} onChange={(e) => upd("country", e.target.value)} /></Field>
              <Field label="Manager" required error={errors.manager}><input className={inputCls} style={inputStyle(!!errors.manager)} value={form.manager} onChange={(e) => upd("manager", e.target.value)} /></Field>
              <Field label="Manager Email"><input className={inputCls} style={inputStyle()} value={form.email} onChange={(e) => upd("email", e.target.value)} /></Field>
              <Field label="Phone"><input className={inputCls} style={inputStyle()} value={form.phone} onChange={(e) => upd("phone", e.target.value)} /></Field>
              <Field label="Active Since"><input type="date" className={inputCls} style={inputStyle()} value={form.activeSince} onChange={(e) => upd("activeSince", e.target.value)} /></Field>
            </div>
            <Field label="Subscription Tier">
              <div className="flex gap-2">
                {(["Pilot", "Standard", "Enterprise"] as const).map((t) => (
                  <button key={t} onClick={() => upd("tier", t)} className="px-4 py-2 rounded-full text-[12px] font-semibold" style={{ background: form.tier === t ? C.primary : "transparent", color: form.tier === t ? "#fff" : C.text2, border: `1px solid ${form.tier === t ? C.primary : C.border}` }}>{t}</button>
                ))}
              </div>
            </Field>
          </div>
        </div>
      )}

      {tab === "ops" && (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Checkouts #"><input type="number" className={inputCls} style={inputStyle()} value={form.checkouts} onChange={(e) => upd("checkouts", +e.target.value)} /></Field>
          <Field label="Store Size (m²)"><input type="number" className={inputCls} style={inputStyle()} value={form.storeSize} onChange={(e) => upd("storeSize", +e.target.value)} /></Field>
          <Field label="Cold Storage Units"><input type="number" className={inputCls} style={inputStyle()} value={form.coldStorage} onChange={(e) => upd("coldStorage", +e.target.value)} /></Field>
          <Field label="Delivery Frequency"><select className={inputCls} style={inputStyle()} value={form.deliveryFreq} onChange={(e) => upd("deliveryFreq", e.target.value)}><option>Daily</option><option>Twice Weekly</option><option>Weekly</option></select></Field>
          <Field label="ERP"><select className={inputCls} style={inputStyle()} value={form.erp} onChange={(e) => upd("erp", e.target.value)}><option>SAP</option><option>Oracle</option><option>NetSuite</option></select></Field>
          <Field label="WMS"><select className={inputCls} style={inputStyle()} value={form.wms} onChange={(e) => upd("wms", e.target.value)}><option>Manhattan</option><option>Blue Yonder</option><option>Korber</option></select></Field>
          <div className="col-span-2">
            <Field label="Categories">
              <div className="flex flex-wrap gap-2">
                {CATS.map((c) => {
                  const on = form.categories.includes(c);
                  return <button key={c} onClick={() => upd("categories", on ? form.categories.filter((x) => x !== c) : [...form.categories, c])} className="px-3 py-1.5 rounded-full text-[12px] font-medium" style={{ background: on ? C.accent : "transparent", color: on ? "#fff" : C.text2, border: `1px solid ${on ? C.accent : C.border}` }}>{c}</button>;
                })}
              </div>
            </Field>
          </div>
        </div>
      )}

      {tab === "prefs" && (
        <div>
          {[["emailRSL", "Email RSL Alerts"], ["dailySummary", "Daily Summary Email"], ["slack", "Slack Notifications"], ["sms", "SMS Alerts for Urgent"]].map(([k, l]) => (
            <div key={k} className="flex items-center justify-between py-3 border-b" style={{ borderColor: C.border }}>
              <span className="text-[13px] font-medium" style={{ color: C.label }}>{l}</span>
              <button onClick={() => upd(k, !(form as any)[k])} className="w-11 h-6 rounded-full transition" style={{ background: (form as any)[k] ? C.accent : C.border }}>
                <span className="block w-5 h-5 bg-white rounded-full shadow transition" style={{ transform: (form as any)[k] ? "translateX(22px)" : "translateX(2px)" }} />
              </button>
            </div>
          ))}
          <Field label="RSL Alert Threshold (days)">
            <div className="flex items-center gap-3">
              <button onClick={() => upd("rslThreshold", Math.max(1, form.rslThreshold - 1))} className="w-8 h-8 rounded border" style={{ borderColor: C.border }}>−</button>
              <span className="text-[16px] font-semibold w-8 text-center" style={{ color: C.text }}>{form.rslThreshold}</span>
              <button onClick={() => upd("rslThreshold", form.rslThreshold + 1)} className="w-8 h-8 rounded border" style={{ borderColor: C.border }}>+</button>
            </div>
          </Field>
          <Field label="Default Dashboard View">
            <div className="flex gap-2">
              {["overview", "passports", "rsl"].map((v) => (
                <button key={v} onClick={() => upd("defaultView", v)} className="px-3 py-1.5 rounded-full text-[12px] font-medium capitalize" style={{ background: form.defaultView === v ? C.primary : "transparent", color: form.defaultView === v ? "#fff" : C.text2, border: `1px solid ${form.defaultView === v ? C.primary : C.border}` }}>{v}</button>
              ))}
            </div>
          </Field>
        </div>
      )}
    </Modal>
  );
}

/* ============================================================
   PASSPORT MODAL
   ============================================================ */
function nextBatchId(batches: Batch[]) {
  let max = 0;
  batches.forEach((b) => {
    const m = b.id.match(/#A(\d+)/);
    if (m) max = Math.max(max, +m[1]);
  });
  return `#A${String(max + 1).padStart(2, "0")}`;
}

const CATEGORY_SHELF: Record<string, number> = {
  Produce: 7, Dairy: 10, Bakery: 5, "Ready Meals": 4,
  "Meat & Fish": 3, Frozen: 90, "Dry Goods": 180,
};
const VALID_CATEGORIES = ["Produce", "Dairy", "Bakery", "Ready Meals", "Meat & Fish", "Frozen", "Dry Goods"];
const PROCESS_MSGS = [
  "Reading document...",
  "Identifying products...",
  "Extracting batch details...",
  "Mapping to passport fields...",
];

// Parse "DD-MM-YYYY" or "DD/MM/YYYY" → "YYYY-MM-DD" (for <input type="date">)
function parseScannedDate(s: string | null | undefined): string | null {
  if (!s || typeof s !== "string") return null;
  const m = s.trim().match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$/);
  if (!m) {
    const d = new Date(s);
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
    return null;
  }
  const dd = m[1].padStart(2, "0");
  const mm = m[2].padStart(2, "0");
  let yyyy = m[3];
  if (yyyy.length === 2) yyyy = "20" + yyyy;
  return `${yyyy}-${mm}-${dd}`;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const s = r.result as string;
      resolve(s.split(",")[1] || "");
    };
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

type ExtractedProduct = {
  productName: string | null;
  sku: string | null;
  batchId: string | null;
  category: string | null;
  units: number | null;
  weight: string | null;
  supplier: string | null;
  origin: string | null;
  productionDate: string | null;
  printedExpiry: string | null;
  baseShelfLife: number | null;
  storageTemp: number | null;
  deliveryDate: string | null;
  invoiceNumber: string | null;
  confidence?: "high" | "medium" | "low";
};

function PassportModal({ state, dispatch }: { state: State; dispatch: Dispatch<Action> }) {
  const modal = state.passportModalOpen;
  if (!modal) return null;
  const [tab, setTab] = useState("batch");
  const [form, setForm] = useState({
    product: "", sku: "", batchId: nextBatchId(state.batches), category: "Produce",
    units: 100, unitSize: "400g", productionDate: new Date().toISOString().slice(0, 10),
    printedExpiry: new Date(Date.now() + 7 * DAY).toISOString().slice(0, 10),
    supplier: "", origin: "UK", baseShelfLife: 7,
    storageTemp: 5, maxTemp: 8, monitoringMethod: "IoT Sensor", currentTemp: 5,
    location: modal.prefilledStoreId ? "store" : "dc", storeSelect: modal.prefilledStoreId || "S1",
    assignedStaff: "", entryPoint: new Date().toISOString().slice(0, 10),
    actionType: "Monitor", priority: "medium" as Batch["priority"], notes: "",
    logoUrl: null as string | null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);
  const upd = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  // Bill scanner state
  type ScanState = "idle" | "preview" | "loading" | "error" | "results" | "multi" | "nodata";
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [scanFile, setScanFile] = useState<File | null>(null);
  const [scanDataUrl, setScanDataUrl] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [extracted, setExtracted] = useState<ExtractedProduct | null>(null);
  const [extractedList, setExtractedList] = useState<ExtractedProduct[] | null>(null);
  const [extractionConfidence, setExtractionConfidence] = useState<"high" | "medium" | "low">("medium");
  const [extractedInvoiceNo, setExtractedInvoiceNo] = useState<string | null>(null);
  const [processIdx, setProcessIdx] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [flashedFields, setFlashedFields] = useState<Set<string>>(new Set());
  const [lowConfFields, setLowConfFields] = useState<Set<string>>(new Set());
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const billFileRef = useRef<HTMLInputElement>(null);

  // Cycle processing messages
  useEffect(() => {
    if (scanState !== "loading") return;
    const id = setInterval(() => setProcessIdx((i) => (i + 1) % PROCESS_MSGS.length), 1200);
    return () => clearInterval(id);
  }, [scanState]);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => upd("logoUrl", r.result as string);
    r.readAsDataURL(f);
  };

  const tempInRange = form.currentTemp <= form.maxTemp;

  const acceptFile = async (f: File) => {
    setScanError(null);
    if (f.size > 10 * 1024 * 1024) {
      setScanError("File too large. Maximum size is 10MB.");
      setScanState("error");
      return;
    }
    const okTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!okTypes.includes(f.type)) {
      setScanError("Please upload a PDF, JPG, or PNG file.");
      setScanState("error");
      return;
    }
    const url = await fileToDataUrl(f);
    setScanFile(f);
    setScanDataUrl(url);
    setScanState("preview");
  };

  const onBillSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) acceptFile(f);
    e.target.value = "";
  };

  const clearScan = () => {
    setScanFile(null); setScanDataUrl(null); setScanState("idle");
    setScanError(null); setExtracted(null); setExtractedList(null);
    setExtractedInvoiceNo(null);
  };

  const runExtraction = async () => {
    if (!scanFile) return;
    setScanState("loading");
    setProcessIdx(0);
    try {
      const { scanBill } = await import("@/lib/scan-bill.functions");
      const base64 = await fileToBase64(scanFile);
      const result = await scanBill({
        data: {
          base64,
          mediaType: scanFile.type as "application/pdf" | "image/jpeg" | "image/png",
          fileName: scanFile.name,
        },
      });
      const ex: any = result.extracted;

      if (ex && ex.multiProduct && Array.isArray(ex.products) && ex.products.length > 1) {
        setExtractedList(ex.products as ExtractedProduct[]);
        setExtractedInvoiceNo(ex.invoiceNumber ?? null);
        setExtractionConfidence((ex.confidence as any) || "medium");
        setScanState("multi");
        return;
      }

      const single: ExtractedProduct = (ex && ex.multiProduct && ex.products?.[0]) || ex;
      const nonNullCount = single ? Object.values(single).filter((v) => v !== null && v !== "" && v !== undefined).length : 0;
      const conf = (single?.confidence as any) || (nonNullCount > 6 ? "high" : nonNullCount > 3 ? "medium" : "low");

      if (!single || nonNullCount === 0) {
        setScanState("nodata");
        return;
      }
      setExtracted(single);
      setExtractedInvoiceNo(single.invoiceNumber ?? null);
      setExtractionConfidence(conf);
      setScanState("results");

      // Activity event
      dispatch({
        type: "ADD_ACTIVITY",
        activity: {
          id: uid(), ts: Date.now(), type: "bill_scanned",
          text: `Delivery bill scanned — ${nonNullCount} fields extracted — ${single.productName || "Unknown product"} — Invoice ${single.invoiceNumber || "N/A"}`,
          storeId: form.location === "store" ? form.storeSelect : "DC",
        },
      });
    } catch (err: any) {
      console.error(err);
      setScanError(err?.message || "Could not read the document. Please try again.");
      setScanState("error");
    }
  };

  const flashFields = (keys: string[]) => {
    setFlashedFields(new Set(keys));
    setTimeout(() => setFlashedFields(new Set()), 900);
  };

  const fillFormWith = (ex: ExtractedProduct) => {
    const filled: Record<string, any> = {};
    const lowConf: string[] = [];
    if (ex.productName) filled.product = ex.productName;
    if (ex.sku) filled.sku = ex.sku;
    filled.batchId = ex.batchId || nextBatchId(state.batches);
    if (ex.category && VALID_CATEGORIES.includes(ex.category)) filled.category = ex.category;
    if (typeof ex.units === "number") filled.units = ex.units;
    if (ex.weight) filled.unitSize = ex.weight;
    if (ex.supplier) filled.supplier = ex.supplier;
    if (ex.origin) filled.origin = ex.origin;
    const pd = parseScannedDate(ex.productionDate);
    if (pd) filled.productionDate = pd;
    const pe = parseScannedDate(ex.printedExpiry);
    if (pe) filled.printedExpiry = pe;
    if (typeof ex.baseShelfLife === "number") filled.baseShelfLife = ex.baseShelfLife;
    else if (filled.category) filled.baseShelfLife = CATEGORY_SHELF[filled.category] || 7;
    if (typeof ex.storageTemp === "number") filled.storageTemp = ex.storageTemp;
    const dd = parseScannedDate(ex.deliveryDate);
    if (dd) filled.entryPoint = dd;

    setForm((f) => ({ ...f, ...filled }));
    const filledKeys = Object.keys(filled).filter((k) => k !== "batchId" || !!ex.batchId);
    if (extractionConfidence === "low") filledKeys.forEach((k) => lowConf.push(k));
    setLowConfFields(new Set(lowConf));
    flashFields(filledKeys);
    setExtractedInvoiceNo(ex.invoiceNumber ?? extractedInvoiceNo);

    const n = filledKeys.length;
    const msg = extractionConfidence === "high"
      ? `✓ ${n} fields filled from your bill. Review and save when ready.`
      : extractionConfidence === "medium"
      ? `✓ ${n} fields filled. Some fields need your review — highlighted in amber.`
      : `⚠ Only ${n} fields could be extracted. Please complete the remaining fields manually.`;
    setSuccessMsg(msg);
    setTab("batch");
    setScanState("idle");

    // scroll modal top
    requestAnimationFrame(() => {
      const sc = document.querySelector('[data-modal-scroll="true"]');
      if (sc) sc.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const fieldStyle = (key: string, err?: boolean): CSSProperties => {
    const base = inputStyle(err);
    if (lowConfFields.has(key)) return { ...base, border: `1.5px solid ${C.amber}` };
    return base;
  };
  const fieldClass = (key: string) => `${inputCls} ${flashedFields.has(key) ? "fp-field-fill" : ""}`;

  const create = (overrides?: Partial<typeof form> & { sourceDoc?: Batch["sourceDocument"] }) => {
    const cur = overrides ? { ...form, ...overrides } : form;
    const e: Record<string, string> = {};
    if (!cur.product) e.product = "Required";
    if (!cur.sku) e.sku = "Required";
    if (!cur.batchId) e.batchId = "Required";
    if (!cur.baseShelfLife) e.baseShelfLife = "Required";
    setErrors(e);
    if (Object.keys(e).length) return false;
    const storeId = cur.location === "dc" ? "DC" : cur.location === "transit" ? "DC" : cur.storeSelect;
    const tIn = cur.currentTemp <= cur.maxTemp;
    const batch: Batch = {
      id: cur.batchId, product: cur.product, sku: cur.sku, category: cur.category, storeId,
      productionDate: new Date(cur.productionDate).getTime(),
      printedExpiry: new Date(cur.printedExpiry).getTime(),
      units: cur.units, unitSize: cur.unitSize, supplier: cur.supplier, origin: cur.origin,
      baseShelfLife: cur.baseShelfLife, dwellDays: 0,
      tempExcursion: !tIn, tempPenaltyDays: tIn ? 0 : 1,
      maxTemp: cur.maxTemp, storageTemp: cur.storageTemp,
      tempHistory: tempHist(cur.storageTemp), monitoringMethod: cur.monitoringMethod,
      entryPoint: cur.entryPoint, assignedStaff: cur.assignedStaff,
      priority: cur.priority, recommendedAction: cur.actionType, logoUrl: cur.logoUrl, createdAt: Date.now(),
      sourceDocument: overrides?.sourceDoc ?? (scanDataUrl && scanFile ? {
        fileName: scanFile.name,
        invoiceNumber: extractedInvoiceNo,
        scannedAt: Date.now(),
        confidence: extractionConfidence,
        mediaType: scanFile.type,
        dataUrl: scanDataUrl,
      } : null),
    };
    dispatch({ type: "ADD_BATCH", batch });
    return true;
  };

  const createAllFromBill = async () => {
    if (!extractedList || !scanFile || !scanDataUrl) return;
    const sourceDoc = {
      fileName: scanFile.name,
      invoiceNumber: extractedInvoiceNo,
      scannedAt: Date.now(),
      confidence: extractionConfidence,
      mediaType: scanFile.type,
      dataUrl: scanDataUrl,
    };
    const existing = [...state.batches];
    extractedList.forEach((ex, i) => {
      const cat = ex.category && VALID_CATEGORIES.includes(ex.category) ? ex.category : "Produce";
      const bsl = typeof ex.baseShelfLife === "number" ? ex.baseShelfLife : (CATEGORY_SHELF[cat] || 7);
      const storeId = form.location === "dc" ? "DC" : form.location === "transit" ? "DC" : form.storeSelect;
      const tempForCat = typeof ex.storageTemp === "number" ? ex.storageTemp : 5;
      const id = ex.batchId || nextBatchId(existing);
      const batch: Batch = {
        id, product: ex.productName || `Product ${i + 1}`, sku: ex.sku || `SKU-${i + 1}`,
        category: cat, storeId,
        productionDate: new Date(parseScannedDate(ex.productionDate) || new Date().toISOString().slice(0, 10)).getTime(),
        printedExpiry: new Date(parseScannedDate(ex.printedExpiry) || new Date(Date.now() + bsl * DAY).toISOString().slice(0, 10)).getTime(),
        units: typeof ex.units === "number" ? ex.units : 100,
        unitSize: ex.weight || "—",
        supplier: ex.supplier || "—", origin: ex.origin || "—",
        baseShelfLife: bsl, dwellDays: 0,
        tempExcursion: false, tempPenaltyDays: 0,
        maxTemp: tempForCat + 3, storageTemp: tempForCat,
        tempHistory: tempHist(tempForCat), monitoringMethod: "IoT Sensor",
        entryPoint: parseScannedDate(ex.deliveryDate) || new Date().toISOString().slice(0, 10),
        assignedStaff: "", priority: "medium",
        recommendedAction: "Monitor", logoUrl: null, createdAt: Date.now() + i,
        sourceDocument: sourceDoc,
      };
      existing.unshift(batch);
      setTimeout(() => dispatch({ type: "ADD_BATCH", batch }), i * 200);
    });
    setTimeout(() => {
      dispatch({ type: "PUSH_TOAST", toast: { id: uid(), kind: "success", text: `${extractedList.length} passports created from bill ${extractedInvoiceNo || ""}` } });
      dispatch({ type: "CLOSE_MODALS" });
    }, extractedList.length * 200 + 100);
  };

  const incomplete = useMemo(() => {
    const s = new Set<string>();
    if (!form.product || !form.sku || !form.batchId) s.add("batch");
    return s;
  }, [form]);

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); };
  const onDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false); };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) acceptFile(f);
  };

  const confidenceBadge = () => {
    if (extractionConfidence === "high") return <Pill bg="#DCFCE7" color={C.green}>High Confidence</Pill>;
    if (extractionConfidence === "medium") return <Pill bg="#FEF3C7" color={C.amber}>Review Fields</Pill>;
    return <Pill bg="#FEE2E2" color={C.red}>Manual Check Needed</Pill>;
  };

  return (
    <div onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop} className="contents">
      <Modal
        title="Create Product Passport"
        onClose={() => dispatch({ type: "CLOSE_MODALS" })}
        banner={
          <>
            {/* Bill scanner banner */}
            <div className="mb-3 relative rounded-xl p-4" style={{ background: C.light, border: `1px dashed #93C5FD` }}>
              {isDragOver && (
                <div className="absolute inset-0 rounded-xl flex items-center justify-center text-[14px] font-semibold pointer-events-none" style={{ background: "rgba(239,246,255,0.95)", border: `2px solid ${C.accent}`, color: C.accent, zIndex: 5 }}>
                  Drop your bill here
                </div>
              )}

              {scanState === "idle" && (
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <div className="text-[13px] font-semibold" style={{ color: C.text }}>📄 Have a delivery bill or invoice?</div>
                    <div className="text-[12px] mt-0.5" style={{ color: C.text2 }}>Upload it and we'll fill the form for you</div>
                    <div className="text-[11px] mt-1" style={{ color: C.muted }}>Supports PDF, JPG, PNG — max 10MB</div>
                  </div>
                  <button onClick={() => billFileRef.current?.click()} className="px-4 h-10 rounded-lg text-[13px] font-semibold text-white" style={{ background: C.primary }}>
                    📤 Upload Bill / Invoice
                  </button>
                  <input ref={billFileRef} type="file" accept="application/pdf,image/jpeg,image/png" className="hidden" onChange={onBillSelect} />
                </div>
              )}

              {scanState === "preview" && scanFile && scanDataUrl && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-[13px] font-semibold" style={{ color: C.text }}>📄 Bill preview</div>
                    <button onClick={clearScan} className="w-7 h-7 rounded-full bg-white shadow text-[14px]" style={{ color: C.text2 }}>×</button>
                  </div>
                  {scanFile.type === "application/pdf" ? (
                    <embed src={scanDataUrl} type="application/pdf" className="w-full rounded-lg" style={{ height: 200, border: `1px solid ${C.border}`, background: "#fff" }} />
                  ) : (
                    <img src={scanDataUrl} alt="bill preview" className="w-full rounded-lg" style={{ maxHeight: 220, objectFit: "contain", border: `1px solid ${C.border}`, background: "#fff" }} />
                  )}
                  <div className="flex items-center justify-between mt-2 text-[12px]" style={{ color: C.text2 }}>
                    <span>{scanFile.name} · {(scanFile.size / 1024).toFixed(0)} KB</span>
                    <Pill bg="#DCFCE7" color={C.green}>Ready to scan</Pill>
                  </div>
                  <button onClick={runExtraction} className="w-full mt-3 h-11 rounded-lg text-[15px] font-semibold text-white" style={{ background: C.primary }}>
                    🔍 Extract Passport Data
                  </button>
                </div>
              )}

              {scanState === "loading" && (
                <div className="flex items-center gap-3 py-2">
                  <div className="w-5 h-5 rounded-full animate-spin" style={{ border: `2px solid ${C.accent}`, borderTopColor: "transparent" }} />
                  <div className="text-[13px] font-medium" style={{ color: C.text }} key={processIdx}>
                    {PROCESS_MSGS[processIdx]}
                  </div>
                  <div className="flex-1 h-2 rounded-full overflow-hidden ml-2" style={{ background: "#DBEAFE" }}>
                    <div className="h-full" style={{ background: C.accent, width: "50%", animation: "fp-pulse 1.2s ease-in-out infinite" }} />
                  </div>
                </div>
              )}

              {scanState === "error" && (
                <div className="rounded-lg p-3" style={{ background: "#FEE2E2", border: `1px solid #FCA5A5` }}>
                  <div className="text-[13px] font-semibold mb-2" style={{ color: C.red }}>{scanError || "Could not read the document."}</div>
                  <div className="flex gap-2">
                    {scanFile && <button onClick={runExtraction} className="px-3 h-8 rounded-lg text-[12px] font-semibold text-white" style={{ background: C.primary }}>Retry</button>}
                    <button onClick={clearScan} className="px-3 h-8 rounded-lg text-[12px] font-semibold" style={{ border: `1px solid ${C.border}`, color: C.text2, background: "#fff" }}>Enter Manually</button>
                  </div>
                </div>
              )}

              {scanState === "nodata" && (
                <div className="rounded-lg p-3" style={{ background: "#FEF3C7", border: `1px solid #FCD34D` }}>
                  <div className="text-[13px] font-medium mb-2" style={{ color: C.amber }}>We couldn't extract product data from this document. This may not be a delivery note or invoice. Please enter details manually.</div>
                  <button onClick={clearScan} className="px-3 h-8 rounded-lg text-[12px] font-semibold" style={{ border: `1px solid ${C.border}`, color: C.text2, background: "#fff" }}>Enter Manually</button>
                </div>
              )}

              {scanState === "results" && extracted && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-[13px] font-semibold" style={{ color: C.green }}>✓ Data extracted from bill</div>
                    {confidenceBadge()}
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-3 p-3 rounded-lg" style={{ background: "#fff", border: `1px solid ${C.border}` }}>
                    {([
                      ["Product Name", extracted.productName],
                      ["SKU", extracted.sku],
                      ["Batch ID", extracted.batchId],
                      ["Category", extracted.category],
                      ["Units", extracted.units],
                      ["Unit Size", extracted.weight],
                      ["Supplier", extracted.supplier],
                      ["Origin", extracted.origin],
                      ["Production Date", extracted.productionDate],
                      ["Expiry Date", extracted.printedExpiry],
                      ["Base Shelf Life", extracted.baseShelfLife ? `${extracted.baseShelfLife} days` : null],
                      ["Storage Temp", typeof extracted.storageTemp === "number" ? `${extracted.storageTemp}°C` : null],
                      ["Invoice No.", extracted.invoiceNumber],
                      ["Delivery Date", extracted.deliveryDate],
                    ] as [string, any][]).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between text-[12px] py-0.5">
                        <span style={{ color: C.muted }}>{k}</span>
                        {v !== null && v !== undefined && v !== "" ? (
                          <span style={{ color: C.text, fontWeight: 500 }}>
                            {String(v)} {extractionConfidence === "low" && <span style={{ color: C.amber }}>⚠</span>}
                          </span>
                        ) : (
                          <span className="italic" style={{ color: C.muted }}>Not found</span>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => fillFormWith(extracted)} className="flex-1 h-10 rounded-lg text-[13px] font-semibold text-white" style={{ background: C.primary }}>✓ Fill Form with This Data</button>
                    <button onClick={clearScan} className="flex-1 h-10 rounded-lg text-[13px] font-semibold" style={{ border: `1px solid ${C.border}`, color: C.text2, background: "#fff" }}>✕ Discard & Enter Manually</button>
                  </div>
                </div>
              )}

              {scanState === "multi" && extractedList && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-[13px] font-semibold" style={{ color: C.text }}>Multiple products found on this bill</div>
                      <div className="text-[12px]" style={{ color: C.text2 }}>Select which product to create a passport for:</div>
                    </div>
                    {confidenceBadge()}
                  </div>
                  <div className="space-y-2 max-h-[260px] overflow-auto pr-1">
                    {extractedList.map((p, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg" style={{ background: "#fff", border: `1px solid ${C.border}` }}>
                        <div className="min-w-0">
                          <div className="text-[13px] font-semibold truncate" style={{ color: C.text }}>{p.productName || `Product ${i + 1}`}</div>
                          <div className="text-[11px]" style={{ color: C.muted }}>{p.sku || "—"} · {p.batchId || "—"}</div>
                          <div className="text-[11px]" style={{ color: C.text2 }}>{p.units ?? "?"} units · Expiry {p.printedExpiry || "—"}</div>
                        </div>
                        <button onClick={() => fillFormWith(p)} className="px-3 h-8 rounded-lg text-[12px] font-semibold text-white flex-shrink-0" style={{ background: C.primary }}>Select</button>
                      </div>
                    ))}
                  </div>
                  <button onClick={createAllFromBill} className="w-full mt-3 h-10 rounded-lg text-[13px] font-semibold" style={{ background: C.accent, color: "#fff" }}>
                    Create passports for all {extractedList.length} products →
                  </button>
                </div>
              )}
            </div>

            {successMsg && (
              <div className="mb-3 p-3 rounded-lg text-[13px]" style={{ background: "#F0FDF4", borderLeft: `3px solid ${C.green}`, color: C.text }}>
                {successMsg}
              </div>
            )}
            {Object.keys(errors).length > 0 && (
              <div className="mb-3 p-3 rounded-lg text-[13px]" style={{ background: "#FEE2E2", color: C.red }}>
                Please complete {Object.keys(errors).length} required field(s)
              </div>
            )}
          </>
        }
        footer={
          <>
            <span className="text-[12px]" style={{ color: C.muted }}>* Required fields</span>
            <div className="flex gap-2">
              <Btn onClick={() => dispatch({ type: "CLOSE_MODALS" })}>Cancel</Btn>
              <Btn kind="primary" onClick={() => create()}>Create Passport</Btn>
            </div>
          </>
        }
      >
        <TabPills tabs={[{ key: "batch", label: "Batch Details" }, { key: "cold", label: "Cold Chain" }, { key: "assign", label: "Assignment" }]} active={tab} onChange={setTab} incomplete={incomplete} />

        {tab === "batch" && (
          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <div className="relative w-[110px] h-[110px] rounded-full flex items-center justify-center overflow-hidden" style={{ background: C.light, border: `1px solid ${C.border}` }}>
                {form.logoUrl ? <img src={form.logoUrl} alt="" className="w-full h-full object-cover" /> : <span className="text-[40px]">📦</span>}
                <button onClick={() => fileRef.current?.click()} className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-white shadow flex items-center justify-center text-[12px]">✏️</button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
              </div>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-3">
              <Field label="Product Name" required error={errors.product}>
                <input className={fieldClass("product")} style={fieldStyle("product", !!errors.product)} value={form.product} onChange={(e) => upd("product", e.target.value)} />
                {lowConfFields.has("product") && <div className="text-[11px] mt-1" style={{ color: C.amber }}>Auto-filled — please verify</div>}
              </Field>
              <Field label="SKU" required error={errors.sku}>
                <input className={fieldClass("sku")} style={fieldStyle("sku", !!errors.sku)} value={form.sku} onChange={(e) => upd("sku", e.target.value)} />
                {lowConfFields.has("sku") && <div className="text-[11px] mt-1" style={{ color: C.amber }}>Auto-filled — please verify</div>}
              </Field>
              <Field label="Batch ID" required error={errors.batchId} hint={<button onClick={() => upd("batchId", nextBatchId(state.batches))} className="text-[12px]" style={{ color: C.accent }}>Auto-generate</button>}>
                <input className={fieldClass("batchId")} style={fieldStyle("batchId", !!errors.batchId)} value={form.batchId} onChange={(e) => upd("batchId", e.target.value)} />
                {extractedInvoiceNo && <div className="text-[11px] mt-1" style={{ color: C.muted }}>Invoice Ref: {extractedInvoiceNo}</div>}
              </Field>
              <Field label="Category">
                <select className={fieldClass("category")} style={fieldStyle("category")} value={form.category} onChange={(e) => upd("category", e.target.value)}>
                  {VALID_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Units"><input type="number" className={fieldClass("units")} style={fieldStyle("units")} value={form.units} onChange={(e) => upd("units", +e.target.value)} /></Field>
              <Field label="Unit Size"><input className={fieldClass("unitSize")} style={fieldStyle("unitSize")} value={form.unitSize} onChange={(e) => upd("unitSize", e.target.value)} /></Field>
              <Field label="Production Date"><input type="date" className={fieldClass("productionDate")} style={fieldStyle("productionDate")} value={form.productionDate} onChange={(e) => upd("productionDate", e.target.value)} /></Field>
              <Field label="Printed Expiry"><input type="date" className={fieldClass("printedExpiry")} style={fieldStyle("printedExpiry")} value={form.printedExpiry} onChange={(e) => upd("printedExpiry", e.target.value)} /></Field>
              <Field label="Supplier"><input className={fieldClass("supplier")} style={fieldStyle("supplier")} value={form.supplier} onChange={(e) => upd("supplier", e.target.value)} /></Field>
              <Field label="Origin"><input className={fieldClass("origin")} style={fieldStyle("origin")} value={form.origin} onChange={(e) => upd("origin", e.target.value)} /></Field>
              <Field label="Base Shelf Life (days)" required error={errors.baseShelfLife}>
                <input type="number" className={fieldClass("baseShelfLife")} style={fieldStyle("baseShelfLife", !!errors.baseShelfLife)} value={form.baseShelfLife} onChange={(e) => upd("baseShelfLife", +e.target.value)} />
              </Field>
            </div>
          </div>
        )}

        {tab === "cold" && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Storage Temp (°C)"><input type="number" className={fieldClass("storageTemp")} style={fieldStyle("storageTemp")} value={form.storageTemp} onChange={(e) => upd("storageTemp", +e.target.value)} /></Field>
            <Field label="Max Allowed Temp (°C)"><input type="number" className={inputCls} style={inputStyle()} value={form.maxTemp} onChange={(e) => upd("maxTemp", +e.target.value)} /></Field>
            <div className="col-span-2">
              <Field label="Monitoring Method">
                <div className="flex gap-2">
                  {["IoT Sensor", "Manual", "Probe"].map((m) => (
                    <button key={m} onClick={() => upd("monitoringMethod", m)} className="px-3 py-1.5 rounded-full text-[12px] font-medium" style={{ background: form.monitoringMethod === m ? C.accent : "transparent", color: form.monitoringMethod === m ? "#fff" : C.text2, border: `1px solid ${form.monitoringMethod === m ? C.accent : C.border}` }}>{m}</button>
                  ))}
                </div>
              </Field>
            </div>
            <Field label="Current Temp (°C)" hint={<Pill bg={tempInRange ? "#DCFCE7" : "#FEE2E2"} color={tempInRange ? C.green : C.red}>{tempInRange ? "Within Range" : "⚠ Excursion"}</Pill>}>
              <input type="number" className={inputCls} style={inputStyle()} value={form.currentTemp} onChange={(e) => upd("currentTemp", +e.target.value)} />
            </Field>
          </div>
        )}

        {tab === "assign" && (
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Field label="Location">
                <div className="flex gap-2 mb-2">
                  {[["dc", "DC"], ["transit", "In Transit"], ["store", "Store"]].map(([v, l]) => (
                    <button key={v} onClick={() => upd("location", v)} className="px-3 py-1.5 rounded-full text-[12px] font-medium" style={{ background: form.location === v ? C.accent : "transparent", color: form.location === v ? "#fff" : C.text2, border: `1px solid ${form.location === v ? C.accent : C.border}` }}>{l}</button>
                  ))}
                </div>
                {form.location === "store" && (
                  <select className={inputCls} style={inputStyle()} value={form.storeSelect} onChange={(e) => upd("storeSelect", e.target.value)}>
                    {state.stores.filter((s) => s.id !== "DC").map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                )}
              </Field>
            </div>
            <Field label="Assigned Staff"><input className={inputCls} style={inputStyle()} value={form.assignedStaff} onChange={(e) => upd("assignedStaff", e.target.value)} placeholder="Initials e.g. AV" /></Field>
            <Field label="Entry Date"><input type="date" className={fieldClass("entryPoint")} style={fieldStyle("entryPoint")} value={form.entryPoint} onChange={(e) => upd("entryPoint", e.target.value)} /></Field>
            <Field label="Recommended Action"><select className={inputCls} style={inputStyle()} value={form.actionType} onChange={(e) => upd("actionType", e.target.value)}><option>Monitor</option><option>FEFO Rotation</option><option>Markdown</option><option>Allocation Adjust</option></select></Field>
            <Field label="Priority">
              <div className="flex gap-2">
                {(["low", "medium", "high", "urgent"] as const).map((p) => {
                  const colors: Record<string, string> = { low: C.green, medium: C.amber, high: "#EA580C", urgent: C.red };
                  const on = form.priority === p;
                  return <button key={p} onClick={() => upd("priority", p)} className="px-3 py-1 rounded-full text-[11px] font-semibold uppercase" style={{ background: on ? colors[p] : "transparent", color: on ? "#fff" : colors[p], border: `1px solid ${colors[p]}` }}>{p}</button>;
                })}
              </div>
            </Field>
            <div className="col-span-2">
              <Field label="Notes"><textarea className="w-full px-3 py-2 rounded-lg text-[13px] outline-none" style={inputStyle()} rows={3} value={form.notes} onChange={(e) => upd("notes", e.target.value)} /></Field>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ============================================================
   DRAWER
   ============================================================ */
function Drawer({ state, dispatch }: { state: State; dispatch: Dispatch<Action> }) {
  const batch = state.batches.find((b) => b.id === state.drawerBatchId);
  const open = !!state.drawerBatchId;
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [open]);

  if (!batch) return null;
  const n = nowOf(state);
  const r = computeRSL(batch, n);
  const store = state.stores.find((s) => s.id === batch.storeId);
  const existingTask = state.tasks.find((t) => t.batchId === batch.id && t.status !== "done");

  const createTask = () => {
    const t: Task = {
      id: uid(), status: "todo",
      priority: r.rslDays < 2 ? "URGENT" : r.rslDays <= 3 ? "HIGH" : "MEDIUM",
      type: rslActionType(r.rslDays), product: batch.product, batchId: batch.id, storeId: batch.storeId,
      instruction: rslToAction(r.rslDays), rslDays: r.rslDays,
      assignee: batch.assignedStaff || "Unassigned", assignedAt: Date.now(),
    };
    dispatch({ type: "ADD_TASK", task: t });
  };

  return (
    <div className="fixed inset-0 z-[9000] no-print" style={{ pointerEvents: open ? "auto" : "none" }}>
      <div className="absolute inset-0 transition-opacity" style={{ background: "rgba(0,0,0,0.4)", opacity: open ? 1 : 0 }} onClick={() => dispatch({ type: "CLOSE_DRAWER" })} />
      <div className="absolute top-0 right-0 h-full bg-white shadow-2xl overflow-y-auto transition-transform" style={{ width: "min(560px, calc(100vw - 40px))", transform: open ? "translateX(0)" : "translateX(100%)", transitionDuration: "250ms" }}>
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: C.muted }}>Passport</div>
              <h2 className="text-[20px] font-bold mt-1" style={{ color: C.text }}>{batch.product}</h2>
              <div className="text-[13px] mt-1" style={{ color: C.text2 }}>{batch.id} · {batch.sku} · {store?.name}</div>
            </div>
            <button onClick={() => dispatch({ type: "CLOSE_DRAWER" })} className="w-8 h-8 rounded-full hover:bg-slate-100 text-[18px]" style={{ color: C.text2 }}>×</button>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="p-3 rounded-lg" style={{ background: C.bg }}>
              <div className="text-[11px]" style={{ color: C.muted }}>RSL</div>
              <div className="text-[18px] font-bold" style={{ color: freshnessColor(r.score) }}>{r.rslDays}d</div>
            </div>
            <div className="p-3 rounded-lg" style={{ background: C.bg }}>
              <div className="text-[11px]" style={{ color: C.muted }}>Score</div>
              <div className="text-[18px] font-bold" style={{ color: freshnessColor(r.score) }}>{r.score}/100</div>
            </div>
            <div className="p-3 rounded-lg" style={{ background: C.bg }}>
              <div className="text-[11px]" style={{ color: C.muted }}>Units</div>
              <div className="text-[18px] font-bold" style={{ color: C.text }}>{batch.units}</div>
            </div>
          </div>

          <h4 className="text-[13px] font-semibold mb-2" style={{ color: C.text }}>Temperature History</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={batch.tempHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: C.muted }} />
              <YAxis tick={{ fontSize: 11, fill: C.muted }} />
              <RTooltip />
              <ReferenceLine y={batch.maxTemp} stroke={C.red} strokeDasharray="4 4" label={{ value: `Max: ${batch.maxTemp}°C`, fill: C.red, fontSize: 11, position: "right" }} />
              <Line type="monotone" dataKey="temp" stroke={C.accent} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>

          <h4 className="text-[13px] font-semibold mt-5 mb-2" style={{ color: C.text }}>RSL Breakdown</h4>
          <div className="space-y-1 text-[13px]" style={{ color: C.text2 }}>
            <div>Base shelf life: <b>{batch.baseShelfLife}d</b></div>
            <div>Days since production: <b>−{r.daysSinceProduction}</b></div>
            <div>Temp penalty: <b>−{r.tempPenalty}</b></div>
            <div>Dwell penalty: <b>−{r.dwellPenalty}</b></div>
            <div className="pt-2 mt-2 border-t" style={{ borderColor: C.border }}>Remaining: <b style={{ color: freshnessColor(r.score) }}>{r.rslDays}d</b></div>
          </div>

          {r.rslDays < 5 && (
            <div className="mt-5">
              {existingTask ? (
                <div className="p-3 rounded-lg flex items-center justify-between" style={{ background: "#DCFCE7", borderLeft: `3px solid ${C.green}` }}>
                  <span className="text-[13px]" style={{ color: C.green }}>Action task already created ✓</span>
                  <button onClick={() => { dispatch({ type: "CLOSE_DRAWER" }); dispatch({ type: "NAVIGATE", page: "actions" }); dispatch({ type: "HIGHLIGHT_TASK", id: existingTask.id }); }} className="text-[12px] font-semibold" style={{ color: C.green }}>View in Action Engine →</button>
                </div>
              ) : (
                <div className="p-3 rounded-lg" style={{ background: C.light, borderLeft: `3px solid ${C.accent}` }}>
                  <div className="text-[13px] mb-2" style={{ color: C.primary }}>Recommended: {rslToAction(r.rslDays)}</div>
                  <button onClick={createTask} className="text-[12px] font-semibold px-3 py-1.5 rounded-lg" style={{ background: C.accent, color: "#fff" }}>Create Action Task →</button>
                </div>
              )}
            </div>
          )}

          <h4 className="text-[13px] font-semibold mt-5 mb-2" style={{ color: C.text }}>Source Document</h4>
          {batch.sourceDocument ? (
            <SourceDocSection doc={batch.sourceDocument} />
          ) : (
            <div className="text-[13px] italic" style={{ color: C.muted }}>Manually entered</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ACTIVITY ICON
   ============================================================ */
const ACT_ICON: Record<ActivityType, { icon: string; color: string }> = {
  passport_created: { icon: "📦", color: C.accent },
  task_completed: { icon: "✓", color: C.green },
  markdown_triggered: { icon: "🏷", color: C.amber },
  temp_excursion: { icon: "⚠", color: C.red },
  waste_logged: { icon: "🗑", color: C.red },
  store_created: { icon: "🏪", color: C.accent },
  rsl_alert: { icon: "🕐", color: C.amber },
  bill_scanned: { icon: "📄", color: C.accent },
};

/* ============================================================
   PAGES
   ============================================================ */
type PageProps = { state: State; dispatch: Dispatch<Action> };

function Overview({ state, dispatch }: PageProps) {
  const n = nowOf(state);
  const storeId = state.activeStoreFilter;
  const batches = getBatchesForStore(state, storeId);
  const atRisk = getAtRiskBatches(state, storeId).length;
  const waste = getWasteThisWeek(state, storeId);
  const freshness = getFreshnessScore(state, storeId);

  const byStore = state.stores.filter((s) => s.id !== "DC").map((s) => {
    const sBatches = state.batches.filter((b) => b.storeId === s.id);
    const score = sBatches.length ? sBatches.reduce((a, b) => a + computeRSL(b, n).score, 0) / sBatches.length : 0;
    return { name: s.name.replace("Store #", "#"), score: +score.toFixed(1), id: s.id };
  });

  const wasteDrivers = useMemo(() => {
    const m = new Map<string, number>();
    WASTE_INCIDENTS.filter((w) => storeId === "all" || w.storeId === storeId).forEach((w) => m.set(w.driver, (m.get(w.driver) || 0) + w.cost));
    return Array.from(m.entries()).map(([name, value]) => ({ name, value }));
  }, [storeId]);
  const DCOLORS = [C.accent, C.amber, C.red, C.green, C.primary];

  const feed = state.activity.filter((a) => storeId === "all" || a.storeId === storeId).slice(0, 8);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[24px] font-bold" style={{ color: C.text }}>Overview</h1>
        <p className="text-[13px]" style={{ color: C.text2 }}>{storeId === "all" ? "All stores" : state.stores.find((s) => s.id === storeId)?.name}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Active Passports" value={batches.length} accent={C.accent} onClick={() => dispatch({ type: "NAVIGATE", page: "passports" })} />
        <KpiCard label="At Risk Products" value={atRisk} accent={C.red} onClick={() => dispatch({ type: "NAVIGATE", page: "rsl" })} />
        <KpiCard label="Waste This Week" value={formatGBP(waste)} accent={C.amber} onClick={() => dispatch({ type: "NAVIGATE", page: "analytics" })} />
        <KpiCard label="Freshness Score" value={formatPct(freshness)} accent={C.green} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <SectionHeader title="Freshness by Store" tipKey="overview" state={state} dispatch={dispatch} />
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byStore}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: C.muted }} />
              <YAxis tick={{ fontSize: 11, fill: C.muted }} />
              <RTooltip />
              <Bar dataKey="score">
                {byStore.map((b) => (
                  <Cell key={b.id} fill={freshnessColor(b.score)} fillOpacity={storeId === "all" || storeId === b.id ? 1 : 0.3} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <SectionHeader title="Waste Drivers (last 7 days)" state={state} dispatch={dispatch} />
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={wasteDrivers} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90}>
                {wasteDrivers.map((_, i) => <Cell key={i} fill={DCOLORS[i % DCOLORS.length]} />)}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <RTooltip formatter={(v: any) => formatGBP(v as number)} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-5">
        <SectionHeader title="Live Activity" tipKey="overview" state={state} dispatch={dispatch} action={<button onClick={() => dispatch({ type: "OPEN_ACTIVITY_LOG" })} className="text-[12px] font-semibold" style={{ color: C.accent }}>View all activity →</button>} />
        <div className="space-y-2">
          {feed.length === 0 && <div className="text-[13px] py-4 text-center" style={{ color: C.muted }}>No activity yet</div>}
          {feed.map((a) => {
            const meta = ACT_ICON[a.type];
            const store = state.stores.find((s) => s.id === a.storeId);
            const click = a.batchId ? () => dispatch({ type: "OPEN_DRAWER", batchId: a.batchId! }) : undefined;
            return (
              <div key={a.id} onClick={click} className={`flex items-center gap-3 p-2 rounded-lg ${click ? "cursor-pointer hover:bg-slate-50" : ""}`}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[14px]" style={{ background: `${meta.color}1A`, color: meta.color }}>{meta.icon}</div>
                <div className="flex-1 text-[13px]" style={{ color: C.text }}>{a.text}</div>
                {store && <Pill bg={C.badgeBlueBg} color={C.badgeBlueText}>{store.name.replace("Store #", "#")}</Pill>}
                <span className="text-[12px]" style={{ color: C.muted }}>{timeAgo(a.ts)}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function PassportsPage({ state, dispatch }: PageProps) {
  const n = nowOf(state);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const storeId = state.activeStoreFilter;

  const filtered = state.batches.filter((b) => {
    if (storeId !== "all" && b.storeId !== storeId) return false;
    if (category !== "all" && b.category !== category) return false;
    if (status !== "all") {
      const s = statusFromScore(computeRSL(b, n).score);
      if (status !== s) return false;
    }
    if (search) {
      const q = search.toLowerCase();
      if (!b.product.toLowerCase().includes(q) && !b.sku.toLowerCase().includes(q) && !b.id.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-bold" style={{ color: C.text }}>Product Passports</h1>
          <p className="text-[13px]" style={{ color: C.text2 }}>Live freshness intelligence for every active batch</p>
        </div>
        <Btn kind="primary" onClick={() => dispatch({ type: "OPEN_PASSPORT_MODAL", prefilledStoreId: storeId === "all" ? null : storeId })}>+ New Passport</Btn>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
          <input className={inputCls} style={inputStyle()} placeholder="Search product / SKU / batch" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className={inputCls} style={inputStyle()} value={storeId} onChange={(e) => dispatch({ type: "SET_STORE_FILTER", storeId: e.target.value })}>
            <option value="all">All Stores</option>
            {state.stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select className={inputCls} style={inputStyle()} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All Status</option><option>Fresh</option><option>At Risk</option><option>Critical</option>
          </select>
          <select className={inputCls} style={inputStyle()} value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">All Categories</option><option>Produce</option><option>Dairy</option><option>Bakery</option><option>Meat & Fish</option><option>Ready Meals</option>
          </select>
        </div>
        <div className="text-[12px] mb-3" style={{ color: C.muted }}>Showing {filtered.length} of {state.batches.length} passports</div>

        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <div className="text-[48px]" style={{ color: C.muted }}>📦</div>
            <div className="text-[14px] font-semibold mt-2" style={{ color: C.text }}>No passports match your filters</div>
            <button onClick={() => { setSearch(""); setStatus("all"); setCategory("all"); dispatch({ type: "SET_STORE_FILTER", storeId: "all" }); }} className="text-[13px] mt-2" style={{ color: C.accent }}>Clear all filters</button>
          </div>
        ) : (
          <div className="overflow-auto">
            <table className="w-full text-[13px]">
              <thead><tr style={{ color: C.muted, fontSize: 11 }} className="text-left">
                <th className="py-2">Batch</th><th>Product</th><th>Category</th><th>Store</th><th>RSL</th><th>Status</th><th></th>
              </tr></thead>
              <tbody>
                {filtered.map((b) => {
                  const r = computeRSL(b, n);
                  const store = state.stores.find((s) => s.id === b.storeId);
                  const flash = b.id === state.newPassportFlashId;
                  return (
                    <tr key={b.id} className={`border-t ${flash ? "fp-flash-row" : ""}`} style={{ borderColor: C.border }}>
                      <td className="py-3 font-semibold" style={{ color: C.text }}>{b.id}</td>
                      <td style={{ color: C.text }}>{b.product}</td>
                      <td style={{ color: C.text2 }}>{b.category}</td>
                      <td style={{ color: C.text2 }}>{store?.name}</td>
                      <td style={{ color: freshnessColor(r.score), fontWeight: 600 }}>{r.rslDays}d</td>
                      <td><StatusBadge score={r.score} /></td>
                      <td><button onClick={() => dispatch({ type: "OPEN_DRAWER", batchId: b.id })} className="text-[12px] font-semibold" style={{ color: C.accent }}>View →</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function RSLPage({ state, dispatch }: PageProps) {
  const n = nowOf(state);
  const storeId = state.activeStoreFilter;
  const batches = getBatchesForStore(state, storeId).map((b) => ({ b, r: computeRSL(b, n) })).sort((a, b) => a.r.rslDays - b.r.rslDays);
  const safe = batches.filter((x) => x.r.rslDays >= 5).length;
  const monitor = batches.filter((x) => x.r.rslDays >= 3 && x.r.rslDays < 5).length;
  const act = batches.filter((x) => x.r.rslDays < 3).length;

  const trend = Array.from({ length: 14 }, (_, i) => ({
    day: `D${i + 1}`,
    atRisk: Math.max(2, Math.round(act * (1.4 - i * 0.05) + Math.sin(i) * 3)),
  }));

  const createTask = (b: Batch, r: ReturnType<typeof computeRSL>) => {
    const t: Task = {
      id: uid(), status: "todo",
      priority: r.rslDays < 2 ? "URGENT" : r.rslDays <= 3 ? "HIGH" : "MEDIUM",
      type: rslActionType(r.rslDays), product: b.product, batchId: b.id, storeId: b.storeId,
      instruction: rslToAction(r.rslDays), rslDays: r.rslDays,
      assignee: b.assignedStaff || "Unassigned", assignedAt: Date.now(),
    };
    dispatch({ type: "ADD_TASK", task: t });
  };

  return (
    <div className="space-y-5">
      <div><h1 className="text-[24px] font-bold" style={{ color: C.text }}>RSL Monitor</h1><p className="text-[13px]" style={{ color: C.text2 }}>Remaining shelf life across the network</p></div>

      <div className="grid grid-cols-3 gap-4">
        <KpiCard label="Safe (≥5d)" value={safe} accent={C.green} />
        <KpiCard label="Monitor (3-4d)" value={monitor} accent={C.amber} />
        <KpiCard label="Act Now (<3d)" value={act} accent={C.red} />
      </div>

      <Card className="p-5">
        <SectionHeader title="Urgency Queue" tipKey="rsl" state={state} dispatch={dispatch} />
        <div className="overflow-auto">
          <table className="w-full text-[13px]">
            <thead><tr style={{ color: C.muted, fontSize: 11 }} className="text-left">
              <th className="py-2">Batch</th><th>Product</th><th>Store</th><th>RSL</th><th>Score</th><th>Recommended Action</th><th></th>
            </tr></thead>
            <tbody>
              {batches.map(({ b, r }) => {
                const store = state.stores.find((s) => s.id === b.storeId);
                const color = freshnessColor(r.score);
                const hasTask = state.tasks.some((t) => t.batchId === b.id && t.status !== "done");
                return (
                  <tr key={b.id} className="border-t" style={{ borderColor: C.border, borderLeft: `3px solid ${color}` }}>
                    <td className="py-3 font-semibold pl-3" style={{ color: C.text }}>{b.id}</td>
                    <td style={{ color: C.text }}>{b.product}</td>
                    <td style={{ color: C.text2 }}>{store?.name}</td>
                    <td style={{ color, fontWeight: 600 }}>{r.rslDays}d</td>
                    <td style={{ color }}>{r.score}</td>
                    <td style={{ color: C.text2 }}>{rslToAction(r.rslDays)}</td>
                    <td>
                      {r.rslDays < 5 && (hasTask ? <Pill bg="#DCFCE7" color={C.green}>Task Created ✓</Pill> : <button onClick={() => createTask(b, r)} className="text-[12px] font-semibold" style={{ color: C.accent }}>→ Create Task</button>)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-5">
        <SectionHeader title="14-Day At-Risk Trend" state={state} dispatch={dispatch} />
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={trend}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: C.muted }} />
            <YAxis tick={{ fontSize: 11, fill: C.muted }} />
            <RTooltip />
            <Area type="monotone" dataKey="atRisk" stroke={C.red} fill={`${C.red}33`} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

function WastePage({ state, dispatch }: PageProps) {
  const storeId = state.activeStoreFilter;
  const incidents = WASTE_INCIDENTS.filter((w) => storeId === "all" || w.storeId === storeId);
  const byDriver = useMemo(() => {
    const m = new Map<string, number>();
    incidents.forEach((w) => m.set(w.driver, (m.get(w.driver) || 0) + w.cost));
    return Array.from(m.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [incidents]);
  const byCat = useMemo(() => {
    const m = new Map<string, number>();
    incidents.forEach((w) => {
      const b = state.batches.find((x) => x.id === w.batch);
      const cat = b?.category || "Other";
      m.set(cat, (m.get(cat) || 0) + w.cost);
    });
    return Array.from(m.entries()).map(([name, value]) => ({ name, value }));
  }, [incidents, state.batches]);

  const trend = Array.from({ length: 8 }, (_, i) => ({
    week: `W${i + 1}`,
    total: 3200 - i * 180 + Math.round(Math.sin(i) * 80),
    preventable: 2400 - i * 170 + Math.round(Math.cos(i) * 60),
  }));

  const PCOLORS = [C.red, C.amber, C.accent, C.green, C.primary];

  return (
    <div className="space-y-5">
      <div><h1 className="text-[24px] font-bold" style={{ color: C.text }}>Waste Analytics</h1><p className="text-[13px]" style={{ color: C.text2 }}>Root-cause analysis</p></div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <SectionHeader title="Waste by Driver" tipKey="waste" state={state} dispatch={dispatch} />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byDriver} layout="vertical" margin={{ left: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis type="number" tick={{ fontSize: 11, fill: C.muted }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: C.muted }} />
              <RTooltip formatter={(v: any) => formatGBP(v as number)} />
              <Bar dataKey="value" fill={C.red} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-5">
          <SectionHeader title="Waste by Category" state={state} dispatch={dispatch} />
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={byCat} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90}>
                {byCat.map((_, i) => <Cell key={i} fill={PCOLORS[i % PCOLORS.length]} />)}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-5">
        <SectionHeader title="Incidents Log" state={state} dispatch={dispatch} />
        <div className="overflow-auto">
          <table className="w-full text-[13px]">
            <thead><tr style={{ color: C.muted, fontSize: 11 }} className="text-left">
              <th className="py-2">Date</th><th>Product</th><th>Batch</th><th>Store</th><th>Driver</th><th>Units</th><th>Cost</th>
            </tr></thead>
            <tbody>
              {incidents.map((w, i) => {
                const store = state.stores.find((s) => s.id === w.storeId);
                const batchExists = state.batches.some((b) => b.id === w.batch);
                return (
                  <tr key={i} className="border-t" style={{ borderColor: C.border }}>
                    <td className="py-3" style={{ color: C.text2 }}>{formatDate(w.date)}</td>
                    <td style={{ color: C.text }}>{w.product}</td>
                    <td>{batchExists ? <button onClick={() => dispatch({ type: "OPEN_DRAWER", batchId: w.batch })} className="font-semibold" style={{ color: C.accent }}>{w.batch}</button> : <span style={{ color: C.muted }}>{w.batch}</span>}</td>
                    <td style={{ color: C.text2 }}>{store?.name}</td>
                    <td style={{ color: C.text2 }}>{w.driver}</td>
                    <td style={{ color: C.text }}>{w.units}</td>
                    <td style={{ color: C.text, fontWeight: 600 }}>{formatGBP(w.cost)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-5">
        <SectionHeader title="8-Week Trend" state={state} dispatch={dispatch} />
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={trend}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
            <XAxis dataKey="week" tick={{ fontSize: 11, fill: C.muted }} />
            <YAxis tick={{ fontSize: 11, fill: C.muted }} />
            <RTooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="total" stroke={C.red} strokeWidth={2} />
            <Line type="monotone" dataKey="preventable" stroke={C.amber} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

function ActionsPage({ state, dispatch }: PageProps) {
  const storeId = state.activeStoreFilter;
  const tasks = getTasksForStore(state, storeId);
  const overdue = getOverdueTaskIds(state);
  const todo = tasks.filter((t) => t.status === "todo");
  const inprog = tasks.filter((t) => t.status === "inprogress");
  const done = tasks.filter((t) => t.status === "done");

  const cols = [
    { key: "todo", label: "TO DO", color: C.red, list: todo },
    { key: "inprogress", label: "IN PROGRESS", color: C.amber, list: inprog },
    { key: "done", label: "COMPLETED", color: C.green, list: done },
  ];

  return (
    <div className="space-y-5">
      <div><h1 className="text-[24px] font-bold" style={{ color: C.text }}>Action Engine</h1><p className="text-[13px]" style={{ color: C.text2 }}>Operational tasks generated from freshness intelligence</p></div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="New" value={todo.length} accent={C.red} />
        <KpiCard label="In Progress" value={inprog.length} accent={C.amber} />
        <KpiCard label="Completed" value={done.length} accent={C.green} />
        <KpiCard label="Overdue" value={overdue.size} accent={C.red} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cols.map((col) => (
          <Card key={col.key} className="p-4" style={{ borderLeft: `3px solid ${col.color}` }}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-[12px] font-bold uppercase tracking-wider" style={{ color: col.color }}>{col.label}</div>
              <span className="text-[11px]" style={{ color: C.muted }}>{col.list.length}</span>
            </div>
            <div className="space-y-2">
              {col.list.length === 0 && <div className="text-[12px] py-4 text-center" style={{ color: C.muted }}>No tasks</div>}
              {col.list.map((t) => {
                const store = state.stores.find((s) => s.id === t.storeId);
                const isOverdue = overdue.has(t.id);
                const highlight = state.taskHighlightId === t.id;
                return (
                  <div key={t.id} className={`p-3 rounded-lg ${highlight ? "fp-flash-row" : ""}`} style={{ background: C.bg, opacity: t.status === "done" ? 0.65 : 1 }}>
                    <div className="flex items-center justify-between mb-1">
                      <Pill bg={`${col.color}1A`} color={col.color}>{t.priority}</Pill>
                      <div className="flex gap-1">
                        {isOverdue && <Pill bg={`${C.red}1A`} color={C.red}>OVERDUE</Pill>}
                        {t.status === "done" && <span style={{ color: C.green }}>✓</span>}
                      </div>
                    </div>
                    <div className="text-[13px] font-semibold mt-1" style={{ color: C.text }}>{t.type} — {t.product}</div>
                    <div className="text-[12px] mt-1" style={{ color: C.text2 }}>{t.instruction}</div>
                    <div className="flex items-center justify-between mt-2">
                      {storeId === "all" && store && <button onClick={() => { dispatch({ type: "OPEN_STORE_PROFILE", storeId: store.id }); }} className="text-[11px] underline" style={{ color: C.accent }}>{store.name}</button>}
                      <span className="text-[11px]" style={{ color: C.muted }}>{t.assignee}</span>
                    </div>
                    {t.status === "todo" && <button onClick={() => dispatch({ type: "UPDATE_TASK", id: t.id, status: "inprogress" })} className="mt-2 w-full text-[12px] py-1.5 rounded" style={{ background: C.accent, color: "#fff" }}>Start Task</button>}
                    {t.status === "inprogress" && <button onClick={() => dispatch({ type: "UPDATE_TASK", id: t.id, status: "done" })} className="mt-2 w-full text-[12px] py-1.5 rounded" style={{ background: C.green, color: "#fff" }}>Mark Complete</button>}
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ImpactPage({ state, dispatch }: PageProps) {
  const storeId = state.activeStoreFilter;
  const completed = state.tasks.filter((t) => t.status === "done" && (storeId === "all" || t.storeId === storeId));
  const savings = completed.reduce((sum, t) => sum + (t.type === "Markdown" ? 120 : t.type === "FEFO Rotation" ? 80 : 60), 0);
  const wasteKg = completed.filter((t) => t.type === "FEFO Rotation").length * 2;
  const co2 = wasteKg * 0.002;

  const league = state.stores.filter((s) => s.id !== "DC").map((s, i) => ({
    store: s,
    reduction: 28 - i * 3 + Math.round(Math.sin(i) * 2),
    trend: Array.from({ length: 8 }, (_, k) => 30 - k - i + Math.round(Math.sin(k) * 3)),
  })).sort((a, b) => b.reduction - a.reduction);

  const activeStore = state.stores.find((s) => s.id === storeId);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between no-print">
        <div><h1 className="text-[24px] font-bold" style={{ color: C.text }}>Impact Report</h1><p className="text-[13px]" style={{ color: C.text2 }}>Sustainability outcomes from interventions</p></div>
        <div className="flex gap-2">
          <Btn onClick={() => window.print()}>Export PDF</Btn>
          <Btn kind="primary" onClick={() => {
            if (navigator.share) navigator.share({ title: "Freshness Passport — Impact Report", url: location.href }).catch(() => {});
            else { navigator.clipboard?.writeText(location.href); dispatch({ type: "PUSH_TOAST", toast: { id: uid(), kind: "info", text: "Link copied to clipboard" } }); }
          }}>Share with Sustainability Team</Btn>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Interventions" value={completed.length} accent={C.accent} />
        <KpiCard label="Cost Savings" value={formatGBP(savings)} accent={C.green} />
        <KpiCard label="Waste Reduced" value={`${wasteKg}kg`} accent={C.amber} />
        <KpiCard label="CO₂ Avoided" value={`${co2.toFixed(3)}t`} accent={C.green} />
      </div>

      <Card className="p-5 no-print">
        <SectionHeader title="12-Month Waste Trend" state={state} dispatch={dispatch} />
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={MONTHLY_IMPACT_12M}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.muted }} />
            <YAxis tick={{ fontSize: 11, fill: C.muted }} />
            <RTooltip />
            <Bar dataKey="waste" fill={C.red} />
            <Line dataKey="trend" stroke={C.accent} strokeWidth={2} />
          </ComposedChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-5 no-print">
        <SectionHeader title="6-Month Interventions" state={state} dispatch={dispatch} />
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={INTERVENTION_STACK_6M}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.muted }} />
            <YAxis tick={{ fontSize: 11, fill: C.muted }} />
            <RTooltip /><Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="fefo" stackId="a" fill={C.accent} />
            <Bar dataKey="markdown" stackId="a" fill={C.amber} />
            <Bar dataKey="allocation" stackId="a" fill={C.green} />
            <Bar dataKey="coldchain" stackId="a" fill={C.primary} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6" style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, color: "#fff" }}>
        <div className="text-[11px] uppercase tracking-wider opacity-80">ESG Certificate</div>
        <div className="text-[22px] font-bold mt-1">{activeStore ? activeStore.name : "All Stores Network"}</div>
        <div className="text-[14px] mt-1 opacity-90">Verified Waste Reduction: {formatPct(((wasteKg / 100) || 1) * 12)}</div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div><div className="text-[11px] opacity-70 uppercase">Period</div><div className="text-[14px] font-semibold">{formatDate(Date.now())}</div></div>
          <div><div className="text-[11px] opacity-70 uppercase">Interventions</div><div className="text-[14px] font-semibold">{completed.length}</div></div>
          <div><div className="text-[11px] opacity-70 uppercase">CO₂ Avoided</div><div className="text-[14px] font-semibold">{co2.toFixed(3)}t</div></div>
        </div>
        <div className="print-only hidden mt-4 text-[11px]">Generated by Freshness Passport · {formatDate(Date.now())}</div>
      </Card>

      <Card className="p-5 no-print">
        <SectionHeader title="Store League" state={state} dispatch={dispatch} />
        <table className="w-full text-[13px]">
          <thead><tr style={{ color: C.muted, fontSize: 11 }} className="text-left"><th className="py-2">Rank</th><th>Store</th><th>Reduction</th><th>Trend</th></tr></thead>
          <tbody>
            {league.map((row, i) => {
              const isSelected = storeId === row.store.id;
              return (
                <tr key={row.store.id} className="border-t" style={{ borderColor: C.border, background: isSelected ? C.light : undefined }}>
                  <td className="py-3" style={{ color: C.text }}>{i + 1}{i === 0 && " 🏆"}</td>
                  <td><button onClick={() => dispatch({ type: "OPEN_STORE_PROFILE", storeId: row.store.id })} className={`${isSelected ? "font-bold" : "font-medium"}`} style={{ color: C.accent }}>{row.store.name}</button>{row.store.isNew && <Pill bg={C.badgeBlueBg} color={C.badgeBlueText} className="ml-2">New</Pill>}</td>
                  <td style={{ color: C.green, fontWeight: 600 }}>{formatPct(row.reduction)}</td>
                  <td>
                    <svg width="80" height="20"><polyline points={row.trend.map((v, i) => `${i * 12},${20 - v * 0.4}`).join(" ")} fill="none" stroke={row.store.isNew ? C.border : C.accent} strokeWidth="1.5" /></svg>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

/* ============================================================
   STORE PROFILE PAGE
   ============================================================ */
function StoreProfilePage({ state, dispatch }: PageProps) {
  const store = state.stores.find((s) => s.id === state.storeProfileId);
  if (!store) return null;
  const [tab, setTab] = useState("overview");
  const n = nowOf(state);
  const batches = state.batches.filter((b) => b.storeId === store.id);
  const atRisk = batches.filter((b) => computeRSL(b, n).rslDays < 3).length;
  const waste = WASTE_INCIDENTS.filter((w) => w.storeId === store.id && w.date >= n - 7 * DAY).reduce((s, w) => s + w.cost, 0);
  const freshness = batches.length ? batches.reduce((s, b) => s + computeRSL(b, n).score, 0) / batches.length : 0;
  const tasks = state.tasks.filter((t) => t.storeId === store.id);
  const pending = tasks.filter((t) => t.status !== "done");
  const completed = tasks.filter((t) => t.status === "done");

  return (
    <div className="space-y-5">
      <button onClick={() => dispatch({ type: "BACK_FROM_PROFILE" })} className="text-[13px] font-medium" style={{ color: C.accent }}>← Back to Dashboard</button>

      <Card className="p-6">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center overflow-hidden" style={{ background: C.light }}>
            {store.logoUrl ? <img src={store.logoUrl} alt="" className="w-full h-full object-cover" /> : <span className="text-[36px]">🏪</span>}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-[22px] font-bold" style={{ color: C.text }}>{store.name}</h1>
              <button onClick={() => dispatch({ type: "TOGGLE_TIP", key: "storeProfile" })} className="w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center" style={{ background: C.light, color: C.accent }}>?</button>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Pill bg={C.bg} color={C.text2}>{store.code}</Pill>
              <Pill bg={C.light} color={C.accent}>{store.tier}</Pill>
              <span className="text-[12px]" style={{ color: C.muted }}>Active since {formatDate(store.activeSince)}</span>
            </div>
            <div className="text-[13px] mt-2" style={{ color: C.text2 }}>{store.address} · {store.city} · {store.postcode}</div>
            <div className="text-[13px]" style={{ color: C.text2 }}>👤 {store.manager} · {store.email}</div>
          </div>
          <div className="flex gap-2">
            <Btn onClick={() => dispatch({ type: "OPEN_STORE_MODAL" })}>Edit Store Profile</Btn>
            <Btn kind="primary" onClick={() => dispatch({ type: "OPEN_PASSPORT_MODAL", prefilledStoreId: store.id })}>+ New Passport</Btn>
          </div>
        </div>
        {state.tooltipsOpen.includes("storeProfile") && (
          <div className="mt-4 p-3 rounded-lg text-[13px]" style={{ background: C.light, borderLeft: `3px solid ${C.accent}`, color: C.primary }}>{TIPS.storeProfile}</div>
        )}
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Active Passports" value={batches.length} accent={C.accent} onClick={() => { dispatch({ type: "SET_STORE_FILTER", storeId: store.id }); dispatch({ type: "NAVIGATE", page: "passports" }); dispatch({ type: "BACK_FROM_PROFILE" }); }} />
        <KpiCard label="At Risk" value={atRisk} accent={C.red} onClick={() => { dispatch({ type: "SET_STORE_FILTER", storeId: store.id }); dispatch({ type: "NAVIGATE", page: "rsl" }); dispatch({ type: "BACK_FROM_PROFILE" }); }} />
        <KpiCard label="Waste This Week" value={formatGBP(waste)} accent={C.amber} onClick={() => { dispatch({ type: "SET_STORE_FILTER", storeId: store.id }); dispatch({ type: "NAVIGATE", page: "analytics" }); dispatch({ type: "BACK_FROM_PROFILE" }); }} />
        <KpiCard label="Freshness" value={formatPct(freshness)} accent={C.green} onClick={() => { dispatch({ type: "SET_STORE_FILTER", storeId: store.id }); dispatch({ type: "NAVIGATE", page: "overview" }); dispatch({ type: "BACK_FROM_PROFILE" }); }} />
      </div>

      <Card className="p-5">
        <TabPills tabs={[{ key: "overview", label: "Overview" }, { key: "products", label: "Products" }, { key: "performance", label: "Performance" }, { key: "actions", label: "Actions" }]} active={tab} onChange={setTab} />

        {tab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-[13px] font-semibold mb-2" style={{ color: C.text }}>Recent Activity</h4>
              <div className="space-y-2">
                {state.activity.filter((a) => a.storeId === store.id).slice(0, 5).map((a) => (
                  <div key={a.id} className="flex items-center gap-2 text-[13px]" style={{ color: C.text2 }}>
                    <span>{ACT_ICON[a.type].icon}</span><span className="flex-1">{a.text}</span><span style={{ color: C.muted, fontSize: 11 }}>{timeAgo(a.ts)}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => { dispatch({ type: "SET_STORE_FILTER", storeId: store.id }); dispatch({ type: "NAVIGATE", page: "analytics" }); dispatch({ type: "BACK_FROM_PROFILE" }); }} className="text-[12px] mt-3" style={{ color: C.accent }}>See full waste analysis →</button>
            </div>
            <div className="flex justify-center">
              <FreshnessGauge score={freshness} />
            </div>
          </div>
        )}

        {tab === "products" && (
          batches.length === 0 ? (
            <div className="py-12 text-center">
              <div className="text-[40px]">📦</div>
              <div className="text-[14px] font-semibold mt-2" style={{ color: C.text }}>No passports yet</div>
              <button onClick={() => dispatch({ type: "OPEN_PASSPORT_MODAL", prefilledStoreId: store.id })} className="mt-2 px-3 py-1.5 rounded-lg text-[13px]" style={{ background: C.accent, color: "#fff" }}>+ Create first passport</button>
            </div>
          ) : (
            <table className="w-full text-[13px]">
              <thead><tr style={{ color: C.muted, fontSize: 11 }} className="text-left"><th className="py-2">Batch</th><th>Product</th><th>RSL</th><th>Status</th></tr></thead>
              <tbody>
                {batches.map((b) => {
                  const r = computeRSL(b, n);
                  return (
                    <tr key={b.id} className="border-t" style={{ borderColor: C.border }}>
                      <td className="py-2 font-semibold cursor-pointer" style={{ color: C.accent }} onClick={() => dispatch({ type: "OPEN_DRAWER", batchId: b.id })}>{b.id}</td>
                      <td>{b.product}</td><td style={{ color: freshnessColor(r.score) }}>{r.rslDays}d</td><td><StatusBadge score={r.score} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )
        )}

        {tab === "performance" && (
          <div>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={Array.from({ length: 8 }, (_, i) => ({ w: `W${i + 1}`, score: Math.max(40, freshness - i * 1.5 + Math.sin(i) * 5), bench: 70 }))}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                <XAxis dataKey="w" tick={{ fontSize: 11, fill: C.muted }} /><YAxis tick={{ fontSize: 11, fill: C.muted }} />
                <RTooltip />
                <Line dataKey="score" stroke={C.accent} strokeWidth={2} />
                <Line dataKey="bench" stroke={C.muted} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {tab === "actions" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-[13px] font-semibold mb-2" style={{ color: C.text }}>Pending ({pending.length})</h4>
              <div className="space-y-2">{pending.map((t) => <div key={t.id} className="p-2 rounded-lg text-[13px]" style={{ background: C.bg }}>{t.type} — {t.product}</div>)}</div>
            </div>
            <div>
              <h4 className="text-[13px] font-semibold mb-2" style={{ color: C.text }}>Completed ({completed.length})</h4>
              <div className="space-y-2">{completed.map((t) => <div key={t.id} className="p-2 rounded-lg text-[13px]" style={{ background: C.bg, opacity: 0.7 }}>✓ {t.type} — {t.product}</div>)}</div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

/* ============================================================
   APP SHELL
   ============================================================ */
const NAV: { key: Page; label: string; icon: string }[] = [
  { key: "overview", label: "Overview", icon: "▤" },
  { key: "passports", label: "Passports", icon: "📋" },
  { key: "rsl", label: "RSL Monitor", icon: "⏳" },
  { key: "analytics", label: "Waste Analytics", icon: "📊" },
  { key: "actions", label: "Action Engine", icon: "✓" },
  { key: "impact", label: "Impact", icon: "🌿" },
];

function Sidebar({ state, dispatch }: PageProps) {
  return (
    <>
      <div className={`fixed inset-0 z-30 bg-black/40 transition-opacity md:hidden no-print ${state.isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} onClick={() => dispatch({ type: "TOGGLE_SIDEBAR", open: false })} />
      <aside className={`fixed md:sticky top-0 left-0 h-screen w-[240px] bg-white border-r flex flex-col z-40 transition-transform no-print ${state.isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`} style={{ borderColor: C.border }}>
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[16px]" style={{ background: C.primary, color: "#fff" }}>🌱</div>
            <div className="font-bold text-[14px]" style={{ color: C.text }}>Freshness Passport</div>
          </div>
          <button onClick={() => dispatch({ type: "TOGGLE_SIDEBAR", open: false })} className="md:hidden text-[18px]" style={{ color: C.text2 }}>×</button>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {NAV.map((n) => {
            const active = state.activePage === n.key && !state.storeProfileId;
            return (
              <button key={n.key} onClick={() => { dispatch({ type: "NAVIGATE", page: n.key }); if (state.storeProfileId) dispatch({ type: "BACK_FROM_PROFILE" }); }} className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 text-[13px] font-medium" style={{ background: active ? C.light : "transparent", color: active ? C.accent : C.text2, borderLeft: `3px solid ${active ? C.accent : "transparent"}` }}>
                <span>{n.icon}</span>{n.label}
              </button>
            );
          })}
        </nav>
        <div className="p-3 text-[11px]" style={{ color: C.muted }}>© Freshness Passport 2026</div>
      </aside>
    </>
  );
}

function Header({ state, dispatch }: PageProps) {
  const ddRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (state.storeDropdownOpen && ddRef.current && !ddRef.current.contains(e.target as Node)) dispatch({ type: "TOGGLE_STORE_DD", open: false });
      if (state.bellOpen && bellRef.current && !bellRef.current.contains(e.target as Node)) dispatch({ type: "TOGGLE_BELL", open: false });
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [state.storeDropdownOpen, state.bellOpen, dispatch]);

  const notifs = getNotifications(state);
  const newCount = notifs.filter((nf) => nf.ts > state.notificationsReadAt).length;
  const activeStore = state.stores.find((s) => s.id === state.activeStoreFilter);

  return (
    <header className="sticky top-0 z-20 bg-white border-b px-4 md:px-6 py-3 flex items-center gap-3 no-print" style={{ borderColor: C.border }}>
      <button onClick={() => dispatch({ type: "TOGGLE_SIDEBAR" })} className="md:hidden w-8 h-8 rounded text-[20px]" style={{ color: C.text2 }}>≡</button>
      <div className="flex-1" />
      <button onClick={() => dispatch({ type: "ADVANCE_TIME", days: 1 })} className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] border" style={{ borderColor: C.border, color: C.text2 }}>⏩ Simulate +1 Day {state.timeOffset > 0 && `(+${state.timeOffset / DAY}d)`}</button>
      {state.timeOffset > 0 && <button onClick={() => dispatch({ type: "RESET_TIME" })} className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] border" style={{ borderColor: C.border, color: C.text2 }}>↺ Reset</button>}
      <Btn onClick={() => dispatch({ type: "OPEN_STORE_MODAL" })}>+ Add Store</Btn>

      <div ref={ddRef} className="relative">
        <button onClick={() => dispatch({ type: "TOGGLE_STORE_DD" })} className="px-3 py-2 rounded-lg text-[13px] border flex items-center gap-2" style={{ borderColor: C.border, color: C.text }}>
          {activeStore ? activeStore.name : "All Stores"} ▾
        </button>
        {state.storeDropdownOpen && (
          <div className="absolute right-0 top-full mt-1 w-[280px] bg-white border rounded-xl shadow-lg z-50 max-h-[400px] overflow-auto" style={{ borderColor: C.border }}>
            <button onClick={() => dispatch({ type: "SET_STORE_FILTER", storeId: "all" })} className="w-full text-left px-3 py-2 text-[13px] hover:bg-slate-50" style={{ color: C.text }}>All Stores</button>
            {state.stores.map((s) => (
              <div key={s.id} className="flex items-center border-t" style={{ borderColor: C.border }}>
                <button onClick={() => dispatch({ type: "SET_STORE_FILTER", storeId: s.id })} className="flex-1 text-left px-3 py-2 text-[13px] hover:bg-slate-50" style={{ color: C.text }}>{s.name}</button>
                <button onClick={() => dispatch({ type: "OPEN_STORE_PROFILE", storeId: s.id })} className="px-2 text-[11px]" style={{ color: C.accent }} title="View profile">→</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div ref={bellRef} className="relative">
        <button onClick={() => dispatch({ type: "TOGGLE_BELL" })} className="relative w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-[16px]" style={{ color: C.text2 }}>
          🔔
          {newCount > 0 && <span className="absolute top-0 right-0 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center" style={{ background: C.red, color: "#fff" }}>{newCount}</span>}
        </button>
        {state.bellOpen && (
          <div className="absolute right-0 top-full mt-1 w-[320px] max-h-[400px] overflow-auto bg-white border rounded-xl shadow-lg z-50" style={{ borderColor: C.border }}>
            <div className="px-3 py-2 border-b flex items-center justify-between" style={{ borderColor: C.border }}>
              <span className="text-[12px] font-bold uppercase" style={{ color: C.muted }}>Notifications</span>
              <button onClick={() => dispatch({ type: "MARK_NOTIFS_READ" })} className="text-[12px]" style={{ color: C.accent }}>Mark all as read</button>
            </div>
            {notifs.length === 0 && <div className="p-4 text-center text-[13px]" style={{ color: C.muted }}>No notifications</div>}
            {notifs.map((nf) => {
              const color = nf.kind === "expiry" ? C.red : nf.kind === "overdue" ? C.amber : C.accent;
              return (
                <button key={nf.id} onClick={() => {
                  if (nf.batchId) dispatch({ type: "OPEN_DRAWER", batchId: nf.batchId });
                  else if (nf.taskId) { dispatch({ type: "NAVIGATE", page: "actions" }); dispatch({ type: "HIGHLIGHT_TASK", id: nf.taskId }); }
                  dispatch({ type: "TOGGLE_BELL", open: false });
                }} className="w-full text-left px-3 py-2 border-b text-[13px] hover:bg-slate-50" style={{ borderColor: C.border, borderLeft: `3px solid ${color}`, color: C.text }}>
                  {nf.text}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold" style={{ background: C.primary, color: "#fff" }}>AV</div>
    </header>
  );
}

function Breadcrumb({ state, dispatch }: PageProps) {
  const pageLabel = NAV.find((n) => n.key === state.activePage)?.label || "Overview";
  const activeStore = state.stores.find((s) => s.id === state.activeStoreFilter);
  const profile = state.stores.find((s) => s.id === state.storeProfileId);
  const drawerBatch = state.batches.find((b) => b.id === state.drawerBatchId);
  const prevLabel = NAV.find((n) => n.key === state.previousPage)?.label;

  return (
    <div className="bg-white border-b h-9 px-4 md:px-6 flex items-center gap-1 text-[13px] no-print" style={{ borderColor: C.border, color: C.muted }}>
      <span>Freshness Passport</span>
      <span>›</span>
      {profile ? (
        <>
          <button onClick={() => dispatch({ type: "BACK_FROM_PROFILE" })} style={{ color: C.accent }}>{prevLabel}</button>
          <span>›</span>
          <span style={{ color: C.text }}>Store Profile: {profile.name}</span>
        </>
      ) : (
        <>
          <span style={{ color: C.text }}>{pageLabel}</span>
          {activeStore && (
            <>
              <span>›</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: C.light, color: C.accent }}>
                Filtered: {activeStore.name}
                <button onClick={() => dispatch({ type: "SET_STORE_FILTER", storeId: "all" })} className="ml-1">×</button>
              </span>
            </>
          )}
        </>
      )}
      {drawerBatch && (<><span>›</span><span style={{ color: C.text }}>Passport: {drawerBatch.id}</span></>)}
    </div>
  );
}

function Toasts({ state, dispatch }: PageProps) {
  useEffect(() => {
    const timers = state.toasts.map((t) => setTimeout(() => dispatch({ type: "DISMISS_TOAST", id: t.id }), 3500));
    return () => timers.forEach(clearTimeout);
  }, [state.toasts, dispatch]);
  return (
    <div className="fixed top-4 right-4 z-[10001] space-y-2 no-print" style={{ width: 320 }}>
      {state.toasts.map((t) => {
        const color = t.kind === "success" ? C.green : t.kind === "error" ? C.red : C.accent;
        return (
          <div key={t.id} className="bg-white rounded-lg shadow-lg p-3 text-[13px] flex items-center justify-between" style={{ borderLeft: `4px solid ${color}`, color: C.text }}>
            <span>{t.text}</span>
            <button onClick={() => dispatch({ type: "DISMISS_TOAST", id: t.id })} className="ml-2 text-[14px]" style={{ color: C.muted }}>×</button>
          </div>
        );
      })}
    </div>
  );
}

function ActivityLogModal({ state, dispatch }: PageProps) {
  return (
    <Modal title="Activity Log" onClose={() => dispatch({ type: "CLOSE_ACTIVITY_LOG" })}>
      <div className="space-y-2 max-h-[60vh] overflow-auto">
        {state.activity.map((a) => {
          const meta = ACT_ICON[a.type];
          const store = state.stores.find((s) => s.id === a.storeId);
          return (
            <div key={a.id} className="flex items-center gap-3 p-2 rounded-lg" style={{ background: C.bg }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[12px]" style={{ background: `${meta.color}1A`, color: meta.color }}>{meta.icon}</div>
              <div className="flex-1 text-[13px]" style={{ color: C.text }}>{a.text}</div>
              {store && <Pill bg={C.badgeBlueBg} color={C.badgeBlueText}>{store.name.replace("Store #", "#")}</Pill>}
              <span className="text-[11px]" style={{ color: C.muted }}>{timeAgo(a.ts)}</span>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}

/* ============================================================
   ROOT
   ============================================================ */
export default function FreshnessPassport() {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Flash clear
  useEffect(() => {
    if (state.newPassportFlashId) {
      const t = setTimeout(() => dispatch({ type: "CLEAR_FLASH" }), 3000);
      return () => clearTimeout(t);
    }
  }, [state.newPassportFlashId]);

  // Highlight clear
  useEffect(() => {
    if (state.taskHighlightId) {
      const t = setTimeout(() => dispatch({ type: "HIGHLIGHT_TASK", id: null }), 3000);
      return () => clearTimeout(t);
    }
  }, [state.taskHighlightId]);

  // Centralised ESC handler (G10)
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (state.passportModalOpen) dispatch({ type: "CLOSE_MODALS" });
      else if (state.storeModalOpen) dispatch({ type: "CLOSE_MODALS" });
      else if (state.activityLogOpen) dispatch({ type: "CLOSE_ACTIVITY_LOG" });
      else if (state.drawerBatchId) dispatch({ type: "CLOSE_DRAWER" });
      else if (state.bellOpen) dispatch({ type: "TOGGLE_BELL", open: false });
      else if (state.storeDropdownOpen) dispatch({ type: "TOGGLE_STORE_DD", open: false });
      else if (state.isSidebarOpen) dispatch({ type: "TOGGLE_SIDEBAR", open: false });
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [state.passportModalOpen, state.storeModalOpen, state.activityLogOpen, state.drawerBatchId, state.bellOpen, state.storeDropdownOpen, state.isSidebarOpen]);

  const renderPage = () => {
    if (state.storeProfileId) return <StoreProfilePage state={state} dispatch={dispatch} />;
    switch (state.activePage) {
      case "overview": return <Overview state={state} dispatch={dispatch} />;
      case "passports": return <PassportsPage state={state} dispatch={dispatch} />;
      case "rsl": return <RSLPage state={state} dispatch={dispatch} />;
      case "analytics": return <WastePage state={state} dispatch={dispatch} />;
      case "actions": return <ActionsPage state={state} dispatch={dispatch} />;
      case "impact": return <ImpactPage state={state} dispatch={dispatch} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: C.bg, fontFamily: FONT, color: C.text }}>
      <style>{`
        @keyframes fp-pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes fp-flash {
          0%   { border-left: 3px solid #2563EB; background: #EFF6FF; }
          80%  { border-left: 3px solid #2563EB; background: #EFF6FF; }
          100% { border-left: 3px solid transparent; background: transparent; }
        }
        .fp-flash-row { animation: fp-flash 3s ease forwards; }
        @keyframes fp-field-fill {
          0%   { background: #EFF6FF; }
          100% { background: #ffffff; }
        }
        .fp-field-fill { animation: fp-field-fill 0.8s ease forwards; }
        @media print {
          body { background: white; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          * { box-shadow: none !important; }
        }
      `}</style>

      <Sidebar state={state} dispatch={dispatch} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header state={state} dispatch={dispatch} />
        <Breadcrumb state={state} dispatch={dispatch} />
        <main className="flex-1 p-4 md:p-8 max-w-[1400px] w-full mx-auto">
          {renderPage()}
        </main>
      </div>

      {/* Overlays */}
      <Drawer state={state} dispatch={dispatch} />
      {state.storeModalOpen && <StoreModal state={state} dispatch={dispatch} />}
      {state.passportModalOpen && <PassportModal state={state} dispatch={dispatch} />}
      {state.activityLogOpen && <ActivityLogModal state={state} dispatch={dispatch} />}
      <Toasts state={state} dispatch={dispatch} />
    </div>
  );
}
