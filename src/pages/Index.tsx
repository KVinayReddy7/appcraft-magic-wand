import { useState } from 'react';
import { ChitFundCard } from '@/components/ChitFundCard';
import { CreateChitFundDialog } from '@/components/CreateChitFundDialog';
import { ChitFundManagement } from '@/components/ChitFundManagement';
import { useChitFundStorage } from '@/hooks/useChitFundStorage';
import { ChitFund } from '@/types/chitfund';

const Index = () => {
  const { chitFunds, addChitFund, updateChitFund } = useChitFundStorage();
  const [selectedChitFund, setSelectedChitFund] = useState<ChitFund | null>(null);

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
            <h1 className="text-3xl font-bold">Chit Fund Manager</h1>
            <p className="text-muted-foreground">Manage your family chit fund business</p>
          </div>
          <CreateChitFundDialog onCreateChitFund={addChitFund} />
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
