import { useEffect, useState } from "react";
import { SectionTitle } from "../components/common/SectionTitle";
import {
  EventHeatmap,
  Gauge,
  TimelineChart,
} from "../components/charts/Charts";
import { statusInfo } from "../data/mockData";
import { analyticsApi } from "../services/analyticsApi";

export function StationDetailView({ station, stations = [], onSelect }) {
  const [history, setHistory] = useState([]);
  const [utilization, setUtilization] = useState(0);
  const [events, setEvents] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState(null);
  const current = station;

  useEffect(() => {
    let isCurrentRequest = true;

    setIsHistoryLoading(true);
    setHistoryError(null);
    Promise.all([
      analyticsApi.getStationHistory(current.id),
      analyticsApi.getStationUtilization(current.id),
      analyticsApi.getStationEvents(current.id),
    ])
      .then(([loadedHistory, loadedUtilization, loadedEvents]) => {
        if (isCurrentRequest) {
          setHistory(loadedHistory);
          setUtilization(loadedUtilization);
          setEvents(loadedEvents);
        }
      })
      .catch((error) => {
        if (isCurrentRequest) {
          setHistoryError(error);
        }
      })
      .finally(() => {
        if (isCurrentRequest) {
          setIsHistoryLoading(false);
        }
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [current.id]);

  return (
    <div className="detail-view">
      <div className="detail-heading">
        <div>
          <span className="station-dot" /> <strong>{current.name}</strong>
          <small>1052 Budapest, {current.name}</small>
        </div>
        <label className="station-selector">
          <span>Állomás kiválasztása</span>
          <select
            value={current.id}
            onChange={(event) => {
              const nextStation = stations.find(
                (item) => item.id === Number(event.target.value),
              );
              if (nextStation) {
                onSelect(nextStation);
              }
            }}
          >
            {stations.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <span className={`status-pill status-pill--${current.status}`}>
          ● {statusInfo[current.status].label}
        </span>
        <div className="detail-numbers">
          <b>
            {current.bikes}
            <small>Kerékpár</small>
          </b>
          <b>
            {current.docks} / {current.capacity}
            <small>Szabad dokkoló</small>
          </b>
        </div>
      </div>
      <div className="detail-grid">
        <section className="card">
          <SectionTitle>Állomás idősor (utolsó 24 óra)</SectionTitle>
          {isHistoryLoading ? (
            <p className="chart-state">Idősor betöltése…</p>
          ) : historyError ? (
            <p className="chart-state chart-state--error">
              Nem sikerült betölteni az idősoradatokat: {historyError.message}
            </p>
          ) : (
            <TimelineChart key={current.id} data={history} height={240} />
          )}
        </section>
        <section className="card detail-gauge">
          <SectionTitle>Napi átlagos kihasználtság</SectionTitle>
          {isHistoryLoading ? (
            <p className="chart-state">Kihasználtság betöltése…</p>
          ) : historyError ? (
            <p className="chart-state chart-state--error">
              Nem sikerült betölteni a kihasználtságot.
            </p>
          ) : (
            <Gauge value={utilization} />
          )}
        </section>
        <section className="card">
          <SectionTitle>Események (hét napja)</SectionTitle>
          {isHistoryLoading ? (
            <p className="chart-state">Események betöltése…</p>
          ) : historyError ? (
            <p className="chart-state chart-state--error">
              Nem sikerült betölteni az eseményeket.
            </p>
          ) : (
            <EventHeatmap events={events} />
          )}
        </section>
      </div>
    </div>
  );
}
