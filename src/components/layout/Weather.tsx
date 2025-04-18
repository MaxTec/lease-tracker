import { useEffect, useState } from 'react';
import { WiDaySunny, WiCloudy, WiRain, WiThunderstorm, WiSnow, WiDust, WiNa } from 'react-icons/wi';
import { Session } from 'next-auth';
import { useTranslations } from 'next-intl';

interface WeatherData {
  main: {
    temp: number;
  };
  weather: Array<{
    main: string;
    description: string;
  }>;
}

interface WeatherProps {
  session: Session | null;
}

const getWeatherIcon = (weatherMain: string) => {
  const iconSize = 24;
  switch (weatherMain.toLowerCase()) {
    case 'clear':
      return <WiDaySunny size={iconSize} />;
    case 'clouds':
      return <WiCloudy size={iconSize} />;
    case 'rain':
      return <WiRain size={iconSize} />;
    case 'thunderstorm':
      return <WiThunderstorm size={iconSize} />;
    case 'snow':
      return <WiSnow size={iconSize} />;
    default:
      return <WiDust size={iconSize} />;
  }
};

const getGreeting = (t: (key: string) => string) => {
  const hour = new Date().getHours();
  if (hour < 12) return t('weather.greeting.morning');
  if (hour < 18) return t('weather.greeting.afternoon');
  return t('weather.greeting.evening');
};

export default function Weather({ session }: WeatherProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const t = useTranslations();

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setError(false);
        // Cancun coordinates
        const lat = 21.1619;
        const lon = -86.8515;
        const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
        
        if (!apiKey) {
          console.error('OpenWeather API key not found');
          setError(true);
          setLoading(false);
          return;
        }

        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
        );
        
        if (!response.ok) {
          throw new Error('Weather API request failed');
        }
        
        const data = await response.json();
        setWeather(data);
      } catch (error) {
        console.error('Error fetching weather:', error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    // Refresh weather every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="text-gray-600">{t('weather.loading')}</div>;
  }

  if (error || !weather) {
    return (
      <div className="flex items-center space-x-2 text-gray-400" title={t('weather.unavailable')}>
        <span><WiNa size={24} /></span>
        <span className="hidden sm:inline">{t('weather.unavailable')}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4 text-gray-600">
      {session?.user?.name && (
        <span className="text-sm font-medium">
          {getGreeting(t)}, {session.user.name.split(' ')[0]}!
        </span>
      )}
      {weather.weather[0] && (
        <>
          <span>{getWeatherIcon(weather.weather[0].main)}</span>
          <span>{Math.round(weather.main.temp)}°C</span>
          <span className="hidden sm:inline">Cancun</span>
        </>
      )}
    </div>
  );
} 