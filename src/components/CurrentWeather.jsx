import { Thermometer, Droplets, Wind, Activity } from 'lucide-react';
import WeatherIcon from './WeatherIcon';
import { getWeatherInfo } from '../api/weather';

export default function CurrentWeather({ weatherData, unit = 'C', convertTemp }) {
  const current = weatherData?.current;
  if (!current) return null;

  const weatherInfo = getWeatherInfo(current.weather_code);
  const tempVal = convertTemp ? convertTemp(current.temperature_2m) : Math.round(current.temperature_2m);
  const apparentVal = convertTemp ? convertTemp(current.apparent_temperature) : Math.round(current.apparent_temperature);

  return (
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
            {tempVal}
            <span className="temp-unit">°{unit}</span>
          </span>
          <span className="apparent-temp">
            체감 {apparentVal}°{unit}
          </span>
        </div>
      </div>

      <div className="weather-details-grid">
        <div className="detail-item">
          <div className="detail-label">
            <Thermometer size={16} />
            <span>체감온도</span>
          </div>
          <div className="detail-value">{apparentVal}°{unit}</div>
        </div>
        <div className="detail-item">
          <div className="detail-label">
            <Droplets size={16} />
            <span>습도</span>
          </div>
          <div className="detail-value">{current.relative_humidity_2m}%</div>
        </div>
        <div className="detail-item">
          <div className="detail-label">
            <Wind size={16} />
            <span>풍속</span>
          </div>
          <div className="detail-value">{current.wind_speed_10m.toFixed(1)} km/h</div>
        </div>
        <div className="detail-item">
          <div className="detail-label">
            <Activity size={16} />
            <span>강수량</span>
          </div>
          <div className="detail-value">{current.precipitation ?? 0} mm</div>
        </div>
      </div>
    </section>
  );
}
