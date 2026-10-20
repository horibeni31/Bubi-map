import { useEffect, useMemo, useState } from "react";
import "leaflet/dist/leaflet.css";
import "./styles/app.css";
import { AppShell } from "./components/layout/AppShell";
import { DashboardView } from "./views/DashboardView";
import { StandaloneView } from "./views/StandaloneView";
import { StationDetailView } from "./views/StationDetailView";
import { navItems } from "./data/mockData";
import { stationApi } from "./services/stationApi";
import { analyticsApi } from "./services/analyticsApi";

function App() {
  const [activeView, setActiveView] = useState("overview");
  const [stations, setStations] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([stationApi.getStations(), analyticsApi.getOverview()])
      .then(([loadedStations, loadedAnalytics]) => {
        setStations(loadedStations);
        setSelectedStation(loadedStations[0] || null);
        setAnalytics(loadedAnalytics);
      })
      .catch((error) => setLoadError(error))
      .finally(() => setIsLoading(false));
  }, []);

  const title = useMemo(
    () => navItems.find(([id]) => id === activeView)?.[1] || "Áttekintés",
    [activeView],
  );
  const content = loadError ? (
    <p className="empty-state">
      Nem sikerült betölteni az állomásadatokat: {loadError.message}
    </p>
  ) : activeView === "overview" ? (
    <DashboardView
      stations={stations}
      analytics={analytics}
      selectedStation={selectedStation}
      onSelect={setSelectedStation}
    />
  ) : activeView === "stations" ? (
    <StationDetailView
      station={selectedStation || stations[0]}
      stations={stations}
      onSelect={setSelectedStation}
    />
  ) : (
    <StandaloneView
      view={activeView}
      stations={stations}
      analytics={analytics}
      selectedStation={selectedStation}
      onSelect={setSelectedStation}
    />
  );

  if (isLoading || !analytics) {
    return <div className="loading-state">Állomásadatok betöltése…</div>;
  }

  if (!selectedStation && !loadError) {
    return (
      <div className="loading-state">Nincs megjeleníthető állomásadat.</div>
    );
  }

  return (
    <AppShell activeView={activeView} onNavigate={setActiveView} title={title}>
      {content}
    </AppShell>
  );
}

export default App;
