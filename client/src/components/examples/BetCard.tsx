import BetCard from '../BetCard';
import { Bet } from '@shared/schema';

export default function BetCardExample() {
  // Mock bet data
  const mockBet: Bet = {
    id: '1',
    bettingHouse: 'Bet365',
    betType: '1x2 - Vitória do Mandante (Barcelona vs Real Madrid)',
    odds: '2.75',
    stake: '150.00',
    potentialProfit: '412.50',
    gameDate: new Date('2024-12-15T20:00:00'),
    status: 'pending',
    isVerified: true,
    pairId: null,
    createdAt: new Date()
  };

  const handleResolve = (betId: string, status: 'won' | 'lost' | 'returned') => {
    console.log(`Bet ${betId} resolved as: ${status}`);
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <BetCard 
        bet={mockBet} 
        onResolve={handleResolve}
        showResolveActions={true}
      />
    </div>
  );
}