import { stations } from "../data/mockData";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA !== "false";

async function request(path, options) {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}`,
    );
  }
  return response.json();
}

export const stationApi = {
  async getStations() {
    if (USE_MOCK_DATA) {
      return stations;
    }
    return request("/stations");
  },
};
