import { MockWatermark } from "../components/common/MockWatermark";
import { isAnalyticsMock } from "../services/analyticsApi";
import { isStationDataMock } from "../services/stationApi";
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
        <MockWatermark active={isStationDataMock}>
          <StationMap
            stations={stations}
            selectedStation={selectedStation}
            onSelect={onSelect}
          />
        </MockWatermark>
      </section>
    );
  }
  if (view === "events") {
    return (
      <section className="card full-map">
        <SectionTitle>Hőtérkép</SectionTitle>
        {/* Intensities are generated, only positions are real */}
        <MockWatermark>
          <EventHeatmapMap stations={stations} />
        </MockWatermark>
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
        <MockWatermark active={isAnalyticsMock}>
          <UsageCharts
            hourlyData={analytics.hourlyUsage}
            weeklyData={analytics.weeklyUsage}
          />
        </MockWatermark>
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
          {/* Hardcoded ranking */}
          <MockWatermark>
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
          </MockWatermark>
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
