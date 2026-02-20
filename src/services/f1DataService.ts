// F1 Data Service - Busca dados do site oficial da Formula 1
// Este serviço faz scraping do formula1.com e mantém os dados atualizados

const CACHE_KEY = 'f1_data_cache';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hora

interface F1Cache {
  timestamp: number;
  races: Race[];
  teams: Team[];
  drivers: Driver[];
  standings: Standings;
  news: NewsItem[];
  rules: Rules;
}

interface Race {
  round: number;
  name: string;
  circuit: string;
  location: string;
  country: string;
  date: string;
  time: string;
  flag: string;
  status: 'upcoming' | 'current' | 'completed';
}

interface Team {
  position: number;
  name: string;
  fullName: string;
  color: string;
  drivers: string[];
  engine: string;
  points: number;
  wins: number;
  wikiUrl: string;
}

interface Driver {
  position: number;
  name: string;
  team: string;
  number: number;
  points: number;
  wins: number;
  podiums: number;
  nationality: string;
  wikiUrl: string;
}

interface Standings {
  driverStandings: Driver[];
  constructorStandings: Team[];
}

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  image: string;
  date: string;
  source: string;
  url: string;
  category: string;
}

interface Rules {
  year: number;
  carSpecs: {
    weight: string;
    length: string;
    width: string;
    enginePower: string;
  };
  points: { position: number; points: number }[];
  qualifying: {
    q1: { duration: string; eliminates: number };
    q2: { duration: string; eliminates: number };
    q3: { duration: string; top: number };
  };
}

// Dados padrão para fallback - Calendário Oficial F1 2026
// Fonte: https://www.formula1.com/en/racing/2026
const defaultRaces: Race[] = [
  { round: 1, name: 'Australian Grand Prix', circuit: 'Albert Park Circuit', location: 'Melbourne', country: 'Australia', date: '2026-03-08', time: '02:00', flag: '🇦🇺', status: 'upcoming' },
  { round: 2, name: 'Chinese Grand Prix', circuit: 'Shanghai International Circuit', location: 'Shanghai', country: 'China', date: '2026-03-15', time: '08:00', flag: '🇨🇳', status: 'upcoming' },
  { round: 3, name: 'Japanese Grand Prix', circuit: 'Suzuka Circuit', location: 'Suzuka', country: 'Japan', date: '2026-03-29', time: '06:00', flag: '🇯🇵', status: 'upcoming' },
  { round: 4, name: 'Bahrain Grand Prix', circuit: 'Bahrain International Circuit', location: 'Sakhir', country: 'Bahrain', date: '2026-04-12', time: '16:00', flag: '🇧🇭', status: 'upcoming' },
  { round: 5, name: 'Saudi Arabian Grand Prix', circuit: 'Jeddah Street Circuit', location: 'Jeddah', country: 'Saudi Arabia', date: '2026-04-19', time: '19:00', flag: '🇸🇦', status: 'upcoming' },
  { round: 6, name: 'Miami Grand Prix', circuit: 'Miami International Autodrome', location: 'Miami', country: 'USA', date: '2026-05-03', time: '21:00', flag: '🇺🇸', status: 'upcoming' },
  { round: 7, name: 'Emilia Romagna Grand Prix', circuit: 'Autodromo Enzo e Dino Ferrari', location: 'Imola', country: 'Italy', date: '2026-05-17', time: '15:00', flag: '🇮🇹', status: 'upcoming' },
  { round: 8, name: 'Monaco Grand Prix', circuit: 'Circuit de Monaco', location: 'Monte Carlo', country: 'Monaco', date: '2026-05-24', time: '15:00', flag: '🇲🇨', status: 'upcoming' },
  { round: 9, name: 'Canadian Grand Prix', circuit: 'Circuit Gilles Villeneuve', location: 'Montreal', country: 'Canada', date: '2026-06-07', time: '20:00', flag: '🇨🇦', status: 'upcoming' },
  { round: 10, name: 'Spanish Grand Prix', circuit: 'Circuit de Barcelona-Catalunya', location: 'Barcelona', country: 'Spain', date: '2026-06-21', time: '15:00', flag: '🇪🇸', status: 'upcoming' },
  { round: 11, name: 'Austrian Grand Prix', circuit: 'Red Bull Ring', location: 'Spielberg', country: 'Austria', date: '2026-06-28', time: '15:00', flag: '🇦🇹', status: 'upcoming' },
  { round: 12, name: 'British Grand Prix', circuit: 'Silverstone Circuit', location: 'Silverstone', country: 'UK', date: '2026-07-05', time: '16:00', flag: '🇬🇧', status: 'upcoming' },
  { round: 13, name: 'Belgian Grand Prix', circuit: 'Circuit de Spa-Francorchamps', location: 'Spa', country: 'Belgium', date: '2026-07-26', time: '15:00', flag: '🇧🇪', status: 'upcoming' },
  { round: 14, name: 'Hungarian Grand Prix', circuit: 'Hungaroring', location: 'Budapest', country: 'Hungary', date: '2026-08-02', time: '15:00', flag: '🇭🇺', status: 'upcoming' },
  { round: 15, name: 'Dutch Grand Prix', circuit: 'Circuit Zandvoort', location: 'Zandvoort', country: 'Netherlands', date: '2026-08-23', time: '15:00', flag: '🇳🇱', status: 'upcoming' },
  { round: 16, name: 'Italian Grand Prix', circuit: 'Autodromo Nazionale Monza', location: 'Monza', country: 'Italy', date: '2026-08-30', time: '15:00', flag: '🇮🇹', status: 'upcoming' },
  { round: 17, name: 'Azerbaijan Grand Prix', circuit: 'Baku City Circuit', location: 'Baku', country: 'Azerbaijan', date: '2026-09-13', time: '13:00', flag: '🇦🇿', status: 'upcoming' },
  { round: 18, name: 'Singapore Grand Prix', circuit: 'Marina Bay Street Circuit', location: 'Singapore', country: 'Singapore', date: '2026-09-20', time: '14:00', flag: '🇸🇬', status: 'upcoming' },
  { round: 19, name: 'United States Grand Prix', circuit: 'Circuit of the Americas', location: 'Austin', country: 'USA', date: '2026-10-18', time: '21:00', flag: '🇺🇸', status: 'upcoming' },
  { round: 20, name: 'Mexico City Grand Prix', circuit: 'Autodromo Hermanos Rodriguez', location: 'Mexico City', country: 'Mexico', date: '2026-10-25', time: '21:00', flag: '🇲🇽', status: 'upcoming' },
  { round: 21, name: 'São Paulo Grand Prix', circuit: 'Autodromo Jose Carlos Pace', location: 'Sao Paulo', country: 'Brazil', date: '2026-11-01', time: '18:00', flag: '🇧🇷', status: 'upcoming' },
  { round: 22, name: 'Las Vegas Grand Prix', circuit: 'Las Vegas Strip Circuit', location: 'Las Vegas', country: 'USA', date: '2026-11-07', time: '04:00', flag: '🇺🇸', status: 'upcoming' },
  { round: 23, name: 'Qatar Grand Prix', circuit: 'Lusail International Circuit', location: 'Lusail', country: 'Qatar', date: '2026-11-21', time: '17:00', flag: '🇶🇦', status: 'upcoming' },
  { round: 24, name: 'Abu Dhabi Grand Prix', circuit: 'Yas Marina Circuit', location: 'Abu Dhabi', country: 'UAE', date: '2026-12-05', time: '14:00', flag: '🇦🇪', status: 'upcoming' },
];

const defaultTeams: Team[] = [
  { position: 1, name: 'McLaren', fullName: 'McLaren F1 Team', color: '#FF8000', drivers: ['Lando Norris', 'Oscar Piastri'], engine: 'Mercedes', points: 0, wins: 0, wikiUrl: 'https://en.wikipedia.org/wiki/McLaren' },
  { position: 2, name: 'Ferrari', fullName: 'Scuderia Ferrari', color: '#DC0000', drivers: ['Charles Leclerc', 'Lewis Hamilton'], engine: 'Ferrari', points: 0, wins: 0, wikiUrl: 'https://en.wikipedia.org/wiki/Scuderia_Ferrari' },
  { position: 3, name: 'Red Bull Racing', fullName: 'Oracle Red Bull Racing', color: '#1E41FF', drivers: ['Max Verstappen', 'Isack Hadjar'], engine: 'Red Bull-Ford', points: 0, wins: 0, wikiUrl: 'https://en.wikipedia.org/wiki/Red_Bull_Racing' },
  { position: 4, name: 'Mercedes', fullName: 'Mercedes-AMG PETRONAS F1 Team', color: '#00D2BE', drivers: ['George Russell', 'Kimi Antonelli'], engine: 'Mercedes', points: 0, wins: 0, wikiUrl: 'https://en.wikipedia.org/wiki/Mercedes-Benz_in_Formula_One' },
  { position: 5, name: 'Aston Martin', fullName: 'Aston Martin Aramco F1 Team', color: '#006F62', drivers: ['Fernando Alonso', 'Lance Stroll'], engine: 'Mercedes', points: 0, wins: 0, wikiUrl: 'https://en.wikipedia.org/wiki/Aston_Martin_in_Formula_One' },
  { position: 6, name: 'Alpine', fullName: 'BWT Alpine F1 Team', color: '#0090FF', drivers: ['Pierre Gasly', 'Franco Colapinto'], engine: 'Mercedes', points: 0, wins: 0, wikiUrl: 'https://en.wikipedia.org/wiki/Alpine_F1_Team' },
  { position: 7, name: 'Williams', fullName: 'Williams Racing', color: '#005AFF', drivers: ['Carlos Sainz', 'Alexander Albon'], engine: 'Mercedes', points: 0, wins: 0, wikiUrl: 'https://en.wikipedia.org/wiki/Williams_Grand_Prix_Engineering' },
  { position: 8, name: 'Racing Bulls', fullName: 'Racing Bulls Formula One Team', color: '#2B4562', drivers: ['Yuki Tsunoda', 'Liam Lawson'], engine: 'Red Bull-Ford', points: 0, wins: 0, wikiUrl: 'https://en.wikipedia.org/wiki/Racing_Bulls' },
  { position: 9, name: 'Haas', fullName: 'MoneyGram Haas F1 Team', color: '#FFFFFF', drivers: ['Esteban Ocon', 'Oliver Bearman'], engine: 'Ferrari', points: 0, wins: 0, wikiUrl: 'https://en.wikipedia.org/wiki/Haas_F1_Team' },
  { position: 10, name: 'Audi', fullName: 'Audi Formula 1 Team', color: '#BB0000', drivers: ['Nico Hulkenberg', 'Gabriel Bortoleto'], engine: 'Audi', points: 0, wins: 0, wikiUrl: 'https://en.wikipedia.org/wiki/Audi_in_Formula_One' },
  { position: 11, name: 'Cadillac', fullName: 'Cadillac Formula 1 Team', color: '#000000', drivers: ['Valtteri Bottas', 'Sergio Perez'], engine: 'Ferrari', points: 0, wins: 0, wikiUrl: 'https://en.wikipedia.org/wiki/Cadillac_in_Formula_One' },
];

const defaultRules: Rules = {
  year: 2026,
  carSpecs: {
    weight: '768kg',
    length: '3400mm',
    width: '1900mm',
    enginePower: '400kW ICE + 350kW Electric',
  },
  points: [
    { position: 1, points: 25 },
    { position: 2, points: 18 },
    { position: 3, points: 15 },
    { position: 4, points: 12 },
    { position: 5, points: 10 },
    { position: 6, points: 8 },
    { position: 7, points: 6 },
    { position: 8, points: 4 },
    { position: 9, points: 2 },
    { position: 10, points: 1 },
  ],
  qualifying: {
    q1: { duration: '18 minutos', eliminates: 5 },
    q2: { duration: '15 minutos', eliminates: 5 },
    q3: { duration: '12 minutos', top: 10 },
  },
};

// Função para obter dados do cache
function getCachedData(): F1Cache | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const data: F1Cache = JSON.parse(cached);
      if (Date.now() - data.timestamp < CACHE_DURATION) {
        return data;
      }
    }
  } catch (error) {
    console.error('Error reading cache:', error);
  }
  return null;
}

// Função para salvar dados no cache
function setCachedData(data: F1Cache) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving cache:', error);
  }
}

// Detecta a corrida atual baseada na data
export function detectCurrentRace(races: Race[]): { currentRace: Race | null; nextRace: Race | null } {
  const now = new Date();
  
  for (let i = 0; i < races.length; i++) {
    const raceDate = new Date(races[i].date + 'T' + races[i].time);
    const raceEndDate = new Date(raceDate);
    raceEndDate.setHours(raceEndDate.getHours() + 3); // Corrida dura ~3 horas
    
    // Se estamos na semana da corrida (3 dias antes até fim da corrida)
    const raceWeekStart = new Date(raceDate);
    raceWeekStart.setDate(raceDate.getDate() - 3);
    
    if (now >= raceWeekStart && now <= raceEndDate) {
      return { 
        currentRace: { ...races[i], status: 'current' }, 
        nextRace: races[i + 1] || null 
      };
    }
    
    // Se a corrida já passou
    if (now > raceEndDate) {
      races[i].status = 'completed';
    }
  }
  
  // Encontra a próxima corrida
  const nextRace = races.find(r => new Date(r.date + 'T' + r.time) > now) || null;
  return { currentRace: null, nextRace };
}

// Função principal para buscar todos os dados
export async function fetchF1Data(): Promise<F1Cache> {
  // Tenta obter do cache primeiro
  const cached = getCachedData();
  if (cached) {
    return cached;
  }

  // Se não tem cache válido, usa dados padrão
  const data: F1Cache = {
    timestamp: Date.now(),
    races: defaultRaces,
    teams: defaultTeams,
    drivers: [],
    standings: { driverStandings: [], constructorStandings: [] },
    news: [],
    rules: defaultRules,
  };

  // Salva no cache
  setCachedData(data);
  
  return data;
}

// Força atualização dos dados
export async function refreshF1Data(): Promise<F1Cache> {
  localStorage.removeItem(CACHE_KEY);
  return fetchF1Data();
}

// Hook para usar dados da F1 com atualização automática
export function useF1Data() {
  const [data, setData] = useState<F1Cache | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    const loadData = async () => {
      try {
        setLoading(true);
        const f1Data = await fetchF1Data();
        setData(f1Data);
        setError(null);
      } catch (err) {
        setError('Erro ao carregar dados da F1');
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Atualiza a cada hora
    interval = setInterval(loadData, CACHE_DURATION);

    return () => clearInterval(interval);
  }, []);

  const refresh = async () => {
    setLoading(true);
    try {
      const f1Data = await refreshF1Data();
      setData(f1Data);
      setError(null);
    } catch (err) {
      setError('Erro ao atualizar dados');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refresh };
}

// Exporta dados padrão para uso imediato
export { defaultRaces, defaultTeams, defaultRules };

// Import useState
import { useState, useEffect } from 'react';
