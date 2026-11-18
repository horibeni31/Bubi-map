import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const HOUR_MS = 60 * 60 * 1000;
const RANGE_MS = { "3h": 3 * HOUR_MS, "6h": 6 * HOUR_MS, "24h": 24 * HOUR_MS };

function toHourlyTimeline(data, range) {
  const snapshots = data
    .filter(
      (point) =>
        Number.isFinite(Number(point.timestamp)) &&
        Number.isFinite(Number(point.bikes)) &&
        Number.isFinite(Number(point.docks)),
    )
    .slice()
    .sort((a, b) => Number(a.timestamp) - Number(b.timestamp));

  const latestTimestamp = snapshots.length
    ? Number(snapshots[snapshots.length - 1].timestamp)
    : Date.now();
  const firstTimestamp = snapshots.length
    ? Number(snapshots[0].timestamp)
    : latestTimestamp;
  let start =
    range === "available"
      ? firstTimestamp
      : latestTimestamp - (RANGE_MS[range] || RANGE_MS["24h"]);
  let end = latestTimestamp;
  if (range === "available" && start === end) {
    start -= HOUR_MS / 2;
    end += HOUR_MS / 2;
  }

  const points = new Map();

  const addPoint = (snapshot, timestamp, changedFields = []) => {
    const existing = points.get(timestamp);
    points.set(timestamp, {
      ...snapshot,
      timestamp,
      changedFields: [
        ...new Set([...(existing?.changedFields || []), ...changedFields]),
      ],
    });
  };

  if (snapshots.length) {
    const firstVisible = snapshots.find(
      (point) => Number(point.timestamp) >= start && Number(point.timestamp) <= end,
    );
    if (firstVisible) addPoint(firstVisible, Number(firstVisible.timestamp));
  }

  for (
    let timestamp = Math.ceil(start / HOUR_MS) * HOUR_MS;
    timestamp <= end;
    timestamp += HOUR_MS
  ) {
    let snapshot = null;
    for (const candidate of snapshots) {
      if (Number(candidate.timestamp) <= timestamp) {
        snapshot = candidate;
      } else {
        break;
      }
    }
    if (snapshot) {
      addPoint(snapshot, timestamp);
    }
  }

  for (let index = 1; index < snapshots.length; index += 1) {
    const previous = snapshots[index - 1];
    const current = snapshots[index];
    const currentTimestamp = Number(current.timestamp);
    const changedFields = [];
    if (current.bikes !== previous.bikes) changedFields.push("bikes");
    if (current.docks !== previous.docks) changedFields.push("docks");
    if (currentTimestamp >= start && currentTimestamp <= end && changedFields.length) {
      addPoint(current, currentTimestamp, changedFields);
    }
  }

  const hourlyData = [...points.values()].sort(
    (a, b) => a.timestamp - b.timestamp,
  );
  const missingUntil = snapshots.length
    ? Math.min(end, firstTimestamp)
    : end;
  const eventAreas = [];
  for (let index = 0; index < hourlyData.length; index += 1) {
    const point = hourlyData[index];
    const nextTimestamp = hourlyData[index + 1]
      ? Number(hourlyData[index + 1].timestamp)
      : end;
    if (nextTimestamp <= point.timestamp) continue;
    if (Number(point.bikes) === 0) {
      eventAreas.push({ x1: point.timestamp, x2: nextTimestamp, type: "empty" });
    }
    if (Number(point.docks) === 0) {
      eventAreas.push({ x1: point.timestamp, x2: nextTimestamp, type: "full" });
    }
  }

  return {
    hourlyData,
    start,
    end,
    firstTimestamp: snapshots.length ? firstTimestamp : null,
    missingUntil,
    eventAreas,
  };
}

export function TimelineChart({ data = [], height = 220, range = "available", capacity }) {
  const { hourlyData, start, end, firstTimestamp, missingUntil, eventAreas } =
    toHourlyTimeline(data, range);
  const ticks = [start];
  for (let tick = Math.ceil(start / HOUR_MS) * HOUR_MS; tick < end; tick += HOUR_MS) {
    if (tick > start) ticks.push(tick);
  }
  if (end > start) ticks.push(end);
  const chartCapacity =
    capacity ??
    (hourlyData.length
      ? Number(hourlyData[0].bikes) + Number(hourlyData[0].docks)
      : null);

  const formatHour = (value) => {
    const date = new Date(Number(value));
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const hourLabel = String(date.getHours()).padStart(2, "0");
    return `${day}.${month} ${hourLabel}:00`;
  };

  if (!hourlyData.length) {
    return <div className="timeline-chart-empty">Nincs elérhető idősoradat</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={hourlyData}
        margin={{ top: 8, right: 12, left: -20, bottom: 0 }}
      >
        {firstTimestamp > start && (
          <ReferenceArea
            x1={start}
            x2={missingUntil}
            fill="#94a3b8"
            fillOpacity={0.12}
            strokeOpacity={0}
            label={{
              value: "Nincs korábbi adat",
              position: "insideTopLeft",
              fill: "#64748b",
              fontSize: 11,
            }}
          />
        )}
        {eventAreas.map((area) => (
          <ReferenceArea
            key={`${area.type}-${area.x1}`}
            x1={area.x1}
            x2={area.x2}
            fill={area.type === "empty" ? "#ef4444" : "#f59e0b"}
            fillOpacity={0.09}
            strokeOpacity={0}
          />
        ))}
        <CartesianGrid className="chart-grid" vertical={false} />
        {chartCapacity > 0 && (
          <ReferenceLine
            y={chartCapacity}
            stroke="#94a3b8"
            strokeDasharray="5 4"
            label={{
              value: `Kapacitás: ${chartCapacity}`,
              position: "insideTopRight",
              fill: "#64748b",
              fontSize: 10,
            }}
          />
        )}
        <XAxis
          dataKey="timestamp"
          type="number"
          domain={[start, end]}
          ticks={ticks}
          interval="preserveStartEnd"
          tickFormatter={formatHour}
          tickMargin={8}
          tick={{ className: "chart-axis-tick" }}
        />
        <YAxis
          domain={[0, (dataMax) => Math.max(dataMax, chartCapacity || 0)]}
          tick={{ className: "chart-axis-tick" }}
        />
        <Tooltip content={<TimelineTooltip capacity={chartCapacity} />} />
        <Line
          type="stepAfter"
          dataKey="bikes"
          name="Kerékpárok"
          stroke="var(--green)"
          className="chart-line chart-line--bikes"
          dot={<ChangeDot field="bikes" fill="var(--green)" />}
        />
        <Line
          type="stepAfter"
          dataKey="docks"
          name="Szabad dokkolók"
          stroke="var(--blue)"
          className="chart-line chart-line--docks"
          dot={<ChangeDot field="docks" fill="var(--blue)" />}
        />
        <Legend />
      </LineChart>
    </ResponsiveContainer>
  );
}

function TimelineTooltip({ active, payload, label, capacity }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  const totalCapacity = capacity ?? Number(point.bikes) + Number(point.docks);
  const occupancy = totalCapacity
    ? Math.round((Number(point.bikes) / totalCapacity) * 100)
    : 0;
  const isEmpty = Number(point.bikes) === 0;
  const isFull = Number(point.docks) === 0;

  return (
    <div className="timeline-tooltip">
      <strong className="timeline-tooltip-time">
        {new Date(Number(label)).toLocaleString("hu-HU")}
      </strong>
      <div>Kerékpárok: <b>{point.bikes}</b></div>
      <div>Szabad dokkolók: <b>{point.docks}</b></div>
      <div>Telítettség: <b>{occupancy}%</b></div>
      {(isEmpty || isFull) && (
        <div className="timeline-tooltip-statuses">
          {isEmpty && <span className="timeline-status timeline-status--empty">Üres</span>}
          {isFull && <span className="timeline-status timeline-status--full">Tele</span>}
        </div>
      )}
    </div>
  );
}

function ChangeDot({ cx, cy, payload, fill, field }) {
  if (!payload?.changedFields?.includes(field)) return null;
  return <circle cx={cx} cy={cy} r={4} fill={fill} stroke="white" strokeWidth={2} />;
}

export function UsageCharts({ hourlyData = [], weeklyData = [] }) {
  return (
    <div className="usage-charts">
      <div>
        <h3>Kihasználtság napszak szerint</h3>
        <ResponsiveContainer width="100%" height={190}>
          <BarChart data={hourlyData}>
            <CartesianGrid className="chart-grid" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ className: "chart-axis-tick chart-axis-tick--small" }}
            />
            <YAxis
              unit="%"
              tick={{ className: "chart-axis-tick chart-axis-tick--small" }}
            />
            <Tooltip />
            <Bar className="chart-bar chart-bar--hourly" dataKey="value" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div>
        <h3>Kihasználtság hét napja szerint</h3>
        <ResponsiveContainer width="100%" height={190}>
          <BarChart data={weeklyData}>
            <CartesianGrid className="chart-grid" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ className: "chart-axis-tick chart-axis-tick--small" }}
            />
            <YAxis
              unit="%"
              tick={{ className: "chart-axis-tick chart-axis-tick--small" }}
            />
            <Tooltip />
            <Bar className="chart-bar chart-bar--weekly" dataKey="value" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function Gauge({ value = 0 }) {
  return (
    <div className="gauge-wrap">
      <ResponsiveContainer width={128} height={128}>
        <PieChart>
          <Pie
            data={[{ value }, { value: 100 - value }]}
            innerRadius={43}
            outerRadius={55}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            className="gauge-chart"
          >
            <Cell className="gauge-segment gauge-segment--value" />
            <Cell className="gauge-segment gauge-segment--remaining" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <strong>{value}%</strong>
      <span>Átlagos kihasználtság</span>
    </div>
  );
}

export function EventHeatmap({ events = [] }) {
  return (
    <div className="heatmap">
      <div className="heatmap-grid">
        {events.map((event, index) => (
          <span key={index} className={`heat-${event.intensity}`} />
        ))}
      </div>
      <div className="heat-legend">
        <b>Magas</b>
        <i />
        <span>Alacsony</span>
      </div>
    </div>
  );
}
