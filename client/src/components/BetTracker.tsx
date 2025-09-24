import { useState, useEffect } from 'react';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Home, Upload, BarChart3, Settings, Target } from 'lucide-react';
import { OCRData, Bet } from '@shared/schema';
import ImageUpload from './ImageUpload';
import OCRVerification from './OCRVerification';
import Dashboard from './Dashboard';
import { ThemeToggle } from './ThemeToggle';

type AppState = 'upload' | 'verification' | 'dashboard';

// Real OCR processing using the API
const processOCR = async (file: File): Promise<OCRData> => {
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await fetch('/api/ocr/process', {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    throw new Error('Failed to process OCR');
  }
  
  return response.json();
};

// API functions
const fetchBets = async (): Promise<Bet[]> => {
  const response = await fetch('/api/bets');
  if (!response.ok) {
    throw new Error('Failed to fetch bets');
  }
  return response.json();
};

const saveBets = async (ocrData: OCRData): Promise<{ success: boolean; bets: Bet[]; pairId: string }> => {
  const response = await fetch('/api/bets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(ocrData)
  });
  
  if (!response.ok) {
    throw new Error('Failed to save bets');
  }
  
  return response.json();
};

const updateBetStatus = async (betId: string, status: 'pending' | 'won' | 'lost' | 'returned'): Promise<Bet> => {
  const response = await fetch(`/api/bets/${betId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status })
  });
  
  if (!response.ok) {
    throw new Error('Failed to update bet status');
  }
  
  return response.json();
};

export default function BetTracker() {
  const [currentState, setCurrentState] = useState<AppState>('dashboard');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');
  const [currentOCRData, setCurrentOCRData] = useState<OCRData | null>(null);
  const [bets, setBets] = useState<Bet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load bets on component mount
  useEffect(() => {
    const loadBets = async () => {
      try {
        setIsLoading(true);
        const fetchedBets = await fetchBets();
        setBets(fetchedBets);
      } catch (error) {
        console.error('Failed to load bets:', error);
        setError('Falha ao carregar apostas');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadBets();
  }, []);

  // Sidebar navigation items
  const sidebarItems = [
    {
      title: 'Dashboard',
      icon: Home,
      id: 'dashboard' as AppState,
      active: currentState === 'dashboard'
    },
    {
      title: 'Nova Aposta',
      icon: Upload,
      id: 'upload' as AppState,
      active: currentState === 'upload'
    },
    {
      title: 'Relatórios',
      icon: BarChart3,
      id: 'dashboard' as AppState, // For now, redirect to dashboard
      active: false
    }
  ];

  const handleImageUpload = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    
    // Create image URL for preview
    const imageUrl = URL.createObjectURL(file);
    setCurrentImageUrl(imageUrl);
    
    try {
      // Real OCR processing using the API
      const ocrData = await processOCR(file);
      setCurrentOCRData(ocrData);
      setCurrentState('verification');
    } catch (error) {
      console.error('OCR processing failed:', error);
      setError('Falha ao processar a imagem. Tente novamente.');
      setCurrentState('upload');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOCRConfirm = async (data: OCRData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Save bets using the API
      const result = await saveBets(data);
      
      if (result.success) {
        // Update local state with the new bets
        setBets(prev => [...result.bets, ...prev]);
        
        // Clean up and navigate to dashboard
        setCurrentImageUrl('');
        setCurrentOCRData(null);
        setCurrentState('dashboard');
        
        console.log('Bet pair saved successfully:', result);
      } else {
        throw new Error('Failed to save bets');
      }
    } catch (error) {
      console.error('Failed to save bets:', error);
      setError('Falha ao salvar as apostas. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOCRCancel = () => {
    setCurrentImageUrl('');
    setCurrentOCRData(null);
    setCurrentState('upload');
  };

  const handleResolveBet = async (betId: string, status: 'won' | 'lost' | 'returned') => {
    try {
      // Update bet status using the API
      const updatedBet = await updateBetStatus(betId, status);
      
      // Update local state
      setBets(prev => {
        const updatedBets = prev.map(bet => {
          if (bet.id === betId) {
            return updatedBet;
          }
          return bet;
        });
        
        // If this bet won, automatically set its pair to lost (for opposing bets)
        if (status === 'won') {
          const resolvedBet = prev.find(bet => bet.id === betId);
          if (resolvedBet?.pairId) {
            return updatedBets.map(bet => {
              if (bet.pairId === resolvedBet.pairId && bet.id !== betId && bet.status === 'pending') {
                // Also update the paired bet status in the backend
                updateBetStatus(bet.id, 'lost').catch(console.error);
                return { ...bet, status: 'lost' };
              }
              return bet;
            });
          }
        }
        
        return updatedBets;
      });
      
      console.log(`Bet ${betId} resolved as: ${status}`);
    } catch (error) {
      console.error('Failed to update bet status:', error);
      setError('Falha ao atualizar status da aposta');
    }
  };

  const handleAddBet = () => {
    setCurrentState('upload');
  };

  const renderMainContent = () => {
    switch (currentState) {
      case 'upload':
        return (
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Adicionar Nova Aposta</h1>
              <p className="text-muted-foreground">
                Faça upload de um comprovante de aposta para extrair os dados automaticamente
              </p>
            </div>
            <ImageUpload 
              onImageUpload={handleImageUpload} 
              isProcessing={isProcessing}
            />
          </div>
        );
      
      case 'verification':
        return currentOCRData && currentImageUrl ? (
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Verificar Dados Extraídos</h1>
              <p className="text-muted-foreground">
                Revise e corrija os dados antes de salvar no sistema
              </p>
            </div>
            <OCRVerification
              imageUrl={currentImageUrl}
              ocrData={currentOCRData}
              onConfirm={handleOCRConfirm}
              onCancel={handleOCRCancel}
            />
          </div>
        ) : null;
      
      case 'dashboard':
      default:
        return (
          <Dashboard
            bets={bets}
            onResolveBet={handleResolveBet}
            onAddBet={handleAddBet}
          />
        );
    }
  };

  return (
    <div className="flex h-screen w-full">
      {/* Sidebar */}
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center gap-2 px-2 py-2">
              <Target className="h-5 w-5" />
              <span className="font-semibold">BetTracker</span>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {sidebarItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild
                      className={item.active ? 'bg-sidebar-accent' : ''}
                    >
                      <button
                        onClick={() => setCurrentState(item.id)}
                        className="w-full"
                        data-testid={`nav-${item.title.toLowerCase().replace(' ', '-')}`}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-2">
            {currentState !== 'dashboard' && (
              <button 
                onClick={() => setCurrentState('dashboard')}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                data-testid="link-back-dashboard"
              >
                ← Voltar ao Dashboard
              </button>
            )}
          </div>
          <ThemeToggle />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6 bg-background">
          {renderMainContent()}
        </main>
      </div>
    </div>
  );
}