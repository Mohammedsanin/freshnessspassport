import { c as createServerFn, i as TSS_SERVER_FUNCTION } from "./esm-I6x-3bX5.mjs";
import { n as objectType, r as stringType, t as enumType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/scan-bill.functions-Ci2Filnt.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var InputSchema = objectType({
	base64: stringType().min(10),
	mediaType: enumType([
		"application/pdf",
		"image/jpeg",
		"image/png"
	]),
	fileName: stringType().optional()
});
var PROMPT = `You are extracting data from a supplier delivery note, invoice, or goods received note (GRN) for a food retail freshness tracking system.

Extract ONLY the following fields and return them as a SINGLE FLAT JSON object with NO explanation, NO markdown, NO preamble — just raw JSON.

Single-product schema:
{
  "productName": "full product name" | null,
  "sku": "product code or SKU or barcode" | null,
  "batchId": "batch number or lot number" | null,
  "category": "Produce" | "Dairy" | "Bakery" | "Ready Meals" | "Meat & Fish" | "Frozen" | "Dry Goods" | null,
  "units": integer | null,
  "weight": "unit weight or size e.g. 250g" | null,
  "supplier": "supplier or vendor name" | null,
  "origin": "country of origin" | null,
  "productionDate": "DD-MM-YYYY" | null,
  "printedExpiry": "DD-MM-YYYY" | null,
  "baseShelfLife": integer (Produce=7, Dairy=10, Bakery=5, Ready Meals=4, Meat & Fish=3, Frozen=90, Dry Goods=180),
  "storageTemp": integer °C | null,
  "deliveryDate": "DD-MM-YYYY" | null,
  "invoiceNumber": "invoice or PO number" | null,
  "confidence": "high" | "medium" | "low"
}

If the document contains MORE THAN ONE product line, return instead:
{ "multiProduct": true, "products": [ {...single-product schema...}, ... ], "invoiceNumber": "...", "confidence": "high"|"medium"|"low" }

If a field is not found, use null. Never guess product names. Category must be one of the exact strings listed. If the document is not a delivery note / invoice / GRN, return all nulls with confidence "low". Return ONLY the JSON.`;
var scanBill_createServerFn_handler = createServerRpc({
	id: "bd0a0761b3d8235512adf548d610bdcbba1fc66e5b5b5dd9a24c61fa4157e4a7",
	name: "scanBill",
	filename: "src/lib/scan-bill.functions.ts"
}, (opts) => scanBill.__executeServer(opts));
var scanBill = createServerFn({ method: "POST" }).inputValidator((d) => InputSchema.parse(d)).handler(scanBill_createServerFn_handler, async ({ data }) => {
	const key = process.env.LOVABLE_API_KEY;
	if (!key) throw new Error("LOVABLE_API_KEY not configured");
	const dataUrl = `data:${data.mediaType};base64,${data.base64}`;
	const contentBlock = data.mediaType === "application/pdf" ? {
		type: "file",
		file: {
			filename: data.fileName || "bill.pdf",
			file_data: dataUrl
		}
	} : {
		type: "image_url",
		image_url: { url: dataUrl }
	};
	const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Lovable-API-Key": key
		},
		body: JSON.stringify({
			model: "google/gemini-3-flash-preview",
			messages: [{
				role: "user",
				content: [contentBlock, {
					type: "text",
					text: PROMPT
				}]
			}],
			response_format: { type: "json_object" }
		})
	});
	if (!res.ok) {
		const errText = await res.text().catch(() => "");
		if (res.status === 429) throw new Error("Rate limit reached — please retry shortly.");
		if (res.status === 402) throw new Error("AI credits exhausted — please upgrade your workspace.");
		throw new Error(`Gateway error ${res.status}: ${errText.slice(0, 200)}`);
	}
	const raw = (await res.json())?.choices?.[0]?.message?.content ?? "";
	let cleaned = raw.trim();
	cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
	if (!cleaned.startsWith("{")) {
		const m = cleaned.match(/\{[\s\S]*\}/);
		if (m) cleaned = m[0];
	}
	let parsed;
	try {
		parsed = JSON.parse(cleaned);
	} catch {
		console.error("scanBill: unparseable JSON", raw);
		throw new Error("Could not parse extraction result");
	}
	return { extracted: parsed };
});
//#endregion
export { scanBill_createServerFn_handler };
