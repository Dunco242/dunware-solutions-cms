import React from 'react';
import { useParams } from 'react-router-dom';

const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Project Details</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-medium mb-4">Project Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Project ID</label>
                <p className="mt-1">{id}</p>
              </div>
              {/* Additional project details will be populated from the database */}
            </div>
          </div>
          <div>
            <h2 className="text-lg font-medium mb-4">Project Status</h2>
            <div className="space-y-4">
              {/* Project status information will be populated from the database */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsPage;