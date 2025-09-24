import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Check, X, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { OCRData } from '@shared/schema';

interface OCRVerificationProps {
  imageUrl: string;
  ocrData: OCRData;
  onConfirm: (data: OCRData & { gameDate: Date; gameTime: string }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function OCRVerification({ 
  imageUrl, 
  ocrData, 
  onConfirm, 
  onCancel, 
  isLoading 
}: OCRVerificationProps) {
  const [formData, setFormData] = useState(ocrData);
  const [gameDate, setGameDate] = useState<Date | undefined>(new Date());
  const [gameTime, setGameTime] = useState('20:00');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.bettingHouse.trim()) newErrors.bettingHouse = 'Casa de aposta é obrigatória';
    if (!formData.betType.trim()) newErrors.betType = 'Tipo de aposta é obrigatório';
    if (!formData.odds || isNaN(Number(formData.odds)) || Number(formData.odds) <= 0) {
      newErrors.odds = 'Odd deve ser um número válido maior que 0';
    }
    if (!formData.stake || isNaN(Number(formData.stake)) || Number(formData.stake) <= 0) {
      newErrors.stake = 'Valor da aposta deve ser um número válido maior que 0';
    }
    if (!formData.potentialProfit || isNaN(Number(formData.potentialProfit)) || Number(formData.potentialProfit) <= 0) {
      newErrors.potentialProfit = 'Lucro potencial deve ser um número válido maior que 0';
    }
    if (!gameDate) newErrors.gameDate = 'Data do jogo é obrigatória';
    if (!gameTime.trim()) newErrors.gameTime = 'Horário do jogo é obrigatório';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm() && gameDate) {
      onConfirm({ ...formData, gameDate, gameTime });
    }
  };

  const updateField = (field: keyof OCRData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Image Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Imagem do Comprovante
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative rounded-lg overflow-hidden border">
            <img 
              src={imageUrl} 
              alt="Comprovante de aposta" 
              className="w-full h-auto max-h-96 object-contain"
              data-testid="img-betting-receipt"
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Verification Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Check className="h-5 w-5" />
            Verificar Dados Extraídos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="betting-house">Casa de Aposta</Label>
              <Input
                id="betting-house"
                value={formData.bettingHouse}
                onChange={(e) => updateField('bettingHouse', e.target.value)}
                placeholder="Ex: Bet365, Betano"
                data-testid="input-betting-house"
                className={errors.bettingHouse ? 'border-destructive' : ''}
              />
              {errors.bettingHouse && (
                <p className="text-sm text-destructive mt-1">{errors.bettingHouse}</p>
              )}
            </div>

            <div>
              <Label htmlFor="bet-type">Tipo de Aposta</Label>
              <Input
                id="bet-type"
                value={formData.betType}
                onChange={(e) => updateField('betType', e.target.value)}
                placeholder="Ex: 1x2, Ambas Marcam"
                data-testid="input-bet-type"
                className={errors.betType ? 'border-destructive' : ''}
              />
              {errors.betType && (
                <p className="text-sm text-destructive mt-1">{errors.betType}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="odds">Odd</Label>
                <Input
                  id="odds"
                  value={formData.odds}
                  onChange={(e) => updateField('odds', e.target.value)}
                  placeholder="Ex: 2.50"
                  data-testid="input-odds"
                  className={errors.odds ? 'border-destructive' : ''}
                />
                {errors.odds && (
                  <p className="text-sm text-destructive mt-1">{errors.odds}</p>
                )}
              </div>

              <div>
                <Label htmlFor="stake">Valor (R$)</Label>
                <Input
                  id="stake"
                  value={formData.stake}
                  onChange={(e) => updateField('stake', e.target.value)}
                  placeholder="Ex: 100.00"
                  data-testid="input-stake"
                  className={errors.stake ? 'border-destructive' : ''}
                />
                {errors.stake && (
                  <p className="text-sm text-destructive mt-1">{errors.stake}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="potential-profit">Lucro Potencial (R$)</Label>
              <Input
                id="potential-profit"
                value={formData.potentialProfit}
                onChange={(e) => updateField('potentialProfit', e.target.value)}
                placeholder="Ex: 250.00"
                data-testid="input-potential-profit"
                className={errors.potentialProfit ? 'border-destructive' : ''}
              />
              {errors.potentialProfit && (
                <p className="text-sm text-destructive mt-1">{errors.potentialProfit}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Data do Jogo</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${
                        !gameDate ? "text-muted-foreground" : ""
                      } ${errors.gameDate ? 'border-destructive' : ''}`}
                      data-testid="button-game-date"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {gameDate ? (
                        format(gameDate, "dd/MM/yyyy", { locale: ptBR })
                      ) : (
                        <span>Selecione a data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={gameDate}
                      onSelect={setGameDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.gameDate && (
                  <p className="text-sm text-destructive mt-1">{errors.gameDate}</p>
                )}
              </div>

              <div>
                <Label htmlFor="game-time">Horário do Jogo</Label>
                <Input
                  id="game-time"
                  type="time"
                  value={gameTime}
                  onChange={(e) => setGameTime(e.target.value)}
                  data-testid="input-game-time"
                  className={errors.gameTime ? 'border-destructive' : ''}
                />
                {errors.gameTime && (
                  <p className="text-sm text-destructive mt-1">{errors.gameTime}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              data-testid="button-cancel"
              className="flex-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              data-testid="button-confirm"
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Salvando...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Confirmar e Salvar
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}