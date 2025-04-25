import React, { useState } from 'react';
import { Plus, Filter, Search, RefreshCw } from 'lucide-react';
import { useCRM } from '../../contexts/CRMContext';
import { useCRMActions } from '../../hooks/useCRMActions';
import Button from '../../components/ui/Button';
import Pipeline from '../../components/crm/Pipeline';
import DealAnalytics from '../../components/crm/DealAnalytics';
import DealForm from '../../components/crm/DealForm';

const DealsPage: React.FC = () => {
  const { state } = useCRM();
  const { refreshData } = useCRMActions();
  const [showForm, setShowForm] = useState(false);

  const dealsByStage = state.deals.reduce((acc: any, deal) => {
    if (!acc[deal.stage]) {
      acc[deal.stage] = {
        id: deal.stage,
        name: deal.stage.charAt(0).toUpperCase() + deal.stage.slice(1),
        deals: [],
        totalValue: 0
      };
    }
    acc[deal.stage].deals.push(deal);
    acc[deal.stage].totalValue += deal.value;
    return acc;
  }, {});

  const stages = Object.values(dealsByStage);

  const analytics = {
    pipeline: stages.map((stage: any) => ({
      stage: stage.name,
      count: stage.deals.length,
      value: stage.totalValue,
      weightedValue: stage.deals.reduce((sum: number, deal: any) => 
        sum + (deal.value * (deal.probability / 100)), 0)
    })),
    performance: [
      { period: 'This Month', won: 12, lost: 3, total: 15 },
      { period: 'Last Month', won: 10, lost: 5, total: 15 },
      { period: 'Two Months Ago', won: 8, lost: 4, total: 12 }
    ],
    conversion: stages.map((stage: any) => ({
      stage: stage.name,
      rate: stage.deals.length > 0 ? 
        (stage.deals.filter((d: any) => d.status === 'won').length / stage.deals.length) * 100 : 0
    })),
    sources: [
      { name: 'Website', value: 35 },
      { name: 'Referral', value: 25 },
      { name: 'Direct', value: 20 },
      { name: 'Other', value: 20 }
    ]
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Deals Pipeline</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and track your sales pipeline
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={refreshData}>
            <RefreshCw size={20} className="mr-2" />
            Refresh
          </Button>

          <Button variant="outline">
            <Filter size={20} className="mr-2" />
            Filter
          </Button>

          <Button onClick={() => setShowForm(true)}>
            <Plus size={20} className="mr-2" />
            New Deal
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Pipeline
            stages={stages}
            onDragEnd={() => {}}
            onDealClick={() => {}}
          />
        </div>

        <div className="space-y-6">
          <DealAnalytics
            data={analytics}
            timeframe="month"
          />
        </div>
      </div>

      {showForm && (
        <DealForm
          onSubmit={() => {}}
          onClose={() => setShowForm(false)}
          companies={state.companies}
          products={[]}
        />
      )}
    </div>
  );
};

export default DealsPage;