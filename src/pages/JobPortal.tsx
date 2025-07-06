
import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Building2, Users } from 'lucide-react';
import CompanyView from '../components/CompanyView';
import UserView from '../components/UserView';
import { useJobs } from '../hooks/useJobs';

const JobPortal = () => {
  const [isCompanyView, setIsCompanyView] = useState(true);
  const { data: jobs = [], isLoading } = useJobs();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading jobs...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Job Portal</h1>
            </div>
            
            {/* View Toggle */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 bg-gray-100 p-2 rounded-lg">
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-md transition-colors ${!isCompanyView ? 'bg-blue-600 text-white' : 'text-gray-600'}`}>
                  <Users className="h-4 w-4" />
                  <Label htmlFor="view-toggle" className="text-sm font-medium cursor-pointer">
                    Job Seeker
                  </Label>
                </div>
                <Switch
                  id="view-toggle"
                  checked={isCompanyView}
                  onCheckedChange={setIsCompanyView}
                  className="data-[state=checked]:bg-blue-600"
                />
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-md transition-colors ${isCompanyView ? 'bg-blue-600 text-white' : 'text-gray-600'}`}>
                  <Building2 className="h-4 w-4" />
                  <Label htmlFor="view-toggle" className="text-sm font-medium cursor-pointer">
                    Company
                  </Label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isCompanyView ? (
          <CompanyView jobs={jobs} />
        ) : (
          <UserView jobs={jobs} />
        )}
      </div>
    </div>
  );
};

export default JobPortal;
