import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronRight } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const modelos = [
  { id: 'extravio', label: 'Extravio', icon: '📋' },
  { id: 'furto', label: 'Furto/Roubo', icon: '🚨' },
  { id: 'furtoImediato', label: 'Furto/Roubo Imediato', icon: '⚡' },
  { id: 'estelionato', label: 'Estelionato', icon: '🎭' },
  { id: 'transito', label: 'Trânsito', icon: '🚗' },
  { id: 'prisao', label: 'Prisão', icon: '🔒' },
  { id: 'rat', label: 'RAT', icon: '📊' },
  { id: 'diversos', label: 'Outros Modelos', icon: '⚙️' },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, isOpen, onToggle }) => {
  return (
    <>
      {/* Toggle Button */}
      <Button
        onClick={onToggle}
        className="fixed left-0 top-32 z-40 rounded-r-lg bg-primary text-primary-foreground hover:bg-primary/90"
        size="sm"
      >
        <ChevronRight className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-30 h-screen w-64 border-r border-border bg-card transition-all duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="pt-20 pb-6">
          <h2 className="px-4 py-2 text-sm font-semibold text-muted-foreground">MODELOS</h2>
          <ScrollArea className="h-[calc(100vh-120px)]">
            <nav className="space-y-1 px-2">
              {modelos.map((modelo) => (
                <Button
                  key={modelo.id}
                  onClick={() => onTabChange(modelo.id)}
                  variant={activeTab === modelo.id ? 'default' : 'ghost'}
                  className="w-full justify-start gap-3 text-left"
                  size="sm"
                >
                  <span className="text-lg">{modelo.icon}</span>
                  <span className="truncate">{modelo.label}</span>
                </Button>
              ))}
            </nav>
          </ScrollArea>
        </div>
      </aside>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={onToggle}
        />
      )}
    </>
  );
};
