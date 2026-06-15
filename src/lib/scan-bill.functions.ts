import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  base64: z.string().min(10),
  mediaType: z.enum(["application/pdf", "image/jpeg", "image/png"]),
  fileName: z.string().optional(),
});

const PROMPT = `You are extracting data from a supplier delivery note, invoice, or goods received note (GRN) for a food retail freshness tracking system.

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

export const scanBill = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => InputSchema.parse(d))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY not configured");

    const dataUrl = `data:${data.mediaType};base64,${data.base64}`;
    const contentBlock =
      data.mediaType === "application/pdf"
        ? { type: "file", file: { filename: data.fileName || "bill.pdf", file_data: dataUrl } }
        : { type: "image_url", image_url: { url: dataUrl } };

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "user",
            content: [contentBlock, { type: "text", text: PROMPT }],
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      if (res.status === 429) throw new Error("Rate limit reached — please retry shortly.");
      if (res.status === 402) throw new Error("AI credits exhausted — please upgrade your workspace.");
      throw new Error(`Gateway error ${res.status}: ${errText.slice(0, 200)}`);
    }

    const payload = await res.json();
    const raw: string = payload?.choices?.[0]?.message?.content ?? "";
    let cleaned = raw.trim();
    // Strip code fences if any
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
    // Extract first {...} block as a fallback
    if (!cleaned.startsWith("{")) {
      const m = cleaned.match(/\{[\s\S]*\}/);
      if (m) cleaned = m[0];
    }

    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("scanBill: unparseable JSON", raw);
      throw new Error("Could not parse extraction result");
    }

    return { extracted: parsed };
  });
