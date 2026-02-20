import { useState, useEffect } from 'react';
import { MapPin, Calendar, Bell, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Race {
  round: number;
  name: string;
  circuit: string;
  country: string;
  date: Date;
  flag: string;
}

// F1 2026 Calendar
const RACES_2026: Race[] = [
  { round: 1, name: 'Australian GP', circuit: 'Albert Park', country: 'Australia', date: new Date('2026-03-06T03:00:00'), flag: '🇦🇺' },
  { round: 2, name: 'Chinese GP', circuit: 'Shanghai', country: 'China', date: new Date('2026-03-20T07:00:00'), flag: '🇨🇳' },
  { round: 3, name: 'Japanese GP', circuit: 'Suzuka', country: 'Japan', date: new Date('2026-04-03T06:00:00'), flag: '🇯🇵' },
  { round: 4, name: 'Bahrain GP', circuit: 'Sakhir', country: 'Bahrain', date: new Date('2026-04-10T16:00:00'), flag: '🇧🇭' },
  { round: 5, name: 'Saudi Arabian GP', circuit: 'Jeddah', country: 'Saudi Arabia', date: new Date('2026-04-17T19:00:00'), flag: '🇸🇦' },
  { round: 6, name: 'Miami GP', circuit: 'Miami', country: 'USA', date: new Date('2026-05-01T20:30:00'), flag: '🇺🇸' },
  { round: 7, name: 'Emilia Romagna GP', circuit: 'Imola', country: 'Italy', date: new Date('2026-05-15T14:00:00'), flag: '🇮🇹' },
  { round: 8, name: 'Monaco GP', circuit: 'Monte Carlo', country: 'Monaco', date: new Date('2026-05-22T14:00:00'), flag: '🇲🇨' },
  { round: 9, name: 'Spanish GP', circuit: 'Barcelona', country: 'Spain', date: new Date('2026-06-05T14:00:00'), flag: '🇪🇸' },
  { round: 10, name: 'Canadian GP', circuit: 'Gilles Villeneuve', country: 'Canada', date: new Date('2026-06-12T19:00:00'), flag: '🇨🇦' },
  { round: 11, name: 'Austrian GP', circuit: 'Red Bull Ring', country: 'Austria', date: new Date('2026-06-26T14:00:00'), flag: '🇦🇹' },
  { round: 12, name: 'British GP', circuit: 'Silverstone', country: 'UK', date: new Date('2026-07-03T14:00:00'), flag: '🇬🇧' },
  { round: 13, name: 'Belgian GP', circuit: 'Spa-Francorchamps', country: 'Belgium', date: new Date('2026-07-17T14:00:00'), flag: '🇧🇪' },
  { round: 14, name: 'Hungarian GP', circuit: 'Hungaroring', country: 'Hungary', date: new Date('2026-07-24T14:00:00'), flag: '🇭🇺' },
  { round: 15, name: 'Dutch GP', circuit: 'Zandvoort', country: 'Netherlands', date: new Date('2026-08-21T14:00:00'), flag: '🇳🇱' },
  { round: 16, name: 'Italian GP', circuit: 'Monza', country: 'Italy', date: new Date('2026-09-04T14:00:00'), flag: '🇮🇹' },
  { round: 17, name: 'Singapore GP', circuit: 'Marina Bay', country: 'Singapore', date: new Date('2026-09-18T13:00:00'), flag: '🇸🇬' },
  { round: 18, name: 'United States GP', circuit: 'Austin', country: 'USA', date: new Date('2026-10-02T20:00:00'), flag: '🇺🇸' },
  { round: 19, name: 'Mexican GP', circuit: 'Hermanos Rodríguez', country: 'Mexico', date: new Date('2026-10-09T20:00:00'), flag: '🇲🇽' },
  { round: 20, name: 'Brazilian GP', circuit: 'Interlagos', country: 'Brazil', date: new Date('2026-10-23T17:00:00'), flag: '🇧🇷' },
  { round: 21, name: 'Las Vegas GP', circuit: 'Las Vegas', country: 'USA', date: new Date('2026-11-06T06:00:00'), flag: '🇺🇸' },
  { round: 22, name: 'Qatar GP', circuit: 'Losail', country: 'Qatar', date: new Date('2026-11-13T17:00:00'), flag: '🇶🇦' },
  { round: 23, name: 'Abu Dhabi GP', circuit: 'Yas Marina', country: 'UAE', date: new Date('2026-11-27T13:00:00'), flag: '🇦🇪' },
];

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const RaceCountdown = () => {
  const [nextRace, setNextRace] = useState<Race | null>(null);
  const [countdown, setCountdown] = useState<CountdownTime>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isRaceWeek, setIsRaceWeek] = useState(false);
  const [reminderSet, setReminderSet] = useState(false);

  useEffect(() => {
    const findNextRace = () => {
      const now = new Date();
      const upcoming = RACES_2026.find(race => race.date > now);
      
      if (upcoming) {
        setNextRace(upcoming);
        
        const diffMs = upcoming.date.getTime() - now.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        setIsRaceWeek(diffDays <= 7);
      }
    };

    findNextRace();
  }, []);

  useEffect(() => {
    if (!nextRace) return;

    const calculateCountdown = () => {
      const now = new Date();
      const diff = nextRace.date.getTime() - now.getTime();

      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000)
      });
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);

    return () => clearInterval(interval);
  }, [nextRace]);

  const setReminder = () => {
    setReminderSet(true);
    setTimeout(() => setReminderSet(false), 3000);
  };

  const shareRace = () => {
    if (navigator.share && nextRace) {
      navigator.share({
        title: `${nextRace.name} 2026`,
        text: `Countdown to ${nextRace.name} at ${nextRace.circuit}!`,
        url: window.location.href
      });
    }
  };

  if (!nextRace) {
    return (
      <div className="glass rounded-2xl p-8">
        <p className="text-white/50 text-center">Temporada 2026 Completa</p>
      </div>
    );
  }

  return (
    <div className={`glass rounded-2xl ${isRaceWeek ? 'border-2 border-[#E10600]' : ''}`}>
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isRaceWeek && (
              <Badge className="bg-[#E10600] text-white animate-pulse">
                Semana de Corrida
              </Badge>
            )}
            <span className="text-white/50 text-xs uppercase tracking-widest">Próxima Corrida</span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={setReminder}
              className={`w-8 h-8 flex items-center justify-center transition-colors ${
                reminderSet ? 'bg-[#E10600]' : 'bg-white/10 hover:bg-[#E10600]'
              }`}
            >
              <Bell className="w-4 h-4" />
            </button>
            <button 
              onClick={shareRace}
              className="w-8 h-8 bg-white/10 flex items-center justify-center hover:bg-[#E10600] transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Race Info */}
      <div className="p-6">
        <div className="flex items-start gap-4 mb-6">
          <span className="text-5xl">{nextRace.flag}</span>
          <div>
            <h3 className="text-white font-bold text-2xl">{nextRace.name}</h3>
            <div className="flex items-center gap-2 text-white/50 mt-1">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{nextRace.circuit}, {nextRace.country}</span>
            </div>
            <div className="flex items-center gap-2 text-white/50 mt-1">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">
                {nextRace.date.toLocaleDateString('pt-BR', { 
                  weekday: 'long',
                  day: 'numeric', 
                  month: 'long'
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Countdown */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <CountdownBox value={countdown.days} label="Dias" />
          <CountdownBox value={countdown.hours} label="Horas" />
          <CountdownBox value={countdown.minutes} label="Min" />
          <CountdownBox value={countdown.seconds} label="Seg" />
        </div>

        {/* Weekend Schedule */}
        {isRaceWeek && (
          <div className="mt-6 pt-6 border-t border-white/10">
            <h4 className="text-white/50 text-xs uppercase tracking-widest mb-4">Programação do Fim de Semana</h4>
            <div className="grid grid-cols-3 gap-2">
              {[
                { day: 'Sex', events: 'FP1 + FP2', time: '12:00 / 15:00' },
                { day: 'Sáb', events: 'FP3 + Quali', time: '11:00 / 14:00' },
                { day: 'Dom', events: 'CORRIDA', time: '14:00', highlight: true },
              ].map((session, i) => (
                <div 
                  key={i} 
                  className={`p-3 text-center ${
                    session.highlight 
                      ? 'bg-[#E10600]/20 border border-[#E10600]/50' 
                      : 'bg-white/5'
                  }`}
                >
                  <p className={`text-xs font-bold uppercase ${session.highlight ? 'text-[#E10600]' : 'text-white/40'}`}>
                    {session.day}
                  </p>
                  <p className="text-white text-sm font-semibold mt-1">{session.events}</p>
                  <p className="text-white/50 text-xs mt-1">{session.time}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex-1 btn-f1">Ver Calendário Completo</Button>
            </DialogTrigger>
            <DialogContent className="bg-[#0a0a0a] border-white/10 text-white max-w-2xl max-h-[80vh] overflow-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Calendário F1 2026</DialogTitle>
              </DialogHeader>
              <div className="space-y-2 mt-4">
                {RACES_2026.map((race) => (
                  <div 
                    key={race.round} 
                    className={`flex items-center gap-4 p-3 ${
                      race.round === nextRace?.round ? 'bg-[#E10600]/20 border border-[#E10600]/50' : 'bg-white/5'
                    }`}
                  >
                    <span className="text-2xl">{race.flag}</span>
                    <div className="flex-1">
                      <p className="text-white font-semibold">{race.name}</p>
                      <p className="text-white/50 text-sm">{race.circuit}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white text-sm">{race.date.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })}</p>
                      <p className="text-white/50 text-xs">Round {race.round}</p>
                    </div>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
          <Button 
            variant="outline" 
            className="border-white/20 text-white hover:bg-white/5 hover:border-[#E10600]"
            onClick={() => window.open('https://www.formula1.com/en/racing/2026.html', '_blank')}
          >
            Site Oficial
          </Button>
        </div>
      </div>
    </div>
  );
};

interface CountdownBoxProps {
  value: number;
  label: string;
}

const CountdownBox = ({ value, label }: CountdownBoxProps) => (
  <div className="bg-black/30 p-4 text-center rounded-lg">
    <div className="text-3xl md:text-4xl font-bold text-white tabular-nums">
      {String(value).padStart(2, '0')}
    </div>
    <div className="text-[10px] text-white/40 uppercase tracking-widest mt-1">{label}</div>
  </div>
);

export default RaceCountdown;
