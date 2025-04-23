import React from 'react';
import { UserCheck, Clock, Check, X } from 'lucide-react';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';

interface Approver {
  id: string;
  name: string;
  avatar: string;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  timestamp?: string;
}

interface ApprovalFlowProps {
  approvers: Approver[];
  onApprove?: (comments?: string) => void;
  onReject?: (comments: string) => void;
  currentUserId?: string;
}

const ApprovalFlow: React.FC<ApprovalFlowProps> = ({
  approvers,
  onApprove,
  onReject,
  currentUserId
}) => {
  const [rejectComments, setRejectComments] = React.useState('');
  const [approveComments, setApproveComments] = React.useState('');
  const [showComments, setShowComments] = React.useState(false);

  const currentUserApproval = approvers.find(a => a.id === currentUserId);
  const canAct = currentUserApproval?.status === 'pending';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Approval Flow</h3>
        <div className="flex items-center space-x-2">
          {canAct && (
            <>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowComments(true)}
              >
                <X size={16} className="mr-2" />
                Reject
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onApprove?.(approveComments)}
              >
                <Check size={16} className="mr-2" />
                Approve
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {approvers.map((approver, index) => (
          <div
            key={approver.id}
            className={`p-4 border rounded-lg ${
              approver.status === 'approved' ? 'bg-green-50 border-green-200' :
              approver.status === 'rejected' ? 'bg-red-50 border-red-200' :
              'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Avatar
                  src={approver.avatar}
                  alt={approver.name}
                  size="sm"
                />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {approver.name}
                  </p>
                  <div className="flex items-center mt-1">
                    {approver.status === 'pending' ? (
                      <>
                        <Clock size={14} className="text-gray-400" />
                        <span className="ml-1 text-xs text-gray-500">Pending</span>
                      </>
                    ) : approver.status === 'approved' ? (
                      <>
                        <Check size={14} className="text-green-500" />
                        <span className="ml-1 text-xs text-green-600">Approved</span>
                      </>
                    ) : (
                      <>
                        <X size={14} className="text-red-500" />
                        <span className="ml-1 text-xs text-red-600">Rejected</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {approver.timestamp && (
                <span className="text-xs text-gray-500">
                  {new Date(approver.timestamp).toLocaleDateString()}
                </span>
              )}
            </div>

            {approver.comments && (
              <div className="mt-2 text-sm text-gray-600">
                <p className="font-medium">Comments:</p>
                <p className="mt-1">{approver.comments}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Reject Dialog */}
      {showComments && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Rejection Comments
            </h3>
            <textarea
              value={rejectComments}
              onChange={(e) => setRejectComments(e.target.value)}
              className="w-full h-32 p-2 border border-gray-300 rounded-md"
              placeholder="Please provide a reason for rejection..."
            />
            <div className="mt-4 flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowComments(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  onReject?.(rejectComments);
                  setShowComments(false);
                }}
                disabled={!rejectComments.trim()}
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalFlow;