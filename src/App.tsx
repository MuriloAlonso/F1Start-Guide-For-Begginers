import { useState, useEffect, useRef, useMemo, memo } from 'react'
import { 
  ChevronRight, 
  Trophy, 
  Wind, 
  Circle, 
  Menu, 
  X,
  Flag,
  Timer,
  Users,
  Zap,
  TrendingUp,
  Settings,
  Gauge,
  Car,
  Target,
  Award,
  BarChart3,
  Flashlight,
  Fuel,
  Shield,
  Activity,
  Radio,
  RefreshCw,
  Clock,
  ChevronDown,
  ChevronUp,
  Share2,
  Bookmark,
  ArrowDown,
  MapPin,
  Calendar,
  ExternalLink,
  Play,
  Tv,
  Globe,
  Bell,
  Camera
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useAutoUpdate } from '@/hooks/useAutoUpdate'
import { formatRelativeDate } from '@/services/newsApi'
import { useF1Data, defaultTeams, defaultRules, useConstructorStandings } from '@/services/f1DataService'
import { AppProvider, useApp } from '@/contexts/AppContext'
import { LanguageSelector } from '@/components/LanguageSelector'
import './App.css'

// ==================== CONSTANTES DE MÓDULO (calculadas uma única vez) ====================
const CURRENT_YEAR = new Date().getFullYear()

const DRIVER_LINKS: Record<string, string> = {
  'Lando Norris': 'https://en.wikipedia.org/wiki/Lando_Norris',
  'Oscar Piastri': 'https://en.wikipedia.org/wiki/Oscar_Piastri',
  'Charles Leclerc': 'https://en.wikipedia.org/wiki/Charles_Leclerc',
  'Lewis Hamilton': 'https://en.wikipedia.org/wiki/Lewis_Hamilton',
  'Max Verstappen': 'https://en.wikipedia.org/wiki/Max_Verstappen',
  'Isack Hadjar': 'https://en.wikipedia.org/wiki/Isack_Hadjar',
  'George Russell': 'https://en.wikipedia.org/wiki/George_Russell_(racing_driver)',
  'Kimi Antonelli': 'https://en.wikipedia.org/wiki/Andrea_Kimi_Antonelli',
  'Fernando Alonso': 'https://en.wikipedia.org/wiki/Fernando_Alonso',
  'Lance Stroll': 'https://en.wikipedia.org/wiki/Lance_Stroll',
  'Pierre Gasly': 'https://en.wikipedia.org/wiki/Pierre_Gasly',
  'Franco Colapinto': 'https://en.wikipedia.org/wiki/Franco_Colapinto',
  'Carlos Sainz': 'https://en.wikipedia.org/wiki/Carlos_Sainz_Jr.',
  'Alexander Albon': 'https://en.wikipedia.org/wiki/Alexander_Albon',
  'Yuki Tsunoda': 'https://en.wikipedia.org/wiki/Yuki_Tsunoda',
  'Liam Lawson': 'https://en.wikipedia.org/wiki/Liam_Lawson',
  'Esteban Ocon': 'https://en.wikipedia.org/wiki/Esteban_Ocon',
  'Oliver Bearman': 'https://en.wikipedia.org/wiki/Oliver_Bearman',
  'Nico Hulkenberg': 'https://en.wikipedia.org/wiki/Nico_H%C3%BClkenberg',
  'Gabriel Bortoleto': 'https://en.wikipedia.org/wiki/Gabriel_Bortoleto',
  'Valtteri Bottas': 'https://en.wikipedia.org/wiki/Valtteri_Bottas',
  'Sergio Perez': 'https://en.wikipedia.org/wiki/Sergio_P%C3%A9rez',
}

const CIRCUITOS_DATA = [
  { name: 'Albert Park Circuit', gp: 'GP da Austrália', city: 'Melbourne', country: 'Austrália', flag: '🇦🇺', image: '/images/circuit-albert-park.jpg', description: 'Circuito urbano ao redor do Lago Albert Park, conhecido por suas curvas rápidas e belo cenário.', length: '5.278 km', laps: 58, wikiUrl: 'https://en.wikipedia.org/wiki/Melbourne_Grand_Prix_Circuit' },
  { name: 'Shanghai International Circuit', gp: 'GP da China', city: 'Shanghai', country: 'China', flag: '🇨🇳', image: '/images/circuit-shanghai.png', description: 'Circuito moderno com uma das retas mais longas da F1, desenhado por Hermann Tilke.', length: '5.451 km', laps: 56, wikiUrl: 'https://en.wikipedia.org/wiki/Shanghai_International_Circuit' },
  { name: 'Suzuka International Racing Course', gp: 'GP do Japão', city: 'Suzuka', country: 'Japão', flag: '🇯🇵', image: '/images/circuit-suzuka.jpg', description: 'Único circuito em forma de 8 do Mundial, famoso por exigir máxima precisão dos pilotos.', length: '5.807 km', laps: 53, wikiUrl: 'https://en.wikipedia.org/wiki/Suzuka_Circuit' },
  { name: 'Bahrain International Circuit', gp: 'GP do Bahrein', city: 'Sakhir', country: 'Bahrein', flag: '🇧🇭', image: '/images/circuit-bahrain-new.jpg', description: 'Primeiro circuito da F1 no Oriente Médio, conhecido por suas corridas noturnas espetaculares.', length: '5.412 km', laps: 57, wikiUrl: 'https://en.wikipedia.org/wiki/Bahrain_International_Circuit' },
  { name: 'Jeddah Street Circuit', gp: 'GP da Arábia Saudita', city: 'Jeddah', country: 'Arábia Saudita', flag: '🇸🇦', image: '/images/circuit-jeddah.webp', description: 'Circuito urbano à beira-mar, o mais rápido do calendário com curvas de alta velocidade.', length: '6.174 km', laps: 50, wikiUrl: 'https://en.wikipedia.org/wiki/Jeddah_Street_Circuit' },
  { name: 'Miami International Autodrome', gp: 'GP de Miami', city: 'Miami', country: 'EUA', flag: '🇺🇸', image: '/images/circuit-miami.jpg', description: 'Circuito urbano ao redor do Hard Rock Stadium, palco de uma das festas mais badaladas da F1.', length: '5.412 km', laps: 57, wikiUrl: 'https://en.wikipedia.org/wiki/Miami_International_Autodrome' },
  { name: 'Autodromo Enzo e Dino Ferrari', gp: 'GP da Emília-Romanha', city: 'Imola', country: 'Itália', flag: '🇮🇹', image: '/images/circuit-imola.jpeg', description: 'Circuito histórico onde Ayrton Senna conquistou vitórias memoráveis.', length: '4.909 km', laps: 63, wikiUrl: 'https://en.wikipedia.org/wiki/Autodromo_Enzo_e_Dino_Ferrari' },
  { name: 'Circuit de Monaco', gp: 'GP de Mônaco', city: 'Monte Carlo', country: 'Mônaco', flag: '🇲🇨', image: '/images/circuit-monaco.webp', description: 'A joia da coroa da F1, corrida nas ruas do principado mais famoso do mundo.', length: '3.337 km', laps: 78, wikiUrl: 'https://en.wikipedia.org/wiki/Circuit_de_Monaco' },
  { name: 'Circuit Gilles Villeneuve', gp: 'GP do Canadá', city: 'Montreal', country: 'Canadá', flag: '🇨🇦', image: '/images/circuit-canada.jpg', description: 'Circuito urbano na Ilha de Notre-Dame, famoso pelo "Muro dos Campeões".', length: '4.361 km', laps: 70, wikiUrl: 'https://en.wikipedia.org/wiki/Circuit_Gilles_Villeneuve' },
  { name: 'Circuit de Barcelona-Catalunya', gp: 'GP da Espanha', city: 'Barcelona', country: 'Espanha', flag: '🇪🇸', image: '/images/circuit-barcelona.jpg', description: 'Circuito técnico usado para testes de pré-temporada, com curvas de todos os tipos.', length: '4.675 km', laps: 66, wikiUrl: 'https://en.wikipedia.org/wiki/Circuit_de_Barcelona-Catalunya' },
  { name: 'Red Bull Ring', gp: 'GP da Áustria', city: 'Spielberg', country: 'Áustria', flag: '🇦🇹', image: '/images/circuit-redbullring.jpg', description: 'Circuito curto e rápido nas montanhas da Estíria, com poucas curvas mas muita ação.', length: '4.318 km', laps: 71, wikiUrl: 'https://en.wikipedia.org/wiki/Red_Bull_Ring' },
  { name: 'Silverstone Circuit', gp: 'GP da Grã-Bretanha', city: 'Silverstone', country: 'Reino Unido', flag: '🇬🇧', image: '/images/circuit-silverstone.jpg', description: 'O berço da Fórmula 1, palco da primeira corrida do Mundial em 1950.', length: '5.891 km', laps: 52, wikiUrl: 'https://en.wikipedia.org/wiki/Silverstone_Circuit' },
  { name: 'Hungaroring', gp: 'GP da Hungria', city: 'Budapeste', country: 'Hungria', flag: '🇭🇺', image: '/images/circuit-hungaroring.jpg', description: 'Circuito semelhante a um kartódromo, com poucas oportunidades de ultrapassagem.', length: '4.381 km', laps: 70, wikiUrl: 'https://en.wikipedia.org/wiki/Hungaroring' },
  { name: 'Circuit de Spa-Francorchamps', gp: 'GP da Bélgica', city: 'Spa', country: 'Bélgica', flag: '🇧🇪', image: '/images/circuit-spa.jpg', description: 'Um dos circuitos mais desafiadores do mundo, famoso pela curva Eau Rouge.', length: '7.004 km', laps: 44, wikiUrl: 'https://en.wikipedia.org/wiki/Circuit_de_Spa-Francorchamps' },
  { name: 'Circuit Zandvoort', gp: 'GP da Holanda', city: 'Zandvoort', country: 'Holanda', flag: '🇳🇱', image: '/images/circuit-zandvoort.jpg', description: 'Circuito à beira-mar com inclinações únicas, palco da festa laranja de Verstappen.', length: '4.259 km', laps: 72, wikiUrl: 'https://en.wikipedia.org/wiki/Circuit_Zandvoort' },
  { name: 'Autodromo Nazionale Monza', gp: 'GP da Itália', city: 'Monza', country: 'Itália', flag: '🇮🇹', image: '/images/circuit-monza.jpg', description: 'O Templo da Velocidade, casa da Ferrari e das retas mais rápidas da F1.', length: '5.793 km', laps: 53, wikiUrl: 'https://en.wikipedia.org/wiki/Autodromo_Nazionale_Monza' },
  { name: 'Baku City Circuit', gp: 'GP do Azerbaijão', city: 'Baku', country: 'Azerbaijão', flag: '🇦🇿', image: '/images/circuit-baku-new.jpg', description: 'Circuito urbano no centro histórico, com a reta mais longa da F1.', length: '6.003 km', laps: 51, wikiUrl: 'https://en.wikipedia.org/wiki/Baku_City_Circuit' },
  { name: 'Marina Bay Street Circuit', gp: 'GP de Singapura', city: 'Singapura', country: 'Singapura', flag: '🇸🇬', image: '/images/circuit-singapore.jpg', description: 'Primeira corrida noturna da F1, circuito urbano desafiador e úmido.', length: '4.940 km', laps: 62, wikiUrl: 'https://en.wikipedia.org/wiki/Marina_Bay_Street_Circuit' },
  { name: 'Circuit of the Americas', gp: 'GP dos EUA', city: 'Austin', country: 'EUA', flag: '🇺🇸', image: '/images/circuit-austin.jpg', description: 'Circuito moderno inspirado em Silverstone, com uma das melhores arquibancadas da F1.', length: '5.513 km', laps: 56, wikiUrl: 'https://en.wikipedia.org/wiki/Circuit_of_the_Americas' },
  { name: 'Autódromo Hermanos Rodríguez', gp: 'GP do México', city: 'Cidade do México', country: 'México', flag: '🇲🇽', image: '/images/circuit-mexico.jpg', description: 'Circuito a 2.200m de altitude, famoso pelo estádio de beisebol nas curvas finais.', length: '4.304 km', laps: 71, wikiUrl: 'https://en.wikipedia.org/wiki/Aut%C3%B3dromo_Hermanos_Rodr%C3%ADguez' },
  { name: 'Interlagos', gp: 'GP do Brasil', city: 'São Paulo', country: 'Brasil', flag: '🇧🇷', image: '/images/circuit-interlagos.jpg', description: 'Autódromo José Carlos Pace, palco de momentos históricos como o tricampeonato de Senna.', length: '4.309 km', laps: 71, wikiUrl: 'https://en.wikipedia.org/wiki/Aut%C3%B3dromo_Jos%C3%A9_Carlos_Pace' },
  { name: 'Las Vegas Strip Circuit', gp: 'GP de Las Vegas', city: 'Las Vegas', country: 'EUA', flag: '🇺🇸', image: '/images/circuit-lasvegas.png', description: 'Corrida noturna na Strip de Las Vegas, com o cassino Sphere como cenário.', length: '6.201 km', laps: 50, wikiUrl: 'https://en.wikipedia.org/wiki/Las_Vegas_Strip_Circuit' },
  { name: 'Lusail International Circuit', gp: 'GP do Catar', city: 'Lusail', country: 'Catar', flag: '🇶🇦', image: '/images/circuit-lusail.jpg', description: 'Circuito moderno no deserto, palco da primeira corrida noturna do Oriente Médio.', length: '5.419 km', laps: 57, wikiUrl: 'https://en.wikipedia.org/wiki/Lusail_International_Circuit' },
  { name: 'Yas Marina Circuit', gp: 'GP de Abu Dhabi', city: 'Abu Dhabi', country: 'Emirados Árabes', flag: '🇦🇪', image: '/images/circuit-yasmarina.jpg', description: 'Circuito desenhado por Hermann Tilke, palco da decisão do campeonato.', length: '5.281 km', laps: 58, wikiUrl: 'https://en.wikipedia.org/wiki/Yas_Marina_Circuit' },
]

// ==================== HOOKS ====================
function useScrollAnimation() {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  return { ref, isVisible }
}

// ==================== NAVIGATION ====================
function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { t } = useApp()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  const navItems = [
    { label: t('nav.home'), href: '#hero' },
    { label: t('nav.whatisf1'), href: '#o-que-e' },
    { label: `${t('nav.rules')} ${CURRENT_YEAR}`, href: '#regras' },
    { label: `${t('nav.teams')} ${CURRENT_YEAR}`, href: '#equipes' },
    { label: t('nav.calendar'), href: '#calendario' },
    { label: t('nav.points'), href: '#pontuacao' },
    { label: t('nav.watch'), href: '#onde-assistir' },
    { label: t('nav.circuits'), href: '#circuitos' },
    { label: t('nav.legends'), href: '#lendas' },
    { label: t('nav.tires'), href: '#pneus' },
    { label: t('nav.weather'), href: '#clima' },
    { label: t('nav.news'), href: '#noticias' },
  ]

  return (
    <>
      {/* Header fixo - sempre visível com fundo */}
      <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        isScrolled || isMobileMenuOpen ? 'header-scrolled' : 'bg-black/80 backdrop-blur-sm'
      }`}>
        <div className="section-padding">
          <div className="flex items-center justify-between h-20">
            <a href="#hero" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-[#E10600] rounded-lg flex items-center justify-center transform group-hover:scale-105 transition-transform">
                <Flag className="w-5 h-5 text-white" />
              </div>
              <span className="font-f1 text-2xl font-semibold text-white">
                F1<span className="text-[#E10600]">Start</span>
              </span>
            </a>

            <div className="hidden xl:flex items-center gap-1">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="nav-item-link px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                >
                  {item.label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1">
                <LanguageSelector />
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="xl:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Menu Mobile */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black z-[99] xl:hidden pt-20">
          <div className="section-padding h-full overflow-y-auto">
            <div className="flex flex-col gap-2 py-4">
              {/* Mobile language selector */}
              <div className="flex items-center gap-2 px-4 py-4 border-b border-white/10 mb-2">
                <LanguageSelector />
              </div>
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-4 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-all text-lg"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ==================== STAT CARD (animação visual de contagem) ====================
function StatCard({ value, label }: { value: string; label: string }) {
  const [isHovered, setIsHovered] = useState(false)
  const [display, setDisplay] = useState(value)
  const numericPart = parseInt(value, 10)
  const suffix = isNaN(numericPart) ? '' : value.replace(/[0-9]/g, '')

  useEffect(() => {
    if (!isHovered || isNaN(numericPart)) { setDisplay(value); return }
    const steps = 14
    const intervalMs = 300 / steps
    let step = 0
    const timer = setInterval(() => {
      step++
      const current = Math.round((numericPart / steps) * step)
      setDisplay(step >= steps ? value : current + suffix)
      if (step >= steps) clearInterval(timer)
    }, intervalMs)
    return () => clearInterval(timer)
  }, [isHovered, value, numericPart, suffix])

  return (
    <div
      className="stat-glass p-6"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="font-mono-stat text-3xl sm:text-4xl font-bold text-[#E10600]">{display}</div>
      <div className="text-sm text-white/40 mt-1 uppercase tracking-wider">{label}</div>
    </div>
  )
}

// ==================== HERO SECTION ====================
function HeroSection() {
  const { t } = useApp()
  
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src="/images/f1-track.jpg" 
          alt="Formula 1 cars on track" 
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(225,6,0,0.2),_transparent_50%)]" />
        <div className="speed-lines" />
        <div className="hero-brake-glow" />
      </div>

      <div className="absolute top-1/4 left-0 w-32 h-64 opacity-20 tire-pattern transform -rotate-12" />
      <div className="absolute bottom-1/4 right-0 w-32 h-64 opacity-20 tire-pattern transform rotate-12" />

      <div className="relative z-10 section-padding pt-32 pb-20">
        <div className="max-w-5xl mx-auto text-center">
          <div className="mb-8 animate-fade-in">
            <Badge className="bg-[#E10600]/20 text-[#E10600] border-[#E10600]/30 hover:bg-[#E10600]/30 px-4 py-1.5 text-sm rounded-full">
              <Zap className="w-3.5 h-3.5 mr-1.5" />
              {t('hero.season')} {CURRENT_YEAR}
            </Badge>
          </div>
          
          <h1 className="font-f1 text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light text-white mb-6 leading-[0.95] animate-fade-in-up">
            {t('hero.title')}{' '}
            <span className="text-gradient font-bold">Fórmula 1</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-white/50 mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-200">
            {t('hero.subtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-300">
            <Button 
              size="lg" 
              className="bg-[#E10600] hover:bg-[#b80500] text-white px-8 py-6 text-lg font-semibold rounded-xl animate-pulse-glow btn-f1-glow btn-arrow-slide"
              onClick={() => document.getElementById('regras')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {t('hero.cta.rules')} {CURRENT_YEAR}
              <ChevronRight className="w-5 h-5 ml-2 arrow-icon" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold rounded-xl flex items-center gap-3"
              onClick={() => document.getElementById('noticias')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <span className="live-dot" />
              {t('hero.cta.news')}
            </Button>
          </div>

          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 animate-fade-in-up delay-400">
            {[
              { value: '11', label: t('hero.stats.teams') },
              { value: '24', label: t('hero.stats.races') },
              { value: '22', label: t('hero.stats.drivers') },
              { value: '768kg', label: t('hero.stats.weight') },
            ].map((stat, index) => (
              <StatCard key={index} value={stat.value} label={stat.label} />
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 animate-bounce-arrow">
        <ArrowDown className="w-8 h-8 text-white/40 scroll-indicator" />
      </div>
    </section>
  )
}

// ==================== O QUE É F1 ====================
function OQueESection() {
  const { ref, isVisible } = useScrollAnimation()
  const { t } = useApp()

  const conceitos = [
    {
      icon: <Flag className="w-6 h-6" />,
      title: t('whatis.gp.title'),
      description: t('whatis.gp.desc')
    },
    {
      icon: <Timer className="w-6 h-6" />,
      title: t('whatis.qualifying.title'),
      description: t('whatis.qualifying.desc')
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: t('whatis.teams.title'),
      description: t('whatis.teams.desc')
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: t('whatis.points.title'),
      description: t('whatis.points.desc')
    }
  ]

  return (
    <section id="o-que-e" ref={ref} className="py-32 bg-black">
      <div className="section-padding">
        <div className="max-w-6xl mx-auto">
          <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Badge className="mb-4 bg-white/10 text-white border-white/20 rounded-full">
              <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
              {t('whatis.badge')}
            </Badge>
            <h2 className="font-f1 text-4xl sm:text-5xl lg:text-6xl font-medium text-white mb-4">
              {t('whatis.title')} <span className="text-[#E10600]">Fórmula 1</span>?
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              {t('whatis.subtitle')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {conceitos.map((item, index) => (
              <div 
                key={index} 
                className={`f1-card p-8 group transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${index * 0.1}s` }}
              >
                <div className="w-14 h-14 bg-[#E10600]/20 rounded-xl flex items-center justify-center text-[#E10600] mb-6 group-hover:bg-[#E10600] group-hover:text-white transition-all">
                  {item.icon}
                </div>
                <h3 className="font-f1 text-2xl text-white mb-3">{item.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>

          <div className={`mt-16 glass rounded-2xl p-8 lg:p-12 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h3 className="font-f1 text-2xl text-white mb-8 text-center">
              {t('whatis.weekend.title')}
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { day: t('whatis.friday.day'), title: t('whatis.friday.title'), desc: t('whatis.friday.desc') },
                { day: t('whatis.saturday.day'), title: t('whatis.saturday.title'), desc: t('whatis.saturday.desc') },
                { day: t('whatis.sunday.day'), title: t('whatis.sunday.title'), desc: t('whatis.sunday.desc') },
              ].map((item, index) => (
                <div key={index} className="relative">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-[#E10600] rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-[#E10600] text-sm font-medium uppercase tracking-wider">{item.day}</div>
                      <div className="text-white font-semibold text-lg">{item.title}</div>
                    </div>
                  </div>
                  <p className="text-white/50 text-sm pl-16">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ==================== REGRAS ====================
function RegrasSection() {
  const { ref, isVisible } = useScrollAnimation()
  const { data } = useF1Data()
  const { t } = useApp()
  const rules = useMemo(() => data?.rules || defaultRules, [data])

  return (
    <section id="regras" ref={ref} className="py-32 bg-[#050505] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#E10600]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#E10600]/5 rounded-full blur-3xl" />

      <div className="section-padding relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Badge className="mb-4 bg-[#E10600]/20 text-[#E10600] border-[#E10600]/30 rounded-full">
              <Settings className="w-3.5 h-3.5 mr-1.5" />
              {t('rules.badge')}
            </Badge>
            <h2 className="font-f1 text-4xl sm:text-5xl lg:text-6xl font-medium text-white mb-4">
              {t('rules.title')} <span className="text-[#E10600]">{CURRENT_YEAR}</span>
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              {CURRENT_YEAR} {t('rules.subtitle')}
            </p>
          </div>

          <Tabs defaultValue="carro" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-white/5 mb-8 rounded-xl">
              {['carro', 'motor', 'aerodinamica', 'seguranca'].map((tabValue, i) => {
                const tabLabels = [t('rules.tab.car'), t('rules.tab.engine'), t('rules.tab.aero'), t('rules.tab.safety')] as string[]
                return (
                  <TabsTrigger 
                    key={tabValue}
                    value={tabValue}
                    className="data-[state=active]:bg-[#E10600] data-[state=active]:text-white text-white/60 uppercase text-sm font-semibold tracking-wider rounded-lg"
                  >
                    {tabLabels[i]}
                  </TabsTrigger>
                )
              })}
            </TabsList>

            <TabsContent value="carro" className="mt-0">
              <div className={`glass rounded-2xl p-8 lg:p-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <h3 className="font-f1 text-3xl text-white mb-8 flex items-center gap-3">
                  <Car className="w-8 h-8 text-[#E10600]" />
                  {t('rules.car.title')}
                </h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    {[
                      { label: t('rules.car.weight'), value: rules.carSpecs.weight },
                      { label: t('rules.car.length'), value: rules.carSpecs.length },
                      { label: t('rules.car.width'), value: rules.carSpecs.width },
                      { label: t('rules.car.power'), value: rules.carSpecs.enginePower },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                        <span className="text-white/60">{item.label}</span>
                        <span className="text-[#E10600] font-bold">{item.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    <div className="bg-[#E10600]/10 rounded-xl p-6 border border-[#E10600]/30">
                      <h4 className="text-white font-semibold mb-2">{t('rules.car.tires.title')}</h4>
                      <p className="text-white/50 text-sm">{t('rules.car.tires.front')}: 305mm → 280mm (-25mm)</p>
                      <p className="text-white/50 text-sm">{t('rules.car.tires.rear')}: 405mm → 375mm (-30mm)</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-6">
                      <h4 className="text-white font-semibold mb-2">{t('rules.car.drag.title')}</h4>
                      <p className="text-white/50 text-sm">{t('rules.car.drag.desc')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="motor" className="mt-0">
              <div className="glass rounded-2xl p-8 lg:p-12">
                <h3 className="font-f1 text-3xl text-white mb-8 flex items-center gap-3">
                  <Gauge className="w-8 h-8 text-[#E10600]" />
                  {t('rules.engine.title')}
                </h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <div className="mb-6">
                      <h4 className="text-white font-semibold mb-3">50/50 Power Split</h4>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-white/50">{t('rules.engine.ice')}</span>
                            <span className="text-white">400kW</span>
                          </div>
                          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 w-1/2 rounded-full" />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-white/50">{t('rules.engine.electric')}</span>
                            <span className="text-[#E10600] font-bold">350kW ↑</span>
                          </div>
                          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-[#E10600] w-1/2 rounded-full" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white/5 rounded-xl p-5">
                      <div className="flex items-center gap-3 mb-2">
                        <Fuel className="w-5 h-5 text-green-500" />
                        <h4 className="text-white font-semibold">{t('rules.engine.fuel.title')}</h4>
                      </div>
                      <p className="text-white/50 text-sm">{t('rules.engine.fuel.desc')}</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-5">
                      <div className="flex items-center gap-3 mb-2">
                        <Zap className="w-5 h-5 text-yellow-500" />
                        <h4 className="text-white font-semibold">{t('rules.engine.energy.title')}</h4>
                      </div>
                      <p className="text-white/50 text-sm">{t('rules.engine.energy.desc')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="aerodinamica" className="mt-0">
              <div className="glass rounded-2xl p-8 lg:p-12">
                <h3 className="font-f1 text-3xl text-white mb-8 flex items-center gap-3">
                  <Wind className="w-8 h-8 text-[#E10600]" />
                  {t('rules.aero.title')}
                </h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="bg-[#E10600]/10 rounded-xl p-6 border border-[#E10600]/30">
                      <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                        <span className="w-8 h-8 bg-[#E10600] rounded-lg flex items-center justify-center text-sm font-bold">X</span>
                        {t('rules.aero.x.title')}
                      </h4>
                      <p className="text-white/50 text-sm">{t('rules.aero.x.desc')}</p>
                    </div>
                    <div className="bg-blue-500/10 rounded-xl p-6 border border-blue-500/30">
                      <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                        <span className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-sm font-bold">Z</span>
                        {t('rules.aero.z.title')}
                      </h4>
                      <p className="text-white/50 text-sm">{t('rules.aero.z.desc')}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white/5 rounded-xl p-5">
                      <h4 className="text-white font-semibold mb-3">{t('rules.aero.drs.title')}</h4>
                      <Badge className="bg-red-500/20 text-red-400 border-red-500/30 rounded-full">{t('rules.aero.drs.badge')}</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="seguranca" className="mt-0">
              <div className="glass rounded-2xl p-8 lg:p-12">
                <h3 className="font-f1 text-3xl text-white mb-8 flex items-center gap-3">
                  <Shield className="w-8 h-8 text-[#E10600]" />
                  {t('rules.safety.title')}
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    { icon: <Activity className="w-6 h-6" />, title: t('rules.safety.roll.title'), desc: t('rules.safety.roll.desc') },
                    { icon: <Target className="w-6 h-6" />, title: t('rules.safety.nose.title'), desc: t('rules.safety.nose.desc') },
                    { icon: <Flashlight className="w-6 h-6" />, title: t('rules.safety.lights.title'), desc: t('rules.safety.lights.desc') },
                  ].map((item, i) => (
                    <div key={i} className="bg-white/5 rounded-xl p-6">
                      <div className="w-12 h-12 bg-[#E10600]/20 rounded-xl flex items-center justify-center text-[#E10600] mb-4">
                        {item.icon}
                      </div>
                      <h4 className="text-white font-semibold mb-2">{item.title}</h4>
                      <p className="text-white/50 text-sm">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  )
}

// ==================== EQUIPES ====================
function EquipesSection() {
  const { ref, isVisible } = useScrollAnimation()
  const { data } = useF1Data()
  const { t, language } = useApp()
  const teams = useMemo(() => data?.teams || defaultTeams, [data])
  const { getTeamData, loading: standingsLoading } = useConstructorStandings()

  return (
    <section id="equipes" ref={ref} className="py-32 bg-black">
      <div className="section-padding">
        <div className="max-w-6xl mx-auto">
          <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Badge className="mb-4 bg-white/10 text-white border-white/20 rounded-full">
              <Users className="w-3.5 h-3.5 mr-1.5" />
              {t('teams.badge')} {CURRENT_YEAR}
            </Badge>
            <h2 className="font-f1 text-4xl sm:text-5xl lg:text-6xl font-medium text-white mb-4">
              {t('teams.title')} <span className="text-[#E10600]">{teams.length} {t('nav.teams')}</span> {t('hero.season')} {CURRENT_YEAR}
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              {t('teams.subtitle')} {CURRENT_YEAR}.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {teams.map((team, index) => (
              <Dialog key={index}>
                <DialogTrigger asChild>
                  <button 
                    className={`f1-card p-5 text-left group relative overflow-hidden transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                    style={{ transitionDelay: `${index * 0.05}s` }}
                  >
                    <div className="h-1 rounded-full mb-4" style={{ backgroundColor: team.color }} />
                    <h3 className="font-f1 text-xl text-white mb-3 group-hover:text-[#E10600] transition-colors">{team.name}</h3>
                    <div className="space-y-1 mb-4">
                      {team.drivers.map((driver, i) => (
                        <p key={i} className="text-white/60 text-sm">{driver}</p>
                      ))}
                    </div>
                    <Separator className="bg-white/10 my-3" />
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/40">{t('teams.engine')}: <span className="text-white/60">{team.engine}</span></span>
                    </div>
                  </button>
                </DialogTrigger>
                <DialogContent className="bg-[#0a0a0a] border-white/10 text-white max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold" style={{ color: team.color }}>{team.name}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <span className="text-white/50 text-sm block mb-2">{t('teams.drivers')}</span>
                      <div className="space-y-2">
                        {team.drivers.map((driver, i) => (
                          <a 
                            key={i} 
                            href={DRIVER_LINKS[driver] || '#'} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-white/5 p-3 flex items-center justify-between rounded-lg hover:bg-white/10 transition-colors group"
                          >
                            <span className="text-white">{driver}</span>
                            <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-[#E10600] transition-colors" />
                          </a>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 p-3 rounded-lg">
                        <span className="text-white/50 text-sm block">{t('teams.engine')}</span>
                        <span className="text-white">{team.engine}</span>
                      </div>
                      <div className="bg-white/5 p-3 rounded-lg">
                        <span className="text-white/50 text-sm block">{t('teams.points')}</span>
                        {standingsLoading ? (
                          <span className="text-white/30 font-bold text-sm">...</span>
                        ) : (() => {
                          const live = getTeamData(team.name)
                          return live !== null ? (
                            <span className="text-white font-bold">{live.points} pts</span>
                          ) : null
                        })()}
                      </div>
                    </div>
                    {(() => {
                      const live = getTeamData(team.name)
                      if (!standingsLoading && live !== null) {
                        return (
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 p-3 rounded-lg">
                              <span className="text-white/50 text-sm block">{language === 'pt' ? 'Posição' : 'Position'}</span>
                              <span className="text-white font-bold">#{live.position}</span>
                            </div>
                            <div className="bg-white/5 p-3 rounded-lg">
                              <span className="text-white/50 text-sm block">{language === 'pt' ? 'Vitórias' : 'Wins'}</span>
                              <span className="text-white font-bold">{live.wins}</span>
                            </div>
                          </div>
                        )
                      }
                      return null
                    })()}
                    <a 
                      href={team.wikiUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 bg-[#E10600] hover:bg-[#b80500] text-white rounded-xl font-semibold transition-colors"
                    >
                      {t('teams.profile')}
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ==================== CALENDÁRIO - SÓ BOTÃO ====================
function CalendarioSection() {
  const { ref, isVisible } = useScrollAnimation()
  const { t } = useApp()

  return (
    <section id="calendario" ref={ref} className="py-32 bg-[#050505]">
      <div className="section-padding">
        <div className="max-w-6xl mx-auto">
          <div className={`text-center mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Badge className="mb-4 bg-white/10 text-white border-white/20 rounded-full">
              <Calendar className="w-3.5 h-3.5 mr-1.5" />
              {t('calendar.badge')} {CURRENT_YEAR}
            </Badge>
            <h2 className="font-f1 text-4xl sm:text-5xl lg:text-6xl font-medium text-white mb-4">
              {t('calendar.title')} <span className="text-[#E10600]">{t('nav.calendar')}</span>
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              {t('calendar.subtitle')} {CURRENT_YEAR}.
            </p>
          </div>

          <div className={`flex flex-col items-center gap-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="glass rounded-2xl p-8 text-center max-w-xl w-full">
              <div className="w-16 h-16 bg-[#E10600]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-[#E10600]" />
              </div>
              <h3 className="font-f1 text-2xl text-white mb-2">{t('calendar.official.title')}</h3>
              <p className="text-white/50 text-sm mb-6">
                {t('calendar.official.desc')}
              </p>
              <a
                href={`https://www.formula1.com/en/racing/${CURRENT_YEAR}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-[#E10600] hover:bg-[#b80500] text-white rounded-xl font-semibold transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
                {t('calendar.official.cta')}
              </a>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <a
                href={`https://www.formula1.com/en/racing/${CURRENT_YEAR}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-lg text-sm transition-colors"
              >
                <MapPin className="w-4 h-4" />
                {t('calendar.circuits')}
              </a>
              <a
                href={`https://www.formula1.com/en/racing/${CURRENT_YEAR}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-lg text-sm transition-colors"
              >
                <Clock className="w-4 h-4" />
                {t('calendar.times')}
              </a>
              <a
                href={`https://www.formula1.com/en/racing/${CURRENT_YEAR}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-lg text-sm transition-colors"
              >
                <Flag className="w-4 h-4" />
                {t('calendar.results')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ==================== PONTUAÇÃO - CORRIGIDO MOBILE ====================
function PontuacaoSection() {
  const { ref, isVisible } = useScrollAnimation()
  const { data } = useF1Data()
  const { t } = useApp()
  const rules = data?.rules || defaultRules

  return (
    <section id="pontuacao" ref={ref} className="py-32 bg-black">
      <div className="section-padding">
        <div className="max-w-6xl mx-auto">
          <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Badge className="mb-4 bg-white/10 text-white border-white/20 rounded-full">
              <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
              {t('points.badge')}
            </Badge>
            <h2 className="font-f1 text-4xl sm:text-5xl lg:text-6xl font-medium text-white mb-4">
              {t('points.title')} <span className="text-[#E10600]">{t('points.qualifying.title')}</span>
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              {t('points.subtitle')}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Pontuação - Mobile otimizado */}
            <div className={`glass rounded-2xl p-6 sm:p-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h3 className="font-f1 text-xl sm:text-2xl text-white mb-6 flex items-center gap-3">
                <Award className="w-6 h-6 sm:w-7 sm:h-7 text-[#E10600]" />
                {t('points.system.title')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {rules.points.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span 
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0"
                        style={{ 
                          backgroundColor: item.position <= 3 ? ['#FFD700', '#C0C0C0', '#CD7F32'][item.position - 1] : 'rgba(255,255,255,0.1)',
                          color: item.position === 1 ? '#000' : '#fff'
                        }}
                      >
                        {item.position}º
                      </span>
                      <span className="text-white/60 text-sm">{t('points.position')}</span>
                    </div>
                    <span className="text-[#E10600] font-bold">{item.points} pts</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 bg-[#E10600]/10 rounded-xl border border-[#E10600]/30">
                <p className="text-white/70 text-sm">
                  <span className="text-[#E10600] font-semibold">{t('points.fastlap.title')}:</span> {t('points.fastlap.desc')}
                </p>
              </div>
            </div>

            {/* Qualificação - Mobile otimizado */}
            <div className={`glass rounded-2xl p-6 sm:p-8 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h3 className="font-f1 text-xl sm:text-2xl text-white mb-6 flex items-center gap-3">
                <Timer className="w-6 h-6 sm:w-7 sm:h-7 text-[#E10600]" />
                {t('points.qualifying.title')}
              </h3>
              <div className="space-y-4">
                {[
                  { q: 'Q1', time: rules.qualifying.q1.duration, elim: `${t('points.q1.elim')}`, desc: t('points.q1.desc') },
                  { q: 'Q2', time: rules.qualifying.q2.duration, elim: `${t('points.q2.elim')}`, desc: t('points.q2.desc') },
                  { q: 'Q3', time: rules.qualifying.q3.duration, elim: `${t('points.q3.elim')}`, desc: t('points.q3.desc') },
                ].map((item, i) => (
                  <div key={i} className="flex gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#E10600] rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm sm:text-base">{item.q}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
                        <h4 className="text-white font-semibold text-sm sm:text-base">{item.time}</h4>
                        <Badge className={item.elim.startsWith('Top') ? 'bg-green-500/20 text-green-400 rounded-full text-xs' : 'bg-red-500/20 text-red-400 rounded-full text-xs'}>
                          {item.elim}
                        </Badge>
                      </div>
                      <p className="text-white/50 text-xs sm:text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={`mt-8 glass rounded-2xl p-6 sm:p-8 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h3 className="font-f1 text-lg sm:text-xl text-white mb-8 text-center">{t('points.championships.title')}</h3>
            <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
              <div className="text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#E10600]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-[#E10600]" />
                </div>
                <h4 className="text-white font-bold text-base sm:text-lg mb-2">{t('points.drivers.title')}</h4>
                <p className="text-white/50 text-sm">{t('points.drivers.desc')}</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#E10600]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 text-[#E10600]" />
                </div>
                <h4 className="text-white font-bold text-base sm:text-lg mb-2">{t('points.constructors.title')}</h4>
                <p className="text-white/50 text-sm">{t('points.constructors.desc')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ==================== ONDE ASSISTIR - NOVA SEÇÃO ====================
function OndeAssistirSection() {
  const { ref, isVisible } = useScrollAnimation()
  const { t } = useApp()

  const broadcasters = [
    {
      name: 'Band',
      country: 'Brasil',
      type: t('watch.band.type'),
      description: t('watch.band.desc'),
      url: 'https://www.band.uol.com.br/esportes/automobilismo/formula-1',
      color: '#00A651'
    },
    {
      name: 'F1 TV Pro',
      country: 'Internacional',
      type: t('watch.f1tvpro.type'),
      description: t('watch.f1tvpro.desc'),
      url: 'https://f1tv.formula1.com',
      color: '#E10600'
    },
    {
      name: 'ESPN',
      country: 'Brasil',
      type: t('watch.espn.type'),
      description: t('watch.espn.desc'),
      url: 'https://www.espn.com.br/f1',
      color: '#E01E3C'
    },
    {
      name: 'Star+',
      country: 'Brasil',
      type: t('watch.star.type'),
      description: t('watch.star.desc'),
      url: 'https://www.starplus.com',
      color: '#00A8E1'
    },
    {
      name: 'DAZN',
      country: 'Internacional',
      type: t('watch.dazn.type'),
      description: t('watch.dazn.desc'),
      url: 'https://www.dazn.com',
      color: '#F7FF19'
    }
  ]

  return (
    <section id="onde-assistir" ref={ref} className="py-32 bg-[#050505]">
      <div className="section-padding">
        <div className="max-w-6xl mx-auto">
          <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Badge className="mb-4 bg-white/10 text-white border-white/20 rounded-full">
              <Tv className="w-3.5 h-3.5 mr-1.5" />
              {t('watch.badge')}
            </Badge>
            <h2 className="font-f1 text-4xl sm:text-5xl lg:text-6xl font-medium text-white mb-4">
              {t('watch.title')} <span className="text-[#E10600]">{t('nav.watch')}</span>
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              {t('watch.subtitle')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {broadcasters.map((broadcaster, index) => (
              <a
                key={index}
                href={broadcaster.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`f1-card p-5 sm:p-6 group transition-all duration-700 hover:border-[#E10600]/50 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${broadcaster.color}20` }}
                  >
                    <Play className="w-6 h-6" style={{ color: broadcaster.color }} />
                  </div>
                  <Badge className="bg-white/10 text-white/70 text-xs rounded-full">
                    {broadcaster.type}
                  </Badge>
                </div>
                
                <h3 className="font-f1 text-xl text-white mb-1 group-hover:text-[#E10600] transition-colors">
                  {broadcaster.name}
                </h3>
                <p className="text-white/40 text-sm mb-3">{broadcaster.country}</p>
                <p className="text-white/50 text-sm mb-4">{broadcaster.description}</p>
                
                <div className="flex items-center gap-2 text-[#E10600] text-sm font-medium">
                  <span>{t('watch.live')}</span>
                  <ExternalLink className="w-4 h-4" />
                </div>
              </a>
            ))}
          </div>

          <div className={`mt-12 glass rounded-2xl p-6 sm:p-8 transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#E10600]/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Radio className="w-7 h-7 text-[#E10600]" />
                </div>
                <div>
                  <h3 className="font-f1 text-lg sm:text-xl text-white">{t('watch.f1tv.title')}</h3>
                  <p className="text-white/50 text-sm">{t('watch.f1tv.desc')}</p>
                </div>
              </div>
              <a
                href="https://f1tv.formula1.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#E10600] hover:bg-[#b80500] text-white rounded-xl font-semibold transition-colors"
              >
                <Play className="w-5 h-5" />
                {t('watch.f1tv.cta')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ==================== CIRCUITOS ====================
function CircuitosSection() {
  const [selectedCircuito, setSelectedCircuito] = useState<typeof CIRCUITOS_DATA[0] | null>(null)


  const { t } = useApp()

  return (
    <section id="circuitos" className="py-32 bg-black relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#E10600]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#E10600]/5 rounded-full blur-3xl" />

      <div className="section-padding relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-white/10 text-white border-white/20 rounded-full">
              <MapPin className="w-3.5 h-3.5 mr-1.5" />
              {t('circuits.badge')}
            </Badge>
            <h2 className="font-f1 text-4xl sm:text-5xl lg:text-6xl font-medium text-white mb-4">
              {t('circuits.title')} <span className="text-[#E10600]">F1</span>
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              {t('circuits.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {CIRCUITOS_DATA.map((circuito, index) => (
              <button
                key={index}
                onClick={() => setSelectedCircuito(circuito)}
                className={`f1-card group overflow-hidden text-left transition-all duration-500 hover:border-[#E10600]/50 opacity-100 translate-y-0`}
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                <div className="relative h-40 sm:h-48 overflow-hidden">
                  <img 
                    src={circuito.image} 
                    alt={circuito.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{circuito.flag}</span>
                      <Badge className="bg-[#E10600]/80 text-white text-xs rounded-full">
                        {circuito.gp}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 sm:p-5">
                  <h3 className="font-f1 text-base sm:text-lg text-white mb-1 group-hover:text-[#E10600] transition-colors line-clamp-1">
                    {circuito.name}
                  </h3>
                  <p className="text-white/50 text-sm mb-2">
                    {circuito.city}, {circuito.country}
                  </p>
                  
                  <div className="flex items-center gap-3 text-xs text-white/30">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {circuito.length}
                    </span>
                    <span className="flex items-center gap-1">
                      <Flag className="w-3 h-3" />
                      {circuito.laps} {t('circuits.laps')}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modal do Circuito */}
      {selectedCircuito && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedCircuito(null)}
        >
          <div 
            className="bg-[#0a0a0a] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-56 sm:h-64">
              <img 
                src={selectedCircuito.image} 
                alt={selectedCircuito.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
              <button
                onClick={() => setSelectedCircuito(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-[#E10600] text-white rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-4 sm:left-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-3xl sm:text-4xl">{selectedCircuito.flag}</span>
                  <Badge className="bg-[#E10600] text-white rounded-full">
                    {selectedCircuito.gp}
                  </Badge>
                </div>
                <h2 className="font-f1 text-2xl sm:text-3xl text-white">{selectedCircuito.name}</h2>
              </div>
            </div>
            
            <div className="p-5 sm:p-6">
              <div className="flex items-center gap-2 text-white/50 mb-4">
                <MapPin className="w-4 h-4" />
                <span>{selectedCircuito.city}, {selectedCircuito.country}</span>
              </div>
              
              <p className="text-white/70 text-base sm:text-lg mb-6 leading-relaxed">
                {selectedCircuito.description}
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-white/40 text-xs mb-1">{t('circuits.modal.length')}</p>
                  <p className="text-white font-semibold text-lg">{selectedCircuito.length}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-white/40 text-xs mb-1">{t('circuits.modal.laps')}</p>
                  <p className="text-white font-semibold text-lg">{selectedCircuito.laps}</p>
                </div>
              </div>
              
              <a
                href={selectedCircuito.wikiUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-4 bg-[#E10600] hover:bg-[#b80500] text-white rounded-xl font-semibold transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
                {t('circuits.modal.seeMore')} {selectedCircuito.name}
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

// ==================== GALERIA F1 ====================
function GaleriaSection() {
  const { ref, isVisible } = useScrollAnimation()
  const { t } = useApp()

  const imagens = [
    { src: '/images/f1-track.jpg', alt: 'F1 cars on track', title: t('gallery.image1.title') },
    { src: '/images/f1-podium.jpg', alt: 'Podium celebration', title: t('gallery.image2.title') },
    { src: '/images/f1-car-closeup.jpg', alt: 'F1 car detail', title: t('gallery.image3.title') },
  ]

  return (
    <section id="galeria" ref={ref} className="py-32 bg-[#050505]">
      <div className="section-padding">
        <div className="max-w-6xl mx-auto">
          <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Badge className="mb-4 bg-white/10 text-white border-white/20 rounded-full">
              <Camera className="w-3.5 h-3.5 mr-1.5" />
              {t('gallery.badge')}
            </Badge>
            <h2 className="font-f1 text-4xl sm:text-5xl lg:text-6xl font-medium text-white mb-4">
              {t('gallery.title')} <span className="text-[#E10600]">F1</span>
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              {t('gallery.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {imagens.map((img, index) => (
              <div 
                key={index}
                className={`group relative overflow-hidden rounded-2xl aspect-[4/3] transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${index * 0.15}s` }}
              >
                <img 
                  src={img.src} 
                  alt={img.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white font-semibold">{img.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ==================== SISTEMA AUTOMATIZADO ====================
function SistemaAutomatizadoSection() {
  const { ref, isVisible } = useScrollAnimation()
  const { t } = useApp()

  const automatizacoes = [
    {
      icon: <Radio className="w-6 h-6" />,
      title: t('auto.realtime.title'),
      description: t('auto.realtime.desc'),
      status: t('auto.active')
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: t('auto.year.title'),
      description: t('auto.year.desc'),
      status: t('auto.active')
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: t('auto.links.title'),
      description: t('auto.links.desc'),
      status: t('auto.active')
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: t('auto.cache.title'),
      description: t('auto.cache.desc'),
      status: t('auto.active')
    },
    {
      icon: <RefreshCw className="w-6 h-6" />,
      title: t('auto.manual.title'),
      description: t('auto.manual.desc'),
      status: t('auto.available')
    }
  ]

  return (
    <section id="automatizado" ref={ref} className="py-32 bg-black relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#E10600]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#E10600]/5 rounded-full blur-3xl" />

      <div className="section-padding relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Badge className="mb-4 bg-[#E10600]/20 text-[#E10600] border-[#E10600]/30 rounded-full">
              <Zap className="w-3.5 h-3.5 mr-1.5" />
              {t('auto.badge')}
            </Badge>
            <h2 className="font-f1 text-4xl sm:text-5xl lg:text-6xl font-medium text-white mb-4">
              {t('auto.title')} <span className="text-[#E10600]">{t('auto.automated')}</span>?
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              {t('auto.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {automatizacoes.map((item, index) => (
              <div 
                key={index}
                className={`f1-card p-6 group transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-[#E10600]/20 rounded-xl flex items-center justify-center text-[#E10600]">
                    {item.icon}
                  </div>
                  <Badge className={item.status === t('auto.active') ? 'bg-green-500/20 text-green-400 border-green-500/30 rounded-full' : 'bg-blue-500/20 text-blue-400 border-blue-500/30 rounded-full'}>
                    {item.status}
                  </Badge>
                </div>
                <h3 className="font-f1 text-xl text-white mb-3">{item.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ==================== LENDAS ====================
function LendasSection() {
  const { ref, isVisible } = useScrollAnimation()
  const { t } = useApp()

  const lendas = [
    { name: 'Michael Schumacher', titles: '7 ' + t('legends.titles'), years: '1991-2012', periodLabel: t('legends.period'), desc: t('legends.schumacher.desc'), color: 'from-red-600 to-red-800', wikiUrl: 'https://en.wikipedia.org/wiki/Michael_Schumacher' },
    { name: 'Ayrton Senna', titles: '3 ' + t('legends.titles'), years: '1984-1994', periodLabel: t('legends.period'), desc: t('legends.senna.desc'), color: 'from-green-600 to-green-800', wikiUrl: 'https://en.wikipedia.org/wiki/Ayrton_Senna' },
    { name: 'Lewis Hamilton', titles: '7 ' + t('legends.titles'), years: '2007-' + new Date().getFullYear(), periodLabel: t('legends.period'), desc: t('legends.hamilton.desc'), color: 'from-purple-600 to-purple-800', wikiUrl: 'https://en.wikipedia.org/wiki/Lewis_Hamilton' },
    { name: 'Max Verstappen', titles: '4 ' + t('legends.titles'), years: '2015-' + new Date().getFullYear(), periodLabel: t('legends.period'), desc: t('legends.verstappen.desc'), color: 'from-blue-600 to-blue-800', wikiUrl: 'https://en.wikipedia.org/wiki/Max_Verstappen' },
    { name: 'Alain Prost', titles: '4 ' + t('legends.titles'), years: '1980-1993', periodLabel: t('legends.period'), desc: t('legends.prost.desc'), color: 'from-yellow-600 to-yellow-800', wikiUrl: 'https://en.wikipedia.org/wiki/Alain_Prost' },
    { name: 'Sebastian Vettel', titles: '4 ' + t('legends.titles'), years: '2007-2022', periodLabel: t('legends.period'), desc: t('legends.vettel.desc'), color: 'from-cyan-600 to-cyan-800', wikiUrl: 'https://en.wikipedia.org/wiki/Sebastian_Vettel' },
  ]

  return (
    <section id="lendas" ref={ref} className="py-32 bg-black relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#E10600]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#E10600]/5 rounded-full blur-3xl" />

      <div className="section-padding relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Badge className="mb-4 bg-white/10 text-white border-white/20 rounded-full">
              <Trophy className="w-3.5 h-3.5 mr-1.5" />
              {t('legends.badge')}
            </Badge>
            <h2 className="font-f1 text-4xl sm:text-5xl lg:text-6xl font-medium text-white mb-4">
              {t('legends.title')} <span className="text-[#E10600]">F1</span>
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              {t('legends.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lendas.map((lenda, index) => (
              <a
                key={index}
                href={lenda.wikiUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`f1-card group overflow-hidden text-left transition-all duration-700 hover:border-[#E10600]/50 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${index * 0.1}s` }}
              >
                <div className={`h-2 bg-gradient-to-r ${lenda.color}`} />
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-f1 text-xl text-white group-hover:text-[#E10600] transition-colors">
                        {lenda.name}
                      </h3>
                      <p className="text-white/50 text-xs">{lenda.periodLabel}</p>
                      <p className="text-[#E10600] text-sm font-medium">{lenda.years}</p>
                    </div>
                    <div className="bg-white/10 px-3 py-1 rounded-full">
                      <span className="text-white text-sm font-bold">{lenda.titles}</span>
                    </div>
                  </div>
                  <p className="text-white/50 text-sm leading-relaxed mb-4">{lenda.desc}</p>
                  <div className="flex items-center gap-2 text-white/40 text-sm group-hover:text-[#E10600] transition-colors">
                    <ExternalLink className="w-4 h-4" />
                    <span>{t('legends.viewProfile')}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ==================== PNEUS ====================
function PneusSection() {
  const { ref, isVisible } = useScrollAnimation()
  const { t } = useApp()

  const pneus = [
    { name: t('tires.soft.title'), color: '#E10600', desc: t('tires.soft.desc'), durabilidade: t('tires.durability.low') },
    { name: t('tires.medium.title'), color: '#FFD700', desc: t('tires.medium.desc'), durabilidade: t('tires.durability.medium') },
    { name: t('tires.hard.title'), color: '#FFFFFF', desc: t('tires.hard.desc'), durabilidade: t('tires.durability.high') },
    { name: t('tires.inter.title'), color: '#00AA00', desc: t('tires.inter.desc'), durabilidade: t('tires.durability.variable') },
    { name: t('tires.wet.title'), color: '#0066CC', desc: t('tires.wet.desc'), durabilidade: t('tires.durability.high') },
  ]

  return (
    <section id="pneus" ref={ref} className="py-32 bg-[#050505]">
      <div className="section-padding">
        <div className="max-w-6xl mx-auto">
          <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Badge className="mb-4 bg-white/10 text-white border-white/20 rounded-full">
              <Circle className="w-3.5 h-3.5 mr-1.5" />
              {t('tires.badge')}
            </Badge>
            <h2 className="font-f1 text-4xl sm:text-5xl lg:text-6xl font-medium text-white mb-4">
              {t('tires.title')} <span className="text-[#E10600]">{t('nav.tires')}</span>
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              {t('tires.subtitle')}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              {pneus.map((pneu, index) => (
                <div 
                  key={index} 
                  className={`f1-card p-5 flex items-start gap-4 group hover:translate-x-1 transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}
                  style={{ transitionDelay: `${index * 0.1}s` }}
                >
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 border-2"
                    style={{ 
                      backgroundColor: `${pneu.color}20`,
                      borderColor: pneu.color
                    }}
                  >
                    <Circle className="w-7 h-7" style={{ color: pneu.color }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-white font-bold text-lg">{pneu.name}</h3>
                      <Badge variant="outline" className="text-xs border-white/20 text-white/50 rounded-full">
                        {pneu.durabilidade}
                      </Badge>
                    </div>
                    <p className="text-white/50 text-sm">{pneu.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className={`glass rounded-2xl p-8 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h3 className="font-f1 text-2xl text-white mb-6">{t('tires.strategy.title')}</h3>
              <div className="space-y-6">
                {[
                  { num: '1', title: t('tires.strategy.rule.title'), desc: t('tires.strategy.rule.desc') },
                ].map((rule, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-8 h-8 bg-[#E10600]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-[#E10600] font-bold text-sm">{rule.num}</span>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">{rule.title}</h4>
                      <p className="text-white/50 text-sm">{rule.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-6 bg-white/10" />

              <div className="bg-[#E10600]/10 rounded-xl p-4 border border-[#E10600]/30">
                <p className="text-sm text-white/70">
                  <span className="text-[#E10600] font-semibold">{t('tires.tip')}:</span> {t('tires.tip.desc')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ==================== CLIMA ====================
function ClimaSection() {
  const { ref, isVisible } = useScrollAnimation()
  const { t } = useApp()

  const condicoes = [
    { condition: t('weather.dry.title'), icon: '☀️', impact: t('weather.dry.desc'), estrategia: t('weather.dry.strategy') },
    { condition: t('weather.cloudy.title'), icon: '☁️', impact: t('weather.cloudy.desc'), estrategia: t('weather.cloudy.strategy') },
    { condition: t('weather.wet.title'), icon: '🌧️', impact: t('weather.wet.desc'), estrategia: t('weather.wet.strategy') },
    { condition: t('weather.heavyRain.title'), icon: '⛈️', impact: t('weather.heavyRain.desc'), estrategia: t('weather.heavyRain.strategy') },
  ]

  const bandeiras = [
    { type: 'green', name: t('weather.flag.green'), desc: t('weather.flag.green.desc') },
    { type: 'yellow', name: t('weather.flag.yellow'), desc: t('weather.flag.yellow.desc') },
    { type: 'red', name: t('weather.flag.red'), desc: t('weather.flag.red.desc') },
    { type: 'checkered', name: t('weather.flag.checkered'), desc: t('weather.flag.checkered.desc') },
  ]

  return (
    <section id="clima" ref={ref} className="py-32 bg-black relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#E10600]/5 to-transparent" />
      
      <div className="section-padding relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Badge className="mb-4 bg-white/10 text-white border-white/20 rounded-full">
              <Wind className="w-3.5 h-3.5 mr-1.5" />
              {t('weather.badge')}
            </Badge>
            <h2 className="font-f1 text-4xl sm:text-5xl lg:text-6xl font-medium text-white mb-4">
              {t('weather.title')} <span className="text-[#E10600]">{t('nav.weather')}</span>
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              {t('weather.subtitle')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {condicoes.map((item, index) => (
              <div 
                key={index} 
                className={`f1-card p-6 text-center group transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${index * 0.1}s` }}
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{item.icon}</div>
                <h3 className="font-f1 text-xl text-white mb-3">{item.condition}</h3>
                <p className="text-white/50 text-sm mb-4">{item.impact}</p>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-[#E10600] text-xs font-medium">{item.estrategia}</p>
                </div>
              </div>
            ))}
          </div>

          <div className={`glass rounded-2xl p-8 transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h3 className="font-f1 text-2xl text-white mb-8 text-center">{t('weather.flags.title')}</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {bandeiras.map((bandeira, index) => (
                <div key={index} className="flex items-center gap-4">
                  {bandeira.type === 'checkered' ? (
                    <div className="w-12 h-12 checkered-flag rounded-lg flex-shrink-0 shadow-lg border border-white/20" />
                  ) : (
                    <div className={`w-12 h-12 ${
                      bandeira.type === 'green' ? 'bg-green-500' : 
                      bandeira.type === 'yellow' ? 'bg-yellow-400' : 
                      'bg-red-500'
                    } rounded-lg flex-shrink-0 shadow-lg`} />
                  )}
                  <div>
                    <div className="text-white font-semibold">{bandeira.name}</div>
                    <div className="text-white/50 text-sm">{bandeira.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ==================== NOTÍCIAS ====================
function NoticiasSection() {
  const { ref, isVisible } = useScrollAnimation()
  const { t, language } = useApp()
  const { news, loading, error, lastUpdate, isUpdating, refresh } = useAutoUpdate({
    interval: 5 * 60 * 1000,
    immediate: true,
    language: language
  })

  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)
  const [savedArticles, setSavedArticles] = useState<string[]>([])

  const displayedNews = showAll ? news : news.slice(0, 6)

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const toggleSave = (id: string) => {
    setSavedArticles(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const shareArticle = (article: any) => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.summary,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copiado!')
    }
  }

  return (
    <section id="noticias" ref={ref} className="py-32 bg-[#050505]">
      <div className="section-padding">
        <div className="max-w-6xl mx-auto">
          <div className={`flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div>
              <Badge className="mb-4 bg-white/10 text-white border-white/20 rounded-full">
                <Radio className="w-3.5 h-3.5 mr-1.5" />
                {t('news.badge')}
              </Badge>
              <h2 className="font-f1 text-4xl sm:text-5xl lg:text-6xl font-medium text-white">
                {t('news.title')} <span className="text-[#E10600]">{t('nav.news')}</span>
              </h2>
            </div>
            <div className="flex items-center gap-4">
              {isUpdating ? (
                <div className="flex items-center gap-2 text-white/50">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span className="text-sm">{t('news.loading')}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-white/40">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">
                    {lastUpdate ? formatRelativeDate(lastUpdate.toISOString(), language) : t('news.updated')}
                  </span>
                </div>
              )}
              <Button
                onClick={refresh}
                disabled={isUpdating}
                variant="ghost"
                size="sm"
                className="text-white/40 hover:text-white"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isUpdating ? 'animate-spin' : ''}`} />
                {t('news.refresh')}
              </Button>
            </div>
          </div>

          {loading && news.length === 0 ? (
            <div className="glass rounded-2xl p-12">
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#E10600] border-t-transparent" />
              </div>
              <p className="text-center text-white/50">{t('news.loading')}</p>
            </div>
          ) : error && news.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <p className="text-white/50 mb-4">{t('news.error')}</p>
              <Button onClick={refresh} variant="outline" className="border-white/20 text-white hover:bg-white/5 rounded-xl">
                {t('news.refresh')}
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedNews.map((article, index) => (
                <article 
                  key={article.id}
                  className={`f1-card group cursor-pointer transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                  style={{ transitionDelay: `${index * 0.1}s` }}
                >
                  <div className="p-6" onClick={() => toggleExpand(article.id)}>
                    <div className="flex items-center justify-between mb-4">
                      <Badge className={`text-xs rounded-full ${article.important ? 'bg-[#E10600]/20 text-[#E10600] border-[#E10600]/30' : 'bg-white/10 text-white/70 border-white/20'}`}>
                        {article.tag}
                      </Badge>
                      <span className="text-white/30 text-sm">{formatRelativeDate(article.date, language)}</span>
                    </div>
                    <h3 className="text-white font-bold text-lg mb-3 group-hover:text-[#E10600] transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className={`text-white/50 text-sm ${expandedId === article.id ? '' : 'line-clamp-2'}`}>
                      {article.summary}
                    </p>
                    
                    {expandedId === article.id && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-white/30 text-xs">{t('news.sourceLabel')}: {article.source}</span>
                          <div className="flex gap-2">
                            <button 
                              onClick={(e) => { e.stopPropagation(); shareArticle(article); }}
                              className="p-2 bg-white/5 hover:bg-[#E10600] transition-colors rounded-lg"
                            >
                              <Share2 className="w-4 h-4 text-white" />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); toggleSave(article.id); }}
                              className={`p-2 transition-colors rounded-lg ${savedArticles.includes(article.id) ? 'bg-[#E10600]' : 'bg-white/5 hover:bg-[#E10600]'}`}
                            >
                              <Bookmark className="w-4 h-4 text-white" />
                            </button>
                          </div>
                        </div>
                        {article.url && (
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-2 text-[#E10600] hover:text-white text-sm font-medium transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                            {t('news.readmore')} {article.source}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}

          {news.length > 6 && (
            <div className="text-center mt-8">
              <Button
                onClick={() => setShowAll(!showAll)}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/5 hover:border-[#E10600] rounded-xl"
              >
                {showAll ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-2" />
                    {t('news.seeLess')}
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-2" />
                    {t('news.seeAll')} ({news.length})
                  </>
                )}
              </Button>
            </div>
          )}

          <div className="mt-12 text-center">
            <p className="text-white/30 text-sm">
              {t('news.sources')}: Formula1.com, Sky Sports F1, BBC Sport, ESPN
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

// ==================== FOOTER ====================
function Footer() {
  const { t } = useApp()
  
  return (
    <footer className="bg-black border-t border-white/10">
      <div className="section-padding py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#E10600] rounded-lg flex items-center justify-center">
                <Flag className="w-5 h-5 text-white" />
              </div>
              <span className="font-f1 text-2xl font-semibold text-white">F1<span className="text-[#E10600]">Start</span></span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6">
              {[
                { label: t('nav.home') as string, href: '#hero' },
                { label: `${t('nav.rules')} ${CURRENT_YEAR}`, href: '#regras' },
                { label: t('nav.teams') as string, href: '#equipes' },
                { label: t('nav.calendar') as string, href: '#calendario' },
                { label: t('nav.watch') as string, href: '#onde-assistir' },
                { label: t('nav.news') as string, href: '#noticias' },
              ].map((item) => (
                <a 
                  key={item.href} 
                  href={item.href}
                  className="text-white/50 hover:text-white transition-colors text-sm"
                >
                  {item.label}
                </a>
              ))}
            </div>

            <div className="text-white/30 text-sm">
              © {CURRENT_YEAR} F1Start
            </div>
          </div>
          
          <Separator className="bg-white/10 mb-8" />
          
          <p className="text-center text-white/30 text-xs">
            {t('footer.disclaimer')}
          </p>
        </div>
      </div>
    </footer>
  )
}

// ==================== MAIN APP ====================
function AppContent() {
  return (
    <div className="min-h-screen bg-black text-white font-f1">
      <Navigation />
      <main>
        <HeroSection />
        <OQueESection />
        <RegrasSection />
        <EquipesSection />
        <CalendarioSection />
        <PontuacaoSection />
        <OndeAssistirSection />
        <CircuitosSection />
        <GaleriaSection />
        <SistemaAutomatizadoSection />
        <LendasSection />
        <PneusSection />
        <ClimaSection />
        <NoticiasSection />
      </main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}

export default App
