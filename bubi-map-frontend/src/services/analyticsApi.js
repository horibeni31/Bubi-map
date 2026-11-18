import { hourlyUsage, timeline, weeklyUsage } from "../data/mockData";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
// The backend has no analytics endpoints yet, so these stay on mock data
// unless explicitly turned off.
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_ANALYTICS !== "false";

export const isAnalyticsMock = USE_MOCK_DATA;
export const isStationHistoryMock = false;

async function request(path) {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}`,
    );
  }
  return response.json();
}

export const analyticsApi = {
  async getOverview() {
    if (USE_MOCK_DATA) {
      return { timeline, hourlyUsage, weeklyUsage };
    }
    return request("/analytics/overview");
  },
  async getStationHistory(stationId) {
    const response = await request(`/stations/${stationId}/history`);
    return response.history;
  },
  async getStationUtilization(stationId) {
    if (USE_MOCK_DATA) {
      return Math.min(92, 48 + ((stationId * 11) % 35));
    }
    const response = await request(`/stations/${stationId}/utilization`);
    return response.value;
  },
  async getStationEvents(stationId) {
    if (USE_MOCK_DATA) {
      return Array.from({ length: 35 }, (_, index) => ({
        intensity: (index * (stationId + 2) + stationId) % 5,
      }));
    }
    return request(`/stations/${stationId}/events`);
  },
};
