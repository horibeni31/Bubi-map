import { useEffect, useState } from "react";
import { SectionTitle } from "../common/SectionTitle";
import { TimelineChart } from "./Charts";
import { analyticsApi, isStationHistoryMock } from "../../services/analyticsApi";
import { MockWatermark } from "../common/MockWatermark";

const TIME_RANGES = [
  { value: "3h", label: "3 óra" },
  { value: "6h", label: "6 óra" },
  { value: "24h", label: "24 óra" },
  { value: "available", label: "Elérhető adatok" },
];

export function StationTimelinePanel({
  stations,
  selectedStation,
  onSelect,
  height = 220,
  compact = false,
}) {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [range, setRange] = useState("available");

  useEffect(() => {
    let isCurrentRequest = true;

    setIsLoading(true);
    setError(null);
    setHistory([]);
    analyticsApi
      .getStationHistory(selectedStation.id)
      .then((loadedHistory) => {
        if (isCurrentRequest) {
          setHistory(loadedHistory);
        }
      })
      .catch((requestError) => {
        if (isCurrentRequest) {
          setError(requestError);
        }
      })
      .finally(() => {
        if (isCurrentRequest) {
          setIsLoading(false);
        }
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [selectedStation.id]);

  const chartHistory = [...history];
  const stationTimestamp = Date.parse(
    selectedStation.feedUpdatedAt || selectedStation.lastReported || "",
  );
  const latestHistoryTimestamp = chartHistory.length
    ? Number(chartHistory[chartHistory.length - 1].timestamp)
    : -Infinity;
  if (
    Number.isFinite(stationTimestamp) &&
    stationTimestamp >= latestHistoryTimestamp
  ) {
    const stationSnapshot = {
      timestamp: stationTimestamp,
      time: new Date(stationTimestamp).toLocaleTimeString("hu-HU", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      bikes: selectedStation.bikes,
      docks: selectedStation.docks,
    };
    const existingIndex = chartHistory.findIndex(
      (point) => Number(point.timestamp) === stationTimestamp,
    );
    if (existingIndex >= 0) chartHistory[existingIndex] = stationSnapshot;
    else chartHistory.push(stationSnapshot);
  }
  chartHistory.sort((a, b) => Number(a.timestamp) - Number(b.timestamp));

  const latestSnapshot = chartHistory[chartHistory.length - 1];
  const bikes = latestSnapshot?.bikes ?? selectedStation.bikes;
  const docks = latestSnapshot?.docks ?? selectedStation.docks;
  const capacity = selectedStation.capacity ?? bikes + docks;
  const occupancy = capacity > 0 ? Math.round((bikes / capacity) * 100) : 0;
  const lastUpdated = latestSnapshot?.timestamp
    ? Number(latestSnapshot.timestamp)
    : stationTimestamp;
  const isStale =
    Number.isFinite(lastUpdated) && Date.now() - lastUpdated > 15 * 60 * 1000;
  const formattedLastUpdated = Number.isFinite(lastUpdated)
    ? new Date(lastUpdated).toLocaleString("hu-HU", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  return (
    <section className={compact ? "card timeline-card" : "card standalone"}>
      <SectionTitle
        action={
          <div className="timeline-header-actions">
            <label className="station-selector station-selector--inline">
              <span>Állomás</span>
              <select
                className="timeline-station-select"
                value={selectedStation.id}
                onChange={(event) => {
                  const nextStation = stations.find(
                    (station) => station.id === Number(event.target.value),
                  );
                  if (nextStation) onSelect(nextStation);
                }}
              >
                {stations.map((station) => (
                  <option key={station.id} value={station.id}>
                    {station.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="timeline-range-switch" role="group" aria-label="Idősáv">
              {TIME_RANGES.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={range === option.value}
                  className={range === option.value ? "is-active" : ""}
                  onClick={() => setRange(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        }
      >
        Állomás idősor
      </SectionTitle>
      {isLoading ? (
        <p className="chart-state">Idősor betöltése…</p>
      ) : error ? (
        <p className="chart-state chart-state--error">
          Nem sikerült betölteni az idősoradatokat: {error.message}
        </p>
      ) : (
        <MockWatermark active={isStationHistoryMock}>
          <TimelineChart
            key={selectedStation.id}
            data={chartHistory}
            height={height}
            range={range}
            capacity={capacity}
          />
        </MockWatermark>
      )}
      <div className="mini-metrics">
        <div className="mini-metric">
          <span>Elérhető kerékpárok</span>
          <strong>{bikes}</strong>
        </div>
        <div className="mini-metric">
          <span>Szabad dokkolók</span>
          <strong>{docks}</strong>
        </div>
        <div className="mini-metric">
          <span>Teljes kapacitás és telítettség</span>
          <strong>{capacity} <small>hely</small> · {occupancy}%</strong>
        </div>
        <div className={`mini-metric ${isStale ? "mini-metric--stale" : ""}`}>
          <span>Utolsó frissítés</span>
          <strong>
            {isStale && <span className="mini-metric-warning" aria-label="Az adat 15 percnél régebbi">⚠ </span>}
            {formattedLastUpdated}
          </strong>
        </div>
      </div>
    </section>
  );
}
