import { i as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { _ as Legend, a as LineChart, c as Area, d as ReferenceLine, f as Bar, g as Tooltip, h as ResponsiveContainer, i as BarChart, l as Line, m as Cell, n as AreaChart, o as YAxis, p as Pie, r as PieChart, s as XAxis, t as ComposedChart, u as CartesianGrid } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BWJxy351.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var SessionContext = (0, import_react.createContext)({
	session: null,
	signOut: () => {}
});
var SessionProvider = SessionContext.Provider;
function useSession() {
	return (0, import_react.useContext)(SessionContext);
}
var C = {
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
	badgeBlueText: "#1E40AF"
};
var FONT = `'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif`;
var DAY = 864e5;
var MONTHS = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec"
];
var formatGBP = (n) => "£" + Math.round(n).toLocaleString("en-GB");
var formatPct = (n) => `${n.toFixed(1)}%`;
var formatDate = (d) => {
	const dt = typeof d === "number" ? new Date(d) : d;
	return `${String(dt.getDate()).padStart(2, "0")} ${MONTHS[dt.getMonth()]} ${dt.getFullYear()}`;
};
var timeAgo = (ts, now = Date.now()) => {
	const d = now - ts;
	if (d < 6e4) return "Just now";
	if (d < 36e5) return `${Math.floor(d / 6e4)}m ago`;
	if (d < 864e5) return `${Math.floor(d / 36e5)}h ago`;
	if (d < 7 * 864e5) return `${Math.floor(d / 864e5)}d ago`;
	return formatDate(ts);
};
var daysAgo = (n) => Date.now() - n * DAY;
var computeRSL = (b, nowMs) => {
	const daysSinceProduction = Math.floor((nowMs - b.productionDate) / DAY);
	const tempPenalty = b.tempExcursion ? b.tempPenaltyDays : 0;
	const dwellPenalty = Math.max(0, b.dwellDays - 2);
	const rslDays = Math.max(0, b.baseShelfLife - daysSinceProduction - tempPenalty - dwellPenalty);
	return {
		rslDays,
		score: Math.max(0, Math.min(100, Math.round(rslDays / b.baseShelfLife * 100))),
		daysSinceProduction,
		tempPenalty,
		dwellPenalty
	};
};
var freshnessColor = (s) => s >= 75 ? C.green : s >= 45 ? C.amber : C.red;
var statusFromScore = (s) => s >= 75 ? "Fresh" : s >= 45 ? "At Risk" : "Critical";
var rslToAction = (d) => d < 1 ? "Trigger 50% markdown immediately" : d <= 2 ? "Move to front shelf + trigger markdown" : d <= 3 ? "FEFO rotation recommended" : d <= 5 ? "Monitor — check allocation" : "No action needed";
var rslActionType = (d) => d < 1 ? "Markdown" : d <= 2 ? "Markdown" : d <= 3 ? "FEFO Rotation" : d <= 5 ? "Allocation Adjust" : "Monitor";
var SEED_STORES = [
	{
		id: "DC",
		code: "DC-001",
		name: "Main Distribution Centre",
		city: "Birmingham",
		region: "Midlands",
		address: "Unit 14, Logistics Park",
		country: "UK",
		postcode: "B7 4AA",
		manager: "Helena Park",
		email: "helena@freshpass.co",
		phone: "+44 121 555 0144",
		activeSince: (/* @__PURE__ */ new Date("2024-02-10")).getTime(),
		tier: "Enterprise",
		type: "Distribution Centre",
		categories: [
			"Produce",
			"Dairy",
			"Bakery",
			"Meat & Fish",
			"Ready Meals"
		],
		rslThreshold: 3
	},
	{
		id: "S1",
		code: "STR-001",
		name: "Store #1 Bristol",
		city: "Bristol",
		region: "South West",
		address: "22 Park Street",
		country: "UK",
		postcode: "BS1 5JA",
		manager: "Tom Whitfield",
		email: "tom@freshpass.co",
		phone: "+44 117 555 0211",
		activeSince: (/* @__PURE__ */ new Date("2024-04-01")).getTime(),
		tier: "Standard",
		type: "Supermarket",
		categories: [
			"Produce",
			"Dairy",
			"Bakery"
		],
		rslThreshold: 3
	},
	{
		id: "S2",
		code: "STR-002",
		name: "Store #2 Cardiff",
		city: "Cardiff",
		region: "Wales",
		address: "5 Queen Street",
		country: "UK",
		postcode: "CF10 2BU",
		manager: "Megan Howells",
		email: "megan@freshpass.co",
		phone: "+44 29 555 0322",
		activeSince: (/* @__PURE__ */ new Date("2024-05-15")).getTime(),
		tier: "Standard",
		type: "Supermarket",
		categories: ["Produce", "Dairy"],
		rslThreshold: 3
	},
	{
		id: "S3",
		code: "STR-003",
		name: "Store #3 Leeds",
		city: "Leeds",
		region: "Yorkshire",
		address: "88 Briggate",
		country: "UK",
		postcode: "LS1 6LY",
		manager: "Daniel Okoye",
		email: "daniel@freshpass.co",
		phone: "+44 113 555 0433",
		activeSince: (/* @__PURE__ */ new Date("2024-07-09")).getTime(),
		tier: "Pilot",
		type: "Supermarket",
		categories: ["Dairy", "Meat & Fish"],
		rslThreshold: 3
	},
	{
		id: "S4",
		code: "STR-004",
		name: "Store #4 Manchester",
		city: "Manchester",
		region: "North West",
		address: "12 Market Street",
		country: "UK",
		postcode: "M1 1WT",
		manager: "Priya Shah",
		email: "priya@freshpass.co",
		phone: "+44 161 555 0544",
		activeSince: (/* @__PURE__ */ new Date("2024-09-22")).getTime(),
		tier: "Enterprise",
		type: "Flagship",
		categories: [
			"Produce",
			"Bakery",
			"Ready Meals"
		],
		rslThreshold: 3
	},
	{
		id: "S5",
		code: "STR-005",
		name: "Store #5 Edinburgh",
		city: "Edinburgh",
		region: "Scotland",
		address: "44 Princes Street",
		country: "UK",
		postcode: "EH2 2BY",
		manager: "Callum Reid",
		email: "callum@freshpass.co",
		phone: "+44 131 555 0655",
		activeSince: (/* @__PURE__ */ new Date("2025-01-12")).getTime(),
		tier: "Standard",
		type: "Convenience",
		categories: ["Bakery", "Produce"],
		rslThreshold: 3
	}
];
var tempHist = (avg, spikes = []) => Array.from({ length: 6 }, (_, i) => ({
	day: [
		"Mon",
		"Tue",
		"Wed",
		"Thu",
		"Fri",
		"Sat"
	][i],
	temp: +(avg + (spikes[i] ?? Math.sin(i) * .6)).toFixed(1)
}));
var SEED_BATCHES = [
	{
		id: "#A14",
		product: "Strawberries",
		sku: "PRD-2241",
		category: "Produce",
		storeId: "S2",
		productionDate: daysAgo(2),
		printedExpiry: daysAgo(-6),
		units: 120,
		unitSize: "400g",
		supplier: "Berry Farms Ltd",
		origin: "UK",
		baseShelfLife: 8,
		dwellDays: 2,
		tempExcursion: false,
		tempPenaltyDays: 0,
		maxTemp: 8,
		storageTemp: 5,
		tempHistory: tempHist(5),
		priority: "medium"
	},
	{
		id: "#B07",
		product: "Salad Mix",
		sku: "PRD-1184",
		category: "Produce",
		storeId: "S4",
		productionDate: daysAgo(4),
		printedExpiry: daysAgo(-2),
		units: 80,
		unitSize: "200g",
		supplier: "GreenLeaf Co",
		origin: "Spain",
		baseShelfLife: 7,
		dwellDays: 4,
		tempExcursion: true,
		tempPenaltyDays: 2,
		maxTemp: 8,
		storageTemp: 5,
		tempHistory: tempHist(7, [
			0,
			1,
			3,
			4,
			2,
			1
		]),
		priority: "urgent"
	},
	{
		id: "#C22",
		product: "Whole Milk",
		sku: "DRY-0451",
		category: "Dairy",
		storeId: "DC",
		productionDate: daysAgo(1),
		printedExpiry: daysAgo(-9),
		units: 240,
		unitSize: "1L",
		supplier: "Dairyworks UK",
		origin: "UK",
		baseShelfLife: 10,
		dwellDays: 1,
		tempExcursion: false,
		tempPenaltyDays: 0,
		maxTemp: 5,
		storageTemp: 3,
		tempHistory: tempHist(3),
		priority: "low"
	},
	{
		id: "#D09",
		product: "Greek Yogurt",
		sku: "DRY-0732",
		category: "Dairy",
		storeId: "S3",
		productionDate: daysAgo(5),
		printedExpiry: daysAgo(-5),
		units: 60,
		unitSize: "500g",
		supplier: "Olympus Dairy",
		origin: "UK",
		baseShelfLife: 12,
		dwellDays: 5,
		tempExcursion: false,
		tempPenaltyDays: 0,
		maxTemp: 5,
		storageTemp: 4,
		tempHistory: tempHist(4),
		priority: "medium"
	},
	{
		id: "#E31",
		product: "Ready Meals — Lasagne",
		sku: "RMM-0998",
		category: "Ready Meals",
		storeId: "S1",
		productionDate: daysAgo(3),
		printedExpiry: daysAgo(-4),
		units: 140,
		unitSize: "400g",
		supplier: "MealCraft",
		origin: "UK",
		baseShelfLife: 9,
		dwellDays: 3,
		tempExcursion: false,
		tempPenaltyDays: 0,
		maxTemp: 5,
		storageTemp: 4,
		tempHistory: tempHist(4),
		priority: "medium"
	},
	{
		id: "#F18",
		product: "Sliced Bread",
		sku: "BAK-0322",
		category: "Bakery",
		storeId: "S5",
		productionDate: daysAgo(6),
		printedExpiry: daysAgo(-1),
		units: 90,
		unitSize: "800g",
		supplier: "Hearth Bakery",
		origin: "UK",
		baseShelfLife: 7,
		dwellDays: 6,
		tempExcursion: false,
		tempPenaltyDays: 0,
		maxTemp: 22,
		storageTemp: 18,
		tempHistory: tempHist(18),
		priority: "high"
	},
	{
		id: "#G04",
		product: "Free-Range Eggs",
		sku: "DRY-0145",
		category: "Dairy",
		storeId: "S2",
		productionDate: daysAgo(2),
		printedExpiry: daysAgo(-12),
		units: 200,
		unitSize: "x12",
		supplier: "Hen Acres",
		origin: "UK",
		baseShelfLife: 18,
		dwellDays: 2,
		tempExcursion: false,
		tempPenaltyDays: 0,
		maxTemp: 8,
		storageTemp: 6,
		tempHistory: tempHist(6),
		priority: "low"
	},
	{
		id: "#H27",
		product: "Blueberries",
		sku: "PRD-2298",
		category: "Produce",
		storeId: "S4",
		productionDate: daysAgo(3),
		printedExpiry: daysAgo(-4),
		units: 110,
		unitSize: "150g",
		supplier: "Berry Farms Ltd",
		origin: "UK",
		baseShelfLife: 9,
		dwellDays: 3,
		tempExcursion: false,
		tempPenaltyDays: 0,
		maxTemp: 8,
		storageTemp: 6,
		tempHistory: tempHist(6),
		priority: "medium"
	},
	{
		id: "#I12",
		product: "Croissants",
		sku: "BAK-0501",
		category: "Bakery",
		storeId: "S1",
		productionDate: daysAgo(2),
		printedExpiry: daysAgo(-3),
		units: 70,
		unitSize: "x6",
		supplier: "Hearth Bakery",
		origin: "UK",
		baseShelfLife: 5,
		dwellDays: 2,
		tempExcursion: false,
		tempPenaltyDays: 0,
		maxTemp: 22,
		storageTemp: 20,
		tempHistory: tempHist(20),
		priority: "high"
	},
	{
		id: "#J33",
		product: "Chicken Fillets",
		sku: "MTF-0118",
		category: "Meat & Fish",
		storeId: "S3",
		productionDate: daysAgo(2),
		printedExpiry: daysAgo(-3),
		units: 55,
		unitSize: "500g",
		supplier: "Cluck & Co",
		origin: "UK",
		baseShelfLife: 6,
		dwellDays: 4,
		tempExcursion: true,
		tempPenaltyDays: 1,
		maxTemp: 4,
		storageTemp: 3,
		tempHistory: tempHist(3, [
			0,
			0,
			1.5,
			2.4,
			.5,
			0
		]),
		priority: "urgent"
	}
];
var SEED_TASKS = [
	{
		id: "T1",
		status: "todo",
		priority: "URGENT",
		type: "Markdown",
		product: "Salad Mix",
		batchId: "#B07",
		storeId: "S4",
		instruction: "Trigger 50% markdown — 1 day RSL remaining.",
		rslDays: 1,
		assignee: "PS",
		assignedAt: Date.now() - 36e5
	},
	{
		id: "T2",
		status: "todo",
		priority: "HIGH",
		type: "FEFO Rotation",
		product: "Strawberries",
		batchId: "#A14",
		storeId: "S2",
		instruction: "Move Batch A14 to front shelf before newer Batch A19.",
		rslDays: 3,
		assignee: "MH",
		assignedAt: daysAgo(1)
	},
	{
		id: "T3",
		status: "todo",
		priority: "HIGH",
		type: "Allocation Adjust",
		product: "Greek Yogurt",
		batchId: "#D09",
		storeId: "S3",
		instruction: "Reduce next dispatch by 18 units.",
		rslDays: 4,
		assignee: "DO",
		assignedAt: daysAgo(3)
	},
	{
		id: "T5",
		status: "inprogress",
		priority: "HIGH",
		type: "Markdown",
		product: "Sliced Bread",
		batchId: "#F18",
		storeId: "S5",
		instruction: "Apply 30% markdown on 22 units.",
		rslDays: 1,
		assignee: "CR",
		assignedAt: daysAgo(1)
	},
	{
		id: "T6",
		status: "inprogress",
		priority: "MEDIUM",
		type: "FEFO Rotation",
		product: "Whole Milk",
		batchId: "#C22",
		storeId: "DC",
		instruction: "Pick older pallet first on next dispatch.",
		rslDays: 5,
		assignee: "HP",
		assignedAt: Date.now() - 72e5
	},
	{
		id: "T8",
		status: "done",
		priority: "URGENT",
		type: "Cold Chain Alert",
		product: "Chicken Fillets",
		batchId: "#J33",
		storeId: "S3",
		instruction: "Quarantine batch — verify temperature.",
		rslDays: 1,
		assignee: "DO",
		assignedAt: daysAgo(1),
		completedAt: Date.now() - 72e5
	},
	{
		id: "T9",
		status: "done",
		priority: "MEDIUM",
		type: "Markdown",
		product: "Blueberries",
		batchId: "#H27",
		storeId: "S4",
		instruction: "20% markdown — slow rotation aisle 3.",
		rslDays: 3,
		assignee: "PS",
		assignedAt: daysAgo(2),
		completedAt: daysAgo(1)
	},
	{
		id: "T10",
		status: "done",
		priority: "HIGH",
		type: "FEFO Rotation",
		product: "Free-Range Eggs",
		batchId: "#G04",
		storeId: "S2",
		instruction: "Rotate stock — older trays to front.",
		rslDays: 8,
		assignee: "MH",
		assignedAt: daysAgo(3),
		completedAt: daysAgo(2)
	}
];
var SEED_ACTIVITY = [
	{
		id: "a1",
		ts: Date.now() - 9e5,
		type: "markdown_triggered",
		text: "Markdown triggered — Yogurt (8 units) — Store #4",
		storeId: "S4"
	},
	{
		id: "a2",
		ts: Date.now() - 27e5,
		type: "temp_excursion",
		text: "Temperature excursion — Cold Chain #3 — +2.4°C above threshold",
		storeId: "DC"
	},
	{
		id: "a3",
		ts: Date.now() - 54e5,
		type: "rsl_alert",
		text: "FEFO alert — Salad Mix #B07 — 1 day remaining",
		storeId: "S4",
		batchId: "#B07"
	},
	{
		id: "a4",
		ts: daysAgo(1),
		type: "passport_created",
		text: "New passport created — Ready Meals — 140 units",
		storeId: "S1",
		batchId: "#E31"
	},
	{
		id: "a5",
		ts: daysAgo(2),
		type: "waste_logged",
		text: "Waste event — Sliced Bread — Store #1 — £42 lost",
		storeId: "S1"
	}
];
var WASTE_INCIDENTS = [
	{
		date: daysAgo(0),
		product: "Salad Mix",
		batch: "#B07",
		storeId: "S4",
		driver: "Temperature Excursion",
		units: 24,
		cost: 96,
		preventable: true
	},
	{
		date: daysAgo(1),
		product: "Sliced Bread",
		batch: "#F18",
		storeId: "S1",
		driver: "Forecast Bias",
		units: 30,
		cost: 42,
		preventable: true
	},
	{
		date: daysAgo(1),
		product: "Croissants",
		batch: "#I12",
		storeId: "S1",
		driver: "Markdown Delay",
		units: 18,
		cost: 36,
		preventable: true
	},
	{
		date: daysAgo(2),
		product: "Greek Yogurt",
		batch: "#D09",
		storeId: "S3",
		driver: "Store Rotation",
		units: 14,
		cost: 56,
		preventable: true
	},
	{
		date: daysAgo(2),
		product: "Strawberries",
		batch: "#A14",
		storeId: "S2",
		driver: "Late Delivery",
		units: 22,
		cost: 88,
		preventable: true
	},
	{
		date: daysAgo(3),
		product: "Blueberries",
		batch: "#H27",
		storeId: "S4",
		driver: "Forecast Bias",
		units: 26,
		cost: 104,
		preventable: true
	},
	{
		date: daysAgo(3),
		product: "Whole Milk",
		batch: "#C22",
		storeId: "DC",
		driver: "Cold Chain",
		units: 40,
		cost: 80,
		preventable: false
	},
	{
		date: daysAgo(4),
		product: "Ready Meals",
		batch: "#E31",
		storeId: "S1",
		driver: "Markdown Delay",
		units: 9,
		cost: 54,
		preventable: true
	},
	{
		date: daysAgo(4),
		product: "Chicken Fillets",
		batch: "#J33",
		storeId: "S3",
		driver: "Temperature Excursion",
		units: 12,
		cost: 96,
		preventable: true
	},
	{
		date: daysAgo(5),
		product: "Salad Mix",
		batch: "#B07",
		storeId: "S4",
		driver: "Late Delivery",
		units: 18,
		cost: 72,
		preventable: false
	}
];
var MONTHLY_IMPACT_12M = Array.from({ length: 12 }, (_, i) => ({
	month: MONTHS[i],
	waste: 1400 - i * 60 + Math.round(Math.sin(i) * 90),
	trend: 1400 - i * 70
}));
var INTERVENTION_STACK_6M = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun"
].map((m, i) => ({
	month: m,
	fefo: 800 + i * 80,
	markdown: 600 + i * 60,
	allocation: 400 + i * 50,
	coldchain: 250 + i * 30
}));
var TIPS = {
	overview: "The Overview Dashboard pulls together freshness, waste, and operational KPIs across your whole network.",
	passports: "A Freshness Digital Passport is assigned to every product batch — recording movement, temperature exposure, handling and dwell time.",
	rsl: "Remaining Shelf Life estimation analyses each batch's time-temperature history combined with handling events to calculate a freshness score from 0–100.",
	waste: "The Waste Root-Cause Analytics engine traces each waste instance back to its operational driver and ranks drivers by impact.",
	action: "The Operational Action Engine converts freshness intelligence into specific, executable tasks for your store and DC teams.",
	impact: "The Impact & Sustainability Report quantifies the real-world results of the platform's interventions in cost, waste and CO₂.",
	storeProfile: "A Store Profile centralises all operational, contact, and preference data for each location. This information feeds directly into freshness analytics, action routing, and sustainability reporting — ensuring every insight and task is mapped to the right store and team."
};
var initialState = {
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
	notificationsReadAt: 0
};
var _id = 1e3;
var uid = () => `x${++_id}`;
var reducer = (s, a) => {
	switch (a.type) {
		case "NAVIGATE": return {
			...s,
			activePage: a.page,
			isSidebarOpen: false
		};
		case "SET_STORE_FILTER": return {
			...s,
			activeStoreFilter: a.storeId,
			storeDropdownOpen: false
		};
		case "OPEN_STORE_PROFILE": return {
			...s,
			previousPage: s.activePage,
			storeProfileId: a.storeId,
			storeDropdownOpen: false
		};
		case "BACK_FROM_PROFILE": return {
			...s,
			storeProfileId: null,
			activePage: s.previousPage
		};
		case "OPEN_DRAWER": return {
			...s,
			drawerBatchId: a.batchId
		};
		case "CLOSE_DRAWER": return {
			...s,
			drawerBatchId: null
		};
		case "OPEN_STORE_MODAL": return {
			...s,
			storeModalOpen: true
		};
		case "OPEN_PASSPORT_MODAL": return {
			...s,
			passportModalOpen: { prefilledStoreId: a.prefilledStoreId }
		};
		case "CLOSE_MODALS": return {
			...s,
			storeModalOpen: false,
			passportModalOpen: false
		};
		case "OPEN_ACTIVITY_LOG": return {
			...s,
			activityLogOpen: true
		};
		case "CLOSE_ACTIVITY_LOG": return {
			...s,
			activityLogOpen: false
		};
		case "ADD_STORE": {
			const act = {
				id: uid(),
				ts: Date.now(),
				type: "store_created",
				text: `New store created — ${a.store.name}`,
				storeId: a.store.id
			};
			return {
				...s,
				stores: [...s.stores, a.store],
				activity: [act, ...s.activity],
				storeModalOpen: false,
				previousPage: s.activePage,
				storeProfileId: a.store.id,
				toasts: [{
					id: uid(),
					kind: "success",
					text: `Store "${a.store.name}" created`
				}, ...s.toasts]
			};
		}
		case "ADD_BATCH": {
			const nowMs = Date.now() + s.timeOffset;
			const r = computeRSL(a.batch, nowMs);
			const acts = [{
				id: uid(),
				ts: Date.now(),
				type: "passport_created",
				text: `New passport — ${a.batch.product} (${a.batch.units} units)`,
				storeId: a.batch.storeId,
				batchId: a.batch.id
			}];
			if (a.batch.tempExcursion) acts.unshift({
				id: uid(),
				ts: Date.now(),
				type: "temp_excursion",
				text: `Temperature excursion on new batch — ${a.batch.product}`,
				storeId: a.batch.storeId,
				batchId: a.batch.id
			});
			const newTasks = [];
			if (a.batch.priority === "urgent" || r.rslDays < 3) newTasks.push({
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
				assignedAt: Date.now()
			});
			return {
				...s,
				batches: [a.batch, ...s.batches],
				tasks: [...newTasks, ...s.tasks],
				activity: [...acts, ...s.activity],
				passportModalOpen: false,
				newPassportFlashId: a.batch.id,
				toasts: [{
					id: uid(),
					kind: "success",
					text: `Passport ${a.batch.id} created`
				}, ...s.toasts]
			};
		}
		case "ADD_TASK": {
			const act = {
				id: uid(),
				ts: Date.now(),
				type: "rsl_alert",
				text: `Action created — ${a.task.product} — ${a.task.type}`,
				storeId: a.task.storeId,
				batchId: a.task.batchId,
				taskId: a.task.id
			};
			const toasts = a.task.rslDays < 2 ? [{
				id: uid(),
				kind: "error",
				text: `${a.task.product} ${a.task.batchId} — urgent task created`
			}, ...s.toasts] : s.toasts;
			return {
				...s,
				tasks: [a.task, ...s.tasks],
				activity: [act, ...s.activity],
				toasts
			};
		}
		case "UPDATE_TASK": {
			const task = s.tasks.find((t) => t.id === a.id);
			if (!task) return s;
			const updated = {
				...task,
				status: a.status,
				completedAt: a.status === "done" ? Date.now() : task.completedAt
			};
			const tasks = s.tasks.map((t) => t.id === a.id ? updated : t);
			if (a.status === "done") {
				const act = {
					id: uid(),
					ts: Date.now(),
					type: "task_completed",
					text: `Task completed — ${task.type} — ${task.product}`,
					storeId: task.storeId,
					batchId: task.batchId,
					taskId: task.id
				};
				return {
					...s,
					tasks,
					activity: [act, ...s.activity]
				};
			}
			return {
				...s,
				tasks
			};
		}
		case "ADD_ACTIVITY": return {
			...s,
			activity: [a.activity, ...s.activity]
		};
		case "PUSH_TOAST": return {
			...s,
			toasts: [a.toast, ...s.toasts]
		};
		case "DISMISS_TOAST": return {
			...s,
			toasts: s.toasts.filter((t) => t.id !== a.id)
		};
		case "TOGGLE_SIDEBAR": return {
			...s,
			isSidebarOpen: a.open ?? !s.isSidebarOpen
		};
		case "TOGGLE_BELL": return {
			...s,
			bellOpen: a.open ?? !s.bellOpen,
			storeDropdownOpen: false
		};
		case "TOGGLE_STORE_DD": return {
			...s,
			storeDropdownOpen: a.open ?? !s.storeDropdownOpen,
			bellOpen: false
		};
		case "TOGGLE_TIP": {
			const has = s.tooltipsOpen.includes(a.key);
			return {
				...s,
				tooltipsOpen: has ? s.tooltipsOpen.filter((k) => k !== a.key) : [...s.tooltipsOpen, a.key]
			};
		}
		case "CLEAR_FLASH": return {
			...s,
			newPassportFlashId: null
		};
		case "HIGHLIGHT_TASK": return {
			...s,
			taskHighlightId: a.id
		};
		case "ADVANCE_TIME": {
			const newOffset = s.timeOffset + a.days * DAY;
			const nowMs = Date.now() + newOffset;
			const newTasks = [];
			const newActs = [];
			s.batches.forEach((b) => {
				const r = computeRSL(b, nowMs);
				const has = s.tasks.some((t) => t.batchId === b.id && t.status !== "done");
				if (r.rslDays < 3 && r.rslDays > 0 && !has) {
					const t = {
						id: uid(),
						status: "todo",
						priority: r.rslDays < 2 ? "URGENT" : "HIGH",
						type: rslActionType(r.rslDays),
						product: b.product,
						batchId: b.id,
						storeId: b.storeId,
						instruction: rslToAction(r.rslDays),
						rslDays: r.rslDays,
						assignee: b.assignedStaff || "Unassigned",
						assignedAt: Date.now()
					};
					newTasks.push(t);
					newActs.push({
						id: uid(),
						ts: Date.now(),
						type: "rsl_alert",
						text: `RSL alert — ${b.product} at ${r.rslDays}d`,
						storeId: b.storeId,
						batchId: b.id,
						taskId: t.id
					});
				}
				if (r.rslDays === 0) newActs.push({
					id: uid(),
					ts: Date.now(),
					type: "waste_logged",
					text: `Waste logged — ${b.product} ${b.id} expired`,
					storeId: b.storeId,
					batchId: b.id
				});
			});
			return {
				...s,
				timeOffset: newOffset,
				tasks: [...newTasks, ...s.tasks],
				activity: [...newActs, ...s.activity]
			};
		}
		case "RESET_TIME": return {
			...s,
			timeOffset: 0
		};
		case "MARK_NOTIFS_READ": return {
			...s,
			notificationsReadAt: Date.now(),
			bellOpen: false
		};
		default: return s;
	}
};
var nowOf = (s) => Date.now() + s.timeOffset;
var getBatchesForStore = (s, storeId) => storeId === "all" ? s.batches : s.batches.filter((b) => b.storeId === storeId);
var getAtRiskBatches = (s, storeId) => {
	const n = nowOf(s);
	return getBatchesForStore(s, storeId).filter((b) => computeRSL(b, n).rslDays < 3);
};
var getWasteThisWeek = (s, storeId) => {
	const cutoff = nowOf(s) - 7 * DAY;
	return WASTE_INCIDENTS.filter((w) => (storeId === "all" || w.storeId === storeId) && w.date >= cutoff).reduce((sum, w) => sum + w.cost, 0);
};
var getFreshnessScore = (s, storeId) => {
	const n = nowOf(s);
	const bs = getBatchesForStore(s, storeId);
	if (!bs.length) return 0;
	return +(bs.reduce((a, b) => a + computeRSL(b, n).score, 0) / bs.length).toFixed(1);
};
var getTasksForStore = (s, storeId) => storeId === "all" ? s.tasks : s.tasks.filter((t) => t.storeId === storeId);
var getOverdueTaskIds = (s) => {
	const cutoff = Date.now() - 2 * DAY;
	return new Set(s.tasks.filter((t) => t.status !== "done" && t.assignedAt < cutoff).map((t) => t.id));
};
var getNotifications = (s) => {
	const n = nowOf(s);
	const cutoff = Date.now() - 2 * DAY;
	const out = [];
	s.batches.forEach((b) => {
		const r = computeRSL(b, n);
		if (r.rslDays < 2) {
			const store = s.stores.find((x) => x.id === b.storeId);
			out.push({
				id: `n-exp-${b.id}`,
				kind: "expiry",
				text: `${b.product} expiring in ${Math.max(0, r.rslDays * 24)}h — ${store?.name ?? b.storeId}`,
				ts: Date.now(),
				batchId: b.id
			});
		}
		if (b.tempExcursion) {
			const store = s.stores.find((x) => x.id === b.storeId);
			out.push({
				id: `n-tmp-${b.id}`,
				kind: "temp",
				text: `Temp excursion — ${b.product} — ${store?.name ?? b.storeId}`,
				ts: Date.now(),
				batchId: b.id
			});
		}
	});
	s.tasks.forEach((t) => {
		if (t.status !== "done" && t.assignedAt < cutoff) {
			const store = s.stores.find((x) => x.id === t.storeId);
			out.push({
				id: `n-od-${t.id}`,
				kind: "overdue",
				text: `Task overdue — ${t.type} — ${store?.name ?? t.storeId}`,
				ts: Date.now(),
				taskId: t.id
			});
		}
	});
	return out;
};
var Card = ({ children, className = "", style }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: `bg-white border rounded-xl ${className}`,
	style: {
		borderColor: C.border,
		...style
	},
	children
});
var Btn = ({ children, onClick, kind = "secondary", className = "", disabled, title }) => {
	const styles = {
		primary: {
			background: C.primary,
			color: "#fff",
			border: `1px solid ${C.primary}`
		},
		secondary: {
			background: "#fff",
			color: C.text2,
			border: `1px solid ${C.border}`
		},
		ghost: {
			background: "transparent",
			color: C.accent,
			border: "none"
		},
		danger: {
			background: C.red,
			color: "#fff",
			border: `1px solid ${C.red}`
		},
		success: {
			background: C.green,
			color: "#fff",
			border: `1px solid ${C.green}`
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		onClick,
		disabled,
		title,
		className: `px-3 py-2 rounded-lg text-[13px] font-medium transition disabled:opacity-50 ${className}`,
		style: styles[kind],
		children
	});
};
var Pill = ({ children, bg, color, className = "" }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
	className: `inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${className}`,
	style: {
		background: bg,
		color
	},
	children
});
var StatusBadge = ({ score }) => {
	const status = statusFromScore(score);
	const color = freshnessColor(score);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
		bg: `${color}1A`,
		color,
		children: status
	});
};
var SectionHeader = ({ title, tipKey, state, dispatch, action }) => {
	const isOpen = tipKey && state.tooltipsOpen.includes(tipKey);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-[15px] font-semibold",
					style: { color: C.text },
					children: title
				}), tipKey && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => dispatch({
						type: "TOGGLE_TIP",
						key: tipKey
					}),
					className: "w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center",
					style: {
						background: C.light,
						color: C.accent
					},
					title: "What is this?",
					children: "?"
				})]
			}), action]
		}), isOpen && tipKey && TIPS[tipKey] && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-2 p-3 rounded-lg text-[13px]",
			style: {
				background: C.light,
				borderLeft: `3px solid ${C.accent}`,
				color: C.primary
			},
			children: TIPS[tipKey]
		})]
	});
};
var KpiCard = ({ label, value, sub, accent, onClick }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
	className: `p-4 ${onClick ? "cursor-pointer hover:shadow-md transition" : ""}`,
	style: accent ? { borderLeft: `3px solid ${accent}` } : {},
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		onClick,
		className: "w-full text-left",
		disabled: !onClick,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[12px] font-semibold uppercase tracking-wide",
				style: { color: C.muted },
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[28px] font-bold mt-1",
				style: { color: C.text },
				children: value
			}),
			sub && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[12px] mt-1",
				style: { color: C.text2 },
				children: sub
			})
		]
	})
});
var FreshnessGauge = ({ score, size = 180 }) => {
	const r = 70;
	const C2 = 2 * Math.PI * r;
	const offset = C2 * (1 - Math.min(98, Math.max(2, score)) / 100);
	const color = freshnessColor(score);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
				width: size,
				height: size,
				viewBox: "0 0 180 180",
				style: { transform: "rotate(-90deg)" },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "90",
					cy: "90",
					r,
					stroke: C.border,
					strokeWidth: "12",
					fill: "none"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "90",
					cy: "90",
					r,
					stroke: color,
					strokeWidth: "12",
					fill: "none",
					strokeDasharray: C2,
					strokeDashoffset: offset,
					strokeLinecap: "round"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "-mt-[120px] flex flex-col items-center",
				style: { width: size },
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-[28px] font-bold",
					style: { color: C.text },
					children: [Math.round(score), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[14px] font-medium",
						style: { color: C.muted },
						children: "/100"
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-[78px] text-[12px]",
				style: { color: C.muted },
				children: "Freshness Score"
			})
		]
	});
};
var Modal = ({ title, onClose, children, footer, banner }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: "fixed inset-0 z-[10000] flex items-center justify-center p-4 no-print",
	style: { background: "rgba(0,0,0,0.35)" },
	onClick: onClose,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-modal-scroll": "true",
		className: "bg-white rounded-2xl shadow-2xl w-full max-w-[680px] max-h-[90vh] overflow-auto",
		onClick: (e) => e.stopPropagation(),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between p-6 pb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-[13px] font-bold uppercase tracking-wider",
					style: { color: C.primary },
					children: title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: onClose,
					className: "w-8 h-8 rounded-full hover:bg-slate-100 text-[18px]",
					style: { color: C.text2 },
					children: "×"
				})]
			}),
			banner && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-10",
				children: banner
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-10 pb-6",
				children
			}),
			footer && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border-t px-10 py-4 flex items-center justify-between",
				style: { borderColor: C.border },
				children: footer
			})
		]
	})
});
var TabPills = ({ tabs, active, onChange, incomplete }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: "flex gap-2 mb-5",
	children: tabs.map((t) => {
		const isActive = t.key === active;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			onClick: () => onChange(t.key),
			className: "px-4 py-2 rounded-full text-[13px] font-semibold flex items-center gap-2",
			style: {
				background: isActive ? C.primary : "transparent",
				color: isActive ? "#fff" : C.text2,
				border: `1px solid ${isActive ? C.primary : C.border}`
			},
			children: [t.label, incomplete?.has(t.key) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "w-2 h-2 rounded-full",
				style: { background: C.amber }
			})]
		}, t.key);
	})
});
var Field$1 = ({ label, required, error, children, hint }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
	className: "mb-4",
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between mb-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "text-[13px] font-semibold",
				style: { color: C.label },
				children: [label, required && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					style: { color: C.red },
					children: " *"
				})]
			}), hint]
		}),
		children,
		error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[12px] mt-1",
			style: { color: C.red },
			children: error
		})
	]
});
var inputCls$1 = "w-full h-10 px-3 rounded-lg text-[13px] outline-none transition";
var inputStyle = (err) => ({
	border: `1px solid ${err ? C.red : C.border}`,
	color: C.text,
	background: "#fff"
});
function StoreModal({ state, dispatch }) {
	const [tab, setTab] = (0, import_react.useState)("details");
	const [form, setForm] = (0, import_react.useState)({
		name: "",
		code: "",
		type: "Supermarket",
		city: "",
		region: "",
		address: "",
		country: "UK",
		postcode: "",
		manager: "",
		email: "",
		phone: "",
		activeSince: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
		tier: "Standard",
		logoUrl: null,
		checkouts: 8,
		storeSize: 1200,
		coldStorage: 3,
		deliveryFreq: "Daily",
		categories: [],
		erp: "SAP",
		wms: "Manhattan",
		notes: "",
		emailRSL: true,
		dailySummary: true,
		slack: false,
		sms: false,
		rslThreshold: 3,
		defaultView: "overview"
	});
	const [errors, setErrors] = (0, import_react.useState)({});
	const fileRef = (0, import_react.useRef)(null);
	const upd = (k, v) => setForm((f) => ({
		...f,
		[k]: v
	}));
	const onFile = (e) => {
		const f = e.target.files?.[0];
		if (!f) return;
		const r = new FileReader();
		r.onload = () => upd("logoUrl", r.result);
		r.readAsDataURL(f);
	};
	const save = () => {
		const e = {};
		if (!form.name) e.name = "Required";
		if (!form.code) e.code = "Required";
		if (!form.city) e.city = "Required";
		if (!form.manager) e.manager = "Required";
		setErrors(e);
		if (Object.keys(e).length) return;
		dispatch({
			type: "ADD_STORE",
			store: {
				id: `S${state.stores.length + 1}-${Date.now().toString(36).slice(-3)}`,
				code: form.code,
				name: form.name,
				city: form.city,
				region: form.region,
				address: form.address,
				country: form.country,
				postcode: form.postcode,
				manager: form.manager,
				email: form.email,
				phone: form.phone,
				activeSince: new Date(form.activeSince).getTime(),
				tier: form.tier,
				type: form.type,
				logoUrl: form.logoUrl,
				erp: form.erp,
				wms: form.wms,
				deliveryFreq: form.deliveryFreq,
				categories: form.categories,
				coldStorage: form.coldStorage,
				storeSize: form.storeSize,
				checkouts: form.checkouts,
				alertPrefs: {
					emailRSL: form.emailRSL,
					dailySummary: form.dailySummary,
					slack: form.slack,
					sms: form.sms
				},
				rslThreshold: form.rslThreshold,
				defaultView: form.defaultView,
				isNew: true
			}
		});
	};
	const incomplete = (0, import_react.useMemo)(() => {
		const s = /* @__PURE__ */ new Set();
		if (!form.name || !form.code || !form.city || !form.manager) s.add("details");
		return s;
	}, [form]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Modal, {
		title: "Create Store Profile",
		onClose: () => dispatch({ type: "CLOSE_MODALS" }),
		banner: Object.keys(errors).length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-3 p-3 rounded-lg text-[13px]",
			style: {
				background: "#FEE2E2",
				color: C.red
			},
			children: [
				"Please complete ",
				Object.keys(errors).length,
				" required field(s)"
			]
		}) : null,
		footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-[12px]",
			style: { color: C.muted },
			children: "* Required fields"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
				onClick: () => dispatch({ type: "CLOSE_MODALS" }),
				children: "Cancel"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
				kind: "primary",
				onClick: save,
				children: "Save Store"
			})]
		})] }),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabPills, {
				tabs: [
					{
						key: "details",
						label: "Store Details"
					},
					{
						key: "ops",
						label: "Operations"
					},
					{
						key: "prefs",
						label: "Preferences"
					}
				],
				active: tab,
				onChange: setTab,
				incomplete
			}),
			tab === "details" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex-shrink-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative w-[110px] h-[110px] rounded-full flex items-center justify-center overflow-hidden",
						style: {
							background: C.light,
							border: `1px solid ${C.border}`
						},
						children: [
							form.logoUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: form.logoUrl,
								alt: "",
								className: "w-full h-full object-cover"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[40px]",
								children: "🏪"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => fileRef.current?.click(),
								className: "absolute bottom-1 right-1 w-7 h-7 rounded-full bg-white shadow flex items-center justify-center text-[12px]",
								title: "Upload logo",
								children: "✏️"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								ref: fileRef,
								type: "file",
								accept: "image/*",
								className: "hidden",
								onChange: onFile
							})
						]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
								label: "Store Name",
								required: true,
								error: errors.name,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: inputCls$1,
									style: inputStyle(!!errors.name),
									value: form.name,
									onChange: (e) => upd("name", e.target.value)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
								label: "Store ID",
								required: true,
								error: errors.code,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: inputCls$1,
									style: inputStyle(!!errors.code),
									value: form.code,
									onChange: (e) => upd("code", e.target.value),
									placeholder: "STR-006"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
								label: "Type",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									className: inputCls$1,
									style: inputStyle(),
									value: form.type,
									onChange: (e) => upd("type", e.target.value),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Supermarket" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Convenience" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Flagship" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Distribution Centre" })
									]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
								label: "City",
								required: true,
								error: errors.city,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: inputCls$1,
									style: inputStyle(!!errors.city),
									value: form.city,
									onChange: (e) => upd("city", e.target.value)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
								label: "Region",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: inputCls$1,
									style: inputStyle(),
									value: form.region,
									onChange: (e) => upd("region", e.target.value)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
								label: "Postcode",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: inputCls$1,
									style: inputStyle(),
									value: form.postcode,
									onChange: (e) => upd("postcode", e.target.value)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
								label: "Address",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: inputCls$1,
									style: inputStyle(),
									value: form.address,
									onChange: (e) => upd("address", e.target.value)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
								label: "Country",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: inputCls$1,
									style: inputStyle(),
									value: form.country,
									onChange: (e) => upd("country", e.target.value)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
								label: "Manager",
								required: true,
								error: errors.manager,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: inputCls$1,
									style: inputStyle(!!errors.manager),
									value: form.manager,
									onChange: (e) => upd("manager", e.target.value)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
								label: "Manager Email",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: inputCls$1,
									style: inputStyle(),
									value: form.email,
									onChange: (e) => upd("email", e.target.value)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
								label: "Phone",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: inputCls$1,
									style: inputStyle(),
									value: form.phone,
									onChange: (e) => upd("phone", e.target.value)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
								label: "Active Since",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "date",
									className: inputCls$1,
									style: inputStyle(),
									value: form.activeSince,
									onChange: (e) => upd("activeSince", e.target.value)
								})
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
						label: "Subscription Tier",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex gap-2",
							children: [
								"Pilot",
								"Standard",
								"Enterprise"
							].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => upd("tier", t),
								className: "px-4 py-2 rounded-full text-[12px] font-semibold",
								style: {
									background: form.tier === t ? C.primary : "transparent",
									color: form.tier === t ? "#fff" : C.text2,
									border: `1px solid ${form.tier === t ? C.primary : C.border}`
								},
								children: t
							}, t))
						})
					})]
				})]
			}),
			tab === "ops" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
						label: "Checkouts #",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "number",
							className: inputCls$1,
							style: inputStyle(),
							value: form.checkouts,
							onChange: (e) => upd("checkouts", +e.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
						label: "Store Size (m²)",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "number",
							className: inputCls$1,
							style: inputStyle(),
							value: form.storeSize,
							onChange: (e) => upd("storeSize", +e.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
						label: "Cold Storage Units",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "number",
							className: inputCls$1,
							style: inputStyle(),
							value: form.coldStorage,
							onChange: (e) => upd("coldStorage", +e.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
						label: "Delivery Frequency",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							className: inputCls$1,
							style: inputStyle(),
							value: form.deliveryFreq,
							onChange: (e) => upd("deliveryFreq", e.target.value),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Daily" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Twice Weekly" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Weekly" })
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
						label: "ERP",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							className: inputCls$1,
							style: inputStyle(),
							value: form.erp,
							onChange: (e) => upd("erp", e.target.value),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "SAP" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Oracle" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "NetSuite" })
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
						label: "WMS",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							className: inputCls$1,
							style: inputStyle(),
							value: form.wms,
							onChange: (e) => upd("wms", e.target.value),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Manhattan" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Blue Yonder" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Korber" })
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "col-span-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
							label: "Categories",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap gap-2",
								children: [
									"Produce",
									"Dairy",
									"Bakery",
									"Meat & Fish",
									"Ready Meals",
									"Frozen",
									"Beverages"
								].map((c) => {
									const on = form.categories.includes(c);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => upd("categories", on ? form.categories.filter((x) => x !== c) : [...form.categories, c]),
										className: "px-3 py-1.5 rounded-full text-[12px] font-medium",
										style: {
											background: on ? C.accent : "transparent",
											color: on ? "#fff" : C.text2,
											border: `1px solid ${on ? C.accent : C.border}`
										},
										children: c
									}, c);
								})
							})
						})
					})
				]
			}),
			tab === "prefs" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				[
					["emailRSL", "Email RSL Alerts"],
					["dailySummary", "Daily Summary Email"],
					["slack", "Slack Notifications"],
					["sms", "SMS Alerts for Urgent"]
				].map(([k, l]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between py-3 border-b",
					style: { borderColor: C.border },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[13px] font-medium",
						style: { color: C.label },
						children: l
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => upd(k, !form[k]),
						className: "w-11 h-6 rounded-full transition",
						style: { background: form[k] ? C.accent : C.border },
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block w-5 h-5 bg-white rounded-full shadow transition",
							style: { transform: form[k] ? "translateX(22px)" : "translateX(2px)" }
						})
					})]
				}, k)),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
					label: "RSL Alert Threshold (days)",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => upd("rslThreshold", Math.max(1, form.rslThreshold - 1)),
								className: "w-8 h-8 rounded border",
								style: { borderColor: C.border },
								children: "−"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[16px] font-semibold w-8 text-center",
								style: { color: C.text },
								children: form.rslThreshold
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => upd("rslThreshold", form.rslThreshold + 1),
								className: "w-8 h-8 rounded border",
								style: { borderColor: C.border },
								children: "+"
							})
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
					label: "Default Dashboard View",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex gap-2",
						children: [
							"overview",
							"passports",
							"rsl"
						].map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => upd("defaultView", v),
							className: "px-3 py-1.5 rounded-full text-[12px] font-medium capitalize",
							style: {
								background: form.defaultView === v ? C.primary : "transparent",
								color: form.defaultView === v ? "#fff" : C.text2,
								border: `1px solid ${form.defaultView === v ? C.primary : C.border}`
							},
							children: v
						}, v))
					})
				})
			] })
		]
	});
}
function nextBatchId(batches) {
	let max = 0;
	batches.forEach((b) => {
		const m = b.id.match(/#A(\d+)/);
		if (m) max = Math.max(max, +m[1]);
	});
	return `#A${String(max + 1).padStart(2, "0")}`;
}
var CATEGORY_SHELF = {
	Produce: 7,
	Dairy: 10,
	Bakery: 5,
	"Ready Meals": 4,
	"Meat & Fish": 3,
	Frozen: 90,
	"Dry Goods": 180
};
var VALID_CATEGORIES = [
	"Produce",
	"Dairy",
	"Bakery",
	"Ready Meals",
	"Meat & Fish",
	"Frozen",
	"Dry Goods"
];
var PROCESS_MSGS = [
	"Reading document...",
	"Identifying products...",
	"Extracting batch details...",
	"Mapping to passport fields..."
];
function parseScannedDate(s) {
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
function fileToBase64(file) {
	return new Promise((resolve, reject) => {
		const r = new FileReader();
		r.onload = () => {
			const s = r.result;
			resolve(s.split(",")[1] || "");
		};
		r.onerror = () => reject(r.error);
		r.readAsDataURL(file);
	});
}
function fileToDataUrl(file) {
	return new Promise((resolve, reject) => {
		const r = new FileReader();
		r.onload = () => resolve(r.result);
		r.onerror = () => reject(r.error);
		r.readAsDataURL(file);
	});
}
function PassportModal({ state, dispatch }) {
	const modal = state.passportModalOpen;
	const prefilledStoreId = modal && typeof modal === "object" ? modal.prefilledStoreId : null;
	const [tab, setTab] = (0, import_react.useState)("batch");
	const [form, setForm] = (0, import_react.useState)({
		product: "",
		sku: "",
		batchId: nextBatchId(state.batches),
		category: "Produce",
		units: 100,
		unitSize: "400g",
		productionDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
		printedExpiry: new Date(Date.now() + 7 * DAY).toISOString().slice(0, 10),
		supplier: "",
		origin: "UK",
		baseShelfLife: 7,
		storageTemp: 5,
		maxTemp: 8,
		monitoringMethod: "IoT Sensor",
		currentTemp: 5,
		location: prefilledStoreId ? "store" : "dc",
		storeSelect: prefilledStoreId || "S1",
		assignedStaff: "",
		entryPoint: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
		actionType: "Monitor",
		priority: "medium",
		notes: "",
		logoUrl: null
	});
	const [errors, setErrors] = (0, import_react.useState)({});
	const fileRef = (0, import_react.useRef)(null);
	const upd = (k, v) => setForm((f) => ({
		...f,
		[k]: v
	}));
	const [scanState, setScanState] = (0, import_react.useState)("idle");
	const [scanFile, setScanFile] = (0, import_react.useState)(null);
	const [scanDataUrl, setScanDataUrl] = (0, import_react.useState)(null);
	const [scanError, setScanError] = (0, import_react.useState)(null);
	const [extracted, setExtracted] = (0, import_react.useState)(null);
	const [extractedList, setExtractedList] = (0, import_react.useState)(null);
	const [extractionConfidence, setExtractionConfidence] = (0, import_react.useState)("medium");
	const [extractedInvoiceNo, setExtractedInvoiceNo] = (0, import_react.useState)(null);
	const [processIdx, setProcessIdx] = (0, import_react.useState)(0);
	const [isDragOver, setIsDragOver] = (0, import_react.useState)(false);
	const [flashedFields, setFlashedFields] = (0, import_react.useState)(/* @__PURE__ */ new Set());
	const [lowConfFields, setLowConfFields] = (0, import_react.useState)(/* @__PURE__ */ new Set());
	const [successMsg, setSuccessMsg] = (0, import_react.useState)(null);
	const billFileRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (scanState !== "loading") return;
		const id = setInterval(() => setProcessIdx((i) => (i + 1) % PROCESS_MSGS.length), 1200);
		return () => clearInterval(id);
	}, [scanState]);
	const onFile = (e) => {
		const f = e.target.files?.[0];
		if (!f) return;
		const r = new FileReader();
		r.onload = () => upd("logoUrl", r.result);
		r.readAsDataURL(f);
	};
	const tempInRange = form.currentTemp <= form.maxTemp;
	const acceptFile = async (f) => {
		setScanError(null);
		if (f.size > 10 * 1024 * 1024) {
			setScanError("File too large. Maximum size is 10MB.");
			setScanState("error");
			return;
		}
		if (![
			"application/pdf",
			"image/jpeg",
			"image/png"
		].includes(f.type)) {
			setScanError("Please upload a PDF, JPG, or PNG file.");
			setScanState("error");
			return;
		}
		const url = await fileToDataUrl(f);
		setScanFile(f);
		setScanDataUrl(url);
		setScanState("preview");
	};
	const onBillSelect = (e) => {
		const f = e.target.files?.[0];
		if (f) acceptFile(f);
		e.target.value = "";
	};
	const clearScan = () => {
		setScanFile(null);
		setScanDataUrl(null);
		setScanState("idle");
		setScanError(null);
		setExtracted(null);
		setExtractedList(null);
		setExtractedInvoiceNo(null);
	};
	const runExtraction = async () => {
		if (!scanFile) return;
		setScanState("loading");
		setProcessIdx(0);
		try {
			const { scanBill } = await import("./scan-bill.functions-exYiRSCv.mjs");
			const ex = (await scanBill({ data: {
				base64: await fileToBase64(scanFile),
				mediaType: scanFile.type,
				fileName: scanFile.name
			} })).extracted;
			if (ex && ex.multiProduct && Array.isArray(ex.products) && ex.products.length > 1) {
				setExtractedList(ex.products);
				setExtractedInvoiceNo(ex.invoiceNumber ?? null);
				setExtractionConfidence(ex.confidence || "medium");
				setScanState("multi");
				return;
			}
			const single = ex && ex.multiProduct && ex.products?.[0] || ex;
			const nonNullCount = single ? Object.values(single).filter((v) => v !== null && v !== "" && v !== void 0).length : 0;
			const conf = single?.confidence || (nonNullCount > 6 ? "high" : nonNullCount > 3 ? "medium" : "low");
			if (!single || nonNullCount === 0) {
				setScanState("nodata");
				return;
			}
			setExtracted(single);
			setExtractedInvoiceNo(single.invoiceNumber ?? null);
			setExtractionConfidence(conf);
			setScanState("results");
			dispatch({
				type: "ADD_ACTIVITY",
				activity: {
					id: uid(),
					ts: Date.now(),
					type: "bill_scanned",
					text: `Delivery bill scanned — ${nonNullCount} fields extracted — ${single.productName || "Unknown product"} — Invoice ${single.invoiceNumber || "N/A"}`,
					storeId: form.location === "store" ? form.storeSelect : "DC"
				}
			});
		} catch (err) {
			console.error(err);
			setScanError(err?.message || "Could not read the document. Please try again.");
			setScanState("error");
		}
	};
	const flashFields = (keys) => {
		setFlashedFields(new Set(keys));
		setTimeout(() => setFlashedFields(/* @__PURE__ */ new Set()), 900);
	};
	const fillFormWith = (ex) => {
		const filled = {};
		const lowConf = [];
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
		setForm((f) => ({
			...f,
			...filled
		}));
		const filledKeys = Object.keys(filled).filter((k) => k !== "batchId" || !!ex.batchId);
		if (extractionConfidence === "low") filledKeys.forEach((k) => lowConf.push(k));
		setLowConfFields(new Set(lowConf));
		flashFields(filledKeys);
		setExtractedInvoiceNo(ex.invoiceNumber ?? extractedInvoiceNo);
		const n = filledKeys.length;
		setSuccessMsg(extractionConfidence === "high" ? `✓ ${n} fields filled from your bill. Review and save when ready.` : extractionConfidence === "medium" ? `✓ ${n} fields filled. Some fields need your review — highlighted in amber.` : `⚠ Only ${n} fields could be extracted. Please complete the remaining fields manually.`);
		setTab("batch");
		setScanState("idle");
		requestAnimationFrame(() => {
			const sc = document.querySelector("[data-modal-scroll=\"true\"]");
			if (sc) sc.scrollTo({
				top: 0,
				behavior: "smooth"
			});
		});
	};
	const fieldStyle = (key, err) => {
		const base = inputStyle(err);
		if (lowConfFields.has(key)) return {
			...base,
			border: `1.5px solid ${C.amber}`
		};
		return base;
	};
	const fieldClass = (key) => `${inputCls$1} ${flashedFields.has(key) ? "fp-field-fill" : ""}`;
	const create = (overrides) => {
		const cur = overrides ? {
			...form,
			...overrides
		} : form;
		const e = {};
		if (!cur.product) e.product = "Required";
		if (!cur.sku) e.sku = "Required";
		if (!cur.batchId) e.batchId = "Required";
		if (!cur.baseShelfLife) e.baseShelfLife = "Required";
		setErrors(e);
		if (Object.keys(e).length) return false;
		const storeId = cur.location === "dc" ? "DC" : cur.location === "transit" ? "DC" : cur.storeSelect;
		const tIn = cur.currentTemp <= cur.maxTemp;
		dispatch({
			type: "ADD_BATCH",
			batch: {
				id: cur.batchId,
				product: cur.product,
				sku: cur.sku,
				category: cur.category,
				storeId,
				productionDate: new Date(cur.productionDate).getTime(),
				printedExpiry: new Date(cur.printedExpiry).getTime(),
				units: cur.units,
				unitSize: cur.unitSize,
				supplier: cur.supplier,
				origin: cur.origin,
				baseShelfLife: cur.baseShelfLife,
				dwellDays: 0,
				tempExcursion: !tIn,
				tempPenaltyDays: tIn ? 0 : 1,
				maxTemp: cur.maxTemp,
				storageTemp: cur.storageTemp,
				tempHistory: tempHist(cur.storageTemp),
				monitoringMethod: cur.monitoringMethod,
				entryPoint: cur.entryPoint,
				assignedStaff: cur.assignedStaff,
				priority: cur.priority,
				recommendedAction: cur.actionType,
				logoUrl: cur.logoUrl,
				createdAt: Date.now(),
				sourceDocument: overrides?.sourceDoc ?? (scanDataUrl && scanFile ? {
					fileName: scanFile.name,
					invoiceNumber: extractedInvoiceNo,
					scannedAt: Date.now(),
					confidence: extractionConfidence,
					mediaType: scanFile.type,
					dataUrl: scanDataUrl
				} : null)
			}
		});
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
			dataUrl: scanDataUrl
		};
		const existing = [...state.batches];
		extractedList.forEach((ex, i) => {
			const cat = ex.category && VALID_CATEGORIES.includes(ex.category) ? ex.category : "Produce";
			const bsl = typeof ex.baseShelfLife === "number" ? ex.baseShelfLife : CATEGORY_SHELF[cat] || 7;
			const storeId = form.location === "dc" ? "DC" : form.location === "transit" ? "DC" : form.storeSelect;
			const tempForCat = typeof ex.storageTemp === "number" ? ex.storageTemp : 5;
			const batch = {
				id: ex.batchId || nextBatchId(existing),
				product: ex.productName || `Product ${i + 1}`,
				sku: ex.sku || `SKU-${i + 1}`,
				category: cat,
				storeId,
				productionDate: new Date(parseScannedDate(ex.productionDate) || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)).getTime(),
				printedExpiry: new Date(parseScannedDate(ex.printedExpiry) || new Date(Date.now() + bsl * DAY).toISOString().slice(0, 10)).getTime(),
				units: typeof ex.units === "number" ? ex.units : 100,
				unitSize: ex.weight || "—",
				supplier: ex.supplier || "—",
				origin: ex.origin || "—",
				baseShelfLife: bsl,
				dwellDays: 0,
				tempExcursion: false,
				tempPenaltyDays: 0,
				maxTemp: tempForCat + 3,
				storageTemp: tempForCat,
				tempHistory: tempHist(tempForCat),
				monitoringMethod: "IoT Sensor",
				entryPoint: parseScannedDate(ex.deliveryDate) || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
				assignedStaff: "",
				priority: "medium",
				recommendedAction: "Monitor",
				logoUrl: null,
				createdAt: Date.now() + i,
				sourceDocument: sourceDoc
			};
			existing.unshift(batch);
			setTimeout(() => dispatch({
				type: "ADD_BATCH",
				batch
			}), i * 200);
		});
		setTimeout(() => {
			dispatch({
				type: "PUSH_TOAST",
				toast: {
					id: uid(),
					kind: "success",
					text: `${extractedList.length} passports created from bill ${extractedInvoiceNo || ""}`
				}
			});
			dispatch({ type: "CLOSE_MODALS" });
		}, extractedList.length * 200 + 100);
	};
	const incomplete = (0, import_react.useMemo)(() => {
		const s = /* @__PURE__ */ new Set();
		if (!form.product || !form.sku || !form.batchId) s.add("batch");
		return s;
	}, [form]);
	if (!modal) return null;
	const onDragOver = (e) => {
		e.preventDefault();
		setIsDragOver(true);
	};
	const onDragLeave = (e) => {
		e.preventDefault();
		setIsDragOver(false);
	};
	const onDrop = (e) => {
		e.preventDefault();
		setIsDragOver(false);
		const f = e.dataTransfer.files?.[0];
		if (f) acceptFile(f);
	};
	const confidenceBadge = () => {
		if (extractionConfidence === "high") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
			bg: "#DCFCE7",
			color: C.green,
			children: "High Confidence"
		});
		if (extractionConfidence === "medium") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
			bg: "#FEF3C7",
			color: C.amber,
			children: "Review Fields"
		});
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
			bg: "#FEE2E2",
			color: C.red,
			children: "Manual Check Needed"
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		onDragOver,
		onDragLeave,
		onDrop,
		className: "contents",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Modal, {
			title: "Create Product Passport",
			onClose: () => dispatch({ type: "CLOSE_MODALS" }),
			banner: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 relative rounded-xl p-4",
					style: {
						background: C.light,
						border: `1px dashed #93C5FD`
					},
					children: [
						isDragOver && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute inset-0 rounded-xl flex items-center justify-center text-[14px] font-semibold pointer-events-none",
							style: {
								background: "rgba(239,246,255,0.95)",
								border: `2px solid ${C.accent}`,
								color: C.accent,
								zIndex: 5
							},
							children: "Drop your bill here"
						}),
						scanState === "idle" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-4 flex-wrap",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[13px] font-semibold",
										style: { color: C.text },
										children: "📄 Have a delivery bill or invoice?"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[12px] mt-0.5",
										style: { color: C.text2 },
										children: "Upload it and we'll fill the form for you"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[11px] mt-1",
										style: { color: C.muted },
										children: "Supports PDF, JPG, PNG — max 10MB"
									})
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => billFileRef.current?.click(),
									className: "px-4 h-10 rounded-lg text-[13px] font-semibold text-white",
									style: { background: C.primary },
									children: "📤 Upload Bill / Invoice"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									ref: billFileRef,
									type: "file",
									accept: "application/pdf,image/jpeg,image/png",
									className: "hidden",
									onChange: onBillSelect
								})
							]
						}),
						scanState === "preview" && scanFile && scanDataUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between mb-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[13px] font-semibold",
									style: { color: C.text },
									children: "📄 Bill preview"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: clearScan,
									className: "w-7 h-7 rounded-full bg-white shadow text-[14px]",
									style: { color: C.text2 },
									children: "×"
								})]
							}),
							scanFile.type === "application/pdf" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("embed", {
								src: scanDataUrl,
								type: "application/pdf",
								className: "w-full rounded-lg",
								style: {
									height: 200,
									border: `1px solid ${C.border}`,
									background: "#fff"
								}
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: scanDataUrl,
								alt: "bill preview",
								className: "w-full rounded-lg",
								style: {
									maxHeight: 220,
									objectFit: "contain",
									border: `1px solid ${C.border}`,
									background: "#fff"
								}
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between mt-2 text-[12px]",
								style: { color: C.text2 },
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									scanFile.name,
									" · ",
									(scanFile.size / 1024).toFixed(0),
									" KB"
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
									bg: "#DCFCE7",
									color: C.green,
									children: "Ready to scan"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: runExtraction,
								className: "w-full mt-3 h-11 rounded-lg text-[15px] font-semibold text-white",
								style: { background: C.primary },
								children: "🔍 Extract Passport Data"
							})
						] }),
						scanState === "loading" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3 py-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "w-5 h-5 rounded-full animate-spin",
									style: {
										border: `2px solid ${C.accent}`,
										borderTopColor: "transparent"
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[13px] font-medium",
									style: { color: C.text },
									children: PROCESS_MSGS[processIdx]
								}, processIdx),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex-1 h-2 rounded-full overflow-hidden ml-2",
									style: { background: "#DBEAFE" },
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-full",
										style: {
											background: C.accent,
											width: "50%",
											animation: "fp-pulse 1.2s ease-in-out infinite"
										}
									})
								})
							]
						}),
						scanState === "error" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg p-3",
							style: {
								background: "#FEE2E2",
								border: `1px solid #FCA5A5`
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[13px] font-semibold mb-2",
								style: { color: C.red },
								children: scanError || "Could not read the document."
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [scanFile && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: runExtraction,
									className: "px-3 h-8 rounded-lg text-[12px] font-semibold text-white",
									style: { background: C.primary },
									children: "Retry"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: clearScan,
									className: "px-3 h-8 rounded-lg text-[12px] font-semibold",
									style: {
										border: `1px solid ${C.border}`,
										color: C.text2,
										background: "#fff"
									},
									children: "Enter Manually"
								})]
							})]
						}),
						scanState === "nodata" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg p-3",
							style: {
								background: "#FEF3C7",
								border: `1px solid #FCD34D`
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[13px] font-medium mb-2",
								style: { color: C.amber },
								children: "We couldn't extract product data from this document. This may not be a delivery note or invoice. Please enter details manually."
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: clearScan,
								className: "px-3 h-8 rounded-lg text-[12px] font-semibold",
								style: {
									border: `1px solid ${C.border}`,
									color: C.text2,
									background: "#fff"
								},
								children: "Enter Manually"
							})]
						}),
						scanState === "results" && extracted && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between mb-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[13px] font-semibold",
									style: { color: C.green },
									children: "✓ Data extracted from bill"
								}), confidenceBadge()]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid grid-cols-2 gap-x-4 gap-y-1.5 mb-3 p-3 rounded-lg",
								style: {
									background: "#fff",
									border: `1px solid ${C.border}`
								},
								children: [
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
									["Delivery Date", extracted.deliveryDate]
								].map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between text-[12px] py-0.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: { color: C.muted },
										children: k
									}), v !== null && v !== void 0 && v !== "" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										style: {
											color: C.text,
											fontWeight: 500
										},
										children: [
											String(v),
											" ",
											extractionConfidence === "low" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												style: { color: C.amber },
												children: "⚠"
											})
										]
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "italic",
										style: { color: C.muted },
										children: "Not found"
									})]
								}, k))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => fillFormWith(extracted),
									className: "flex-1 h-10 rounded-lg text-[13px] font-semibold text-white",
									style: { background: C.primary },
									children: "✓ Fill Form with This Data"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: clearScan,
									className: "flex-1 h-10 rounded-lg text-[13px] font-semibold",
									style: {
										border: `1px solid ${C.border}`,
										color: C.text2,
										background: "#fff"
									},
									children: "✕ Discard & Enter Manually"
								})]
							})
						] }),
						scanState === "multi" && extractedList && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between mb-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[13px] font-semibold",
									style: { color: C.text },
									children: "Multiple products found on this bill"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[12px]",
									style: { color: C.text2 },
									children: "Select which product to create a passport for:"
								})] }), confidenceBadge()]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "space-y-2 max-h-[260px] overflow-auto pr-1",
								children: extractedList.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between p-3 rounded-lg",
									style: {
										background: "#fff",
										border: `1px solid ${C.border}`
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-[13px] font-semibold truncate",
												style: { color: C.text },
												children: p.productName || `Product ${i + 1}`
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "text-[11px]",
												style: { color: C.muted },
												children: [
													p.sku || "—",
													" · ",
													p.batchId || "—"
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "text-[11px]",
												style: { color: C.text2 },
												children: [
													p.units ?? "?",
													" units · Expiry ",
													p.printedExpiry || "—"
												]
											})
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => fillFormWith(p),
										className: "px-3 h-8 rounded-lg text-[12px] font-semibold text-white flex-shrink-0",
										style: { background: C.primary },
										children: "Select"
									})]
								}, i))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: createAllFromBill,
								className: "w-full mt-3 h-10 rounded-lg text-[13px] font-semibold",
								style: {
									background: C.accent,
									color: "#fff"
								},
								children: [
									"Create passports for all ",
									extractedList.length,
									" products →"
								]
							})
						] })
					]
				}),
				successMsg && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-3 p-3 rounded-lg text-[13px]",
					style: {
						background: "#F0FDF4",
						borderLeft: `3px solid ${C.green}`,
						color: C.text
					},
					children: successMsg
				}),
				Object.keys(errors).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 p-3 rounded-lg text-[13px]",
					style: {
						background: "#FEE2E2",
						color: C.red
					},
					children: [
						"Please complete ",
						Object.keys(errors).length,
						" required field(s)"
					]
				})
			] }),
			footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-[12px]",
				style: { color: C.muted },
				children: "* Required fields"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
					onClick: () => dispatch({ type: "CLOSE_MODALS" }),
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
					kind: "primary",
					onClick: () => create(),
					children: "Create Passport"
				})]
			})] }),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabPills, {
					tabs: [
						{
							key: "batch",
							label: "Batch Details"
						},
						{
							key: "cold",
							label: "Cold Chain"
						},
						{
							key: "assign",
							label: "Assignment"
						}
					],
					active: tab,
					onChange: setTab,
					incomplete
				}),
				tab === "batch" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex-shrink-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative w-[110px] h-[110px] rounded-full flex items-center justify-center overflow-hidden",
							style: {
								background: C.light,
								border: `1px solid ${C.border}`
							},
							children: [
								form.logoUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: form.logoUrl,
									alt: "",
									className: "w-full h-full object-cover"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[40px]",
									children: "📦"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => fileRef.current?.click(),
									className: "absolute bottom-1 right-1 w-7 h-7 rounded-full bg-white shadow flex items-center justify-center text-[12px]",
									children: "✏️"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									ref: fileRef,
									type: "file",
									accept: "image/*",
									className: "hidden",
									onChange: onFile
								})
							]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1 grid grid-cols-2 gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field$1, {
								label: "Product Name",
								required: true,
								error: errors.product,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: fieldClass("product"),
									style: fieldStyle("product", !!errors.product),
									value: form.product,
									onChange: (e) => upd("product", e.target.value)
								}), lowConfFields.has("product") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] mt-1",
									style: { color: C.amber },
									children: "Auto-filled — please verify"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field$1, {
								label: "SKU",
								required: true,
								error: errors.sku,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: fieldClass("sku"),
									style: fieldStyle("sku", !!errors.sku),
									value: form.sku,
									onChange: (e) => upd("sku", e.target.value)
								}), lowConfFields.has("sku") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] mt-1",
									style: { color: C.amber },
									children: "Auto-filled — please verify"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field$1, {
								label: "Batch ID",
								required: true,
								error: errors.batchId,
								hint: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => upd("batchId", nextBatchId(state.batches)),
									className: "text-[12px]",
									style: { color: C.accent },
									children: "Auto-generate"
								}),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: fieldClass("batchId"),
									style: fieldStyle("batchId", !!errors.batchId),
									value: form.batchId,
									onChange: (e) => upd("batchId", e.target.value)
								}), extractedInvoiceNo && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-[11px] mt-1",
									style: { color: C.muted },
									children: ["Invoice Ref: ", extractedInvoiceNo]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
								label: "Category",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									className: fieldClass("category"),
									style: fieldStyle("category"),
									value: form.category,
									onChange: (e) => upd("category", e.target.value),
									children: VALID_CATEGORIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: c }, c))
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
								label: "Units",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "number",
									className: fieldClass("units"),
									style: fieldStyle("units"),
									value: form.units,
									onChange: (e) => upd("units", +e.target.value)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
								label: "Unit Size",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: fieldClass("unitSize"),
									style: fieldStyle("unitSize"),
									value: form.unitSize,
									onChange: (e) => upd("unitSize", e.target.value)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
								label: "Production Date",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "date",
									className: fieldClass("productionDate"),
									style: fieldStyle("productionDate"),
									value: form.productionDate,
									onChange: (e) => upd("productionDate", e.target.value)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
								label: "Printed Expiry",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "date",
									className: fieldClass("printedExpiry"),
									style: fieldStyle("printedExpiry"),
									value: form.printedExpiry,
									onChange: (e) => upd("printedExpiry", e.target.value)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
								label: "Supplier",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: fieldClass("supplier"),
									style: fieldStyle("supplier"),
									value: form.supplier,
									onChange: (e) => upd("supplier", e.target.value)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
								label: "Origin",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: fieldClass("origin"),
									style: fieldStyle("origin"),
									value: form.origin,
									onChange: (e) => upd("origin", e.target.value)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
								label: "Base Shelf Life (days)",
								required: true,
								error: errors.baseShelfLife,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "number",
									className: fieldClass("baseShelfLife"),
									style: fieldStyle("baseShelfLife", !!errors.baseShelfLife),
									value: form.baseShelfLife,
									onChange: (e) => upd("baseShelfLife", +e.target.value)
								})
							})
						]
					})]
				}),
				tab === "cold" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
							label: "Storage Temp (°C)",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "number",
								className: fieldClass("storageTemp"),
								style: fieldStyle("storageTemp"),
								value: form.storageTemp,
								onChange: (e) => upd("storageTemp", +e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
							label: "Max Allowed Temp (°C)",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "number",
								className: inputCls$1,
								style: inputStyle(),
								value: form.maxTemp,
								onChange: (e) => upd("maxTemp", +e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "col-span-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
								label: "Monitoring Method",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex gap-2",
									children: [
										"IoT Sensor",
										"Manual",
										"Probe"
									].map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => upd("monitoringMethod", m),
										className: "px-3 py-1.5 rounded-full text-[12px] font-medium",
										style: {
											background: form.monitoringMethod === m ? C.accent : "transparent",
											color: form.monitoringMethod === m ? "#fff" : C.text2,
											border: `1px solid ${form.monitoringMethod === m ? C.accent : C.border}`
										},
										children: m
									}, m))
								})
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
							label: "Current Temp (°C)",
							hint: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
								bg: tempInRange ? "#DCFCE7" : "#FEE2E2",
								color: tempInRange ? C.green : C.red,
								children: tempInRange ? "Within Range" : "⚠ Excursion"
							}),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "number",
								className: inputCls$1,
								style: inputStyle(),
								value: form.currentTemp,
								onChange: (e) => upd("currentTemp", +e.target.value)
							})
						})
					]
				}),
				tab === "assign" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "col-span-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field$1, {
								label: "Location",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex gap-2 mb-2",
									children: [
										["dc", "DC"],
										["transit", "In Transit"],
										["store", "Store"]
									].map(([v, l]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => upd("location", v),
										className: "px-3 py-1.5 rounded-full text-[12px] font-medium",
										style: {
											background: form.location === v ? C.accent : "transparent",
											color: form.location === v ? "#fff" : C.text2,
											border: `1px solid ${form.location === v ? C.accent : C.border}`
										},
										children: l
									}, v))
								}), form.location === "store" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									className: inputCls$1,
									style: inputStyle(),
									value: form.storeSelect,
									onChange: (e) => upd("storeSelect", e.target.value),
									children: state.stores.filter((s) => s.id !== "DC").map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: s.id,
										children: s.name
									}, s.id))
								})]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
							label: "Assigned Staff",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: inputCls$1,
								style: inputStyle(),
								value: form.assignedStaff,
								onChange: (e) => upd("assignedStaff", e.target.value),
								placeholder: "Initials e.g. AV"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
							label: "Entry Date",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "date",
								className: fieldClass("entryPoint"),
								style: fieldStyle("entryPoint"),
								value: form.entryPoint,
								onChange: (e) => upd("entryPoint", e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
							label: "Recommended Action",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								className: inputCls$1,
								style: inputStyle(),
								value: form.actionType,
								onChange: (e) => upd("actionType", e.target.value),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Monitor" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "FEFO Rotation" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Markdown" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Allocation Adjust" })
								]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
							label: "Priority",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex gap-2",
								children: [
									"low",
									"medium",
									"high",
									"urgent"
								].map((p) => {
									const colors = {
										low: C.green,
										medium: C.amber,
										high: "#EA580C",
										urgent: C.red
									};
									const on = form.priority === p;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => upd("priority", p),
										className: "px-3 py-1 rounded-full text-[11px] font-semibold uppercase",
										style: {
											background: on ? colors[p] : "transparent",
											color: on ? "#fff" : colors[p],
											border: `1px solid ${colors[p]}`
										},
										children: p
									}, p);
								})
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "col-span-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
								label: "Notes",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									className: "w-full px-3 py-2 rounded-lg text-[13px] outline-none",
									style: inputStyle(),
									rows: 3,
									value: form.notes,
									onChange: (e) => upd("notes", e.target.value)
								})
							})
						})
					]
				})
			]
		})
	});
}
function Drawer({ state, dispatch }) {
	const batch = state.batches.find((b) => b.id === state.drawerBatchId);
	const open = !!state.drawerBatchId;
	(0, import_react.useEffect)(() => {
		if (open) {
			document.body.style.overflow = "hidden";
			return () => {
				document.body.style.overflow = "";
			};
		}
	}, [open]);
	if (!batch) return null;
	const r = computeRSL(batch, nowOf(state));
	const store = state.stores.find((s) => s.id === batch.storeId);
	const existingTask = state.tasks.find((t) => t.batchId === batch.id && t.status !== "done");
	const createTask = () => {
		dispatch({
			type: "ADD_TASK",
			task: {
				id: uid(),
				status: "todo",
				priority: r.rslDays < 2 ? "URGENT" : r.rslDays <= 3 ? "HIGH" : "MEDIUM",
				type: rslActionType(r.rslDays),
				product: batch.product,
				batchId: batch.id,
				storeId: batch.storeId,
				instruction: rslToAction(r.rslDays),
				rslDays: r.rslDays,
				assignee: batch.assignedStaff || "Unassigned",
				assignedAt: Date.now()
			}
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-[9000] no-print",
		style: { pointerEvents: open ? "auto" : "none" },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute inset-0 transition-opacity",
			style: {
				background: "rgba(0,0,0,0.4)",
				opacity: open ? 1 : 0
			},
			onClick: () => dispatch({ type: "CLOSE_DRAWER" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute top-0 right-0 h-full bg-white shadow-2xl overflow-y-auto transition-transform",
			style: {
				width: "min(560px, calc(100vw - 40px))",
				transform: open ? "translateX(0)" : "translateX(100%)",
				transitionDuration: "250ms"
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between mb-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11px] uppercase tracking-wider font-semibold",
								style: { color: C.muted },
								children: "Passport"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-[20px] font-bold mt-1",
								style: { color: C.text },
								children: batch.product
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-[13px] mt-1",
								style: { color: C.text2 },
								children: [
									batch.id,
									" · ",
									batch.sku,
									" · ",
									store?.name
								]
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => dispatch({ type: "CLOSE_DRAWER" }),
							className: "w-8 h-8 rounded-full hover:bg-slate-100 text-[18px]",
							style: { color: C.text2 },
							children: "×"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-3 gap-3 mb-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-3 rounded-lg",
								style: { background: C.bg },
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px]",
									style: { color: C.muted },
									children: "RSL"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-[18px] font-bold",
									style: { color: freshnessColor(r.score) },
									children: [r.rslDays, "d"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-3 rounded-lg",
								style: { background: C.bg },
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px]",
									style: { color: C.muted },
									children: "Score"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-[18px] font-bold",
									style: { color: freshnessColor(r.score) },
									children: [r.score, "/100"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-3 rounded-lg",
								style: { background: C.bg },
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px]",
									style: { color: C.muted },
									children: "Units"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[18px] font-bold",
									style: { color: C.text },
									children: batch.units
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
						className: "text-[13px] font-semibold mb-2",
						style: { color: C.text },
						children: "Temperature History"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: 200,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
							data: batch.tempHistory,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									strokeDasharray: "3 3",
									stroke: C.border
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "day",
									tick: {
										fontSize: 11,
										fill: C.muted
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, { tick: {
									fontSize: 11,
									fill: C.muted
								} }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReferenceLine, {
									y: batch.maxTemp,
									stroke: C.red,
									strokeDasharray: "4 4",
									label: {
										value: `Max: ${batch.maxTemp}°C`,
										fill: C.red,
										fontSize: 11,
										position: "right"
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
									type: "monotone",
									dataKey: "temp",
									stroke: C.accent,
									strokeWidth: 2
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
						className: "text-[13px] font-semibold mt-5 mb-2",
						style: { color: C.text },
						children: "RSL Breakdown"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1 text-[13px]",
						style: { color: C.text2 },
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["Base shelf life: ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [batch.baseShelfLife, "d"] })] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["Days since production: ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: ["−", r.daysSinceProduction] })] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["Temp penalty: ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: ["−", r.tempPenalty] })] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["Dwell penalty: ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: ["−", r.dwellPenalty] })] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "pt-2 mt-2 border-t",
								style: { borderColor: C.border },
								children: ["Remaining: ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", {
									style: { color: freshnessColor(r.score) },
									children: [r.rslDays, "d"]
								})]
							})
						]
					}),
					r.rslDays < 5 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-5",
						children: existingTask ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-3 rounded-lg flex items-center justify-between",
							style: {
								background: "#DCFCE7",
								borderLeft: `3px solid ${C.green}`
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[13px]",
								style: { color: C.green },
								children: "Action task already created ✓"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => {
									dispatch({ type: "CLOSE_DRAWER" });
									dispatch({
										type: "NAVIGATE",
										page: "actions"
									});
									dispatch({
										type: "HIGHLIGHT_TASK",
										id: existingTask.id
									});
								},
								className: "text-[12px] font-semibold",
								style: { color: C.green },
								children: "View in Action Engine →"
							})]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-3 rounded-lg",
							style: {
								background: C.light,
								borderLeft: `3px solid ${C.accent}`
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-[13px] mb-2",
								style: { color: C.primary },
								children: ["Recommended: ", rslToAction(r.rslDays)]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: createTask,
								className: "text-[12px] font-semibold px-3 py-1.5 rounded-lg",
								style: {
									background: C.accent,
									color: "#fff"
								},
								children: "Create Action Task →"
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
						className: "text-[13px] font-semibold mt-5 mb-2",
						style: { color: C.text },
						children: "Source Document"
					}),
					batch.sourceDocument ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SourceDocSection, { doc: batch.sourceDocument }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[13px] italic",
						style: { color: C.muted },
						children: "Manually entered"
					})
				]
			})
		})]
	});
}
function SourceDocSection({ doc }) {
	const [viewOpen, setViewOpen] = (0, import_react.useState)(false);
	const confColor = doc.confidence === "high" ? C.green : doc.confidence === "medium" ? C.amber : C.red;
	const confBg = doc.confidence === "high" ? "#DCFCE7" : doc.confidence === "medium" ? "#FEF3C7" : "#FEE2E2";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "p-3 rounded-lg flex items-center justify-between gap-2",
		style: {
			background: C.bg,
			border: `1px solid ${C.border}`
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-[13px] font-semibold truncate",
				style: { color: C.text },
				children: ["📄 ", doc.invoiceNumber || doc.fileName]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-[11px]",
				style: { color: C.muted },
				children: ["Scanned on ", formatDate(doc.scannedAt)]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2 flex-shrink-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
				bg: confBg,
				color: confColor,
				children: doc.confidence
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: () => setViewOpen(true),
				className: "px-2 h-7 rounded-lg text-[11px] font-semibold",
				style: {
					background: C.accent,
					color: "#fff"
				},
				children: "View Original Bill"
			})]
		})]
	}), viewOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-[10001] flex items-center justify-center p-4 no-print",
		style: { background: "rgba(0,0,0,0.6)" },
		onClick: () => setViewOpen(false),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "bg-white rounded-2xl shadow-2xl w-full max-w-[800px] max-h-[90vh] overflow-auto",
			onClick: (e) => e.stopPropagation(),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between p-4 border-b",
				style: { borderColor: C.border },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[13px] font-bold uppercase tracking-wider",
					style: { color: C.primary },
					children: "Source Bill"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[12px]",
					style: { color: C.text2 },
					children: doc.fileName
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: doc.dataUrl,
						download: doc.fileName,
						className: "px-3 h-8 rounded-lg text-[12px] font-semibold inline-flex items-center",
						style: {
							background: C.primary,
							color: "#fff"
						},
						children: "Download"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setViewOpen(false),
						className: "w-8 h-8 rounded-full hover:bg-slate-100 text-[18px]",
						style: { color: C.text2 },
						children: "×"
					})]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "p-4",
				children: doc.mediaType === "application/pdf" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("embed", {
					src: doc.dataUrl,
					type: "application/pdf",
					className: "w-full rounded-lg",
					style: {
						height: "70vh",
						border: `1px solid ${C.border}`
					}
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: doc.dataUrl,
					alt: "Original bill",
					className: "w-full rounded-lg",
					style: {
						maxHeight: "70vh",
						objectFit: "contain",
						border: `1px solid ${C.border}`
					}
				})
			})]
		})
	})] });
}
var ACT_ICON = {
	passport_created: {
		icon: "📦",
		color: C.accent
	},
	task_completed: {
		icon: "✓",
		color: C.green
	},
	markdown_triggered: {
		icon: "🏷",
		color: C.amber
	},
	temp_excursion: {
		icon: "⚠",
		color: C.red
	},
	waste_logged: {
		icon: "🗑",
		color: C.red
	},
	store_created: {
		icon: "🏪",
		color: C.accent
	},
	rsl_alert: {
		icon: "🕐",
		color: C.amber
	},
	bill_scanned: {
		icon: "📄",
		color: C.accent
	}
};
function Overview({ state, dispatch }) {
	const n = nowOf(state);
	const storeId = state.activeStoreFilter;
	const batches = getBatchesForStore(state, storeId);
	const atRisk = getAtRiskBatches(state, storeId).length;
	const waste = getWasteThisWeek(state, storeId);
	const freshness = getFreshnessScore(state, storeId);
	const byStore = state.stores.filter((s) => s.id !== "DC").map((s) => {
		const sBatches = state.batches.filter((b) => b.storeId === s.id);
		const score = sBatches.length ? sBatches.reduce((a, b) => a + computeRSL(b, n).score, 0) / sBatches.length : 0;
		return {
			name: s.name.replace("Store #", "#"),
			score: +score.toFixed(1),
			id: s.id
		};
	});
	const wasteDrivers = (0, import_react.useMemo)(() => {
		const m = /* @__PURE__ */ new Map();
		WASTE_INCIDENTS.filter((w) => storeId === "all" || w.storeId === storeId).forEach((w) => m.set(w.driver, (m.get(w.driver) || 0) + w.cost));
		return Array.from(m.entries()).map(([name, value]) => ({
			name,
			value
		}));
	}, [storeId]);
	const DCOLORS = [
		C.accent,
		C.amber,
		C.red,
		C.green,
		C.primary
	];
	const feed = state.activity.filter((a) => storeId === "all" || a.storeId === storeId).slice(0, 8);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-[24px] font-bold",
				style: { color: C.text },
				children: "Overview"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[13px]",
				style: { color: C.text2 },
				children: storeId === "all" ? "All stores" : state.stores.find((s) => s.id === storeId)?.name
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 md:grid-cols-4 gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "Active Passports",
						value: batches.length,
						accent: C.accent,
						onClick: () => dispatch({
							type: "NAVIGATE",
							page: "passports"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "At Risk Products",
						value: atRisk,
						accent: C.red,
						onClick: () => dispatch({
							type: "NAVIGATE",
							page: "rsl"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "Waste This Week",
						value: formatGBP(waste),
						accent: C.amber,
						onClick: () => dispatch({
							type: "NAVIGATE",
							page: "analytics"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "Freshness Score",
						value: formatPct(freshness),
						accent: C.green
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 lg:grid-cols-2 gap-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
						title: "Freshness by Store",
						tipKey: "overview",
						state,
						dispatch
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: 260,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
							data: byStore,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									strokeDasharray: "3 3",
									stroke: C.border
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "name",
									tick: {
										fontSize: 11,
										fill: C.muted
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, { tick: {
									fontSize: 11,
									fill: C.muted
								} }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "score",
									children: byStore.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, {
										fill: freshnessColor(b.score),
										fillOpacity: storeId === "all" || storeId === b.id ? 1 : .3
									}, b.id))
								})
							]
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
						title: "Waste Drivers (last 7 days)",
						state,
						dispatch
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: 240,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PieChart, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pie, {
								data: wasteDrivers,
								dataKey: "value",
								nameKey: "name",
								innerRadius: 50,
								outerRadius: 90,
								children: wasteDrivers.map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: DCOLORS[i % DCOLORS.length] }, i))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, { wrapperStyle: { fontSize: 11 } }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { formatter: (v) => formatGBP(v) })
						] })
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
					title: "Live Activity",
					tipKey: "overview",
					state,
					dispatch,
					action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => dispatch({ type: "OPEN_ACTIVITY_LOG" }),
						className: "text-[12px] font-semibold",
						style: { color: C.accent },
						children: "View all activity →"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [feed.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[13px] py-4 text-center",
						style: { color: C.muted },
						children: "No activity yet"
					}), feed.map((a) => {
						const meta = ACT_ICON[a.type];
						const store = state.stores.find((s) => s.id === a.storeId);
						const click = a.batchId ? () => dispatch({
							type: "OPEN_DRAWER",
							batchId: a.batchId
						}) : void 0;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							onClick: click,
							className: `flex items-center gap-3 p-2 rounded-lg ${click ? "cursor-pointer hover:bg-slate-50" : ""}`,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "w-8 h-8 rounded-full flex items-center justify-center text-[14px]",
									style: {
										background: `${meta.color}1A`,
										color: meta.color
									},
									children: meta.icon
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex-1 text-[13px]",
									style: { color: C.text },
									children: a.text
								}),
								store && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
									bg: C.badgeBlueBg,
									color: C.badgeBlueText,
									children: store.name.replace("Store #", "#")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[12px]",
									style: { color: C.muted },
									children: timeAgo(a.ts)
								})
							]
						}, a.id);
					})]
				})]
			})
		]
	});
}
function PassportsPage({ state, dispatch }) {
	const n = nowOf(state);
	const [search, setSearch] = (0, import_react.useState)("");
	const [status, setStatus] = (0, import_react.useState)("all");
	const [category, setCategory] = (0, import_react.useState)("all");
	const storeId = state.activeStoreFilter;
	const filtered = state.batches.filter((b) => {
		if (storeId !== "all" && b.storeId !== storeId) return false;
		if (category !== "all" && b.category !== category) return false;
		if (status !== "all") {
			if (status !== statusFromScore(computeRSL(b, n).score)) return false;
		}
		if (search) {
			const q = search.toLowerCase();
			if (!b.product.toLowerCase().includes(q) && !b.sku.toLowerCase().includes(q) && !b.id.toLowerCase().includes(q)) return false;
		}
		return true;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-[24px] font-bold",
				style: { color: C.text },
				children: "Product Passports"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[13px]",
				style: { color: C.text2 },
				children: "Live freshness intelligence for every active batch"
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
				kind: "primary",
				onClick: () => dispatch({
					type: "OPEN_PASSPORT_MODAL",
					prefilledStoreId: storeId === "all" ? null : storeId
				}),
				children: "+ New Passport"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-1 md:grid-cols-4 gap-3 mb-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: inputCls$1,
							style: inputStyle(),
							placeholder: "Search product / SKU / batch",
							value: search,
							onChange: (e) => setSearch(e.target.value)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							className: inputCls$1,
							style: inputStyle(),
							value: storeId,
							onChange: (e) => dispatch({
								type: "SET_STORE_FILTER",
								storeId: e.target.value
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "all",
								children: "All Stores"
							}), state.stores.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: s.id,
								children: s.name
							}, s.id))]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							className: inputCls$1,
							style: inputStyle(),
							value: status,
							onChange: (e) => setStatus(e.target.value),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "all",
									children: "All Status"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Fresh" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "At Risk" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Critical" })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							className: inputCls$1,
							style: inputStyle(),
							value: category,
							onChange: (e) => setCategory(e.target.value),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "all",
									children: "All Categories"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Produce" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Dairy" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Bakery" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Meat & Fish" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Ready Meals" })
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-[12px] mb-3",
					style: { color: C.muted },
					children: [
						"Showing ",
						filtered.length,
						" of ",
						state.batches.length,
						" passports"
					]
				}),
				filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "py-12 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[48px]",
							style: { color: C.muted },
							children: "📦"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[14px] font-semibold mt-2",
							style: { color: C.text },
							children: "No passports match your filters"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => {
								setSearch("");
								setStatus("all");
								setCategory("all");
								dispatch({
									type: "SET_STORE_FILTER",
									storeId: "all"
								});
							},
							className: "text-[13px] mt-2",
							style: { color: C.accent },
							children: "Clear all filters"
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-[13px]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							style: {
								color: C.muted,
								fontSize: 11
							},
							className: "text-left",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-2",
									children: "Batch"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Product" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Category" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Store" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "RSL" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Status" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {})
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: filtered.map((b) => {
							const r = computeRSL(b, n);
							const store = state.stores.find((s) => s.id === b.storeId);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: `border-t ${b.id === state.newPassportFlashId ? "fp-flash-row" : ""}`,
								style: { borderColor: C.border },
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-3 font-semibold",
										style: { color: C.text },
										children: b.id
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										style: { color: C.text },
										children: b.product
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										style: { color: C.text2 },
										children: b.category
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										style: { color: C.text2 },
										children: store?.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										style: {
											color: freshnessColor(r.score),
											fontWeight: 600
										},
										children: [r.rslDays, "d"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { score: r.score }) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => dispatch({
											type: "OPEN_DRAWER",
											batchId: b.id
										}),
										className: "text-[12px] font-semibold",
										style: { color: C.accent },
										children: "View →"
									}) })
								]
							}, b.id);
						}) })]
					})
				})
			]
		})]
	});
}
function RSLPage({ state, dispatch }) {
	const n = nowOf(state);
	const storeId = state.activeStoreFilter;
	const batches = getBatchesForStore(state, storeId).map((b) => ({
		b,
		r: computeRSL(b, n)
	})).sort((a, b) => a.r.rslDays - b.r.rslDays);
	const safe = batches.filter((x) => x.r.rslDays >= 5).length;
	const monitor = batches.filter((x) => x.r.rslDays >= 3 && x.r.rslDays < 5).length;
	const act = batches.filter((x) => x.r.rslDays < 3).length;
	const trend = Array.from({ length: 14 }, (_, i) => ({
		day: `D${i + 1}`,
		atRisk: Math.max(2, Math.round(act * (1.4 - i * .05) + Math.sin(i) * 3))
	}));
	const createTask = (b, r) => {
		dispatch({
			type: "ADD_TASK",
			task: {
				id: uid(),
				status: "todo",
				priority: r.rslDays < 2 ? "URGENT" : r.rslDays <= 3 ? "HIGH" : "MEDIUM",
				type: rslActionType(r.rslDays),
				product: b.product,
				batchId: b.id,
				storeId: b.storeId,
				instruction: rslToAction(r.rslDays),
				rslDays: r.rslDays,
				assignee: b.assignedStaff || "Unassigned",
				assignedAt: Date.now()
			}
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-[24px] font-bold",
				style: { color: C.text },
				children: "RSL Monitor"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[13px]",
				style: { color: C.text2 },
				children: "Remaining shelf life across the network"
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-3 gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "Safe (≥5d)",
						value: safe,
						accent: C.green
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "Monitor (3-4d)",
						value: monitor,
						accent: C.amber
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "Act Now (<3d)",
						value: act,
						accent: C.red
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
					title: "Urgency Queue",
					tipKey: "rsl",
					state,
					dispatch
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-[13px]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							style: {
								color: C.muted,
								fontSize: 11
							},
							className: "text-left",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-2",
									children: "Batch"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Product" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Store" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "RSL" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Score" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Recommended Action" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {})
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: batches.map(({ b, r }) => {
							const store = state.stores.find((s) => s.id === b.storeId);
							const color = freshnessColor(r.score);
							const hasTask = state.tasks.some((t) => t.batchId === b.id && t.status !== "done");
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-t",
								style: {
									borderColor: C.border,
									borderLeft: `3px solid ${color}`
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-3 font-semibold pl-3",
										style: { color: C.text },
										children: b.id
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										style: { color: C.text },
										children: b.product
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										style: { color: C.text2 },
										children: store?.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										style: {
											color,
											fontWeight: 600
										},
										children: [r.rslDays, "d"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										style: { color },
										children: r.score
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										style: { color: C.text2 },
										children: rslToAction(r.rslDays)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: r.rslDays < 5 && (hasTask ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
										bg: "#DCFCE7",
										color: C.green,
										children: "Task Created ✓"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => createTask(b, r),
										className: "text-[12px] font-semibold",
										style: { color: C.accent },
										children: "→ Create Task"
									})) })
								]
							}, b.id);
						}) })]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
					title: "14-Day At-Risk Trend",
					state,
					dispatch
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
					width: "100%",
					height: 260,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
						data: trend,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
								strokeDasharray: "3 3",
								stroke: C.border
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
								dataKey: "day",
								tick: {
									fontSize: 11,
									fill: C.muted
								}
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, { tick: {
								fontSize: 11,
								fill: C.muted
							} }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
								type: "monotone",
								dataKey: "atRisk",
								stroke: C.red,
								fill: `${C.red}33`
							})
						]
					})
				})]
			})
		]
	});
}
function WastePage({ state, dispatch }) {
	const storeId = state.activeStoreFilter;
	const incidents = WASTE_INCIDENTS.filter((w) => storeId === "all" || w.storeId === storeId);
	const byDriver = (0, import_react.useMemo)(() => {
		const m = /* @__PURE__ */ new Map();
		incidents.forEach((w) => m.set(w.driver, (m.get(w.driver) || 0) + w.cost));
		return Array.from(m.entries()).map(([name, value]) => ({
			name,
			value
		})).sort((a, b) => b.value - a.value);
	}, [incidents]);
	const byCat = (0, import_react.useMemo)(() => {
		const m = /* @__PURE__ */ new Map();
		incidents.forEach((w) => {
			const cat = state.batches.find((x) => x.id === w.batch)?.category || "Other";
			m.set(cat, (m.get(cat) || 0) + w.cost);
		});
		return Array.from(m.entries()).map(([name, value]) => ({
			name,
			value
		}));
	}, [incidents, state.batches]);
	const trend = Array.from({ length: 8 }, (_, i) => ({
		week: `W${i + 1}`,
		total: 3200 - i * 180 + Math.round(Math.sin(i) * 80),
		preventable: 2400 - i * 170 + Math.round(Math.cos(i) * 60)
	}));
	const PCOLORS = [
		C.red,
		C.amber,
		C.accent,
		C.green,
		C.primary
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-[24px] font-bold",
				style: { color: C.text },
				children: "Waste Analytics"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[13px]",
				style: { color: C.text2 },
				children: "Root-cause analysis"
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 lg:grid-cols-2 gap-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
						title: "Waste by Driver",
						tipKey: "waste",
						state,
						dispatch
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: 220,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
							data: byDriver,
							layout: "vertical",
							margin: { left: 80 },
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									strokeDasharray: "3 3",
									stroke: C.border
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									type: "number",
									tick: {
										fontSize: 11,
										fill: C.muted
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									type: "category",
									dataKey: "name",
									tick: {
										fontSize: 11,
										fill: C.muted
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { formatter: (v) => formatGBP(v) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "value",
									fill: C.red
								})
							]
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
						title: "Waste by Category",
						state,
						dispatch
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: 240,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PieChart, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pie, {
							data: byCat,
							dataKey: "value",
							nameKey: "name",
							innerRadius: 50,
							outerRadius: 90,
							children: byCat.map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: PCOLORS[i % PCOLORS.length] }, i))
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, { wrapperStyle: { fontSize: 11 } })] })
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
					title: "Incidents Log",
					state,
					dispatch
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-[13px]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							style: {
								color: C.muted,
								fontSize: 11
							},
							className: "text-left",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-2",
									children: "Date"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Product" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Batch" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Store" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Driver" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Units" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Cost" })
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: incidents.map((w, i) => {
							const store = state.stores.find((s) => s.id === w.storeId);
							const batchExists = state.batches.some((b) => b.id === w.batch);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-t",
								style: { borderColor: C.border },
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-3",
										style: { color: C.text2 },
										children: formatDate(w.date)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										style: { color: C.text },
										children: w.product
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: batchExists ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => dispatch({
											type: "OPEN_DRAWER",
											batchId: w.batch
										}),
										className: "font-semibold",
										style: { color: C.accent },
										children: w.batch
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: { color: C.muted },
										children: w.batch
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										style: { color: C.text2 },
										children: store?.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										style: { color: C.text2 },
										children: w.driver
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										style: { color: C.text },
										children: w.units
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										style: {
											color: C.text,
											fontWeight: 600
										},
										children: formatGBP(w.cost)
									})
								]
							}, i);
						}) })]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
					title: "8-Week Trend",
					state,
					dispatch
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
					width: "100%",
					height: 260,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
						data: trend,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
								strokeDasharray: "3 3",
								stroke: C.border
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
								dataKey: "week",
								tick: {
									fontSize: 11,
									fill: C.muted
								}
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, { tick: {
								fontSize: 11,
								fill: C.muted
							} }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, { wrapperStyle: { fontSize: 11 } }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
								type: "monotone",
								dataKey: "total",
								stroke: C.red,
								strokeWidth: 2
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
								type: "monotone",
								dataKey: "preventable",
								stroke: C.amber,
								strokeWidth: 2
							})
						]
					})
				})]
			})
		]
	});
}
function ActionsPage({ state, dispatch }) {
	const storeId = state.activeStoreFilter;
	const tasks = getTasksForStore(state, storeId);
	const overdue = getOverdueTaskIds(state);
	const todo = tasks.filter((t) => t.status === "todo");
	const inprog = tasks.filter((t) => t.status === "inprogress");
	const done = tasks.filter((t) => t.status === "done");
	const cols = [
		{
			key: "todo",
			label: "TO DO",
			color: C.red,
			list: todo
		},
		{
			key: "inprogress",
			label: "IN PROGRESS",
			color: C.amber,
			list: inprog
		},
		{
			key: "done",
			label: "COMPLETED",
			color: C.green,
			list: done
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-[24px] font-bold",
				style: { color: C.text },
				children: "Action Engine"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[13px]",
				style: { color: C.text2 },
				children: "Operational tasks generated from freshness intelligence"
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 md:grid-cols-4 gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "New",
						value: todo.length,
						accent: C.red
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "In Progress",
						value: inprog.length,
						accent: C.amber
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "Completed",
						value: done.length,
						accent: C.green
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "Overdue",
						value: overdue.size,
						accent: C.red
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 md:grid-cols-3 gap-4",
				children: cols.map((col) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-4",
					style: { borderLeft: `3px solid ${col.color}` },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between mb-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[12px] font-bold uppercase tracking-wider",
							style: { color: col.color },
							children: col.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[11px]",
							style: { color: C.muted },
							children: col.list.length
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [col.list.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[12px] py-4 text-center",
							style: { color: C.muted },
							children: "No tasks"
						}), col.list.map((t) => {
							const store = state.stores.find((s) => s.id === t.storeId);
							const isOverdue = overdue.has(t.id);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: `p-3 rounded-lg ${state.taskHighlightId === t.id ? "fp-flash-row" : ""}`,
								style: {
									background: C.bg,
									opacity: t.status === "done" ? .65 : 1
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between mb-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
											bg: `${col.color}1A`,
											color: col.color,
											children: t.priority
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex gap-1",
											children: [isOverdue && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
												bg: `${C.red}1A`,
												color: C.red,
												children: "OVERDUE"
											}), t.status === "done" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												style: { color: C.green },
												children: "✓"
											})]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-[13px] font-semibold mt-1",
										style: { color: C.text },
										children: [
											t.type,
											" — ",
											t.product
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[12px] mt-1",
										style: { color: C.text2 },
										children: t.instruction
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between mt-2",
										children: [storeId === "all" && store && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => {
												dispatch({
													type: "OPEN_STORE_PROFILE",
													storeId: store.id
												});
											},
											className: "text-[11px] underline",
											style: { color: C.accent },
											children: store.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[11px]",
											style: { color: C.muted },
											children: t.assignee
										})]
									}),
									t.status === "todo" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => dispatch({
											type: "UPDATE_TASK",
											id: t.id,
											status: "inprogress"
										}),
										className: "mt-2 w-full text-[12px] py-1.5 rounded",
										style: {
											background: C.accent,
											color: "#fff"
										},
										children: "Start Task"
									}),
									t.status === "inprogress" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => dispatch({
											type: "UPDATE_TASK",
											id: t.id,
											status: "done"
										}),
										className: "mt-2 w-full text-[12px] py-1.5 rounded",
										style: {
											background: C.green,
											color: "#fff"
										},
										children: "Mark Complete"
									})
								]
							}, t.id);
						})]
					})]
				}, col.key))
			})
		]
	});
}
function ImpactPage({ state, dispatch }) {
	const storeId = state.activeStoreFilter;
	const completed = state.tasks.filter((t) => t.status === "done" && (storeId === "all" || t.storeId === storeId));
	const savings = completed.reduce((sum, t) => sum + (t.type === "Markdown" ? 120 : t.type === "FEFO Rotation" ? 80 : 60), 0);
	const wasteKg = completed.filter((t) => t.type === "FEFO Rotation").length * 2;
	const co2 = wasteKg * .002;
	const league = state.stores.filter((s) => s.id !== "DC").map((s, i) => ({
		store: s,
		reduction: 28 - i * 3 + Math.round(Math.sin(i) * 2),
		trend: Array.from({ length: 8 }, (_, k) => 30 - k - i + Math.round(Math.sin(k) * 3))
	})).sort((a, b) => b.reduction - a.reduction);
	const activeStore = state.stores.find((s) => s.id === storeId);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between no-print",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-[24px] font-bold",
					style: { color: C.text },
					children: "Impact Report"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[13px]",
					style: { color: C.text2 },
					children: "Sustainability outcomes from interventions"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
						onClick: () => window.print(),
						children: "Export PDF"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
						kind: "primary",
						onClick: () => {
							if (navigator.share) navigator.share({
								title: "Freshness Passport — Impact Report",
								url: location.href
							}).catch(() => {});
							else {
								navigator.clipboard?.writeText(location.href);
								dispatch({
									type: "PUSH_TOAST",
									toast: {
										id: uid(),
										kind: "info",
										text: "Link copied to clipboard"
									}
								});
							}
						},
						children: "Share with Sustainability Team"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 md:grid-cols-4 gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "Interventions",
						value: completed.length,
						accent: C.accent
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "Cost Savings",
						value: formatGBP(savings),
						accent: C.green
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "Waste Reduced",
						value: `${wasteKg}kg`,
						accent: C.amber
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "CO₂ Avoided",
						value: `${co2.toFixed(3)}t`,
						accent: C.green
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-5 no-print",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
					title: "12-Month Waste Trend",
					state,
					dispatch
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
					width: "100%",
					height: 300,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ComposedChart, {
						data: MONTHLY_IMPACT_12M,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
								strokeDasharray: "3 3",
								stroke: C.border
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
								dataKey: "month",
								tick: {
									fontSize: 11,
									fill: C.muted
								}
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, { tick: {
								fontSize: 11,
								fill: C.muted
							} }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
								dataKey: "waste",
								fill: C.red
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
								dataKey: "trend",
								stroke: C.accent,
								strokeWidth: 2
							})
						]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-5 no-print",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
					title: "6-Month Interventions",
					state,
					dispatch
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
					width: "100%",
					height: 280,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
						data: INTERVENTION_STACK_6M,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
								strokeDasharray: "3 3",
								stroke: C.border
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
								dataKey: "month",
								tick: {
									fontSize: 11,
									fill: C.muted
								}
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, { tick: {
								fontSize: 11,
								fill: C.muted
							} }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, { wrapperStyle: { fontSize: 11 } }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
								dataKey: "fefo",
								stackId: "a",
								fill: C.accent
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
								dataKey: "markdown",
								stackId: "a",
								fill: C.amber
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
								dataKey: "allocation",
								stackId: "a",
								fill: C.green
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
								dataKey: "coldchain",
								stackId: "a",
								fill: C.primary
							})
						]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-6",
				style: {
					background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`,
					color: "#fff"
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[11px] uppercase tracking-wider opacity-80",
						children: "ESG Certificate"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[22px] font-bold mt-1",
						children: activeStore ? activeStore.name : "All Stores Network"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-[14px] mt-1 opacity-90",
						children: ["Verified Waste Reduction: ", formatPct((wasteKg / 100 || 1) * 12)]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-3 gap-4 mt-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11px] opacity-70 uppercase",
								children: "Period"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[14px] font-semibold",
								children: formatDate(Date.now())
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11px] opacity-70 uppercase",
								children: "Interventions"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[14px] font-semibold",
								children: completed.length
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11px] opacity-70 uppercase",
								children: "CO₂ Avoided"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-[14px] font-semibold",
								children: [co2.toFixed(3), "t"]
							})] })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "print-only hidden mt-4 text-[11px]",
						children: ["Generated by Freshness Passport · ", formatDate(Date.now())]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-5 no-print",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
					title: "Store League",
					state,
					dispatch
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full text-[13px]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						style: {
							color: C.muted,
							fontSize: 11
						},
						className: "text-left",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2",
								children: "Rank"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Store" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Reduction" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Trend" })
						]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: league.map((row, i) => {
						const isSelected = storeId === row.store.id;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-t",
							style: {
								borderColor: C.border,
								background: isSelected ? C.light : void 0
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "py-3",
									style: { color: C.text },
									children: [i + 1, i === 0 && " 🏆"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => dispatch({
										type: "OPEN_STORE_PROFILE",
										storeId: row.store.id
									}),
									className: `${isSelected ? "font-bold" : "font-medium"}`,
									style: { color: C.accent },
									children: row.store.name
								}), row.store.isNew && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
									bg: C.badgeBlueBg,
									color: C.badgeBlueText,
									className: "ml-2",
									children: "New"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									style: {
										color: C.green,
										fontWeight: 600
									},
									children: formatPct(row.reduction)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
									width: "80",
									height: "20",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", {
										points: row.trend.map((v, i) => `${i * 12},${20 - v * .4}`).join(" "),
										fill: "none",
										stroke: row.store.isNew ? C.border : C.accent,
										strokeWidth: "1.5"
									})
								}) })
							]
						}, row.store.id);
					}) })]
				})]
			})
		]
	});
}
function StoreProfilePage({ state, dispatch }) {
	const store = state.stores.find((s) => s.id === state.storeProfileId);
	const [tab, setTab] = (0, import_react.useState)("overview");
	if (!store) return null;
	const n = nowOf(state);
	const batches = state.batches.filter((b) => b.storeId === store.id);
	const atRisk = batches.filter((b) => computeRSL(b, n).rslDays < 3).length;
	const waste = WASTE_INCIDENTS.filter((w) => w.storeId === store.id && w.date >= n - 7 * DAY).reduce((s, w) => s + w.cost, 0);
	const freshness = batches.length ? batches.reduce((s, b) => s + computeRSL(b, n).score, 0) / batches.length : 0;
	const tasks = state.tasks.filter((t) => t.storeId === store.id);
	const pending = tasks.filter((t) => t.status !== "done");
	const completed = tasks.filter((t) => t.status === "done");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: () => dispatch({ type: "BACK_FROM_PROFILE" }),
				className: "text-[13px] font-medium",
				style: { color: C.accent },
				children: "← Back to Dashboard"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start gap-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "w-20 h-20 rounded-2xl flex items-center justify-center overflow-hidden",
							style: { background: C.light },
							children: store.logoUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: store.logoUrl,
								alt: "",
								className: "w-full h-full object-cover"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[36px]",
								children: "🏪"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
										className: "text-[22px] font-bold",
										style: { color: C.text },
										children: store.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => dispatch({
											type: "TOGGLE_TIP",
											key: "storeProfile"
										}),
										className: "w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center",
										style: {
											background: C.light,
											color: C.accent
										},
										children: "?"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 mt-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
											bg: C.bg,
											color: C.text2,
											children: store.code
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
											bg: C.light,
											color: C.accent,
											children: store.tier
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-[12px]",
											style: { color: C.muted },
											children: ["Active since ", formatDate(store.activeSince)]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-[13px] mt-2",
									style: { color: C.text2 },
									children: [
										store.address,
										" · ",
										store.city,
										" · ",
										store.postcode
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-[13px]",
									style: { color: C.text2 },
									children: [
										"👤 ",
										store.manager,
										" · ",
										store.email
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
								onClick: () => dispatch({ type: "OPEN_STORE_MODAL" }),
								children: "Edit Store Profile"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
								kind: "primary",
								onClick: () => dispatch({
									type: "OPEN_PASSPORT_MODAL",
									prefilledStoreId: store.id
								}),
								children: "+ New Passport"
							})]
						})
					]
				}), state.tooltipsOpen.includes("storeProfile") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 p-3 rounded-lg text-[13px]",
					style: {
						background: C.light,
						borderLeft: `3px solid ${C.accent}`,
						color: C.primary
					},
					children: TIPS.storeProfile
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 md:grid-cols-4 gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "Active Passports",
						value: batches.length,
						accent: C.accent,
						onClick: () => {
							dispatch({
								type: "SET_STORE_FILTER",
								storeId: store.id
							});
							dispatch({
								type: "NAVIGATE",
								page: "passports"
							});
							dispatch({ type: "BACK_FROM_PROFILE" });
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "At Risk",
						value: atRisk,
						accent: C.red,
						onClick: () => {
							dispatch({
								type: "SET_STORE_FILTER",
								storeId: store.id
							});
							dispatch({
								type: "NAVIGATE",
								page: "rsl"
							});
							dispatch({ type: "BACK_FROM_PROFILE" });
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "Waste This Week",
						value: formatGBP(waste),
						accent: C.amber,
						onClick: () => {
							dispatch({
								type: "SET_STORE_FILTER",
								storeId: store.id
							});
							dispatch({
								type: "NAVIGATE",
								page: "analytics"
							});
							dispatch({ type: "BACK_FROM_PROFILE" });
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "Freshness",
						value: formatPct(freshness),
						accent: C.green,
						onClick: () => {
							dispatch({
								type: "SET_STORE_FILTER",
								storeId: store.id
							});
							dispatch({
								type: "NAVIGATE",
								page: "overview"
							});
							dispatch({ type: "BACK_FROM_PROFILE" });
						}
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabPills, {
						tabs: [
							{
								key: "overview",
								label: "Overview"
							},
							{
								key: "products",
								label: "Products"
							},
							{
								key: "performance",
								label: "Performance"
							},
							{
								key: "actions",
								label: "Actions"
							}
						],
						active: tab,
						onChange: setTab
					}),
					tab === "overview" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-1 lg:grid-cols-2 gap-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
								className: "text-[13px] font-semibold mb-2",
								style: { color: C.text },
								children: "Recent Activity"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "space-y-2",
								children: state.activity.filter((a) => a.storeId === store.id).slice(0, 5).map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 text-[13px]",
									style: { color: C.text2 },
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: ACT_ICON[a.type].icon }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "flex-1",
											children: a.text
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: {
												color: C.muted,
												fontSize: 11
											},
											children: timeAgo(a.ts)
										})
									]
								}, a.id))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => {
									dispatch({
										type: "SET_STORE_FILTER",
										storeId: store.id
									});
									dispatch({
										type: "NAVIGATE",
										page: "analytics"
									});
									dispatch({ type: "BACK_FROM_PROFILE" });
								},
								className: "text-[12px] mt-3",
								style: { color: C.accent },
								children: "See full waste analysis →"
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex justify-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FreshnessGauge, { score: freshness })
						})]
					}),
					tab === "products" && (batches.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "py-12 text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[40px]",
								children: "📦"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[14px] font-semibold mt-2",
								style: { color: C.text },
								children: "No passports yet"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => dispatch({
									type: "OPEN_PASSPORT_MODAL",
									prefilledStoreId: store.id
								}),
								className: "mt-2 px-3 py-1.5 rounded-lg text-[13px]",
								style: {
									background: C.accent,
									color: "#fff"
								},
								children: "+ Create first passport"
							})
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-[13px]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							style: {
								color: C.muted,
								fontSize: 11
							},
							className: "text-left",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-2",
									children: "Batch"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Product" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "RSL" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Status" })
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: batches.map((b) => {
							const r = computeRSL(b, n);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-t",
								style: { borderColor: C.border },
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-2 font-semibold cursor-pointer",
										style: { color: C.accent },
										onClick: () => dispatch({
											type: "OPEN_DRAWER",
											batchId: b.id
										}),
										children: b.id
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: b.product }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										style: { color: freshnessColor(r.score) },
										children: [r.rslDays, "d"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { score: r.score }) })
								]
							}, b.id);
						}) })]
					})),
					tab === "performance" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: 260,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
							data: Array.from({ length: 8 }, (_, i) => ({
								w: `W${i + 1}`,
								score: Math.max(40, freshness - i * 1.5 + Math.sin(i) * 5),
								bench: 70
							})),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									strokeDasharray: "3 3",
									stroke: C.border
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "w",
									tick: {
										fontSize: 11,
										fill: C.muted
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, { tick: {
									fontSize: 11,
									fill: C.muted
								} }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
									dataKey: "score",
									stroke: C.accent,
									strokeWidth: 2
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
									dataKey: "bench",
									stroke: C.muted,
									strokeDasharray: "4 4"
								})
							]
						})
					}) }),
					tab === "actions" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-1 lg:grid-cols-2 gap-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
							className: "text-[13px] font-semibold mb-2",
							style: { color: C.text },
							children: [
								"Pending (",
								pending.length,
								")"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-2",
							children: pending.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-2 rounded-lg text-[13px]",
								style: { background: C.bg },
								children: [
									t.type,
									" — ",
									t.product
								]
							}, t.id))
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
							className: "text-[13px] font-semibold mb-2",
							style: { color: C.text },
							children: [
								"Completed (",
								completed.length,
								")"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-2",
							children: completed.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-2 rounded-lg text-[13px]",
								style: {
									background: C.bg,
									opacity: .7
								},
								children: [
									"✓ ",
									t.type,
									" — ",
									t.product
								]
							}, t.id))
						})] })]
					})
				]
			})
		]
	});
}
var NAV = [
	{
		key: "overview",
		label: "Overview",
		icon: "▤"
	},
	{
		key: "passports",
		label: "Passports",
		icon: "📋"
	},
	{
		key: "rsl",
		label: "RSL Monitor",
		icon: "⏳"
	},
	{
		key: "analytics",
		label: "Waste Analytics",
		icon: "📊"
	},
	{
		key: "actions",
		label: "Action Engine",
		icon: "✓"
	},
	{
		key: "impact",
		label: "Impact",
		icon: "🌿"
	}
];
function Sidebar({ state, dispatch }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: `fixed inset-0 z-30 bg-black/40 transition-opacity md:hidden no-print ${state.isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`,
		onClick: () => dispatch({
			type: "TOGGLE_SIDEBAR",
			open: false
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: `fixed md:sticky top-0 left-0 h-screen w-[240px] bg-white border-r flex flex-col z-40 transition-transform no-print ${state.isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`,
		style: { borderColor: C.border },
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-5 flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "w-8 h-8 rounded-lg flex items-center justify-center text-[16px]",
						style: {
							background: C.primary,
							color: "#fff"
						},
						children: "🌱"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-bold text-[14px]",
						style: { color: C.text },
						children: "Freshness Passport"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => dispatch({
						type: "TOGGLE_SIDEBAR",
						open: false
					}),
					className: "md:hidden text-[18px]",
					style: { color: C.text2 },
					children: "×"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "flex-1 px-3 space-y-1",
				children: NAV.map((n) => {
					const active = state.activePage === n.key && !state.storeProfileId;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => {
							dispatch({
								type: "NAVIGATE",
								page: n.key
							});
							if (state.storeProfileId) dispatch({ type: "BACK_FROM_PROFILE" });
						},
						className: "w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 text-[13px] font-medium",
						style: {
							background: active ? C.light : "transparent",
							color: active ? C.accent : C.text2,
							borderLeft: `3px solid ${active ? C.accent : "transparent"}`
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: n.icon }), n.label]
					}, n.key);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "p-3 text-[11px]",
				style: { color: C.muted },
				children: "© Freshness Passport 2026"
			})
		]
	})] });
}
function Header({ state, dispatch }) {
	const ddRef = (0, import_react.useRef)(null);
	const bellRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const h = (e) => {
			if (state.storeDropdownOpen && ddRef.current && !ddRef.current.contains(e.target)) dispatch({
				type: "TOGGLE_STORE_DD",
				open: false
			});
			if (state.bellOpen && bellRef.current && !bellRef.current.contains(e.target)) dispatch({
				type: "TOGGLE_BELL",
				open: false
			});
		};
		document.addEventListener("mousedown", h);
		return () => document.removeEventListener("mousedown", h);
	}, [
		state.storeDropdownOpen,
		state.bellOpen,
		dispatch
	]);
	const notifs = getNotifications(state);
	const newCount = notifs.filter((nf) => nf.ts > state.notificationsReadAt).length;
	const activeStore = state.stores.find((s) => s.id === state.activeStoreFilter);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "sticky top-0 z-20 bg-white border-b px-4 md:px-6 py-3 flex items-center gap-3 no-print",
		style: { borderColor: C.border },
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: () => dispatch({ type: "TOGGLE_SIDEBAR" }),
				className: "md:hidden w-8 h-8 rounded text-[20px]",
				style: { color: C.text2 },
				children: "≡"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex-1" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				onClick: () => dispatch({
					type: "ADVANCE_TIME",
					days: 1
				}),
				className: "hidden md:flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] border",
				style: {
					borderColor: C.border,
					color: C.text2
				},
				children: ["⏩ Simulate +1 Day ", state.timeOffset > 0 && `(+${state.timeOffset / DAY}d)`]
			}),
			state.timeOffset > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: () => dispatch({ type: "RESET_TIME" }),
				className: "hidden md:flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] border",
				style: {
					borderColor: C.border,
					color: C.text2
				},
				children: "↺ Reset"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
				onClick: () => dispatch({ type: "OPEN_STORE_MODAL" }),
				children: "+ Add Store"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				ref: ddRef,
				className: "relative",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => dispatch({ type: "TOGGLE_STORE_DD" }),
					className: "px-3 py-2 rounded-lg text-[13px] border flex items-center gap-2",
					style: {
						borderColor: C.border,
						color: C.text
					},
					children: [activeStore ? activeStore.name : "All Stores", " ▾"]
				}), state.storeDropdownOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "absolute right-0 top-full mt-1 w-[280px] bg-white border rounded-xl shadow-lg z-50 max-h-[400px] overflow-auto",
					style: { borderColor: C.border },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => dispatch({
							type: "SET_STORE_FILTER",
							storeId: "all"
						}),
						className: "w-full text-left px-3 py-2 text-[13px] hover:bg-slate-50",
						style: { color: C.text },
						children: "All Stores"
					}), state.stores.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center border-t",
						style: { borderColor: C.border },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => dispatch({
								type: "SET_STORE_FILTER",
								storeId: s.id
							}),
							className: "flex-1 text-left px-3 py-2 text-[13px] hover:bg-slate-50",
							style: { color: C.text },
							children: s.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => dispatch({
								type: "OPEN_STORE_PROFILE",
								storeId: s.id
							}),
							className: "px-2 text-[11px]",
							style: { color: C.accent },
							title: "View profile",
							children: "→"
						})]
					}, s.id))]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				ref: bellRef,
				className: "relative",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => dispatch({ type: "TOGGLE_BELL" }),
					className: "relative w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-[16px]",
					style: { color: C.text2 },
					children: ["🔔", newCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "absolute top-0 right-0 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center",
						style: {
							background: C.red,
							color: "#fff"
						},
						children: newCount
					})]
				}), state.bellOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "absolute right-0 top-full mt-1 w-[320px] max-h-[400px] overflow-auto bg-white border rounded-xl shadow-lg z-50",
					style: { borderColor: C.border },
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-3 py-2 border-b flex items-center justify-between",
							style: { borderColor: C.border },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[12px] font-bold uppercase",
								style: { color: C.muted },
								children: "Notifications"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => dispatch({ type: "MARK_NOTIFS_READ" }),
								className: "text-[12px]",
								style: { color: C.accent },
								children: "Mark all as read"
							})]
						}),
						notifs.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "p-4 text-center text-[13px]",
							style: { color: C.muted },
							children: "No notifications"
						}),
						notifs.map((nf) => {
							const color = nf.kind === "expiry" ? C.red : nf.kind === "overdue" ? C.amber : C.accent;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => {
									if (nf.batchId) dispatch({
										type: "OPEN_DRAWER",
										batchId: nf.batchId
									});
									else if (nf.taskId) {
										dispatch({
											type: "NAVIGATE",
											page: "actions"
										});
										dispatch({
											type: "HIGHLIGHT_TASK",
											id: nf.taskId
										});
									}
									dispatch({
										type: "TOGGLE_BELL",
										open: false
									});
								},
								className: "w-full text-left px-3 py-2 border-b text-[13px] hover:bg-slate-50",
								style: {
									borderColor: C.border,
									borderLeft: `3px solid ${color}`,
									color: C.text
								},
								children: nf.text
							}, nf.id);
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserMenu, {})
		]
	});
}
function UserMenu() {
	const { session, signOut } = useSession();
	const [open, setOpen] = (0, import_react.useState)(false);
	const ref = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const h = (e) => {
			if (open && ref.current && !ref.current.contains(e.target)) setOpen(false);
		};
		document.addEventListener("mousedown", h);
		return () => document.removeEventListener("mousedown", h);
	}, [open]);
	if (!session) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold",
		style: {
			background: C.primary,
			color: "#fff"
		},
		children: "AV"
	});
	const initials = session.fullName.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "U";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref,
		className: "relative",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			onClick: () => setOpen((v) => !v),
			className: "w-9 h-9 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-slate-200 transition-all",
			title: session.fullName,
			children: session.avatarDataUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: session.avatarDataUrl,
				alt: "",
				className: "w-full h-full object-cover"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "w-full h-full grid place-items-center text-[12px] font-bold text-white",
				style: { background: session.role === "admin" ? "linear-gradient(135deg,#0f172a,#4338ca)" : "linear-gradient(135deg,#2563eb,#4f46e5)" },
				children: initials
			})
		}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "absolute right-0 top-full mt-2 w-[240px] bg-white border rounded-xl shadow-xl z-50 overflow-hidden",
			style: { borderColor: C.border },
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-3.5 py-3 border-b",
				style: { borderColor: C.border },
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[13px] font-semibold",
						style: { color: C.text },
						children: session.fullName
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[11px] truncate",
						style: { color: C.muted },
						children: session.email
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
						style: {
							background: session.role === "admin" ? "#FEF3C7" : "#DBEAFE",
							color: session.role === "admin" ? "#92400E" : "#1E40AF"
						},
						children: session.role === "admin" ? "Administrator" : session.storeName || "User"
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				onClick: () => {
					setOpen(false);
					signOut();
				},
				className: "w-full text-left px-3.5 py-2.5 text-[13px] hover:bg-rose-50 text-rose-600 flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
					width: "14",
					height: "14",
					viewBox: "0 0 24 24",
					fill: "none",
					stroke: "currentColor",
					strokeWidth: "2",
					strokeLinecap: "round",
					strokeLinejoin: "round",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", { points: "16 17 21 12 16 7" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
							x1: "21",
							y1: "12",
							x2: "9",
							y2: "12"
						})
					]
				}), "Sign out"]
			})]
		})]
	});
}
function Breadcrumb({ state, dispatch }) {
	const pageLabel = NAV.find((n) => n.key === state.activePage)?.label || "Overview";
	const activeStore = state.stores.find((s) => s.id === state.activeStoreFilter);
	const profile = state.stores.find((s) => s.id === state.storeProfileId);
	const drawerBatch = state.batches.find((b) => b.id === state.drawerBatchId);
	const prevLabel = NAV.find((n) => n.key === state.previousPage)?.label;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "bg-white border-b h-9 px-4 md:px-6 flex items-center gap-1 text-[13px] no-print",
		style: {
			borderColor: C.border,
			color: C.muted
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Freshness Passport" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "›" }),
			profile ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => dispatch({ type: "BACK_FROM_PROFILE" }),
					style: { color: C.accent },
					children: prevLabel
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "›" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					style: { color: C.text },
					children: ["Store Profile: ", profile.name]
				})
			] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				style: { color: C.text },
				children: pageLabel
			}), activeStore && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "›" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full",
				style: {
					background: C.light,
					color: C.accent
				},
				children: [
					"Filtered: ",
					activeStore.name,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => dispatch({
							type: "SET_STORE_FILTER",
							storeId: "all"
						}),
						className: "ml-1",
						children: "×"
					})
				]
			})] })] }),
			drawerBatch && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "›" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				style: { color: C.text },
				children: ["Passport: ", drawerBatch.id]
			})] })
		]
	});
}
function Toasts({ state, dispatch }) {
	(0, import_react.useEffect)(() => {
		const timers = state.toasts.map((t) => setTimeout(() => dispatch({
			type: "DISMISS_TOAST",
			id: t.id
		}), 3500));
		return () => timers.forEach(clearTimeout);
	}, [state.toasts, dispatch]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed top-4 right-4 z-[10001] space-y-2 no-print",
		style: { width: 320 },
		children: state.toasts.map((t) => {
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "bg-white rounded-lg shadow-lg p-3 text-[13px] flex items-center justify-between",
				style: {
					borderLeft: `4px solid ${t.kind === "success" ? C.green : t.kind === "error" ? C.red : C.accent}`,
					color: C.text
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.text }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => dispatch({
						type: "DISMISS_TOAST",
						id: t.id
					}),
					className: "ml-2 text-[14px]",
					style: { color: C.muted },
					children: "×"
				})]
			}, t.id);
		})
	});
}
function ActivityLogModal({ state, dispatch }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
		title: "Activity Log",
		onClose: () => dispatch({ type: "CLOSE_ACTIVITY_LOG" }),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-2 max-h-[60vh] overflow-auto",
			children: state.activity.map((a) => {
				const meta = ACT_ICON[a.type];
				const store = state.stores.find((s) => s.id === a.storeId);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3 p-2 rounded-lg",
					style: { background: C.bg },
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "w-7 h-7 rounded-full flex items-center justify-center text-[12px]",
							style: {
								background: `${meta.color}1A`,
								color: meta.color
							},
							children: meta.icon
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex-1 text-[13px]",
							style: { color: C.text },
							children: a.text
						}),
						store && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
							bg: C.badgeBlueBg,
							color: C.badgeBlueText,
							children: store.name.replace("Store #", "#")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[11px]",
							style: { color: C.muted },
							children: timeAgo(a.ts)
						})
					]
				}, a.id);
			})
		})
	});
}
function FreshnessPassport() {
	const { session } = useSession();
	const [state, dispatch] = (0, import_react.useReducer)(reducer, initialState, (init) => {
		if (!session || session.role === "admin" || !session.storeName) return init;
		if (init.stores.some((s) => s.name.toLowerCase() === session.storeName.toLowerCase())) return init;
		const id = `s${Date.now().toString(36)}`;
		const store = {
			id,
			code: session.storeName.slice(0, 3).toUpperCase().padEnd(3, "X") + "-01",
			name: session.storeName,
			city: "—",
			region: "—",
			address: "—",
			country: "—",
			postcode: "—",
			manager: session.fullName,
			email: session.email,
			phone: "—",
			activeSince: Date.now(),
			tier: "Pilot",
			type: "Supermarket"
		};
		return {
			...init,
			stores: [...init.stores, store],
			activeStoreFilter: id,
			activity: [{
				id: `a${Date.now()}`,
				ts: Date.now(),
				type: "store_created",
				text: `Welcome — store "${store.name}" linked to your account`,
				storeId: id
			}, ...init.activity]
		};
	});
	(0, import_react.useEffect)(() => {
		if (state.newPassportFlashId) {
			const t = setTimeout(() => dispatch({ type: "CLEAR_FLASH" }), 3e3);
			return () => clearTimeout(t);
		}
	}, [state.newPassportFlashId]);
	(0, import_react.useEffect)(() => {
		if (state.taskHighlightId) {
			const t = setTimeout(() => dispatch({
				type: "HIGHLIGHT_TASK",
				id: null
			}), 3e3);
			return () => clearTimeout(t);
		}
	}, [state.taskHighlightId]);
	(0, import_react.useEffect)(() => {
		const h = (e) => {
			if (e.key !== "Escape") return;
			if (state.passportModalOpen) dispatch({ type: "CLOSE_MODALS" });
			else if (state.storeModalOpen) dispatch({ type: "CLOSE_MODALS" });
			else if (state.activityLogOpen) dispatch({ type: "CLOSE_ACTIVITY_LOG" });
			else if (state.drawerBatchId) dispatch({ type: "CLOSE_DRAWER" });
			else if (state.bellOpen) dispatch({
				type: "TOGGLE_BELL",
				open: false
			});
			else if (state.storeDropdownOpen) dispatch({
				type: "TOGGLE_STORE_DD",
				open: false
			});
			else if (state.isSidebarOpen) dispatch({
				type: "TOGGLE_SIDEBAR",
				open: false
			});
		};
		document.addEventListener("keydown", h);
		return () => document.removeEventListener("keydown", h);
	}, [
		state.passportModalOpen,
		state.storeModalOpen,
		state.activityLogOpen,
		state.drawerBatchId,
		state.bellOpen,
		state.storeDropdownOpen,
		state.isSidebarOpen
	]);
	const renderPage = () => {
		if (state.storeProfileId) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StoreProfilePage, {
			state,
			dispatch
		});
		switch (state.activePage) {
			case "overview": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Overview, {
				state,
				dispatch
			});
			case "passports": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PassportsPage, {
				state,
				dispatch
			});
			case "rsl": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RSLPage, {
				state,
				dispatch
			});
			case "analytics": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WastePage, {
				state,
				dispatch
			});
			case "actions": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionsPage, {
				state,
				dispatch
			});
			case "impact": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImpactPage, {
				state,
				dispatch
			});
			default: return null;
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen flex",
		style: {
			background: C.bg,
			fontFamily: FONT,
			color: C.text
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { children: `
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
      ` }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sidebar, {
				state,
				dispatch
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 flex flex-col min-w-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {
						state,
						dispatch
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Breadcrumb, {
						state,
						dispatch
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
						className: "flex-1 p-4 md:p-8 max-w-[1400px] w-full mx-auto",
						children: renderPage()
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer, {
				state,
				dispatch
			}),
			state.storeModalOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StoreModal, {
				state,
				dispatch
			}),
			state.passportModalOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PassportModal, {
				state,
				dispatch
			}),
			state.activityLogOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActivityLogModal, {
				state,
				dispatch
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toasts, {
				state,
				dispatch
			})
		]
	});
}
var KEY = "fp_session_v1";
var ACCOUNTS_KEY = "fp_accounts_v1";
function loadAccounts() {
	try {
		return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "[]");
	} catch {
		return [];
	}
}
function saveAccounts(a) {
	localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(a));
}
function AuthGate({ children }) {
	const [session, setSession] = (0, import_react.useState)(null);
	const [ready, setReady] = (0, import_react.useState)(false);
	const [mode, setMode] = (0, import_react.useState)("login");
	(0, import_react.useEffect)(() => {
		try {
			const raw = localStorage.getItem(KEY);
			if (raw) setSession(JSON.parse(raw));
		} catch (e) {
			console.warn("AuthGate: failed to parse stored session", e);
		}
		setReady(true);
	}, []);
	function login(s) {
		localStorage.setItem(KEY, JSON.stringify(s));
		setSession(s);
	}
	function logout() {
		localStorage.removeItem(KEY);
		setSession(null);
		setMode("login");
	}
	if (!ready) return null;
	if (session) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SessionProvider, {
		value: {
			session,
			signOut: logout
		},
		children
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthShell, {
		mode,
		setMode,
		onLogin: login
	});
}
function AuthShell({ mode, setMode, onLogin }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen w-full bg-[#F0F2F5] flex flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "px-6 py-4 flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 grid place-items-center text-white shadow-md",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
						width: "20",
						height: "20",
						viewBox: "0 0 24 24",
						fill: "none",
						stroke: "currentColor",
						strokeWidth: "2.2",
						strokeLinecap: "round",
						strokeLinejoin: "round",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M12 2 5 6v6c0 5 3.5 8.5 7 10 3.5-1.5 7-5 7-10V6l-7-4Z" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "m9 12 2 2 4-4" })]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "leading-tight",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[15px] font-semibold text-slate-800 tracking-tight",
						children: "Freshness Passport"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[11px] text-slate-500",
						children: "Food Waste Intelligence Platform"
					})]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "hidden md:flex items-center gap-1 text-xs text-slate-500",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" }), "All systems operational"]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
			className: "flex-1 grid place-items-center px-4 py-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full max-w-[920px]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex justify-center mb-5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "inline-flex bg-white rounded-full p-1 shadow-sm border border-slate-200",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabBtn, {
									active: mode === "login",
									onClick: () => setMode("login"),
									children: "Sign In"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabBtn, {
									active: mode === "signup",
									onClick: () => setMode("signup"),
									children: "Create Account"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabBtn, {
									active: mode === "admin",
									onClick: () => setMode("admin"),
									children: "Admin"
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "bg-white rounded-2xl shadow-[0_8px_40px_-12px_rgba(15,23,42,0.15)] border border-slate-100 overflow-hidden",
						children: [
							mode === "login" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoginForm, {
								onLogin,
								switchToSignup: () => setMode("signup")
							}),
							mode === "signup" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignupForm, {
								onLogin,
								switchToLogin: () => setMode("login")
							}),
							mode === "admin" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminForm, { onLogin })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-center text-[11px] text-slate-400 mt-5",
						children: "Demo environment · Visual prototype · No data is transmitted"
					})
				]
			})
		})]
	});
}
function TabBtn({ active, onClick, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		onClick,
		className: `px-5 py-2 text-sm rounded-full transition-all ${active ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md font-semibold" : "text-slate-600 hover:text-slate-900 font-medium"}`,
		children
	});
}
function Field({ label, children, hint, className = "" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: `block ${className}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[12px] font-semibold text-slate-700 mb-1.5 tracking-tight",
				children: label
			}),
			children,
			hint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[10.5px] text-slate-400 mt-1",
				children: hint
			})
		]
	});
}
var inputCls = "w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400";
function LoginForm({ onLogin, switchToSignup }) {
	const [email, setEmail] = (0, import_react.useState)("");
	const [pwd, setPwd] = (0, import_react.useState)("");
	const [err, setErr] = (0, import_react.useState)("");
	const [forgot, setForgot] = (0, import_react.useState)(false);
	function submit(e) {
		e.preventDefault();
		setErr("");
		if (!email || !pwd) return setErr("Please enter your email and password.");
		const found = loadAccounts().find((a) => a.email.toLowerCase() === email.toLowerCase());
		if (found && found.password !== pwd) return setErr("Incorrect password.");
		onLogin({
			email,
			fullName: found?.fullName || email.split("@")[0],
			role: "user",
			storeName: found?.storeName,
			avatarDataUrl: found?.avatarDataUrl
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-8 py-9 md:px-12 md:py-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-center mb-7",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs font-bold text-blue-600 tracking-[0.18em] mb-1.5",
						children: "WELCOME BACK"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-2xl font-bold text-slate-900 tracking-tight",
						children: "Sign in to your dashboard"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-slate-500 mt-1.5",
						children: "Access freshness analytics for your stores"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: submit,
				className: "max-w-sm mx-auto space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Email Address",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "email",
							value: email,
							onChange: (e) => setEmail(e.target.value),
							placeholder: "you@retailer.com",
							className: inputCls,
							autoFocus: true
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
						label: "Password",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "password",
							value: pwd,
							onChange: (e) => setPwd(e.target.value),
							placeholder: "••••••••••••",
							className: inputCls
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setForgot(true),
							className: "text-[11px] text-blue-600 hover:underline mt-1.5",
							children: "Forgot password?"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-[11px] text-slate-500 bg-blue-50/60 border border-blue-100 rounded-lg px-3 py-2 leading-relaxed",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-semibold text-blue-700",
							children: "Demo mode:"
						}), " any email & password works. Create an account to personalize your dashboard with your store."]
					}),
					err && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2 rounded-lg",
						children: err
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "submit",
						className: "w-full py-2.5 mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all",
						children: "Sign In →"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-center text-xs text-slate-500 pt-2",
						children: [
							"New here?",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: switchToSignup,
								className: "text-blue-600 font-semibold hover:underline",
								children: "Create your account"
							})
						]
					})
				]
			}),
			forgot && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ForgotPasswordModal, {
				onClose: () => setForgot(false),
				defaultEmail: email
			})
		]
	});
}
function ForgotPasswordModal({ onClose, defaultEmail }) {
	const [email, setEmail] = (0, import_react.useState)(defaultEmail);
	const [sent, setSent] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm grid place-items-center p-4",
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6",
			onClick: (e) => e.stopPropagation(),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between mb-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-base font-bold text-slate-900",
					children: "Reset your password"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: onClose,
					className: "text-slate-400 hover:text-slate-700 text-xl leading-none",
					children: "×"
				})]
			}), !sent ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-slate-500 mb-4",
					children: "Enter your email and we'll send a reset link (simulated in this demo)."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "email",
					value: email,
					onChange: (e) => setEmail(e.target.value),
					placeholder: "you@retailer.com",
					className: inputCls,
					autoFocus: true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => email && setSent(true),
					className: "w-full mt-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-lg shadow hover:shadow-md transition-all",
					children: "Send reset link"
				})
			] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-center py-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mx-auto h-12 w-12 rounded-full bg-emerald-100 grid place-items-center mb-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
							width: "22",
							height: "22",
							viewBox: "0 0 24 24",
							fill: "none",
							stroke: "currentColor",
							strokeWidth: "2.5",
							className: "text-emerald-600",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", { points: "20 6 9 17 4 12" })
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-sm font-semibold text-slate-800",
						children: "Check your inbox"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-xs text-slate-500 mt-1",
						children: [
							"A reset link has been sent to",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium text-slate-700",
								children: email
							}),
							"."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onClose,
						className: "mt-4 text-xs font-semibold text-blue-600 hover:underline",
						children: "Back to sign in"
					})
				]
			})]
		})
	});
}
function SignupForm({ onLogin, switchToLogin }) {
	const [tab, setTab] = (0, import_react.useState)("essentials");
	const [err, setErr] = (0, import_react.useState)("");
	const [form, setForm] = (0, import_react.useState)({
		fullName: "",
		email: "",
		password: "",
		confirm: "",
		role: "Store Manager",
		storeName: "",
		storeType: "Supermarket",
		city: "",
		country: "United Kingdom",
		storeSize: "Medium (1,000–3,000 m²)",
		unitSystem: "Metric (kg, °C)",
		language: "English",
		notifications: true,
		avatarDataUrl: ""
	});
	const avatarInputRef = (0, import_react.useRef)(null);
	function pickAvatar(file) {
		if (!file) return;
		if (file.size > 2 * 1024 * 1024) return setErr("Avatar must be under 2MB.");
		const reader = new FileReader();
		reader.onload = () => setForm((f) => ({
			...f,
			avatarDataUrl: String(reader.result)
		}));
		reader.readAsDataURL(file);
	}
	const set = (k, v) => setForm((f) => ({
		...f,
		[k]: v
	}));
	const tabs = [
		{
			id: "essentials",
			label: "Essentials",
			icon: "👤"
		},
		{
			id: "store",
			label: "Store Details",
			icon: "🏪"
		},
		{
			id: "prefs",
			label: "Preferences",
			icon: "⚙️"
		}
	];
	function next() {
		setErr("");
		if (tab === "essentials") {
			if (!form.fullName || !form.email || !form.password) return setErr("Please fill in name, email and password.");
			if (form.password.length < 6) return setErr("Password must be at least 6 characters.");
			if (form.password !== form.confirm) return setErr("Passwords don't match.");
			setTab("store");
		} else if (tab === "store") {
			if (!form.storeName || !form.city) return setErr("Please enter your store name and city.");
			setTab("prefs");
		}
	}
	function submit() {
		setErr("");
		const accounts = loadAccounts();
		if (accounts.some((a) => a.email.toLowerCase() === form.email.toLowerCase())) return setErr("An account with that email already exists.");
		const account = { ...form };
		saveAccounts([...accounts, account]);
		onLogin({
			email: form.email,
			fullName: form.fullName,
			role: "user",
			storeName: form.storeName,
			avatarDataUrl: form.avatarDataUrl || void 0
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-6 py-8 md:px-10 md:py-10 bg-gradient-to-b from-white to-slate-50/50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-center mb-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xs font-bold text-blue-600 tracking-[0.18em] mb-1",
					children: "CREATE YOUR ACCOUNT"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-bold text-slate-900 tracking-tight",
					children: "Set up your Freshness Passport"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex justify-center mb-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "inline-flex bg-slate-100 rounded-full p-1",
					children: tabs.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setTab(t.id),
						className: `px-4 md:px-5 py-1.5 text-[13px] rounded-full transition-all flex items-center gap-1.5 ${tab === t.id ? "bg-blue-600 text-white font-semibold shadow-sm" : "text-slate-500 hover:text-slate-800 font-medium"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[11px]",
							children: t.icon
						}), t.label]
					}, t.id))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "bg-slate-100/60 rounded-2xl p-6 md:p-8 min-h-[340px]",
				children: [
					tab === "essentials" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col md:flex-row gap-8 items-start",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mx-auto md:mx-0 flex-shrink-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-32 w-32 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 grid place-items-center text-white text-4xl font-bold shadow-md overflow-hidden",
										children: form.avatarDataUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											src: form.avatarDataUrl,
											alt: "avatar",
											className: "h-full w-full object-cover"
										}) : (form.fullName || "?").charAt(0).toUpperCase()
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										ref: avatarInputRef,
										type: "file",
										accept: "image/*",
										className: "hidden",
										onChange: (e) => pickAvatar(e.target.files?.[0])
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => avatarInputRef.current?.click(),
										className: "absolute bottom-1 right-1 h-8 w-8 rounded-full bg-white border border-slate-200 grid place-items-center shadow-md hover:bg-slate-50",
										title: "Upload photo",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
											width: "14",
											height: "14",
											viewBox: "0 0 24 24",
											fill: "none",
											stroke: "currentColor",
											strokeWidth: "2",
											className: "text-slate-600",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M12 20h9" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" })]
										})
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[10.5px] text-slate-500 text-center mt-2 max-w-[8rem]",
								children: "Click pencil to upload"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1 w-full space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Full Name",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										value: form.fullName,
										onChange: (e) => set("fullName", e.target.value),
										placeholder: "Enter",
										className: inputCls
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Email Address",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "email",
											value: form.email,
											onChange: (e) => set("email", e.target.value),
											placeholder: "you@retailer.com",
											className: inputCls
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Role",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											value: form.role,
											onChange: (e) => set("role", e.target.value),
											className: inputCls,
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Store Manager" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Regional Manager" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Sustainability Lead" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Operations Director" })
											]
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Password",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "password",
											value: form.password,
											onChange: (e) => set("password", e.target.value),
											placeholder: "••••••••",
											className: inputCls
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Confirm Password",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "password",
											value: form.confirm,
											onChange: (e) => set("confirm", e.target.value),
											placeholder: "••••••••",
											className: inputCls
										})
									})]
								})
							]
						})]
					}),
					tab === "store" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Store Name",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: form.storeName,
									onChange: (e) => set("storeName", e.target.value),
									placeholder: "e.g. Fresh Market — Notting Hill",
									className: inputCls
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Store Type",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										value: form.storeType,
										onChange: (e) => set("storeType", e.target.value),
										className: inputCls,
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Supermarket" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Hypermarket" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Convenience Store" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Discount Store" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Distribution Center" })
										]
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Store Size",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										value: form.storeSize,
										onChange: (e) => set("storeSize", e.target.value),
										className: inputCls,
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Small (< 1,000 m²)" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Medium (1,000–3,000 m²)" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Large (3,000–6,000 m²)" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Extra Large (> 6,000 m²)" })
										]
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "City",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										value: form.city,
										onChange: (e) => set("city", e.target.value),
										placeholder: "London",
										className: inputCls
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Country",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										value: form.country,
										onChange: (e) => set("country", e.target.value),
										className: inputCls,
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "United Kingdom" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Ireland" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "France" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Germany" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Spain" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Italy" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Netherlands" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "United States" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "India" })
										]
									})
								})]
							})
						]
					}),
					tab === "prefs" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Unit System",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										value: form.unitSystem,
										onChange: (e) => set("unitSystem", e.target.value),
										className: inputCls,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Metric (kg, °C)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Imperial (lb, °F)" })]
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Language",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										value: form.language,
										onChange: (e) => set("language", e.target.value),
										className: inputCls,
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "English" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Français" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Deutsch" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Español" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Italiano" })
										]
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-blue-300 transition-colors",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: form.notifications,
									onChange: (e) => set("notifications", e.target.checked),
									className: "mt-0.5 h-4 w-4 accent-blue-600"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-sm font-semibold text-slate-800",
									children: "Email me freshness alerts"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs text-slate-500 mt-0.5",
									children: "Get notified when batches drop below 30% RSL or cold-chain excursions occur."
								})] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11px] text-slate-500 bg-blue-50/50 border border-blue-100 rounded-lg p-3",
								children: "By creating an account you agree to our demo Terms of Service & Privacy Policy. No real data is collected."
							})
						]
					})
				]
			}),
			err && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "max-w-md mx-auto mt-4 text-xs text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2 rounded-lg text-center",
				children: err
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between mt-6 max-w-md mx-auto",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: switchToLogin,
					className: "text-xs text-slate-500 hover:text-slate-800 font-medium",
					children: "← Already have an account?"
				}), tab !== "prefs" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: next,
					className: "px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all",
					children: "Continue →"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: submit,
					className: "px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all",
					children: "Create Account ✓"
				})]
			})
		]
	});
}
function AdminForm({ onLogin }) {
	const [email, setEmail] = (0, import_react.useState)("");
	const [pwd, setPwd] = (0, import_react.useState)("");
	const [code, setCode] = (0, import_react.useState)("");
	const [err, setErr] = (0, import_react.useState)("");
	function submit(e) {
		e.preventDefault();
		setErr("");
		if (!email || !pwd || !code) return setErr("All fields are required.");
		if (code !== "FP-ADMIN-2026") return setErr("Invalid administrator access code.");
		onLogin({
			email,
			fullName: email.split("@")[0],
			role: "admin"
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid md:grid-cols-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white p-8 md:p-10 relative overflow-hidden",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 opacity-10",
				style: {
					backgroundImage: "radial-gradient(circle at 20% 20%, white 1px, transparent 1px)",
					backgroundSize: "24px 24px"
				}
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/10 backdrop-blur rounded-full text-[10px] font-bold tracking-[0.15em] mb-5 border border-white/20",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" }), "RESTRICTED ACCESS"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-2xl font-bold tracking-tight mb-2",
						children: "Administrator Console"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-slate-300 leading-relaxed mb-6",
						children: "Manage stores, users, role assignments and platform-wide settings for the Freshness Passport network."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "space-y-2.5 text-xs text-slate-300",
						children: [
							"Cross-store analytics & audit logs",
							"User & role management",
							"Tooltip and seed-data registry",
							"Platform configuration & integrations"
						].map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
								width: "14",
								height: "14",
								viewBox: "0 0 24 24",
								fill: "none",
								stroke: "currentColor",
								strokeWidth: "2.5",
								className: "text-emerald-400",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", { points: "20 6 9 17 4 12" })
							}), x]
						}, x))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute bottom-0 right-0 opacity-20",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
							width: "120",
							height: "120",
							viewBox: "0 0 24 24",
							fill: "none",
							stroke: "currentColor",
							strokeWidth: "1.2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M12 2 5 6v6c0 5 3.5 8.5 7 10 3.5-1.5 7-5 7-10V6l-7-4Z" })
						})
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: submit,
			className: "p-8 md:p-10 space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xs font-bold text-indigo-600 tracking-[0.18em] mb-1",
					children: "ADMIN SIGN IN"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-xl font-bold text-slate-900 tracking-tight",
					children: "Verify your credentials"
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Administrator Email",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "email",
						value: email,
						onChange: (e) => setEmail(e.target.value),
						placeholder: "admin@freshness.io",
						className: inputCls
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Password",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "password",
						value: pwd,
						onChange: (e) => setPwd(e.target.value),
						placeholder: "••••••••",
						className: inputCls
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Access Code",
					hint: "Demo code: FP-ADMIN-2026",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: code,
						onChange: (e) => setCode(e.target.value),
						placeholder: "FP-ADMIN-XXXX",
						className: `${inputCls} font-mono tracking-wider uppercase`
					})
				}),
				err && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xs text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2 rounded-lg",
					children: err
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "submit",
					className: "w-full py-2.5 bg-gradient-to-r from-slate-900 to-indigo-700 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
						width: "14",
						height: "14",
						viewBox: "0 0 24 24",
						fill: "none",
						stroke: "currentColor",
						strokeWidth: "2.2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
							x: "3",
							y: "11",
							width: "18",
							height: "11",
							rx: "2"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M7 11V7a5 5 0 0 1 10 0v4" })]
					}), "Enter Admin Console"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[10.5px] text-slate-400 text-center leading-relaxed",
					children: "All administrator actions are logged. Unauthorized access is prohibited."
				})
			]
		})]
	});
}
function Page() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthGate, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FreshnessPassport, {}) });
}
//#endregion
export { Page as component };
