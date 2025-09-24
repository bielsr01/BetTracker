import Dashboard from '../Dashboard';
import { Bet } from '@shared/schema';

export default function DashboardExample() {
  // Mock bet data //todo: remove mock functionality
  const mockBets: Bet[] = [
    {
      id: '1',
      bettingHouse: 'Bet365',
      sport: 'Futebol',
      league: 'La Liga',
      teamA: 'Barcelona',
      teamB: 'Real Madrid',
      betType: '1x2 - Vitória do Mandante',
      selectedSide: 'A',
      odds: '2.75',
      stake: '150.00',
      payout: '412.50',
      profit: '262.50',
      gameDate: new Date('2024-12-15T20:00:00'),
      status: 'pending',
      isVerified: true,
      pairId: 'pair-1',
      betPosition: 'A',
      totalPairStake: '350.00',
      profitPercentage: '17.86',
      createdAt: new Date()
    },
    {
      id: '2',
      bettingHouse: 'Betano',
      sport: 'Futebol',
      league: 'Premier League',
      teamA: 'Manchester City',
      teamB: 'Arsenal',
      betType: 'Over 2.5 Gols',
      selectedSide: 'A',
      odds: '1.85',
      stake: '200.00',
      payout: '370.00',
      profit: '170.00',
      gameDate: new Date('2024-12-14T16:30:00'),
      status: 'won',
      isVerified: true,
      pairId: 'pair-2',
      betPosition: 'A',
      totalPairStake: '400.00',
      profitPercentage: '15.00',
      createdAt: new Date()
    },
    {
      id: '3',
      bettingHouse: 'Rivalo',
      sport: 'Futebol',
      league: 'Ligue 1',
      teamA: 'PSG',
      teamB: 'Lyon',
      betType: 'Ambas Marcam - Sim',
      selectedSide: 'A',
      odds: '1.65',
      stake: '100.00',
      payout: '165.00',
      profit: '65.00',
      gameDate: new Date('2024-12-13T21:00:00'),
      status: 'lost',
      isVerified: true,
      pairId: 'pair-3',
      betPosition: 'A',
      totalPairStake: '300.00',
      profitPercentage: '5.00',
      createdAt: new Date()
    },
    {
      id: '4',
      bettingHouse: 'Stake',
      sport: 'Futebol',
      league: 'Serie A',
      teamA: 'Juventus',
      teamB: 'Napoli',
      betType: 'Handicap Asiático +1.5',
      selectedSide: 'A',
      odds: '2.10',
      stake: '175.00',
      payout: '367.50',
      profit: '192.50',
      gameDate: new Date('2024-12-16T19:45:00'),
      status: 'pending',
      isVerified: true,
      pairId: 'pair-4',
      betPosition: 'A',
      totalPairStake: '500.00',
      profitPercentage: '12.75',
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