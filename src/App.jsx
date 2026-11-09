import { useState, useEffect, useCallback, useMemo } from 'react';
import { RefreshCw, AlertCircle, MapPin, Sun, Moon } from 'lucide-react';
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

  // 라이트/다크 모드 상태 (기본값: 라이트 모드)
  const [colorMode, setColorMode] = useState(() => {
    return localStorage.getItem('weather_color_mode') || 'light';
  });

  const toggleColorMode = () => {
    const nextMode = colorMode === 'light' ? 'dark' : 'light';
    setColorMode(nextMode);
    localStorage.setItem('weather_color_mode', nextMode);
  };

  // 섭씨(°C) / 화씨(°F) 단위 전환 상태
  const [unit, setUnit] = useState('C');

  const convertTemp = useCallback(
    (celsius) => {
      if (typeof celsius !== 'number') return 0;
      return unit === 'C' ? Math.round(celsius) : Math.round(celsius * 1.8 + 32);
    },
    [unit]
  );

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

  // 현재 날씨 및 주야간(is_day), 테마 모드에 맞춘 감성 배경 이미지와 그라데이션
  const weatherBg = useMemo(() => {
    const current = weatherData?.current;
    if (!current) {
      return {
        gradient:
          colorMode === 'light'
            ? 'linear-gradient(135deg, rgba(224, 242, 254, 0.85) 0%, rgba(240, 249, 255, 0.9) 100%)'
            : 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.95) 100%)',
        imgUrl:
          'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=1600&auto=format&fit=crop&q=80',
      };
    }

    const isDay = current.is_day === 1;
    const code = current.weather_code;

    // 1. 뇌우 (Thunderstorm)
    if (code >= 95) {
      return {
        gradient:
          colorMode === 'light'
            ? 'linear-gradient(180deg, rgba(76, 29, 149, 0.45) 0%, rgba(30, 27, 75, 0.7) 100%)'
            : 'linear-gradient(180deg, rgba(30, 27, 75, 0.8) 0%, rgba(15, 10, 30, 0.95) 100%)',
        imgUrl:
          'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?w=1600&auto=format&fit=crop&q=80',
      };
    }
    // 2. 눈 (Snow)
    if (code >= 71 && code <= 77) {
      return {
        gradient:
          colorMode === 'light'
            ? 'linear-gradient(180deg, rgba(224, 242, 254, 0.65) 0%, rgba(241, 245, 249, 0.8) 100%)'
            : 'linear-gradient(180deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.92) 100%)',
        imgUrl:
          'https://images.unsplash.com/photo-1517299321929-30a70817547c?w=1600&auto=format&fit=crop&q=80',
      };
    }
    // 3. 비 / 소나기 / 이슬비 (Rain)
    if ((code >= 51 && code <= 65) || (code >= 80 && code <= 82)) {
      return {
        gradient:
          colorMode === 'light'
            ? 'linear-gradient(180deg, rgba(186, 230, 253, 0.6) 0%, rgba(147, 197, 253, 0.7) 100%)'
            : 'linear-gradient(180deg, rgba(15, 23, 42, 0.85) 0%, rgba(23, 37, 84, 0.9) 100%)',
        imgUrl:
          'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=1600&auto=format&fit=crop&q=80',
      };
    }
    // 4. 안개 (Fog)
    if (code === 45 || code === 48) {
      return {
        gradient:
          colorMode === 'light'
            ? 'linear-gradient(180deg, rgba(226, 232, 240, 0.7) 0%, rgba(203, 213, 225, 0.8) 100%)'
            : 'linear-gradient(180deg, rgba(30, 41, 59, 0.85) 0%, rgba(15, 23, 42, 0.92) 100%)',
        imgUrl:
          'https://images.unsplash.com/photo-1487621167305-5d248087c724?w=1600&auto=format&fit=crop&q=80',
      };
    }
    // 5. 구름 / 흐림 (Clouds)
    if (code === 2 || code === 3) {
      return {
        gradient:
          colorMode === 'light'
            ? (isDay
                ? 'linear-gradient(180deg, rgba(224, 242, 254, 0.6) 0%, rgba(203, 213, 225, 0.7) 100%)'
                : 'linear-gradient(180deg, rgba(100, 116, 139, 0.55) 0%, rgba(71, 85, 105, 0.75) 100%)')
            : 'linear-gradient(180deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 41, 59, 0.92) 100%)',
        imgUrl: isDay
          ? 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=1600&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=1600&auto=format&fit=crop&q=80',
      };
    }
    // 6. 맑음 (Clear)
    return {
      gradient:
        colorMode === 'light'
          ? (isDay
              ? 'linear-gradient(180deg, rgba(186, 230, 253, 0.5) 0%, rgba(254, 240, 138, 0.35) 100%)'
              : 'linear-gradient(180deg, rgba(30, 58, 138, 0.5) 0%, rgba(15, 23, 42, 0.75) 100%)')
          : (isDay
              ? 'linear-gradient(180deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 58, 138, 0.85) 100%)'
              : 'linear-gradient(180deg, rgba(2, 6, 23, 0.88) 0%, rgba(15, 23, 42, 0.95) 100%)'),
      imgUrl: isDay
        ? 'https://images.unsplash.com/photo-1601297183305-6df142704ea2?w=1600&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1600&auto=format&fit=crop&q=80',
    };
  }, [weatherData, colorMode]);

  return (
    <div
      className="weather-app-wrapper"
      data-theme={colorMode}
      style={{
        backgroundImage: `${weatherBg.gradient}, url(${weatherBg.imgUrl})`,
      }}
    >
      <div className="weather-app">
        {/* 1. 상단 헤더 */}
        <header className="app-header">
          <div className="header-title">
            <div className="title-row">
              <h1>실시간 날씨 & 미세먼지</h1>
              <span className="live-badge">LIVE</span>
            </div>
            <p className="subtitle">Open-Meteo 공개 API 연동 스마트 기상 대시보드</p>
          </div>

          <div className="header-actions">
            {/* 라이트/다크 모드 토글 버튼 */}
            <button
              type="button"
              className="theme-mode-btn"
              onClick={toggleColorMode}
              title={colorMode === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}
            >
              {colorMode === 'light' ? (
                <>
                  <Moon size={16} />
                  <span>다크 모드</span>
                </>
              ) : (
                <>
                  <Sun size={16} color="#f59e0b" />
                  <span>라이트 모드</span>
                </>
              )}
            </button>

            {/* 단위 변환 토글 스위치 (섭씨 °C / 화씨 °F) */}
            <div className="unit-toggle" role="group" aria-label="온도 단위 전환">
              <button
                type="button"
                className={`unit-btn ${unit === 'C' ? 'active' : ''}`}
                onClick={() => setUnit('C')}
              >
                °C
              </button>
              <button
                type="button"
                className={`unit-btn ${unit === 'F' ? 'active' : ''}`}
                onClick={() => setUnit('F')}
              >
                °F
              </button>
            </div>

            {/* 새로고침 버튼 */}
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
              <CurrentWeather
                weatherData={weatherData}
                unit={unit}
                convertTemp={convertTemp}
              />
              <AirQualityCard airQualityData={airQualityData} />
            </div>

            {/* 24시간 시간별 기온 SVG 차트 */}
            <HourlyChart
              weatherData={weatherData}
              unit={unit}
              convertTemp={convertTemp}
            />

            {/* 7일간 주간 예보 */}
            <WeeklyForecast
              weatherData={weatherData}
              unit={unit}
              convertTemp={convertTemp}
            />
          </main>
        )}

        {/* 푸터 */}
        <footer className="app-footer">
          <p>Open-Meteo 전세계 공개 기상 데이터 API 연동 (No API Key Required)</p>
          <p className="copyright">한국폴리텍대학 강서캠퍼스 사이버보안과 실습 프로젝트</p>
        </footer>
      </div>
    </div>
  );
}
