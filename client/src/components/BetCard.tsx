import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, TrendingDown, Clock, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Bet } from '@shared/schema';

interface BetCardProps {
  bet: Bet;
  onResolve: (betId: string, status: 'won' | 'lost' | 'returned') => void;
  showResolveActions?: boolean;
}

export default function BetCard({ bet, onResolve, showResolveActions = true }: BetCardProps) {
  const statusConfig = {
    pending: {
      icon: Clock,
      label: 'Pendente',
      className: 'bg-warning text-warning-foreground',
      textColor: 'text-warning'
    },
    won: {
      icon: CheckCircle2,
      label: 'Ganhou',
      className: 'bg-success text-success-foreground',
      textColor: 'text-success'
    },
    lost: {
      icon: XCircle,
      label: 'Perdeu',
      className: 'bg-destructive text-destructive-foreground',
      textColor: 'text-destructive'
    },
    returned: {
      icon: RotateCcw,
      label: 'Devolvido',
      className: 'bg-muted text-muted-foreground',
      textColor: 'text-muted-foreground'
    }
  };

  const config = statusConfig[bet.status];
  const StatusIcon = config.icon;
  
  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Number(value));
  };

  const formatDate = (date: Date) => {
    return format(new Date(date), 'dd/MM/yyyy às HH:mm', { locale: ptBR });
  };

  const calculateProfit = () => {
    const stake = Number(bet.stake);
    const potential = Number(bet.potentialProfit);
    return potential - stake;
  };

  return (
    <Card className="hover-elevate transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-medium">
                {bet.bettingHouse}
              </Badge>
              <Badge className={config.className}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {config.label}
              </Badge>
            </div>
            <h3 className="font-semibold text-lg leading-tight" data-testid={`text-bet-type-${bet.id}`}>
              {bet.betType}
            </h3>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold" data-testid={`text-odds-${bet.id}`}>
              {Number(bet.odds).toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">odd</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Valor apostado</div>
            <div className="font-semibold text-lg" data-testid={`text-stake-${bet.id}`}>
              {formatCurrency(bet.stake)}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Lucro potencial</div>
            <div className="font-semibold text-lg flex items-center gap-1" data-testid={`text-potential-profit-${bet.id}`}>
              <TrendingUp className="w-4 h-4 text-success" />
              {formatCurrency(calculateProfit().toString())}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span data-testid={`text-game-date-${bet.id}`}>
            {formatDate(bet.gameDate)}
          </span>
        </div>

        {showResolveActions && bet.status === 'pending' && (
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant="default"
              onClick={() => onResolve(bet.id, 'won')}
              className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
              data-testid={`button-resolve-won-${bet.id}`}
            >
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Ganhou
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onResolve(bet.id, 'lost')}
              className="flex-1"
              data-testid={`button-resolve-lost-${bet.id}`}
            >
              <XCircle className="w-4 h-4 mr-1" />
              Perdeu
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onResolve(bet.id, 'returned')}
              data-testid={`button-resolve-returned-${bet.id}`}
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Devolvido
            </Button>
          </div>
        )}

        {bet.status !== 'pending' && (
          <div className={`p-3 rounded-lg border text-center ${config.textColor}`}>
            <StatusIcon className="w-5 h-5 mx-auto mb-1" />
            <div className="font-medium">
              {bet.status === 'won' && `Lucro: ${formatCurrency(calculateProfit().toString())}`}
              {bet.status === 'lost' && `Perda: ${formatCurrency(bet.stake)}`}
              {bet.status === 'returned' && `Valor devolvido: ${formatCurrency(bet.stake)}`}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}