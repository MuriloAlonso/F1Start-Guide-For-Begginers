// Serviço para buscar notícias de F1 de múltiplas fontes
// Usa RSS feeds e APIs públicas para obter notícias em tempo real

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  date: string;
  tag: string;
  important: boolean;
  url?: string;
  source: string;
}

// Cache configuration
const CACHE_KEY = 'f1_news_cache_v4';
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

// Chave de cache separada por idioma
const getCacheKey = (language: 'pt' | 'en') => `${CACHE_KEY}_${language}`;

interface CacheData {
  news: NewsItem[];
  timestamp: number;
}

// Notícias fallback em caso de falha nas APIs
const FALLBACK_NEWS_PT: NewsItem[] = [
  {
    id: '1',
    title: 'Charles Leclerc lidera testes no Bahrein',
    summary: 'Ferrari mostra força no primeiro dia de testes de pré-temporada no Bahrein, com Leclerc no topo da tabela de tempos.',
    date: new Date().toISOString(),
    tag: 'Testes',
    important: true,
    source: 'Formula1.com',
    url: 'https://www.formula1.com'
  },
  {
    id: '2',
    title: 'Red Bull e Mercedes enfrentam problemas técnicos',
    summary: 'Isack Hadjar e Kimi Antonelli tiveram poucas voltas no primeiro dia devido a problemas hidráulicos e no power unit.',
    date: new Date(Date.now() - 3600000).toISOString(),
    tag: 'Problemas',
    important: true,
    source: 'Sky Sports F1',
    url: 'https://www.skysports.com/f1'
  },
  {
    id: '3',
    title: 'Lewis Hamilton troca de engenheiro de corrida',
    summary: 'Hamilton admitiu que a mudança de engenheiro pode ser "prejudicial" no início da temporada com a Ferrari.',
    date: new Date(Date.now() - 7200000).toISOString(),
    tag: 'Ferrari',
    important: false,
    source: 'BBC Sport',
    url: 'https://www.bbc.com/sport/formula1'
  }
];

const FALLBACK_NEWS_EN: NewsItem[] = [
  {
    id: '1',
    title: 'Charles Leclerc leads Bahrain testing',
    summary: 'Ferrari shows strength on the first day of pre-season testing in Bahrain, with Leclerc at the top of the timesheets.',
    date: new Date().toISOString(),
    tag: 'Testing',
    important: true,
    source: 'Formula1.com',
    url: 'https://www.formula1.com'
  },
  {
    id: '2',
    title: 'Red Bull and Mercedes face technical issues',
    summary: 'Isack Hadjar and Kimi Antonelli had few laps on the first day due to hydraulic and power unit problems.',
    date: new Date(Date.now() - 3600000).toISOString(),
    tag: 'Issues',
    important: true,
    source: 'Sky Sports F1',
    url: 'https://www.skysports.com/f1'
  },
  {
    id: '3',
    title: 'Lewis Hamilton changes race engineer',
    summary: 'Hamilton admitted that the engineer change may be "detrimental" at the start of the season with Ferrari.',
    date: new Date(Date.now() - 7200000).toISOString(),
    tag: 'Ferrari',
    important: false,
    source: 'BBC Sport',
    url: 'https://www.bbc.com/sport/formula1'
  }
];

// Função para gerar ID único
const generateId = () => Math.random().toString(36).substr(2, 9);

// Função para formatar data relativa
const formatRelativeDate = (dateString: string, language: 'pt' | 'en' = 'pt'): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (language === 'en') {
    if (diffMins < 5) return 'Now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  }

  if (diffMins < 5) return 'Agora';
  if (diffMins < 60) return `${diffMins} min atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays === 1) return 'Ontem';
  return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
};

// Simulador de notícias atualizadas (para quando APIs falham)
const generateUpdatedNews = (language: 'pt' | 'en' = 'pt'): NewsItem[] => {
  const now = new Date();
  const hour = now.getHours();
  
  const isEnglish = language === 'en';
  
  // Notícias base que são atualizadas com timestamps recentes
  const baseNews: NewsItem[] = isEnglish ? [
    {
      id: generateId(),
      title: 'Charles Leclerc leads Bahrain testing',
      summary: 'Ferrari shows strength on the first day of pre-season testing in Bahrain, with Leclerc at the top of the timesheets.',
      date: new Date(now.getTime() - 2 * 3600000).toISOString(),
      tag: 'Testing',
      important: true,
      source: 'Formula1.com',
      url: 'https://www.formula1.com'
    },
    {
      id: generateId(),
      title: 'Red Bull and Mercedes face technical issues',
      summary: 'Isack Hadjar and Kimi Antonelli had few laps on the first day due to hydraulic and power unit problems.',
      date: new Date(now.getTime() - 4 * 3600000).toISOString(),
      tag: 'Issues',
      important: true,
      source: 'Sky Sports F1',
      url: 'https://www.skysports.com/f1'
    },
    {
      id: generateId(),
      title: 'Lewis Hamilton changes race engineer',
      summary: 'Hamilton admitted that the engineer change may be "detrimental" at the start of the season with Ferrari.',
      date: new Date(now.getTime() - 6 * 3600000).toISOString(),
      tag: 'Ferrari',
      important: false,
      source: 'BBC Sport',
      url: 'https://www.bbc.com/sport/formula1'
    },
    {
      id: generateId(),
      title: 'Lando Norris will use number 1 in 2026',
      summary: 'The 2025 world champion confirmed he will race with number 1 this season, as is tradition.',
      date: new Date(now.getTime() - 12 * 3600000).toISOString(),
      tag: 'Champion',
      important: true,
      source: 'ESPN F1',
      url: 'https://www.espn.com/f1'
    },
    {
      id: generateId(),
      title: 'Cadillac reveals livery during Super Bowl',
      summary: 'The new American team showed their car livery for the first time in a commercial during Super Bowl 2026.',
      date: new Date(now.getTime() - 24 * 3600000).toISOString(),
      tag: 'Cadillac',
      important: false,
      source: 'Motorsport.com',
      url: 'https://www.motorsport.com/f1'
    },
    {
      id: generateId(),
      title: 'Zhou Guanyu confirmed as Cadillac reserve',
      summary: 'The first Chinese driver to race in F1 returns as reserve driver for the new American team.',
      date: new Date(now.getTime() - 48 * 3600000).toISOString(),
      tag: 'Market',
      important: false,
      source: 'Formula1.com',
      url: 'https://www.formula1.com'
    }
  ] : [
    {
      id: generateId(),
      title: 'Charles Leclerc lidera testes no Bahrein',
      summary: 'Ferrari mostra força no primeiro dia de testes de pré-temporada no Bahrein, com Leclerc no topo da tabela de tempos.',
      date: new Date(now.getTime() - 2 * 3600000).toISOString(),
      tag: 'Testes',
      important: true,
      source: 'Formula1.com',
      url: 'https://www.formula1.com'
    },
    {
      id: generateId(),
      title: 'Red Bull e Mercedes enfrentam problemas técnicos',
      summary: 'Isack Hadjar e Kimi Antonelli tiveram poucas voltas no primeiro dia devido a problemas hidráulicos e no power unit.',
      date: new Date(now.getTime() - 4 * 3600000).toISOString(),
      tag: 'Problemas',
      important: true,
      source: 'Sky Sports F1',
      url: 'https://www.skysports.com/f1'
    },
    {
      id: generateId(),
      title: 'Lewis Hamilton troca de engenheiro de corrida',
      summary: 'Hamilton admitiu que a mudança de engenheiro pode ser "prejudicial" no início da temporada com a Ferrari.',
      date: new Date(now.getTime() - 6 * 3600000).toISOString(),
      tag: 'Ferrari',
      important: false,
      source: 'BBC Sport',
      url: 'https://www.bbc.com/sport/formula1'
    },
    {
      id: generateId(),
      title: 'Lando Norris usará número 1 em 2026',
      summary: 'O campeão mundial de 2025 confirmou que vai correr com o número 1 nesta temporada, como é tradição.',
      date: new Date(now.getTime() - 12 * 3600000).toISOString(),
      tag: 'Campeão',
      important: true,
      source: 'ESPN F1',
      url: 'https://www.espn.com.br/f1'
    },
    {
      id: generateId(),
      title: 'Cadillac revela pintura durante Super Bowl',
      summary: 'A nova equipe americana mostrou pela primeira vez a pintura de seu carro em comercial durante o Super Bowl 2026.',
      date: new Date(now.getTime() - 24 * 3600000).toISOString(),
      tag: 'Cadillac',
      important: false,
      source: 'Motorsport.com',
      url: 'https://www.motorsport.com/f1'
    },
    {
      id: generateId(),
      title: 'Zhou Guanyu confirmado como reserva da Cadillac',
      summary: 'O primeiro chinês a correr na F1 retorna como piloto reserva da nova equipe americana.',
      date: new Date(now.getTime() - 48 * 3600000).toISOString(),
      tag: 'Mercado',
      important: false,
      source: 'Formula1.com',
      url: 'https://www.formula1.com'
    }
  ];

  // Adiciona notícias dinâmicas baseadas na hora do dia
  if (hour >= 8 && hour < 12) {
    baseNews.unshift(isEnglish ? {
      id: generateId(),
      title: 'Morning practice begins in Bahrain',
      summary: 'Teams start work at the Sakhir circuit for the second day of pre-season testing.',
      date: new Date(now.getTime() - 30 * 60000).toISOString(),
      tag: 'Testing',
      important: true,
      source: 'Formula1.com',
      url: 'https://www.formula1.com'
    } : {
      id: generateId(),
      title: 'Treinos da manhã começam no Bahrein',
      summary: 'As equipes iniciam os trabalhos no circuito de Sakhir para o segundo dia de testes de pré-temporada.',
      date: new Date(now.getTime() - 30 * 60000).toISOString(),
      tag: 'Testes',
      important: true,
      source: 'Formula1.com',
      url: 'https://www.formula1.com'
    });
  } else if (hour >= 14 && hour < 18) {
    baseNews.unshift(isEnglish ? {
      id: generateId(),
      title: 'Afternoon results: Ferrari remains strong',
      summary: 'Leclerc and Hamilton keep Ferrari at the top of the timesheets in the afternoon testing session.',
      date: new Date(now.getTime() - 45 * 60000).toISOString(),
      tag: 'Testing',
      important: true,
      source: 'Formula1.com',
      url: 'https://www.formula1.com'
    } : {
      id: generateId(),
      title: 'Resultados da tarde: Ferrari continua forte',
      summary: 'Leclerc e Hamilton mantêm a Ferrari no topo dos tempos na sessão da tarde dos testes.',
      date: new Date(now.getTime() - 45 * 60000).toISOString(),
      tag: 'Testes',
      important: true,
      source: 'Formula1.com',
      url: 'https://www.formula1.com'
    });
  }

  return baseNews;
};

// RSS feeds públicos de F1
const RSS_FEEDS = [
  { url: 'https://feeds.bbci.co.uk/sport/formula1/rss.xml', source: 'BBC Sport F1' },
  { url: 'https://www.motorsport.com/rss/f1/news/', source: 'Motorsport.com' },
  { url: 'https://www.racefans.net/feed/', source: 'RaceFans' },
];

// Proxy CORS para acessar RSS feeds do browser
const CORS_PROXY = 'https://api.allorigins.win/get?url=';

const stripHtml = (html: string): string =>
  html.replace(/<!\[CDATA\[|\]\]>/g, '')
      .replace(/<[^>]*>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .trim();

const getText = (element: Element, tag: string): string => {
  const el = element.querySelector(tag);
  return el ? stripHtml(el.textContent || '') : '';
};

const detectTag = (title: string, categories: string): string => {
  const text = (title + ' ' + categories).toLowerCase();
  if (text.includes('ferrari')) return 'Ferrari';
  if (text.includes('red bull')) return 'Red Bull';
  if (text.includes('mercedes')) return 'Mercedes';
  if (text.includes('mclaren')) return 'McLaren';
  if (text.includes('qualifying') || text.includes('quali')) return 'Qualifying';
  if (text.includes('testing') || text.includes('test')) return 'Testes';
  if (text.includes('transfer') || text.includes('signing') || text.includes('contract')) return 'Mercado';
  if (text.includes('technical') || text.includes('regulation')) return 'Técnico';
  if (text.includes('champion')) return 'Campeão';
  if (text.includes('race') || text.includes('grand prix')) return 'Corrida';
  return 'F1';
};

const fetchWithTimeout = (url: string, ms: number): Promise<Response> => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(id));
};

// Tradução via MyMemory API — suporta CORS no browser, gratuito, sem chave
// Docs: https://mymemory.translated.net/doc/spec.php
const MYMEMORY_URL = 'https://api.mymemory.translated.net/get';

const translateText = async (text: string): Promise<string> => {
  const truncated = text.slice(0, 480); // MyMemory limita 500 chars por requisição
  const url = `${MYMEMORY_URL}?q=${encodeURIComponent(truncated)}&langpair=en|pt-BR`;
  const response = await fetchWithTimeout(url, 8000);
  if (!response.ok) throw new Error(`MyMemory HTTP ${response.status}`);
  const data = await response.json();
  if (data.responseStatus !== 200 && data.responseStatus !== '200') {
    throw new Error(`MyMemory status: ${data.responseStatus}`);
  }
  return data.responseData?.translatedText || text;
};

const translateNewsItems = async (items: NewsItem[]): Promise<NewsItem[]> => {
  const BATCH_SIZE = 4; // Processa 4 artigos por vez para não sobrecarregar a API
  const result: NewsItem[] = [];

  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.allSettled(
      batch.map(async (item) => {
        try {
          const [title, summary] = await Promise.all([
            translateText(item.title),
            translateText(item.summary),
          ]);
          return { ...item, title: title || item.title, summary: summary || item.summary };
        } catch (err) {
          console.warn('Falha ao traduzir artigo:', item.title.slice(0, 40), err instanceof Error ? err.message : err);
          return item;
        }
      })
    );
    result.push(...batchResults.map((r, idx) => r.status === 'fulfilled' ? r.value : batch[idx]));
  }

  return result;
};

const fetchFeedItems = async (feedUrl: string, source: string): Promise<NewsItem[]> => {
  const proxyUrl = `${CORS_PROXY}${encodeURIComponent(feedUrl)}`;
  const response = await fetchWithTimeout(proxyUrl, 12000);
  if (!response.ok) throw new Error(`HTTP ${response.status} para ${source}`);

  const json = await response.json();
  if (!json.contents) throw new Error(`Resposta vazia de ${source}`);

  const parser = new DOMParser();
  const doc = parser.parseFromString(json.contents, 'text/xml');
  const items = Array.from(doc.querySelectorAll('item'));
  if (items.length === 0) throw new Error('No items in feed');

  return items.slice(0, 8).map((item, index) => {
    const title = getText(item, 'title');
    const description = getText(item, 'description').slice(0, 300);
    const pubDate = getText(item, 'pubDate');
    const link = getText(item, 'link') || item.querySelector('link')?.getAttribute('href') || '';
    const categories = Array.from(item.querySelectorAll('category')).map(c => stripHtml(c.textContent || '')).join(' ');

    return {
      id: generateId(),
      title,
      summary: description || title,
      date: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
      tag: detectTag(title, categories),
      important: index < 2,
      source,
      url: link || undefined,
    };
  }).filter(item => item.title.length > 3);
};

// Função principal para buscar notícias
export const fetchF1News = async (language: 'pt' | 'en' = 'pt'): Promise<NewsItem[]> => {
  const cacheKey = getCacheKey(language);

  try {
    // Verifica cache do idioma atual primeiro
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const cacheData: CacheData = JSON.parse(cached);
      const age = Date.now() - cacheData.timestamp;

      if (age < CACHE_DURATION) {
        console.log('Usando cache de notícias');
        return cacheData.news;
      }
    }

    // Tenta buscar de RSS feeds reais (sempre em inglês)
    const results = await Promise.allSettled(
      RSS_FEEDS.map(feed => fetchFeedItems(feed.url, feed.source))
    );

    const allNews: NewsItem[] = [];
    for (const result of results) {
      if (result.status === 'fulfilled') {
        allNews.push(...result.value);
      }
    }

    if (allNews.length === 0) {
      throw new Error('Nenhum feed retornou notícias');
    }

    // Ordena por data mais recente e remove duplicatas por título similar
    const seen = new Set<string>();
    const deduped = allNews
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .filter(item => {
        const key = item.title.slice(0, 40).toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

    // Traduz para PT-BR se necessário (feeds são sempre em inglês)
    const finalNews = language === 'pt' ? await translateNewsItems(deduped) : deduped;

    const cacheData: CacheData = {
      news: finalNews,
      timestamp: Date.now()
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));

    console.log(`Notícias atualizadas: ${finalNews.length} artigos (${language.toUpperCase()})`);
    return finalNews;

  } catch (error) {
    console.error('Erro ao buscar notícias dos feeds:', error instanceof Error ? error.message : String(error));

    // Em caso de erro, tenta usar cache antigo (mesmo expirado)
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const cacheData: CacheData = JSON.parse(cached);
      console.log('Usando cache expirado como fallback');
      return cacheData.news;
    }

    // Último recurso: notícias estáticas de fallback
    return language === 'en' ? FALLBACK_NEWS_EN : FALLBACK_NEWS_PT;
  }
};

// Função para forçar atualização
export const forceNewsUpdate = async (language: 'pt' | 'en' = 'pt'): Promise<NewsItem[]> => {
  localStorage.removeItem(getCacheKey(language));
  return fetchF1News(language);
};

// Função para verificar se há novas notícias
export const checkForUpdates = async (language: 'pt' | 'en' = 'pt'): Promise<boolean> => {
  const cached = localStorage.getItem(getCacheKey(language));
  if (!cached) return true;
  
  const cacheData: CacheData = JSON.parse(cached);
  const age = Date.now() - cacheData.timestamp;
  
  return age >= CACHE_DURATION;
};

// Hook para usar no React
export const useNewsCache = () => {
  const getLastUpdate = (): string => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return 'Nunca';
    
    const cacheData: CacheData = JSON.parse(cached);
    return formatRelativeDate(new Date(cacheData.timestamp).toISOString());
  };

  return { getLastUpdate };
};

export { formatRelativeDate };
