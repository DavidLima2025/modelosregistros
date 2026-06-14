import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronLeft, Copy, Trash2, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface HistoricoItem {
  id: string;
  tipo: string;
  nome: string;
  data: string;
  texto: string;
}

interface HistoricoPanelProps {
  historico: HistoricoItem[];
  isOpen: boolean;
  onToggle: () => void;
  onCopy: (texto: string) => void;
  onDelete: (id: string) => void;
  onView: (item: HistoricoItem) => void;
}

export const HistoricoPanel: React.FC<HistoricoPanelProps> = ({
  historico,
  isOpen,
  onToggle,
  onCopy,
  onDelete,
  onView,
}) => {
  return (
    <>
      {/* Toggle Button */}
      <Button
        onClick={onToggle}
        className="fixed right-0 top-32 z-40 rounded-l-lg bg-primary text-primary-foreground hover:bg-primary/90"
        size="sm"
      >
        <ChevronLeft className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {/* Panel */}
      <aside
        className={`fixed right-0 top-0 z-30 h-screen w-72 border-l border-border bg-card transition-all duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="pt-20 pb-6 h-full flex flex-col">
          <h2 className="px-4 py-2 text-sm font-semibold text-muted-foreground">HISTÓRICO</h2>
          <ScrollArea className="flex-1">
            <div className="space-y-2 px-2">
              {historico.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Nenhum histórico gerado ainda
                </p>
              ) : (
                historico.map((item) => (
                  <Card key={item.id} className="bg-muted/50 border-border/50">
                    <CardHeader className="p-3">
                      <CardTitle className="text-xs font-semibold">{item.tipo}</CardTitle>
                      <CardDescription className="text-xs">
                        {item.nome} • {item.data}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <div className="flex gap-1">
                        <Button
                          onClick={() => onView(item)}
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs h-8"
                          title="Visualizar"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Ver
                        </Button>
                        <Button
                          onClick={() => onCopy(item.texto)}
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs h-8"
                          title="Copiar"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copiar
                        </Button>
                        <Button
                          onClick={() => onDelete(item.id)}
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs h-8 text-destructive hover:text-destructive"
                          title="Deletar"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
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
