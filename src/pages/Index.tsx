import { useState } from 'react';
import { ChitFundCard } from '@/components/ChitFundCard';
import { CreateChitFundDialog } from '@/components/CreateChitFundDialog';
import { ChitFundManagement } from '@/components/ChitFundManagement';
import { SettingsPage } from '@/components/SettingsPage';
import { useChitFundStorage } from '@/hooks/useChitFundStorage';
import { ChitFund } from '@/types/chitfund';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

const Index = () => {
  const { chitFunds, addChitFund, updateChitFund, deleteChitFund } = useChitFundStorage();
  const [selectedChitFund, setSelectedChitFund] = useState<ChitFund | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const handleImportData = (importedChitFunds: ChitFund[]) => {
    // Clear existing and import new data
    localStorage.setItem('chitfunds', JSON.stringify(importedChitFunds));
    window.location.reload(); // Simple refresh to reload data
  };

  if (showSettings) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto">
          <SettingsPage
            chitFunds={chitFunds}
            onDeleteChitFund={deleteChitFund}
            onImportData={handleImportData}
            onBack={() => setShowSettings(false)}
          />
        </div>
      </div>
    );
  }

  if (selectedChitFund) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto">
          <ChitFundManagement
            chitFund={selectedChitFund}
            onUpdateChitFund={(updated) => {
              updateChitFund(updated);
              setSelectedChitFund(updated);
            }}
            onBack={() => setSelectedChitFund(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Family Chit Fund Manager</h1>
            <p className="text-muted-foreground">Offline Android App for Family Chit Fund Business</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowSettings(true)}
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>
            <CreateChitFundDialog onCreateChitFund={addChitFund} />
          </div>
        </div>

        {chitFunds.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">No Chit Funds Yet</h2>
            <p className="text-muted-foreground mb-6">
              Create your first chit fund to get started with managing your family business
            </p>
            <CreateChitFundDialog onCreateChitFund={addChitFund} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chitFunds.map((chitFund) => (
              <ChitFundCard
                key={chitFund.id}
                chitFund={chitFund}
                onSelect={setSelectedChitFund}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
