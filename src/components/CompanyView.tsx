import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, MapPin, Clock, DollarSign, Calendar, Users, UserPlus, TrendingUp, Briefcase, Eye } from 'lucide-react';
import { Job } from '../pages/JobPortal';
import { useToast } from '@/hooks/use-toast';

interface CompanyViewProps {
  jobs: Job[];
  onAddJob: (job: Omit<Job, 'id' | 'postedDate'>) => void;
}

const CompanyView: React.FC<CompanyViewProps> = ({ jobs, onAddJob }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    type: '',
    salary: '',
    description: '',
    requirements: '',
    benefits: ''
  });
  const { toast } = useToast();

  // Mock data for dashboard metrics
  const totalApplications = 12;
  const shortlistedCandidates = 3;
  const hireRate = 24;
  const applicationsByJob = {
    '1': { total: 8, pending: 3, shortlisted: 2, hired: 1 }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.company || !formData.location || !formData.type || !formData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    onAddJob(formData);
    setFormData({
      title: '',
      company: '',
      location: '',
      type: '',
      salary: '',
      description: '',
      requirements: '',
      benefits: ''
    });
    setShowAddForm(false);
    
    toast({
      title: "Job Posted Successfully!",
      description: "Your job listing has been added to the portal.",
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Job Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Company Dashboard</h2>
          <p className="text-gray-600 mt-1">Manage your job postings and track hiring metrics</p>
        </div>
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          Post New Job
        </Button>
      </div>

      {/* Dashboard Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{jobs.length}</div>
            <p className="text-xs text-green-600 mt-1">+2 from last month</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Applications</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{totalApplications}</div>
            <p className="text-xs text-green-600 mt-1">+12% from last week</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Shortlisted</CardTitle>
            <UserPlus className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{shortlistedCandidates}</div>
            <p className="text-xs text-gray-500 mt-1">3 pending review</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Hire Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{hireRate}%</div>
            <p className="text-xs text-green-600 mt-1">+5% from last quarter</p>
          </CardContent>
        </Card>
      </div>

      {/* Add Job Form */}
      {showAddForm && (
        <Card className="border-l-4 border-l-blue-600 shadow-lg">
          <CardHeader>
            <CardTitle className="text-blue-900">Post New Job</CardTitle>
            <CardDescription>Fill in the details to create a new job listing</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium text-gray-700">Job Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g. Senior Frontend Developer"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-sm font-medium text-gray-700">Company Name *</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder="e.g. TechCorp Inc."
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm font-medium text-gray-700">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="e.g. San Francisco, CA"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-sm font-medium text-gray-700">Job Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                    <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                      <SelectItem value="Internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="salary" className="text-sm font-medium text-gray-700">Salary Range</Label>
                  <Input
                    id="salary"
                    value={formData.salary}
                    onChange={(e) => handleInputChange('salary', e.target.value)}
                    placeholder="e.g. $80,000 - $120,000"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">Job Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the role, responsibilities, and what you're looking for..."
                  rows={4}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="requirements" className="text-sm font-medium text-gray-700">Requirements</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => handleInputChange('requirements', e.target.value)}
                  placeholder="List the required skills, experience, and qualifications..."
                  rows={3}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="benefits" className="text-sm font-medium text-gray-700">Benefits</Label>
                <Textarea
                  id="benefits"
                  value={formData.benefits}
                  onChange={(e) => handleInputChange('benefits', e.target.value)}
                  placeholder="Describe the benefits and perks offered..."
                  rows={3}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-2"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                >
                  Post Job
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Job Listings & Applications Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Listings & Applications</h3>
        <div className="grid gap-6">
          {jobs.map((job) => {
            const jobApplications = applicationsByJob[job.id] || { total: 0, pending: 0, shortlisted: 0, hired: 0 };
            
            return (
              <Card key={job.id} className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-blue-500">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <CardTitle className="text-xl text-blue-900">{job.title}</CardTitle>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-blue-600 border-blue-600">
                            {jobApplications.total} Applications
                          </Badge>
                          <Button variant="outline" size="sm" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                      <CardDescription className="text-lg font-medium text-gray-700">{job.company}</CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 mt-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      {job.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-1" />
                      {job.type}
                    </div>
                    {job.salary && (
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="h-4 w-4 mr-1" />
                        {job.salary}
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(job.postedDate).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Application Stats */}
                  {jobApplications.total > 0 && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Applications</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-blue-600">{jobApplications.total}</div>
                          <div className="text-gray-600">Total</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-orange-600">{jobApplications.pending}</div>
                          <div className="text-gray-600">Pending</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-purple-600">{jobApplications.shortlisted}</div>
                          <div className="text-gray-600">Shortlisted</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-green-600">{jobApplications.hired}</div>
                          <div className="text-gray-600">Hired</div>
                        </div>
                      </div>
                      
                      {job.id === '1' && (
                        <div className="mt-4 border-t pt-4">
                          <div className="flex items-center justify-between bg-white p-3 rounded border">
                            <div>
                              <div className="font-medium text-gray-900">John Doe</div>
                              <div className="text-sm text-gray-600">john.doe@example.com</div>
                            </div>
                            <Badge className="bg-orange-100 text-orange-800">pending</Badge>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardHeader>
                
                <CardContent>
                  <p className="text-gray-700 mb-4">{job.description}</p>
                  {job.requirements && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Requirements:</h4>
                      <p className="text-gray-700 text-sm">{job.requirements}</p>
                    </div>
                  )}
                  {job.benefits && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Benefits:</h4>
                      <p className="text-gray-700 text-sm">{job.benefits}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CompanyView;
