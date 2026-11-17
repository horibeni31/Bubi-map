import { useEffect, useState } from "react";
import { SectionTitle } from "../common/SectionTitle";
import { TimelineChart } from "./Charts";
import { analyticsApi } from "../../services/analyticsApi";

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

  useEffect(() => {
    let isCurrentRequest = true;

    setIsLoading(true);
    setError(null);
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

  return (
    <section className={compact ? "card timeline-card" : "card standalone"}>
      <SectionTitle
        action={
          <label className="station-selector station-selector--inline">
            <span>Állomás kiválasztása</span>
            <select
              value={selectedStation.id}
              onChange={(event) => {
                const nextStation = stations.find(
                  (station) => station.id === Number(event.target.value),
                );
                if (nextStation) {
                  onSelect(nextStation);
                }
              }}
            >
              {stations.map((station) => (
                <option key={station.id} value={station.id}>
                  {station.name}
                </option>
              ))}
            </select>
          </label>
        }
      >
        Állomás idősor {compact ? "" : "(utolsó 24 óra)"}
      </SectionTitle>
      {isLoading ? (
        <p className="chart-state">Idősor betöltése…</p>
      ) : error ? (
        <p className="chart-state chart-state--error">
          Nem sikerült betölteni az idősoradatokat: {error.message}
        </p>
      ) : (
        <TimelineChart
          key={selectedStation.id}
          data={history}
          height={height}
        />
      )}
      {compact && (
        <div className="mini-metrics">
          <span>
            Állomás <b>{selectedStation.name}</b>
          </span>
          <span>
            Kerékpárok <b>{selectedStation.bikes}</b>
          </span>
          <span>
            Szabad dokkolók <b>{selectedStation.docks}</b>
          </span>
        </div>
      )}
    </section>
  );
}
