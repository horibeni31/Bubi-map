import { SectionTitle } from "../components/common/SectionTitle";
import { UsageCharts } from "../components/charts/Charts";
import { StationMap } from "../components/map/StationMap";
import { EventHeatmapMap } from "../components/map/EventHeatmapMap";
import { StationTimelinePanel } from "../components/charts/StationTimelinePanel";

export function StandaloneView({
  view,
  stations,
  analytics,
  selectedStation,
  onSelect,
}) {
  if (view === "map") {
    return (
      <section className="card full-map">
        <SectionTitle>Térkép</SectionTitle>
        <StationMap
          stations={stations}
          selectedStation={selectedStation}
          onSelect={onSelect}
        />
      </section>
    );
  }
  if (view === "events") {
    return (
      <section className="card full-map">
        <SectionTitle>Hőtérkép</SectionTitle>
        <EventHeatmapMap stations={stations} />
      </section>
    );
  }
  if (view === "timeline") {
    return (
      <StationTimelinePanel
        stations={stations}
        selectedStation={selectedStation}
        onSelect={onSelect}
        height={360}
      />
    );
  }
  if (view === "usage") {
    return (
      <section className="card standalone usage-view">
        <SectionTitle>Átlagos kihasználtság</SectionTitle>
        <UsageCharts
          hourlyData={analytics.hourlyUsage}
          weeklyData={analytics.weeklyUsage}
        />
      </section>
    );
  }
  if (view === "flows") {
    return (
      <section className="card standalone">
        <SectionTitle>Forgalom – nettó áramlás (béta)</SectionTitle>
        <div className="flow-content">
          <div className="flow-map">
            <StationMap
              stations={stations}
              selectedStation={selectedStation}
              onSelect={onSelect}
            />
          </div>
          <ol>
            <li>
              Müegyetem rakpart <b>+42</b>
            </li>
            <li>
              WestEnd <b>+38</b>
            </li>
            <li>
              Keleti pályaudvar <b>+31</b>
            </li>
          </ol>
        </div>
      </section>
    );
  }
  return (
    <section className="card standalone">
      <SectionTitle>Jelentések</SectionTitle>
      <p className="empty-state">
        A jelentések nézet a backend-analitikára vár. A navigáció és a
        megjelenítési keret már elkészült.
      </p>
    </section>
  );
}
