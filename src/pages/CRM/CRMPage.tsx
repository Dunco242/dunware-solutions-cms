import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Plus, Filter, Search, Download } from 'lucide-react';
import Button from '../../components/ui/Button';
import Pipeline from '../../components/crm/Pipeline';
import DealAnalytics from '../../components/crm/DealAnalytics';
import ActivityAnalytics from '../../components/crm/ActivityAnalytics';
import ActivityTimeline from '../../components/crm/ActivityTimeline';
import { crmService } from '../../services/crm';
import { Deal, Activity } from '../../types';

const CRMPage: React.FC = () => {
  const [view, setView] = useState<'pipeline' | 'analytics'>('pipeline');
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [isLoading, setIsLoading] = useState(false);
  const [dealStages, setDealStages] = useState<{
    id: string;
    name: string;
    deals: Deal[];
    totalValue: number;
  }[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [analytics, setAnalytics] = useState({
    deals: {
      pipeline: [],
      performance: [],
      conversion: [],
      sources: []
    },
    activities: {
      timeline: [],
      byType: [],
      byUser: [],
      completion: []
    }
  });

  useEffect(() => {
    loadData();
  }, [timeframe]);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Load pipeline data
      const pipeline = await crmService.getDealsPipeline();
      const stages = Object.entries(pipeline).map(([name, data]) => ({
        id: name.toLowerCase(),
        name,
        deals: data.deals,
        totalValue: data.value
      }));
      setDealStages(stages);

      // Load activities
      const activityMetrics = await crmService.getActivityMetrics(timeframe);
      setActivities(activityMetrics.activities || []);

      // Load analytics data
      // In a real application, you would fetch this data from your backend
      setAnalytics({
        deals: {
          pipeline: stages.map(stage => ({
            stage: stage.name,
            count: stage.deals.length,
            value: stage.totalValue,
            weightedValue: stage.deals.reduce((sum, deal) => 
              sum + (deal.value * (deal.probability / 100)), 0)
          })),
          performance: [
            { period: 'Jan', won: 12, lost: 5, total: 17 },
            { period: 'Feb', won: 15, lost: 3, total: 18 },
            { period: 'Mar', won: 10, lost: 7, total: 17 },
            { period: 'Apr', won: 18, lost: 4, total: 22 }
          ],
          conversion: stages.map(stage => ({
            stage: stage.name,
            rate: stage.deals.length > 0 ? 
              (stage.deals.filter(d => d.status === 'won').length / stage.deals.length) * 100 : 0
          })),
          sources: [
            { name: 'Website', value: 35 },
            { name: 'Referral', value: 25 },
            { name: 'Social', value: 20 },
            { name: 'Direct', value: 15 },
            { name: 'Other', value: 5 }
          ]
        },
        activities: {
          timeline: activityMetrics.timeline || [],
          byType: activityMetrics.byType || [],
          byUser: activityMetrics.byUser || [],
          completion: activityMetrics.completion || []
        }
      });
    } catch (error) {
      console.error('Error loading CRM data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { draggableId, source, destination } = result;
    const deal = dealStages
      .find(s => s.id === source.droppableId)
      ?.deals
      .find(d => d.id === draggableId);

    if (!deal) return;

    try {
      // Update deal stage
      await crmService.updateDeal(draggableId, {
        stage: destination.droppableId,
        updatedAt: new Date().toISOString()
      });

      // Optimistically update UI
      setDealStages(prev => {
        const newStages = [...prev];
        
        // Remove from source
        const sourceStage = newStages.find(s => s.id === source.droppableId);
        if (sourceStage) {
          sourceStage.deals = sourceStage.deals.filter(d => d.id !== draggableId);
          sourceStage.totalValue -= deal.value;
        }

        // Add to destination
        const destStage = newStages.find(s => s.id === destination.droppableId);
        if (destStage) {
          destStage.deals.push({ ...deal, stage: destination.droppableId });
          destStage.totalValue += deal.value;
        }

        return newStages;
      });
    } catch (error) {
      console.error('Error updating deal stage:', error);
      // Revert changes on error
      loadData();
    }
  };

  const handleDealClick = (deal: Deal) => {
    // Implement deal details view
    console.log('View deal:', deal);
  };

  return (
    <div className="py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">CRM Dashboard</h1>
          <p className="mt-1 text-gray-600">Manage your sales pipeline and customer relationships</p>
        </div>
        <div className="mt-4 md:mt-0 space-x-2">
          <Button variant="outline">
            <Filter size={16} className="mr-2" />
            Filter
          </Button>
          <Button variant="outline">
            <Download size={16} className="mr-2" />
            Export
          </Button>
          <Button>
            <Plus size={16} className="mr-2" />
            New Deal
          </Button>
        </div>
      </div>

      {/* View Toggle */}
      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant={view === 'pipeline' ? 'primary' : 'outline'}
            onClick={() => setView('pipeline')}
          >
            Pipeline View
          </Button>
          <Button
            variant={view === 'analytics' ? 'primary' : 'outline'}
            onClick={() => setView('analytics')}
          >
            Analytics View
          </Button>

          <div className="ml-auto">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as typeof timeframe)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {view === 'pipeline' ? (
        <div className="space-y-6">
          <Pipeline
            stages={dealStages}
            onDragEnd={handleDragEnd}
            onDealClick={handleDealClick}
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900">Recent Activities</h2>
              </CardHeader>
              <CardBody>
                <ActivityTimeline
                  activities={activities}
                  onAddActivity={() => {}}
                  onViewActivity={() => {}}
                />
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900">Deal Analytics</h2>
              </CardHeader>
              <CardBody>
                <DealAnalytics
                  data={analytics.deals}
                  timeframe={timeframe}
                />
              </CardBody>
            </Card>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <DealAnalytics
            data={analytics.deals}
            timeframe={timeframe}
          />
          
          <ActivityAnalytics
            data={analytics.activities}
            timeframe={timeframe}
          />
        </div>
      )}
    </div>
  );
};

export default CRMPage;