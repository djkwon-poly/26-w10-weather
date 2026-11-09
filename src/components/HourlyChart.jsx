import { useMemo } from 'react';
import WeatherIcon from './WeatherIcon';
import { getWeatherInfo } from '../api/weather';

export default function HourlyChart({ weatherData }) {
  const hourly = weatherData?.hourly;

  const hoursData = useMemo(() => {
    if (!hourly || !hourly.time || !hourly.time.length) return [];

    const now = new Date();
    // 현재 시간에 가장 가까운 시작 인덱스 탐색
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

    // 향후 24시간 추출
    const count = Math.min(24, hourly.time.length - startIndex);
    return Array.from({ length: count }, (_, i) => {
      const idx = startIndex + i;
      const date = new Date(hourly.time[idx]);
      const hour = date.getHours();
      return {
        timeStr: hourly.time[idx],
        label: i === 0 ? '지금' : `${hour}시`,
        temp: Math.round(hourly.temperature_2m[idx]),
        code: hourly.weather_code?.[idx] ?? 0,
      };
    });
  }, [hourly]);

  if (!hoursData.length) return null;

  // SVG 좌표 계산
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
    // 온도가 높을수록 y좌표는 작아짐(상단)
    const y = svgHeight - paddingY - ((d.temp - minTemp) / tempRange) * (svgHeight - paddingY * 2);
    return { ...d, x, y };
  });

  // 꺾은선 좌표 문자열
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  // 영역 채우기용 폐곡선 패스
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${svgHeight - 10} L ${points[0].x} ${svgHeight - 10} Z`;

  return (
    <section className="card hourly-card">
      <div className="card-header">
        <span className="card-badge">24-HOUR FORECAST</span>
        <span className="card-subtitle">24시간 시간별 기온 변화</span>
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

            {/* 영역 그라디언트 */}
            <path d={areaPath} fill="url(#tempGradient)" />

            {/* 꺾은선 */}
            <path d={linePath} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

            {/* 각 시점별 데이터 포인트, 기온 라벨, 날짜/시간 라벨 */}
            {points.map((p, i) => {
              const info = getWeatherInfo(p.code);
              return (
                <g key={p.timeStr || i}>
                  {/* 온도 라벨 */}
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

                  {/* 포인트 점 */}
                  <circle cx={p.x} cy={p.y} r="4" fill="#ffffff" stroke="#2563eb" strokeWidth="2" />

                  {/* 시간 라벨 */}
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
              );
            })}
          </svg>
        </div>
      </div>
    </section>
  );
}

