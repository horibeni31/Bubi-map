import { hourlyUsage, timeline, weeklyUsage } from "../data/mockData";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA !== "false";

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
    if (USE_MOCK_DATA) {
      const offset = (stationId % 4) - 1;

      return timeline.map((point, index) => ({
        ...point,
        bikes: Math.max(0, point.bikes + offset * 2 + (stationId % 3)),
        docks: Math.max(0, point.docks - offset + ((index + stationId) % 2)),
      }));
    }
    return request(`/stations/${stationId}/history`);
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
