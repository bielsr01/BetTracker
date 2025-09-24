import OCRVerification from '../OCRVerification';
import { OCRData } from '@shared/schema';

export default function OCRVerificationExample() {
  // Mock OCR extracted data
  const mockOCRData: OCRData = {
    bettingHouse: 'Bet365',
    betType: '1x2 - Vitória do Mandante',
    odds: '2.75',
    stake: '150.00',
    potentialProfit: '412.50'
  };

  // Mock image URL (placeholder)
  const mockImageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzM3NDE1MSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNvbXByb3ZhbnRlIGRlIEFwb3N0YTwvdGV4dD48L3N2Zz4=';

  const handleConfirm = (data: OCRData & { gameDate: Date; gameTime: string }) => {
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