import { apiRequest } from "./queryClient";

export interface NavigateRequest {
  url: string;
}

export interface ScreenshotRequest {
  url: string;
  fullPage?: boolean;
  width?: number;
  height?: number;
}

export interface ContentRequest {
  url: string;
  selector?: string;
}

export interface ScriptRequest {
  script: string;
  url: string;
}

export const proxyApi = {
  navigate: async (data: NavigateRequest) => {
    const response = await apiRequest("POST", "/api/proxy/navigate", data);
    return response.json();
  },

  takeScreenshot: async (data: ScreenshotRequest) => {
    const response = await apiRequest("POST", "/api/proxy/screenshot", data);
    return response.json();
  },

  extractContent: async (data: ContentRequest) => {
    const response = await apiRequest("POST", "/api/proxy/content", data);
    return response.json();
  },

  injectScript: async (data: ScriptRequest) => {
    const response = await apiRequest("POST", "/api/proxy/inject", data);
    return response.json();
  },

  getHistory: async () => {
    const response = await apiRequest("GET", "/api/proxy/history");
    return response.json();
  },

  clearHistory: async () => {
    const response = await apiRequest("DELETE", "/api/proxy/history");
    return response.json();
  },

  getScripts: async () => {
    const response = await apiRequest("GET", "/api/scripts");
    return response.json();
  },

  createScript: async (data: { name: string; description?: string; content: string }) => {
    const response = await apiRequest("POST", "/api/scripts", data);
    return response.json();
  },

  deleteScript: async (id: number) => {
    const response = await apiRequest("DELETE", `/api/scripts/${id}`);
    return response.json();
  }
};
