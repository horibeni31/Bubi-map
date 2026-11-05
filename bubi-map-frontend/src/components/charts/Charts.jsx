import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
export function TimelineChart({ data = [], height = 220 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={data}
        margin={{ top: 8, right: 12, left: -20, bottom: 0 }}
      >
        <CartesianGrid className="chart-grid" vertical={false} />
        <XAxis dataKey="time" tick={{ className: "chart-axis-tick" }} />
        <YAxis tick={{ className: "chart-axis-tick" }} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="bikes"
          name="Kerékpárok"
          className="chart-line chart-line--bikes"
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="docks"
          name="Szabad dokkolók"
          className="chart-line chart-line--docks"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
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
