import { useState } from 'react'
import { Globe, Check } from 'lucide-react'
import { useApp, type Language } from '@/contexts/AppContext'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const languages: { code: Language; name: string; flag: string }[] = [
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
]

export function LanguageSelector() {
  const { language, setLanguage } = useApp()
  const [open, setOpen] = useState(false)

  const currentLang = languages.find(l => l.code === language)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 px-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg gap-2"
        >
          <Globe className="w-4 h-4" />
          <span className="hidden sm:inline text-sm">{currentLang?.flag}</span>
          <span className="text-sm uppercase">{language}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-48 bg-[#1a1a1a] border-white/10"
      >
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => {
              setLanguage(lang.code)
              setOpen(false)
            }}
            className={`flex items-center justify-between cursor-pointer text-white/80 hover:text-white hover:bg-white/10 focus:bg-white/10 focus:text-white ${
              language === lang.code ? 'bg-white/5' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{lang.flag}</span>
              <span className="text-sm">{lang.name}</span>
            </div>
            {language === lang.code && (
              <Check className="w-4 h-4 text-[#E10600]" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
