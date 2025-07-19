import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Building, Users, UserCheck, TrendingUp, Eye, FileText, MapPin, Clock, DollarSign, Briefcase, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCreateJob, useUpdateJob, useDeleteJob } from '../hooks/useJobs';
import { useCompanyJobs } from '../hooks/useCompanyJobs';
import { useApplications } from '../hooks/useApplications';
import JobApplicationsView from './JobApplicationsView';

// Separate JobForm component to prevent re-rendering issues
const JobForm = React.memo(({ 
  jobData, 
  onInputChange, 
  onSelectChange, 
  onSubmit, 
  isEdit = false, 
  isLoading = false,
  onCancel 
}: {
  jobData: any;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isEdit?: boolean;
  isLoading?: boolean;
  onCancel: () => void;
}) => (
  <form onSubmit={onSubmit} className="space-y-4 mt-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-medium text-gray-700">Job Title *</Label>
        <Input
          id="title"
          name="title"
          value={jobData.title}
          onChange={onInputChange}
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
          onChange={onInputChange}
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
          onChange={onInputChange}
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
          onChange={onInputChange}
          placeholder="Enter location"
          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="employment_type" className="text-sm font-medium text-gray-700">Employment Type *</Label>
        <Select onValueChange={onSelectChange} value={jobData.employment_type}>
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
          onChange={onInputChange}
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
        onChange={onInputChange}
        placeholder="Enter job description"
        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
        rows={4}
      />
    </div>
    
    <div className="space-y-2">
      <Label htmlFor="requirements" className="text-sm font-medium text-gray-700">Requirements (Optional)</Label>
      <Textarea
        id="requirements"
        name="requirements"
        value={jobData.requirements}
        onChange={onInputChange}
        placeholder="Enter requirements"
        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
        rows={3}
      />
    </div>
    
    <div className="space-y-2">
      <Label htmlFor="benefits" className="text-sm font-medium text-gray-700">Benefits (Optional)</Label>
      <Textarea
        id="benefits"
        name="benefits"
        value={jobData.benefits}
        onChange={onInputChange}
        placeholder="Enter benefits"
        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
        rows={3}
      />
    </div>
    
    <div className="flex justify-end space-x-2">
      <Button variant="outline" type="button" onClick={onCancel}>
        Cancel
      </Button>
      <Button 
        type="submit" 
        disabled={isLoading} 
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        {isLoading ? (isEdit ? 'Updating...' : 'Posting...') : (isEdit ? 'Update Job' : 'Post Job')}
      </Button>
    </div>
  </form>
));

const CompanyView: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isApplicationsViewOpen, setIsApplicationsViewOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  
  // Use company-specific jobs hook instead of all jobs
  const { data: jobs = [], isLoading: jobsLoading } = useCompanyJobs();
  const selectedJob = jobs.find(job => job.id === selectedJobId) || null;
  
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
  const updateJobMutation = useUpdateJob();
  const deleteJobMutation = useDeleteJob();

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

    if (editingJob) {
      // Update existing job
      updateJobMutation.mutate({
        jobId: editingJob.id,
        jobData: jobData
      }, {
        onSuccess: () => {
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
          setIsEditDialogOpen(false);
          setEditingJob(null);
        }
      });
    } else {
      // Create new job
      createJobMutation.mutate(jobData, {
        onSuccess: () => {
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
        }
      });
    }
  };

  const handleEditJob = (job: any) => {
    setEditingJob(job);
    setJobData({
      title: job.title,
      company: job.company,
      department: job.department,
      location: job.location,
      employment_type: job.employment_type,
      salary: job.salary || '',
      description: job.description,
      requirements: job.requirements || '',
      benefits: job.benefits || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteJob = (jobId: string) => {
    if (window.confirm('Are you sure you want to delete this job posting? This action cannot be undone.')) {
      deleteJobMutation.mutate(jobId);
    }
  };

  const handleViewApplications = (jobId: string) => {
    setSelectedJobId(jobId);
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

  if (jobsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-blue-900">Company Dashboard</h2>
            <p className="text-gray-600 mt-1">Loading your job postings...</p>
          </div>
        </div>
      </div>
    );
  }

  // Cancel handlers
  const handleCancelCreate = () => {
    setIsDialogOpen(false);
  };

  const handleCancelEdit = () => {
    setIsEditDialogOpen(false);
    setEditingJob(null);
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
            <JobForm
              jobData={jobData}
              onInputChange={handleInputChange}
              onSelectChange={handleSelectChange}
              onSubmit={handleSubmit}
              isEdit={false}
              isLoading={createJobMutation.isPending}
              onCancel={handleCancelCreate}
            />
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
        <h3 className="text-xl font-semibold text-gray-900">Your Job Postings</h3>
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
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditJob(job)}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteJob(job.id)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        disabled={deleteJobMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewApplications(job.id)}
                        className="text-green-600 hover:text-green-800 hover:bg-green-50"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
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

      {/* Edit Job Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl text-blue-900">Edit Job</DialogTitle>
            <DialogDescription>
              Update the job details below.
            </DialogDescription>
          </DialogHeader>
          <JobForm
            jobData={jobData}
            onInputChange={handleInputChange}
            onSelectChange={handleSelectChange}
            onSubmit={handleSubmit}
            isEdit={true}
            isLoading={updateJobMutation.isPending}
            onCancel={handleCancelEdit}
          />
        </DialogContent>
      </Dialog>

      {/* Job Applications View */}
      <JobApplicationsView 
        job={selectedJob}
        isOpen={isApplicationsViewOpen}
        onClose={() => {
          setIsApplicationsViewOpen(false);
          setSelectedJobId(null);
        }}
      />
    </div>
  );
};

export default CompanyView;
