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
} from 'lucide-react';

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

export default function WeatherIcon({ name, size = 48, color = 'currentColor', className = '' }) {
  const Component = ICON_COMPONENTS[name] || Cloud;
  return <Component size={size} color={color} strokeWidth={2} className={className} />;
}

