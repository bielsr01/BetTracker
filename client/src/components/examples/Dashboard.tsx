import Dashboard from '../Dashboard';
import { Bet } from '@shared/schema';

export default function DashboardExample() {
  // Mock bet data //todo: remove mock functionality
  const mockBets: Bet[] = [
    {
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
    },
    {
      id: '2',
      bettingHouse: 'Betano',
      betType: 'Over 2.5 Gols (Manchester City vs Arsenal)',
      odds: '1.85',
      stake: '200.00',
      potentialProfit: '370.00',
      gameDate: new Date('2024-12-14T16:30:00'),
      status: 'won',
      isVerified: true,
      pairId: null,
      createdAt: new Date()
    },
    {
      id: '3',
      bettingHouse: 'Rivalo',
      betType: 'Ambas Marcam - Sim (PSG vs Lyon)',
      odds: '1.65',
      stake: '100.00',
      potentialProfit: '165.00',
      gameDate: new Date('2024-12-13T21:00:00'),
      status: 'lost',
      isVerified: true,
      pairId: null,
      createdAt: new Date()
    },
    {
      id: '4',
      bettingHouse: 'Stake',
      betType: 'Handicap Asiático +1.5 (Juventus vs Napoli)',
      odds: '2.10',
      stake: '175.00',
      potentialProfit: '367.50',
      gameDate: new Date('2024-12-16T19:45:00'),
      status: 'pending',
      isVerified: true,
      pairId: null,
      createdAt: new Date()
    }
  ];

  const handleResolveBet = (betId: string, status: 'won' | 'lost' | 'returned') => {
    console.log(`Resolving bet ${betId} as: ${status}`);
  };

  const handleAddBet = () => {
    console.log('Adding new bet');
  };

  return (
    <div className="p-6">
      <Dashboard
        bets={mockBets}
        onResolveBet={handleResolveBet}
        onAddBet={handleAddBet}
      />
    </div>
  );
}