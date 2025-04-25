import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Deal } from '../../types';
import { Building, DollarSign, Calendar, User } from 'lucide-react';
import Avatar from '../ui/Avatar';

interface PipelineProps {
  stages: {
    id: string;
    name: string;
    deals: Deal[];
    totalValue: number;
  }[];
  onDragEnd: (result: any) => void;
  onDealClick: (deal: Deal) => void;
}

const Pipeline: React.FC<PipelineProps> = ({
  stages,
  onDragEnd,
  onDealClick
}) => {
  const getStageColor = (stageName: string) => {
    switch (stageName.toLowerCase()) {
      case 'prospecting':
        return 'bg-blue-50 border-blue-200';
      case 'qualification':
        return 'bg-purple-50 border-purple-200';
      case 'proposal':
        return 'bg-yellow-50 border-yellow-200';
      case 'negotiation':
        return 'bg-orange-50 border-orange-200';
      case 'closed-won':
        return 'bg-green-50 border-green-200';
      case 'closed-lost':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStageHeaderColor = (stageName: string) => {
    switch (stageName.toLowerCase()) {
      case 'prospecting':
        return 'bg-blue-100 text-blue-800';
      case 'qualification':
        return 'bg-purple-100 text-purple-800';
      case 'proposal':
        return 'bg-yellow-100 text-yellow-800';
      case 'negotiation':
        return 'bg-orange-100 text-orange-800';
      case 'closed-won':
        return 'bg-green-100 text-green-800';
      case 'closed-lost':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex overflow-x-auto pb-4 space-x-4">
        {stages.map((stage) => (
          <div
            key={stage.id}
            className="flex-shrink-0 w-80"
          >
            <div className={`rounded-lg border ${getStageColor(stage.name)} h-full`}>
              <div className={`p-4 ${getStageHeaderColor(stage.name)} rounded-t-lg`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{stage.name}</h3>
                  <span className="text-sm">
                    {stage.deals.length} {stage.deals.length === 1 ? 'deal' : 'deals'}
                  </span>
                </div>
                <div className="text-sm">
                  Total: ${stage.totalValue.toLocaleString()}
                </div>
              </div>

              <Droppable droppableId={stage.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="p-2 min-h-[200px]"
                  >
                    {stage.deals.map((deal, index) => (
                      <Draggable
                        key={deal.id}
                        draggableId={deal.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`
                              bg-white rounded-lg shadow-sm p-4 mb-2 cursor-pointer
                              ${snapshot.isDragging ? 'shadow-lg' : ''}
                              hover:shadow-md transition-shadow duration-200
                            `}
                            onClick={() => onDealClick(deal)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-900 truncate">
                                {deal.name}
                              </h4>
                              <span className={`
                                px-2 py-1 text-xs rounded-full
                                ${deal.probability >= 70 ? 'bg-green-100 text-green-800' :
                                  deal.probability >= 40 ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'}
                              `}>
                                {deal.probability}%
                              </span>
                            </div>

                            <div className="space-y-2 text-sm text-gray-500">
                              <div className="flex items-center">
                                <Building size={14} className="mr-2" />
                                <span className="truncate">{deal.company?.name}</span>
                              </div>

                              <div className="flex items-center">
                                <DollarSign size={14} className="mr-2" />
                                <span>{deal.currency} {deal.value?.toLocaleString()}</span>
                              </div>

                              <div className="flex items-center">
                                <Calendar size={14} className="mr-2" />
                                <span>
                                  {new Date(deal.expectedCloseDate).toLocaleDateString()}
                                </span>
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <User size={14} className="mr-2" />
                                  <Avatar
                                    src={deal.assignedTo?.avatar}
                                    alt={deal.assignedTo?.name}
                                    size="sm"
                                  />
                                </div>

                                {deal.tags && deal.tags.length > 0 && (
                                  <div className="flex space-x-1">
                                    {deal.tags.slice(0, 2).map(tag => (
                                      <span
                                        key={tag}
                                        className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                    {deal.tags.length > 2 && (
                                      <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                                        +{deal.tags.length - 2}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};

export default Pipeline;