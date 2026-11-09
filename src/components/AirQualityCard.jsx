import { getAirQualityStatus } from '../api/weather';

export default function AirQualityCard({ airQualityData }) {
  const current = airQualityData?.current;
  if (!current) return null;

  const { status, badgeColor } = getAirQualityStatus(current.pm10, current.pm2_5);

  return (
    <section className="card air-card">
      <div className="card-header">
        <span className="card-badge">AIR QUALITY</span>
        <div
          className="air-status-badge"
          style={{ backgroundColor: badgeColor }}
        >
          {status}
        </div>
      </div>

      <div className="air-main-info">
        <div className="air-overview">
          <span className="air-overview-title">대기 환경 지수</span>
          <span className="air-grade" style={{ color: badgeColor }}>
            {status}
          </span>
          <span className="air-desc">
            {status === '좋음' && '야외 활동하기 아주 좋은 공기 상태입니다.'}
            {status === '보통' && '무난한 공기 상태입니다. 일상 활동에 지장 없습니다.'}
            {status === '나쁨' && '호흡기 민감군은 장시간 실외 활동을 자제하세요.'}
            {status === '매우 나쁨' && '마스크 착용 권장! 가급적 실내 활동을 권합니다.'}
          </span>
        </div>
      </div>

      <div className="air-metrics-grid">
        <div className="metric-box">
          <div className="metric-header">
            <span className="metric-title">미세먼지 (PM10)</span>
            <span
              className="metric-dot"
              style={{
                backgroundColor:
                  current.pm10 > 150 ? '#ef4444' :
                  current.pm10 > 80 ? '#f97316' :
                  current.pm10 > 30 ? '#3b82f6' : '#10b981'
              }}
            />
          </div>
          <div className="metric-value-row">
            <span className="metric-val">{Math.round(current.pm10)}</span>
            <span className="metric-unit">μg/m³</span>
          </div>
          <div className="metric-scale">
            <span>기준: ~30 좋음 / ~80 보통 / ~150 나쁨</span>
          </div>
        </div>

        <div className="metric-box">
          <div className="metric-header">
            <span className="metric-title">초미세먼지 (PM2.5)</span>
            <span
              className="metric-dot"
              style={{
                backgroundColor:
                  current.pm2_5 > 75 ? '#ef4444' :
                  current.pm2_5 > 35 ? '#f97316' :
                  current.pm2_5 > 15 ? '#3b82f6' : '#10b981'
              }}
            />
          </div>
          <div className="metric-value-row">
            <span className="metric-val">{Math.round(current.pm2_5)}</span>
            <span className="metric-unit">μg/m³</span>
          </div>
          <div className="metric-scale">
            <span>기준: ~15 좋음 / ~35 보통 / ~75 나쁨</span>
          </div>
        </div>
      </div>
    </section>
  );
}

