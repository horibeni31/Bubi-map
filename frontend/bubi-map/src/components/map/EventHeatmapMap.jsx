import { useEffect, useMemo } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet.heat";

function HeatLayer({ points }) {
  const map = useMap();

  useEffect(() => {
    const heatLayer = L.heatLayer(points, {
      radius: 34,
      blur: 25,
      maxZoom: 15,
      minOpacity: 0.35,
      gradient: {
        0.2: "#3b82f6",
        0.45: "#2dd4bf",
        0.65: "#facc15",
        0.82: "#fb923c",
        1: "#ef4444",
      },
    });

    heatLayer.addTo(map);
    return () => map.removeLayer(heatLayer);
  }, [map, points]);

  return null;
}

export function EventHeatmapMap({ stations }) {
  const points = useMemo(
    () =>
      stations.map((station, index) => [
        station.position[0],
        station.position[1],
        0.35 + ((index * 3) % 7) / 10,
      ]),
    [stations],
  );

  return (
    <div className="event-heatmap-map">
      <MapContainer
        center={[47.495, 19.06]}
        zoom={13}
        scrollWheelZoom={false}
        className="leaflet-map"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <HeatLayer points={points} />
      </MapContainer>
      <div className="heatmap-overlay-legend">
        <strong>Események gyakorisága</strong>
        <span className="heatmap-gradient" />
        <div>
          <span>Alacsony</span>
          <span>Magas</span>
        </div>
        <small>Üres és tele állomások összesített eseményei</small>
      </div>
    </div>
  );
}
