import { stations } from "../data/mockData";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === "true";

export const isStationDataMock = USE_MOCK_DATA;

async function request(path, options) {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}`,
    );
  }
  return response.json();
}

function getStatus(bikes, docks, capacity) {
  if (bikes === 0) return "empty";
  if (docks === 0) return "full";
  if (capacity && bikes / capacity < 0.25) return "low";
  return "normal";
}

// Convert a backend station into the shape the UI components use.
function toUiStation(station) {
  const bikes = station.num_bikes_available ?? 0;
  const docks = station.num_docks_available ?? 0;
  const capacity = station.capacity ?? bikes + docks;
  return {
    id: Number(station.station_id),
    name: station.name,
    address: station.address,
    position: [station.lat, station.lon],
    bikes,
    docks,
    capacity,
    status: getStatus(bikes, docks, capacity),
    lastReported: station.last_reported,
  };
}

export const stationApi = {
  async getStations() {
    if (USE_MOCK_DATA) {
      return stations;
    }
    const data = await request("/stations");
    return data.stations.map(toUiStation);
  },
  async getStation(stationId) {
    if (USE_MOCK_DATA) {
      return stations.find((station) => station.id === Number(stationId));
    }
    return toUiStation(await request(`/station/${stationId}`));
  },
};
