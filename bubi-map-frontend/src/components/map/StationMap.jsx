import { useState } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import { statusInfo } from "../../data/mockData";

export function StationMap({
  stations,
  selectedStation,
  onSelect,
  compact = false,
}) {
  const [query, setQuery] = useState("");
  const [visibleStatuses, setVisibleStatuses] = useState(() =>
    Object.fromEntries(Object.keys(statusInfo).map((status) => [status, true])),
  );
  const filteredStations = stations.filter(
    (station) =>
      visibleStatuses[station.status] &&
      station.name.toLowerCase().includes(query.toLowerCase()),
  );

  function toggleStatus(status) {
    setVisibleStatuses((current) => ({
      ...current,
      [status]: !current[status],
    }));
  }

  return (
    <div className={`map-panel ${compact ? "map-panel-compact" : ""}`}>
      <MapContainer
        center={[47.495, 19.06]}
        zoom={13}
        scrollWheelZoom={false}
        zoomControl={!compact}
        className="leaflet-map"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {filteredStations.map((station) => (
          <CircleMarker
            key={station.id}
            center={station.position}
            radius={selectedStation?.id === station.id ? 10 : 7}
            pathOptions={{
              className: `station-marker station-marker--${station.status}`,
            }}
            eventHandlers={{ click: () => onSelect(station) }}
          >
            <Popup>
              <strong>{station.name}</strong>
              <br />
              {station.bikes} kerékpár · {station.docks} szabad dokkoló
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
      {!compact && (
        <div className="map-filter">
          <strong>Állomás állapota</strong>
          {Object.entries(statusInfo).map(([key, item]) => (
            <label key={key}>
              <input
                type="checkbox"
                checked={visibleStatuses[key]}
                onChange={() => toggleStatus(key)}
              />
              <i className={`status-dot status-dot--${key}`} />
              {item.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
