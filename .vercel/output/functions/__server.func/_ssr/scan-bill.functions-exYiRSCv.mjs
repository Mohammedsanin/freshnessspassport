import { c as createServerFn, i as TSS_SERVER_FUNCTION } from "./esm-I6x-3bX5.mjs";
import { n as objectType, r as stringType, t as enumType } from "../_libs/zod.mjs";
import { t as getServerFnById } from "../__23tanstack-start-server-fn-resolver-DXkRgl38.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/scan-bill.functions-exYiRSCv.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
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
var scanBill = createServerFn({ method: "POST" }).inputValidator((d) => InputSchema.parse(d)).handler(createSsrRpc("bd0a0761b3d8235512adf548d610bdcbba1fc66e5b5b5dd9a24c61fa4157e4a7"));
//#endregion
export { scanBill };
