import { request } from "./api";

export const reportService = {
  list: (params) => request({ url: "/reports", params }),
  byId: (id) => request({ url: `/reports/${id}` }),
  updateStatus: (id, status, comments) =>
    request({
      url: `/reports/${id}/status`,
      method: "patch",
      data: { status, comments },
    }),
  monthly: (params) => request({ url: "/reports/monthly", params }),
  /** `format` is one of "pdf" | "excel" | "csv". */
  export: (format, params) =>
    request({ url: `/reports/export/${format}`, params, responseType: "blob" }),
};

export default reportService;
