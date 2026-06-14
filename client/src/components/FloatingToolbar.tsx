import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Download, Printer, Trash2, ChevronUp } from 'lucide-react';

interface FloatingToolbarProps {
  onCopy: () => void;
  onDownload: () => void;
  onPrint: () => void;
  onClear: () => void;
  hasResult: boolean;
}

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  onCopy,
  onDownload,
  onPrint,
  onClear,
  hasResult,
}) => {
  const [isOpen, setIsOpen] = React.useState(true);

  if (!hasResult) return null;

  return (
    <div
      className={`fixed bottom-8 right-8 z-50 flex flex-col gap-2 transition-all duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="flex flex-col gap-2 bg-card border border-border rounded-lg p-3 shadow-lg">
        <Button
          onClick={onCopy}
          size="sm"
          variant="outline"
          className="gap-2 justify-start"
          title="Copiar (Ctrl+C)"
        >
          <Copy className="h-4 w-4" />
          <span className="hidden sm:inline">Copiar</span>
        </Button>
        <Button
          onClick={onDownload}
          size="sm"
          variant="outline"
          className="gap-2 justify-start"
          title="Baixar (Ctrl+S)"
        >
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Baixar</span>
        </Button>
        <Button
          onClick={onPrint}
          size="sm"
          variant="outline"
          className="gap-2 justify-start"
          title="Imprimir (Ctrl+P)"
        >
          <Printer className="h-4 w-4" />
          <span className="hidden sm:inline">Imprimir</span>
        </Button>
        <Button
          onClick={onClear}
          size="sm"
          variant="outline"
          className="gap-2 justify-start text-destructive hover:text-destructive"
          title="Limpar"
        >
          <Trash2 className="h-4 w-4" />
          <span className="hidden sm:inline">Limpar</span>
        </Button>
      </div>

      {/* Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="sm"
        className="self-end bg-primary text-primary-foreground hover:bg-primary/90"
      >
        <ChevronUp className={`h-4 w-4 transition-transform ${isOpen ? '' : 'rotate-180'}`} />
      </Button>
    </div>
  );
};
