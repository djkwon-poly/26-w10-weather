import { Droplets } from 'lucide-react';
import WeatherIcon from './WeatherIcon';
import { getWeatherInfo } from '../api/weather';

export default function WeeklyForecast({ weatherData }) {
  const daily = weatherData?.daily;
  if (!daily || !daily.time || !daily.time.length) return null;

  const days = daily.time.map((timeStr, index) => {
    const date = new Date(timeStr);
    let dayLabel = date.toLocaleDateString('ko-KR', { weekday: 'short' });
    if (index === 0) dayLabel = '오늘';
    else if (index === 1) dayLabel = '내일';

    const monthDay = `${date.getMonth() + 1}.${date.getDate()}`;
    const code = daily.weather_code[index];
    const weatherInfo = getWeatherInfo(code);
    const maxTemp = Math.round(daily.temperature_2m_max[index]);
    const minTemp = Math.round(daily.temperature_2m_min[index]);
    const rainProb = daily.precipitation_probability_max ? daily.precipitation_probability_max[index] : null;

    return {
      timeStr,
      dayLabel,
      monthDay,
      weatherInfo,
      maxTemp,
      minTemp,
      rainProb,
    };
  });

  // 전체 7일 중 최고/최저 기준 기온 범위
  const allMax = Math.max(...days.map((d) => d.maxTemp));
  const allMin = Math.min(...days.map((d) => d.minTemp));
  const totalRange = Math.max(allMax - allMin, 1);

  return (
    <section className="card weekly-card">
      <div className="card-header">
        <span className="card-badge">7-DAY FORECAST</span>
        <span className="card-subtitle">향후 7일간 주간 예보</span>
      </div>

      <div className="weekly-list">
        {days.map((day) => {
          // 기온 바 위치 계산
          const leftPercent = ((day.minTemp - allMin) / totalRange) * 100;
          const widthPercent = Math.max(((day.maxTemp - day.minTemp) / totalRange) * 100, 8);

          return (
            <div key={day.timeStr} className="weekly-row">
              <div className="day-col">
                <span className="day-name">{day.dayLabel}</span>
                <span className="day-date">{day.monthDay}</span>
              </div>

              <div className="weather-col">
                <WeatherIcon
                  name={day.weatherInfo.icon}
                  size={24}
                  color={day.weatherInfo.color}
                />
                <span className="weather-status-text">{day.weatherInfo.label}</span>
                {day.rainProb !== null && day.rainProb > 0 && (
                  <span className="rain-prob">
                    <Droplets size={12} />
                    {day.rainProb}%
                  </span>
                )}
              </div>

              <div className="temp-range-col">
                <span className="min-temp-label">{day.minTemp}°</span>
                <div className="temp-bar-track">
                  <div
                    className="temp-bar-fill"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                    }}
                  />
                </div>
                <span className="max-temp-label">{day.maxTemp}°</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

