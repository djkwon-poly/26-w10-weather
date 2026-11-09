import { useMemo } from 'react';
import WeatherIcon from './WeatherIcon';
import { getWeatherInfo } from '../api/weather';

export default function HourlyChart({ weatherData, unit = 'C', convertTemp }) {
  const hourly = weatherData?.hourly;

  const hoursData = useMemo(() => {
    if (!hourly || !hourly.time || !hourly.time.length) return [];

    const now = new Date();
    let startIndex = 0;
    const nowTime = now.getTime();
    let minDiff = Infinity;

    for (let i = 0; i < hourly.time.length; i++) {
      const diff = Math.abs(new Date(hourly.time[i]).getTime() - nowTime);
      if (diff < minDiff) {
        minDiff = diff;
        startIndex = i;
      }
    }

    const count = Math.min(24, hourly.time.length - startIndex);
    return Array.from({ length: count }, (_, i) => {
      const idx = startIndex + i;
      const date = new Date(hourly.time[idx]);
      const hour = date.getHours();
      const rawTemp = hourly.temperature_2m[idx];
      const displayTemp = convertTemp ? convertTemp(rawTemp) : Math.round(rawTemp);
      return {
        timeStr: hourly.time[idx],
        label: i === 0 ? '지금' : `${hour}시`,
        temp: displayTemp,
        code: hourly.weather_code?.[idx] ?? 0,
      };
    });
  }, [hourly, convertTemp]);

  if (!hoursData.length) return null;

  const pointWidth = 52;
  const svgWidth = Math.max(hoursData.length * pointWidth, 600);
  const svgHeight = 160;
  const paddingY = 40;

  const temps = hoursData.map((d) => d.temp);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const tempRange = Math.max(maxTemp - minTemp, 1);

  const points = hoursData.map((d, index) => {
    const x = index * pointWidth + pointWidth / 2;
    const y = svgHeight - paddingY - ((d.temp - minTemp) / tempRange) * (svgHeight - paddingY * 2);
    return { ...d, x, y };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${svgHeight - 10} L ${points[0].x} ${svgHeight - 10} Z`;

  return (
    <section className="card hourly-card">
      <div className="card-header">
        <span className="card-badge">24-HOUR FORECAST</span>
        <span className="card-subtitle">24시간 시간별 기온 변화 (°{unit})</span>
      </div>

      <div className="chart-scroll-wrapper">
        <div className="chart-inner" style={{ width: `${svgWidth}px` }}>
          <svg width={svgWidth} height={svgHeight} className="hourly-svg">
            <defs>
              <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            <path d={areaPath} fill="url(#tempGradient)" />
            <path d={linePath} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

            {points.map((p, i) => (
              <g key={p.timeStr || i}>
                <text
                  x={p.x}
                  y={p.y - 12}
                  textAnchor="middle"
                  fill="var(--text-h)"
                  fontSize="13"
                  fontWeight="700"
                >
                  {p.temp}°
                </text>
                <circle cx={p.x} cy={p.y} r="4" fill="#ffffff" stroke="#2563eb" strokeWidth="2" />
                <text
                  x={p.x}
                  y={svgHeight - 14}
                  textAnchor="middle"
                  fill={i === 0 ? '#2563eb' : 'var(--text)'}
                  fontSize="12"
                  fontWeight={i === 0 ? '700' : '500'}
                >
                  {p.label}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    </section>
  );
}
