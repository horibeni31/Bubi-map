import { MockWatermark } from "../components/common/MockWatermark";
import { isAnalyticsMock } from "../services/analyticsApi";
import { isStationDataMock } from "../services/stationApi";
import { SectionTitle } from "../components/common/SectionTitle";
import { StatCard } from "../components/common/StatCard";
import { UsageCharts } from "../components/charts/Charts";
import { StationMap } from "../components/map/StationMap";
import { EventHeatmapMap } from "../components/map/EventHeatmapMap";
import { StationTimelinePanel } from "../components/charts/StationTimelinePanel";

export function DashboardView({
  stations,
  analytics,
  selectedStation,
  onSelect,
}) {
  return (
    <div className="content-grid">
      <section className="card overview-card">
        <SectionTitle>Hálózat pillanatnyi állapota</SectionTitle>
        {/* Hardcoded values, not computed from data yet */}
        <MockWatermark>
          <div className="stats-row">
            <StatCard label="Állomások száma" value="221" />
            <StatCard label="Kerékpárok összesen" value="1 873" />
            <StatCard label="Szabad dokkolók" value="2 411" />
            <StatCard label="Üres állomások" value="7" />
            <StatCard label="Tele állomások" value="5" />
          </div>
        </MockWatermark>
      </section>
      <section className="card map-card">
        <SectionTitle>Állomások aktuális állapota</SectionTitle>
        <MockWatermark active={isStationDataMock}>
          <StationMap
            stations={stations}
            selectedStation={selectedStation}
            onSelect={onSelect}
          />
        </MockWatermark>
      </section>
      <StationTimelinePanel
        stations={stations}
        selectedStation={selectedStation}
        onSelect={onSelect}
        compact
      />
      <section className="card usage-card">
        <SectionTitle>Kihasználtság</SectionTitle>
        <MockWatermark active={isAnalyticsMock}>
          <UsageCharts
            hourlyData={analytics.hourlyUsage}
            weeklyData={analytics.weeklyUsage}
          />
        </MockWatermark>
      </section>
      <section className="card events-card">
        <SectionTitle>„Üres” és „tele” események hőtérképe</SectionTitle>
        {/* Intensities are generated, only positions are real */}
        <MockWatermark>
          <EventHeatmapMap stations={stations} />
        </MockWatermark>
      </section>
      <section className="card flows-card">
        <SectionTitle>
          Forgalom – nettó áramlás <small>(béta)</small>
        </SectionTitle>
        <div className="flow-content">
          <div className="flow-map">
            <StationMap
              stations={stations}
              selectedStation={selectedStation}
              onSelect={onSelect}
              compact
            />
          </div>
          {/* Hardcoded ranking */}
          <MockWatermark>
            <FlowRanking />
          </MockWatermark>
        </div>
      </section>
    </div>
  );
}

function FlowRanking() {
  return (
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
      <li>
        Deák Ferenc tér <em>−37</em>
      </li>
      <li>
        Nyugati tér <em>−28</em>
      </li>
    </ol>
  );
}
