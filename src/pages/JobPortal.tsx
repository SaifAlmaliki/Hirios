
import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Building2, Users } from 'lucide-react';
import CompanyView from '../components/CompanyView';
import UserView from '../components/UserView';

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  requirements: string;
  benefits: string;
  postedDate: string;
}

const JobPortal = () => {
  const [isCompanyView, setIsCompanyView] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([
    {
      id: '1',
      title: 'Senior Frontend Developer',
      company: 'TechCorp Inc.',
      location: 'San Francisco, CA',
      type: 'Full-time',
      salary: '$120,000 - $150,000',
      description: 'We are looking for a skilled Frontend Developer to join our dynamic team. You will be responsible for building user-facing features and ensuring great user experience.',
      requirements: 'Bachelor\'s degree in Computer Science or related field. 5+ years of experience with React, TypeScript, and modern web technologies.',
      benefits: 'Health insurance, 401k matching, flexible work hours, remote work options, professional development budget.',
      postedDate: '2024-01-15'
    }
  ]);

  const addJob = (job: Omit<Job, 'id' | 'postedDate'>) => {
    const newJob: Job = {
      ...job,
      id: Date.now().toString(),
      postedDate: new Date().toISOString().split('T')[0]
    };
    setJobs(prev => [newJob, ...prev]);
  };

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
          <CompanyView jobs={jobs} onAddJob={addJob} />
        ) : (
          <UserView jobs={jobs} />
        )}
      </div>
    </div>
  );
};

export default JobPortal;
