import React from 'react';
import { format } from 'date-fns';
import { History, Check, X, Eye } from 'lucide-react';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';

interface Version {
  id: string;
  createdAt: string;
  createdBy: {
    name: string;
    avatar: string;
  };
  changes?: string;
}

interface VersionHistoryProps {
  versions: Version[];
  currentVersion: string;
  onViewVersion: (versionId: string) => void;
  onCompareVersions: (version1: string, version2: string) => void;
}

const VersionHistory: React.FC<VersionHistoryProps> = ({
  versions,
  currentVersion,
  onViewVersion,
  onCompareVersions
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Version History</h3>
        <Button variant="outline" size="sm">
          <History size={16} className="mr-2" />
          Compare Versions
        </Button>
      </div>

      <div className="space-y-2">
        {versions.map((version, index) => (
          <div
            key={version.id}
            className={`p-4 border rounded-lg ${
              version.id === currentVersion ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Avatar
                  src={version.createdBy.avatar}
                  alt={version.createdBy.name}
                  size="sm"
                />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {version.createdBy.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(version.createdAt), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewVersion(version.id)}
                >
                  <Eye size={16} className="mr-2" />
                  View
                </Button>
                {index > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onCompareVersions(version.id, versions[index - 1].id)}
                  >
                    Compare
                  </Button>
                )}
              </div>
            </div>

            {version.changes && (
              <div className="mt-2 text-sm text-gray-600">
                <p>Changes:</p>
                <pre className="mt-1 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                  {version.changes}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VersionHistory;