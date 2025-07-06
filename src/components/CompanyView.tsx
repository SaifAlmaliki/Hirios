
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Building, Users, UserCheck, TrendingUp, Eye, FileText, MapPin, Clock, DollarSign, Briefcase } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Job, useCreateJob } from '../hooks/useJobs';
import { useApplications } from '../hooks/useApplications';
import JobApplicationsView from './JobApplicationsView';

interface CompanyViewProps {
  jobs: Job[];
}

const CompanyView: React.FC<CompanyViewProps> = ({ jobs }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isApplicationsViewOpen, setIsApplicationsViewOpen] = useState(false);
  
  const [jobData, setJobData] = useState({
    title: '',
    company: '',
    department: '',
    location: '',
    employment_type: 'full-time',
    salary: '',
    description: '',
    requirements: '',
    benefits: '',
  });

  const { toast } = useToast();
  const createJobMutation = useCreateJob();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setJobData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setJobData(prev => ({ ...prev, employment_type: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!jobData.title || !jobData.company || !jobData.department || !jobData.location || !jobData.employment_type || !jobData.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createJobMutation.mutate(jobData, {
      onSuccess: () => {
        toast({
          title: "Job Posted!",
          description: "Your job has been posted successfully.",
        });
        setJobData({
          title: '',
          company: '',
          department: '',
          location: '',
          employment_type: 'full-time',
          salary: '',
          description: '',
          requirements: '',
          benefits: '',
        });
        setIsDialogOpen(false);
      },
      onError: (error) => {
        console.error('Failed to create job:', error);
        toast({
          title: "Error",
          description: "Failed to post job. Please try again.",
          variant: "destructive",
        });
      },
    });
  };

  const handleViewApplications = (job: Job) => {
    setSelectedJob(job);
    setIsApplicationsViewOpen(true);
  };

  // Dashboard metrics calculations
  const { data: allApplications = [] } = useApplications();
  const totalApplications = allApplications.length;
  const shortlistedCount = allApplications.filter(app => app.status === 'shortlisted').length;
  const hiredCount = allApplications.filter(app => app.status === 'hired').length;
  const hireRate = totalApplications > 0 ? Math.round((hiredCount / totalApplications) * 100) : 0;

  const formatEmploymentType = (type: string) => {
    return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-blue-900">Company Dashboard</h2>
          <p className="text-gray-600 mt-1">Manage your job postings and applications</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Post New Job
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl text-blue-900">Post a New Job</DialogTitle>
              <DialogDescription>
                Fill in the details below to post a new job opening.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium text-gray-700">Job Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={jobData.title}
                    onChange={handleInputChange}
                    placeholder="Enter job title"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-sm font-medium text-gray-700">Company Name *</Label>
                  <Input
                    id="company"
                    name="company"
                    value={jobData.company}
                    onChange={handleInputChange}
                    placeholder="Enter company name"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-sm font-medium text-gray-700">Department *</Label>
                  <Input
                    id="department"
                    name="department"
                    value={jobData.department}
                    onChange={handleInputChange}
                    placeholder="Enter department"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm font-medium text-gray-700">Location *</Label>
                  <Input
                    id="location"
                    name="location"
                    value={jobData.location}
                    onChange={handleInputChange}
                    placeholder="Enter location"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employment_type" className="text-sm font-medium text-gray-700">Employment Type *</Label>
                  <Select onValueChange={handleSelectChange}>
                    <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select employment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="temporary">Temporary</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="salary" className="text-sm font-medium text-gray-700">Salary (Optional)</Label>
                  <Input
                    id="salary"
                    name="salary"
                    value={jobData.salary}
                    onChange={handleInputChange}
                    placeholder="Enter salary"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">Job Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={jobData.description}
                  onChange={handleInputChange}
                  placeholder="Enter job description"
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="requirements" className="text-sm font-medium text-gray-700">Requirements (Optional)</Label>
                <Textarea
                  id="requirements"
                  name="requirements"
                  value={jobData.requirements}
                  onChange={handleInputChange}
                  placeholder="Enter requirements"
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="benefits" className="text-sm font-medium text-gray-700">Benefits (Optional)</Label>
                <Textarea
                  id="benefits"
                  name="benefits"
                  value={jobData.benefits}
                  onChange={handleInputChange}
                  placeholder="Enter benefits"
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createJobMutation.isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {createJobMutation.isPending ? 'Posting...' : 'Post Job'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Dashboard Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-blue-50 border-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalApplications}</div>
            <p className="text-sm text-gray-500">+20% from last month</p>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shortlisted</CardTitle>
            <UserCheck className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shortlistedCount}</div>
            <p className="text-sm text-gray-500">+10% from last month</p>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-50 border-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hired</CardTitle>
            <Building className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hiredCount}</div>
            <p className="text-sm text-gray-500">+5% from last month</p>
          </CardContent>
        </Card>
        
        <Card className="bg-yellow-50 border-yellow-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hire Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hireRate}%</div>
            <p className="text-sm text-gray-500">Steady growth</p>
          </CardContent>
        </Card>
      </div>

      {/* Job Listings */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">Current Job Postings</h3>
        {jobs.length === 0 ? (
          <Card className="text-center py-8">
            <CardContent>
              <div className="text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Jobs Posted</h3>
                <p>Post a new job to start receiving applications!</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-bold text-gray-900 mb-1">{job.title}</CardTitle>
                      <div className="flex items-center text-blue-600 font-semibold mb-2">
                        <Building className="h-4 w-4 mr-1" />
                        {job.company}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewApplications(job)}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Apps
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-sm">{job.location}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-sm">{job.department}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-sm">{formatEmploymentType(job.employment_type)}</span>
                      </div>
                      
                      {job.salary && (
                        <div className="flex items-center text-green-600 font-medium">
                          <DollarSign className="h-4 w-4 mr-1" />
                          <span className="text-sm">{job.salary}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="border-t pt-3">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {job.description}
                      </p>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs text-gray-500 pt-2">
                      <span>Posted: {formatDate(job.created_at)}</span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        Active
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Job Applications View */}
      <JobApplicationsView 
        job={selectedJob}
        isOpen={isApplicationsViewOpen}
        onClose={() => {
          setIsApplicationsViewOpen(false);
          setSelectedJob(null);
        }}
      />
    </div>
  );
};

export default CompanyView;
