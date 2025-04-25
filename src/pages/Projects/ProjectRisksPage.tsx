import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Plus, Filter, Search, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import Button from '../../components/ui/Button';
import { projectService } from '../../services/projects';
import { Risk } from '../../types';

const ProjectRisksPage: React.FC = () => {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRisks();
  }, [selectedProject]);

  const loadRisks = async () => {
    try {
      setIsLoading(true);
      const projectRisks = await projectService.getProjectRisks(selectedProject);
      setRisks(projectRisks);
    } catch (error) {
      console.error('Error loading risks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskSeverityColor = (impact: string, probability: string) => {
    if (impact === 'high' && probability === 'high') {
      return 'bg-red-100 text-red-800';
    } else if (impact === 'low' && probability === 'low') {
      return 'bg-green-100 text-green-800';
    }
    return 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Risk Management</h1>
          <p className="mt-1 text-gray-600">Monitor and manage project risks</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedProject || ''}
            onChange={(e) => setSelectedProject(e.target.value || null)}
            className="border border-gray-300 rounded-md shadow-sm px-4 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Projects</option>
            {/* Project options will be populated here */}
          </select>
          <Button>
            <Plus size={20} className="mr-2" />
            New Risk
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Matrix */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium">Risk Matrix</h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-3 gap-2 p-4">
              {['low', 'medium', 'high'].map((impact) => (
                ['low', 'medium', 'high'].map((probability) => (
                  <div
                    key={`${impact}-${probability}`}
                    className={`
                      p-2 text-center rounded border
                      ${impact === 'high' && probability === 'high' ? 'bg-red-100 border-red-200' :
                        impact === 'low' && probability === 'low' ? 'bg-green-100 border-green-200' :
                        'bg-yellow-100 border-yellow-200'}
                    `}
                  >
                    <span className="text-xs">
                      {risks.filter(r => r.impact === impact && r.probability === probability).length}
                    </span>
                  </div>
                ))
              ))}
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <div className="flex items-center mb-2">
                <div className="w-4 h-4 bg-red-100 border border-red-200 rounded mr-2"></div>
                <span>High Risk</span>
              </div>
              <div className="flex items-center mb-2">
                <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded mr-2"></div>
                <span>Medium Risk</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-100 border border-green-200 rounded mr-2"></div>
                <span>Low Risk</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Risk List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium">Risks</h2>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search risks..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <Button variant="outline">
                    <Filter size={20} className="mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {risks.map((risk) => (
                    <div
                      key={risk.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <AlertTriangle size={20} className="text-yellow-500 mr-2" />
                          <h3 className="text-lg font-medium">{risk.title}</h3>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm ${getRiskSeverityColor(risk.impact, risk.probability)}`}>
                          {risk.impact} Impact / {risk.probability} Probability
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4">{risk.description}</p>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">Mitigation Strategy</h4>
                          <p className="text-sm text-gray-600">{risk.mitigation_strategy}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">Contingency Plan</h4>
                          <p className="text-sm text-gray-600">{risk.contingency_plan}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center">
                          <span className="mr-4">Status: {risk.status}</span>
                          <span>Owner: {risk.mitigation_owner}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="mr-2">Trend:</span>
                          {Math.random() > 0.5 ? (
                            <TrendingUp size={16} className="text-green-500" />
                          ) : (
                            <TrendingDown size={16} className="text-red-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProjectRisksPage;