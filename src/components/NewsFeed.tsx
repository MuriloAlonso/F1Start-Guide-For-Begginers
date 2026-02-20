import { useState } from 'react';
import { 
  RefreshCw, 
  Clock, 
  AlertCircle, 
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Share2,
  Bookmark
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAutoUpdate } from '@/hooks/useAutoUpdate';
import { formatRelativeDate } from '@/services/newsApi';

interface NewsFeedProps {
  maxItems?: number;
  showRefresh?: boolean;
}

export const NewsFeed = ({ maxItems = 6, showRefresh = true }: NewsFeedProps) => {
  const { 
    news, 
    loading, 
    error, 
    lastUpdate, 
    isUpdating, 
    hasUpdate, 
    refresh 
  } = useAutoUpdate({
    interval: 5 * 60 * 1000,
    immediate: true
  });

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [savedArticles, setSavedArticles] = useState<string[]>([]);

  const displayedNews = showAll ? news : news.slice(0, maxItems);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const toggleSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedArticles(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const shareArticle = (article: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.summary,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    }
  };

  if (loading && news.length === 0) {
    return (
      <div className="glass rounded-2xl p-12">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#E10600] border-t-transparent" />
        </div>
        <p className="text-center text-white/50">Carregando notícias...</p>
      </div>
    );
  }

  if (error && news.length === 0) {
    return (
      <div className="glass rounded-2xl p-12">
        <div className="flex items-center justify-center py-8 text-white/60">
          <AlertCircle className="w-8 h-8 mr-3" />
          <div>
            <p className="font-semibold">Erro ao carregar notícias</p>
            <p className="text-sm text-white/40">{error}</p>
          </div>
        </div>
        <Button 
          onClick={refresh} 
          variant="outline" 
          className="mx-auto block border-white/20 text-white hover:bg-white/5 hover:border-[#E10600]"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      {showRefresh && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {isUpdating ? (
              <div className="flex items-center gap-2 text-white/60">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-sm">Atualizando...</span>
              </div>
            ) : hasUpdate ? (
              <div className="flex items-center gap-2 text-[#E10600]">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-semibold">Novas notícias disponíveis</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-white/40">
                <Clock className="w-4 h-4" />
                <span className="text-sm">
                  {lastUpdate ? formatRelativeDate(lastUpdate.toISOString()) : 'Agora'}
                </span>
              </div>
            )}
          </div>
          
          <Button
            onClick={refresh}
            disabled={isUpdating}
            variant="ghost"
            size="sm"
            className="text-white/40 hover:text-white hover:bg-transparent"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isUpdating ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      )}

      {/* News Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedNews.map((article) => (
          <article 
            key={article.id}
            className={`f1-card group cursor-pointer ${
              expandedId === article.id ? 'md:col-span-2 lg:col-span-3' : ''
            }`}
            onClick={() => toggleExpand(article.id)}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Badge className={`text-xs ${article.important ? 'bg-[#E10600]/20 text-[#E10600] border-[#E10600]/30' : 'bg-white/10 text-white/70 border-white/20'}`}>
                  {article.tag}
                </Badge>
                <span className="text-white/30 text-sm">{formatRelativeDate(article.date)}</span>
              </div>
              <h3 className="text-white font-bold text-lg mb-3 group-hover:text-[#E10600] transition-colors line-clamp-2">
                {article.title}
              </h3>
              <p className={`text-white/50 text-sm ${expandedId === article.id ? '' : 'line-clamp-2'}`}>
                {article.summary}
              </p>
              
              {expandedId === article.id && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-white/30 text-xs">Fonte: {article.source}</span>
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => shareArticle(article, e)}
                        className="p-2 bg-white/5 hover:bg-[#E10600] transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => toggleSave(article.id, e)}
                        className={`p-2 transition-colors ${savedArticles.includes(article.id) ? 'bg-[#E10600]' : 'bg-white/5 hover:bg-[#E10600]'}`}
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>

      {/* Show More/Less */}
      {news.length > maxItems && (
        <div className="text-center pt-4">
          <Button
            onClick={() => setShowAll(!showAll)}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/5 hover:border-[#E10600]"
          >
            {showAll ? (
              <>
                <ChevronUp className="w-4 h-4 mr-2" />
                Ver Menos
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-2" />
                Ver Todas ({news.length})
              </>
            )}
          </Button>
        </div>
      )}

      {/* Auto-update indicator */}
      <div className="text-center pt-6 border-t border-white/5">
        <p className="text-xs text-white/30">
          Atualiza automaticamente a cada 5 minutos • Última atualização: {lastUpdate?.toLocaleTimeString() || '--:--'}
        </p>
      </div>
    </div>
  );
};

export default NewsFeed;
