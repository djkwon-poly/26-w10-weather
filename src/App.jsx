import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, AlertCircle, MapPin } from 'lucide-react';
import {
  DEFAULT_CITIES,
  fetchWeatherData,
  fetchAirQualityData,
} from './api/weather';
import CurrentWeather from './components/CurrentWeather';
import AirQualityCard from './components/AirQualityCard';
import HourlyChart from './components/HourlyChart';
import WeeklyForecast from './components/WeeklyForecast';
import CitySearch from './components/CitySearch';
import './App.css';

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
      setLastUpdated(
        new Date().toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
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

  return (
    <div className="weather-app">
      {/* 1. 상단 헤더 */}
      <header className="app-header">
        <div className="header-title">
          <div className="title-row">
            <h1>실시간 날씨 & 미세먼지</h1>
            <span className="live-badge">LIVE</span>
          </div>
          <p className="subtitle">Open-Meteo 공개 기상 데이터 API 연동 스마트 대시보드</p>
        </div>

        <div className="header-actions">
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
        </div>
      </header>

      {/* 2. 도시 검색창 (400ms 디바운스 적용) */}
      <CitySearch onSelectCity={(city) => setSelectedCity(city)} />

      {/* 3. 주요 도시 빠른 선택 프리셋 버튼 */}
      <nav className="city-presets" aria-label="주요 도시 빠른 선택">
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

      {/* 4. 현재 위치 배너 */}
      <div className="current-location-banner">
        <div className="location-name">
          <MapPin size={22} className="pin-icon" />
          <h2>{selectedCity.name}</h2>
        </div>
        {lastUpdated && !loading && (
          <span className="updated-time">기준 시각: {lastUpdated}</span>
        )}
      </div>

      {/* 5. 로딩 화면 */}
      {loading && (
        <div className="status-container loading-container">
          <RefreshCw size={36} className="spinning spinner-icon" />
          <p>{selectedCity.name}의 실시간 날씨 및 대기 정보를 불러오는 중입니다...</p>
        </div>
      )}

      {/* 6. 에러 화면 */}
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

      {/* 7. 대시보드 콘텐츠 */}
      {!loading && !error && weatherData && airQualityData && (
        <main className="dashboard-content">
          {/* 상단 2열 그리드: 현재 날씨 + 미세먼지 */}
          <div className="dashboard-grid">
            <CurrentWeather weatherData={weatherData} />
            <AirQualityCard airQualityData={airQualityData} />
          </div>

          {/* 24시간 시간별 기온 SVG 차트 */}
          <HourlyChart weatherData={weatherData} />

          {/* 7일간 주간 예보 */}
          <WeeklyForecast weatherData={weatherData} />
        </main>
      )}

      {/* 푸터 */}
      <footer className="app-footer">
        <p>Open-Meteo 전세계 공개 기상 데이터 API 연동 (No API Key Required)</p>
        <p className="copyright">한국폴리텍대학 강서캠퍼스 사이버보안과 실습 프로젝트</p>
      </footer>
    </div>
  );
}
