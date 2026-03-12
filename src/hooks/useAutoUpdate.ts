import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchF1News, checkForUpdates, forceNewsUpdate, type NewsItem } from '@/services/newsApi';

interface UseAutoUpdateOptions {
  interval?: number; // Intervalo em ms
  immediate?: boolean; // Buscar imediatamente ao montar
  language?: 'pt' | 'en'; // Idioma das notícias
}

interface UseAutoUpdateReturn {
  news: NewsItem[];
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  isUpdating: boolean;
  hasUpdate: boolean;
  refresh: () => Promise<void>;
  dismissUpdate: () => void;
}

export const useAutoUpdate = (options: UseAutoUpdateOptions = {}): UseAutoUpdateReturn => {
  const { interval = 5 * 60 * 1000, immediate = true, language = 'pt' } = options; // 5 minutos padrão
  
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasUpdate, setHasUpdate] = useState(false);
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Função para buscar notícias
  const fetchNews = useCallback(async (showLoading = false) => {
    if (showLoading) {
      setIsUpdating(true);
    }
    
    try {
      const data = await fetchF1News(language);
      setNews(data);
      setLastUpdate(new Date());
      setError(null);
      setHasUpdate(false);
    } catch (err) {
      setError(language === 'en' ? 'Error updating news' : 'Erro ao atualizar notícias');
      console.error(err);
    } finally {
      if (showLoading) {
        setIsUpdating(false);
      }
      setLoading(false);
    }
  }, [language]);

  // Função para verificar atualizações
  const checkUpdates = useCallback(async () => {
    const shouldUpdate = await checkForUpdates(language);
    if (shouldUpdate) {
      setHasUpdate(true);
      // Auto-atualiza se passou tempo suficiente
      await fetchNews(true);
    }
  }, [fetchNews, language]);

  // Função de refresh manual
  const refresh = useCallback(async () => {
    setIsUpdating(true);
    try {
      const data = await forceNewsUpdate(language);
      setNews(data);
      setLastUpdate(new Date());
      setError(null);
      setHasUpdate(false);
    } catch (err) {
      setError(language === 'en' ? 'Error updating news' : 'Erro ao atualizar notícias');
    } finally {
      setIsUpdating(false);
    }
  }, [language]);

  // Descartar notificação de update
  const dismissUpdate = useCallback(() => {
    setHasUpdate(false);
  }, []);

  // Efeito para busca inicial
  useEffect(() => {
    if (immediate) {
      fetchNews(true);
    }
  }, [immediate, fetchNews]);

  // Efeito para intervalo de atualização automática
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      checkUpdates();
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [interval, checkUpdates]);

  // Efeito para visibilidade da página (atualiza quando usuário volta)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkUpdates();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkUpdates]);

  return {
    news,
    loading,
    error,
    lastUpdate,
    isUpdating,
    hasUpdate,
    refresh,
    dismissUpdate
  };
};

// Hook para contador regressivo de próxima corrida
interface RaceCountdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isRaceDay: boolean;
}

export const useRaceCountdown = (raceDate: Date): RaceCountdown => {
  const [countdown, setCountdown] = useState<RaceCountdown>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isRaceDay: false
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = raceDate.getTime() - now.getTime();

      if (difference <= 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isRaceDay: true
        };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
        isRaceDay: false
      };
    };

    // Atualiza imediatamente
    setCountdown(calculateTimeLeft());

    // Atualiza a cada segundo
    const timer = setInterval(() => {
      setCountdown(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [raceDate]);

  return countdown;
};

// Hook para dados ao vivo (simulação de websocket)
interface LiveData {
  isLive: boolean;
  sessionType: string | null;
  leader: string | null;
  fastestLap: string | null;
}

export const useLiveSession = (): LiveData => {
  const [liveData, setLiveData] = useState<LiveData>({
    isLive: false,
    sessionType: null,
    leader: null,
    fastestLap: null
  });

  useEffect(() => {
    // Simula verificação de sessão ao vivo
    // Em produção, isso conectaria a uma API real
    const checkLiveSession = () => {
      const now = new Date();
      const day = now.getDay();
      const hour = now.getHours();
      
      // Simula sessões ao vivo em horários específicos de GP
      // Sexta: Treino 1 (12h-13h), Treino 2 (15h-16h)
      // Sábado: Treino 3 (11h-12h), Qualifying (14h-15h)
      // Domingo: Corrida (14h-16h)
      
      let isLive = false;
      let sessionType = null;
      
      if (day === 5) { // Sexta
        if (hour === 12) {
          isLive = true;
          sessionType = 'Treino Livre 1';
        } else if (hour === 15) {
          isLive = true;
          sessionType = 'Treino Livre 2';
        }
      } else if (day === 6) { // Sábado
        if (hour === 11) {
          isLive = true;
          sessionType = 'Treino Livre 3';
        } else if (hour === 14) {
          isLive = true;
          sessionType = 'Qualifying';
        }
      } else if (day === 0) { // Domingo
        if (hour >= 14 && hour < 16) {
          isLive = true;
          sessionType = 'Corrida';
        }
      }

      setLiveData({
        isLive,
        sessionType,
        leader: isLive ? 'Atualizando...' : null,
        fastestLap: isLive ? 'Atualizando...' : null
      });
    };

    checkLiveSession();
    const interval = setInterval(checkLiveSession, 60000); // Verifica a cada minuto

    return () => clearInterval(interval);
  }, []);

  return liveData;
};

export default useAutoUpdate;
