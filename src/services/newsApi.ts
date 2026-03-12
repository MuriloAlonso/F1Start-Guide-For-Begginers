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
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutos (era 15)

// Chave de cache separada por idioma
const getCacheKey = (language: 'pt' | 'en') => `${CACHE_KEY}_${language}`;

interface CacheData {
  news: NewsItem[];
  timestamp: number;
}

// Guard para evitar fetches concorrentes
let isFetching = false;


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

// Tradução via Google Translate (endpoint público, sem chave, alto limite)
const GOOGLE_TRANSLATE_URL = 'https://translate.googleapis.com/translate_a/single';
const MYMEMORY_URL = 'https://api.mymemory.translated.net/get';

// Tentativa 1: Google Translate público (sem chave, limite muito maior)
const translateWithGoogle = async (text: string): Promise<string> => {
  const url = `${GOOGLE_TRANSLATE_URL}?client=gtx&sl=en&tl=pt-BR&dt=t&q=${encodeURIComponent(text)}`;
  const response = await fetchWithTimeout(url, 8000);
  if (!response.ok) throw new Error(`Google Translate HTTP ${response.status}`);
  const data = await response.json();
  // Resposta: [[[translatedChunk, original], ...], ...]
  const translated = (data[0] as [string, string][]).map(d => d[0]).join('');
  if (!translated) throw new Error('Google Translate: resposta vazia');
  return translated;
};

// Tentativa 2: MyMemory como fallback
const translateWithMyMemory = async (text: string): Promise<string> => {
  const truncated = text.slice(0, 480);
  const url = `${MYMEMORY_URL}?q=${encodeURIComponent(truncated)}&langpair=en|pt-BR`;
  const response = await fetchWithTimeout(url, 8000);
  if (!response.ok) throw new Error(`MyMemory HTTP ${response.status}`);
  const data = await response.json();
  if (data.responseStatus !== 200 && data.responseStatus !== '200') {
    throw new Error(`MyMemory status: ${data.responseStatus}`);
  }
  return data.responseData?.translatedText || text;
};

const translateText = async (text: string): Promise<string> => {
  try {
    return await translateWithGoogle(text);
  } catch {
    return await translateWithMyMemory(text);
  }
};

// Tradução sequencial: 1 artigo por vez, título + resumo em paralelo (máx 2 req simultâneas)
// Se a API retornar 429 (rate limit), abandona a tradução e retorna todos em inglês
const translateNewsItems = async (items: NewsItem[]): Promise<NewsItem[]> => {
  const result: NewsItem[] = [];
  let rateLimited = false;

  for (const item of items) {
    if (rateLimited) {
      result.push(item);
      continue;
    }

    try {
      const [title, summary] = await Promise.all([
        translateText(item.title),
        translateText(item.summary),
      ]);
      result.push({ ...item, title: title || item.title, summary: summary || item.summary });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes('429') || message.includes('rate') || message.includes('quota')) {
        rateLimited = true;
        console.warn('Limite de tradução atingido — exibindo notícias em inglês');
      } else {
        console.warn('Falha ao traduzir artigo:', item.title.slice(0, 40), message);
      }
      result.push(item);
    }
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

  // Reduzido de 8 para 5 artigos por feed (menos memória e menos traduções)
  return items.slice(0, 5).map((item, index) => {
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

  // Guard: evita múltiplas chamadas simultâneas
  if (isFetching) {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const cacheData: CacheData = JSON.parse(cached);
      return cacheData.news;
    }
    return [];
  }

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

    isFetching = true;

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

    // Se PT falhou e não há cache PT, usa cache EN como fallback (notícias em inglês)
    if (language === 'pt') {
      const enCached = localStorage.getItem(getCacheKey('en'));
      if (enCached) {
        console.log('Usando cache EN como fallback para PT');
        const enCacheData: CacheData = JSON.parse(enCached);
        return enCacheData.news;
      }
    }

    return [];
  } finally {
    isFetching = false;
  }
};

// Função para forçar atualização
export const forceNewsUpdate = async (language: 'pt' | 'en' = 'pt'): Promise<NewsItem[]> => {
  localStorage.removeItem(getCacheKey(language));
  isFetching = false; // Reseta o guard para permitir fetch forçado
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
