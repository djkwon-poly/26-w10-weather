import { useState, useEffect, useCallback } from 'react';
import {
  Sun,
  SunDim,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  Snowflake,
  CloudLightning,
  Thermometer,
  Droplets,
  Wind,
  MapPin,
  RefreshCw,
  AlertCircle,
  Activity,
} from 'lucide-react';
import {
  DEFAULT_CITIES,
  getWeatherInfo,
  getAirQualityStatus,
  fetchWeatherData,
  fetchAirQualityData,
} from './api/weather';
import './App.css';

// Lucide 아이콘 이름 매핑 헬퍼
const ICON_COMPONENTS = {
  Sun,
  SunDim,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  Snowflake,
  CloudLightning,
};

function WeatherIcon({ name, size = 48, color = 'currentColor' }) {
  const Component = ICON_COMPONENTS[name] || Cloud;
  return <Component size={size} color={color} strokeWidth={2} />;
}

export default function App() {
  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITIES[0]);
  const [weatherData, setWeatherData] = useState(null);
  const [airQualityData, setAirQualityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadCityData = useCallback(async (city) => {
    setLoading(true);
    setError(null);
    try {
      const [weather, airQuality] = await Promise.all([
        fetchWeatherData(city.lat, city.lon),
        fetchAirQualityData(city.lat, city.lon),
      ]);
      setWeatherData(weather);
      setAirQualityData(airQuality);
      setLastUpdated(new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.error(err);
      setError('기상 및 대기 정보를 불러오는 데 실패했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCityData(selectedCity);
  }, [selectedCity, loadCityData]);

  const currentWeather = weatherData?.current;
  const weatherInfo = currentWeather ? getWeatherInfo(currentWeather.weather_code) : null;

  const currentAir = airQualityData?.current;
  const airStatus = currentAir ? getAirQualityStatus(currentAir.pm10, currentAir.pm2_5) : null;

  return (
    <div className="weather-app">
      {/* 헤더 */}
      <header className="app-header">
        <div className="header-title">
          <div className="title-row">
            <h1>실시간 날씨 & 미세먼지</h1>
            <span className="live-badge">LIVE</span>
          </div>
          <p className="subtitle">Open-Meteo API 연동 실시간 기상 대시보드</p>
        </div>
        <button
          className="refresh-btn"
          onClick={() => loadCityData(selectedCity)}
          disabled={loading}
          title="새로고침"
          type="button"
        >
          <RefreshCw size={18} className={loading ? 'spinning' : ''} />
          <span>새로고침</span>
        </button>
      </header>

      {/* 도시 빠른 선택 탭 */}
      <nav className="city-presets" aria-label="주요 도시 선택">
        {DEFAULT_CITIES.map((city) => {
          const isSelected = selectedCity.name === city.name;
          return (
            <button
              key={city.name}
              type="button"
              className={`city-pill ${isSelected ? 'active' : ''}`}
              onClick={() => setSelectedCity(city)}
            >
              <MapPin size={14} />
              <span>{city.name}</span>
            </button>
          );
        })}
      </nav>

      {/* 현재 선택된 위치 및 갱신 시간 */}
      <div className="current-location-banner">
        <div className="location-name">
          <MapPin size={20} className="pin-icon" />
          <h2>{selectedCity.name}</h2>
        </div>
        {lastUpdated && !loading && (
          <span className="updated-time">기준 시각: {lastUpdated}</span>
        )}
      </div>

      {/* 로딩 표시 */}
      {loading && (
        <div className="status-container loading-container">
          <RefreshCw size={36} className="spinning spinner-icon" />
          <p>{selectedCity.name}의 실시간 날씨 정보를 조회하고 있습니다...</p>
        </div>
      )}

      {/* 오류 표시 */}
      {error && !loading && (
        <div className="status-container error-container">
          <AlertCircle size={36} color="#ef4444" />
          <p>{error}</p>
          <button
            type="button"
            className="retry-btn"
            onClick={() => loadCityData(selectedCity)}
          >
            다시 시도
          </button>
        </div>
      )}

      {/* 날씨 & 미세먼지 카드 그리드 */}
      {!loading && !error && currentWeather && currentAir && (
        <main className="dashboard-grid">
          {/* 1. 현재 날씨 카드 */}
          <section className="card weather-card">
            <div className="card-header">
              <span className="card-badge">CURRENT WEATHER</span>
              <span className="weather-label" style={{ color: weatherInfo.color }}>
                {weatherInfo.label}
              </span>
            </div>

            <div className="weather-main-info">
              <div className="weather-icon-wrapper" style={{ background: `${weatherInfo.color}18` }}>
                <WeatherIcon name={weatherInfo.icon} size={64} color={weatherInfo.color} />
              </div>
              <div className="temperature-group">
                <span className="temp-value">
                  {Math.round(currentWeather.temperature_2m)}
                  <span className="temp-unit">°C</span>
                </span>
                <span className="apparent-temp">
                  체감 {Math.round(currentWeather.apparent_temperature)}°C
                </span>
              </div>
            </div>

            <div className="weather-details-grid">
              <div className="detail-item">
                <div className="detail-label">
                  <Thermometer size={16} />
                  <span>체감온도</span>
                </div>
                <div className="detail-value">{currentWeather.apparent_temperature.toFixed(1)}°C</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">
                  <Droplets size={16} />
                  <span>습도</span>
                </div>
                <div className="detail-value">{currentWeather.relative_humidity_2m}%</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">
                  <Wind size={16} />
                  <span>풍속</span>
                </div>
                <div className="detail-value">{currentWeather.wind_speed_10m.toFixed(1)} km/h</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">
                  <Activity size={16} />
                  <span>강수량</span>
                </div>
                <div className="detail-value">{currentWeather.precipitation ?? 0} mm</div>
              </div>
            </div>
          </section>

          {/* 2. 미세먼지 카드 */}
          <section className="card air-card">
            <div className="card-header">
              <span className="card-badge">AIR QUALITY</span>
              <div
                className="air-status-badge"
                style={{ backgroundColor: airStatus.badgeColor }}
              >
                {airStatus.status}
              </div>
            </div>

            <div className="air-main-info">
              <div className="air-overview">
                <span className="air-overview-title">대기 환경 지수</span>
                <span className="air-grade" style={{ color: airStatus.badgeColor }}>
                  {airStatus.status}
                </span>
                <span className="air-desc">
                  {airStatus.status === '좋음' && '야외 활동하기 아주 좋은 공기 상태입니다.'}
                  {airStatus.status === '보통' && '무난한 공기 상태입니다. 일상 활동에 지장 없습니다.'}
                  {airStatus.status === '나쁨' && '호흡기 민감군은 장시간 실외 활동을 자제하세요.'}
                  {airStatus.status === '매우 나쁨' && '마스크 착용 권장! 가급적 실내 활동을 권합니다.'}
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
                        currentAir.pm10 > 150 ? '#ef4444' :
                        currentAir.pm10 > 80 ? '#f97316' :
                        currentAir.pm10 > 30 ? '#3b82f6' : '#10b981'
                    }}
                  />
                </div>
                <div className="metric-value-row">
                  <span className="metric-val">{Math.round(currentAir.pm10)}</span>
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
                        currentAir.pm2_5 > 75 ? '#ef4444' :
                        currentAir.pm2_5 > 35 ? '#f97316' :
                        currentAir.pm2_5 > 15 ? '#3b82f6' : '#10b981'
                    }}
                  />
                </div>
                <div className="metric-value-row">
                  <span className="metric-val">{Math.round(currentAir.pm2_5)}</span>
                  <span className="metric-unit">μg/m³</span>
                </div>
                <div className="metric-scale">
                  <span>기준: ~15 좋음 / ~35 보통 / ~75 나쁨</span>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* 푸터 */}
      <footer className="app-footer">
        <p>기상청 및 Open-Meteo 전세계 공개 기상 데이터 API 연동</p>
        <p className="copyright">한국폴리텍대학 강서캠퍼스 사이버보안과 실습 프로젝트</p>
      </footer>
    </div>
  );
}
