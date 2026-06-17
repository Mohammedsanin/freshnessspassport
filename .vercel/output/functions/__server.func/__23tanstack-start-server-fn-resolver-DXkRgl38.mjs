//#region node_modules/.nitro/vite/services/ssr/assets/__23tanstack-start-server-fn-resolver-DXkRgl38.js
var manifest = { "bd0a0761b3d8235512adf548d610bdcbba1fc66e5b5b5dd9a24c61fa4157e4a7": {
	functionName: "scanBill_createServerFn_handler",
	importer: () => import("./_ssr/scan-bill.functions-Ci2Filnt.mjs")
} };
async function getServerFnById(id, access) {
	const serverFnInfo = manifest[id];
	if (!serverFnInfo) throw new Error("Server function info not found for " + id);
	const fnModule = serverFnInfo.module ?? await serverFnInfo.importer();
	if (!fnModule) throw new Error("Server function module not resolved for " + id);
	const action = fnModule[serverFnInfo.functionName];
	if (!action) throw new Error("Server function module export not resolved for serverFn ID: " + id);
	return action;
}
//#endregion
export { getServerFnById as t };
