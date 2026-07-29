import { request } from "./api";

export const aiService = {
  /** Send an image for breeding-site classification. */
  predict: (file, meta = {}) => {
    const formData = new FormData();
    formData.append("image", file);
    Object.entries(meta).forEach(([key, value]) => formData.append(key, value));
    return request({
      url: "/ai/predict",
      method: "post",
      data: formData,
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  prediction: (reportId) => request({ url: `/ai/predictions/${reportId}` }),
  accuracy: (params) => request({ url: "/ai/accuracy", params }),
  feedback: (reportId, payload) =>
    request({ url: `/ai/predictions/${reportId}/feedback`, method: "post", data: payload }),
};

export default aiService;
