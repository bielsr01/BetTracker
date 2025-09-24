import OCRVerification from '../OCRVerification';
import { OCRData } from '@shared/schema';

export default function OCRVerificationExample() {
  // Mock OCR extracted data
  const mockOCRData: OCRData = {
    betA: {
      bettingHouse: 'Betfast',
      sport: 'Tênis',
      league: 'ATP - Hangzhou, China',
      teamA: 'Giulio Zeppieri',
      teamB: 'Tien, Learner',
      betType: 'Acima 8.5 1º o set',
      selectedSide: 'A',
      odds: '1.270',
      stake: '979.47',
      payout: '1243.67',
      profit: '28.42'
    },
    betB: {
      bettingHouse: 'Pinnacle',
      sport: 'Tênis',
      league: 'ATP - Hangzhou, China',
      teamA: 'Giulio Zeppieri',
      teamB: 'Tien, Learner',
      betType: 'Abaixo 8.5 1º o set',
      selectedSide: 'B',
      odds: '5.270',
      stake: '236.04',
      payout: '1243.67',
      profit: '28.42'
    },
    gameDate: new Date('2024-12-15T20:00:00'),
    gameTime: '20:00'
  };

  // Mock image URL (placeholder)
  const mockImageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzM3NDE1MSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNvbXByb3ZhbnRlIGRlIEFwb3N0YTwvdGV4dD48L3N2Zz4=';

  const handleConfirm = (data: OCRData) => {
    console.log('OCR verification confirmed:', data);
  };

  const handleCancel = () => {
    console.log('OCR verification cancelled');
  };

  return (
    <div className="p-6">
      <OCRVerification
        imageUrl={mockImageUrl}
        ocrData={mockOCRData}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        isLoading={false}
      />
    </div>
  );
}