import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Building, Eye, FileText, MapPin, Clock, Briefcase, Edit, Trash2, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCreateJob, useUpdateJob, useDeleteJob } from '../hooks/useJobs';
import { useCompanyJobs } from '../hooks/useCompanyJobs';

import JobApplicationsView from './JobApplicationsView';
import CompanyResumeUpload from './CompanyResumeUpload';
import { useAuth } from '@/contexts/AuthContext';

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
      <Label htmlFor="responsibilities" className="text-sm font-medium text-gray-700">Responsibilities *</Label>
      <Textarea
        id="responsibilities"
        name="responsibilities"
        value={jobData.responsibilities}
        onChange={onInputChange}
        placeholder="Enter job responsibilities"
        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
        rows={3}
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
  const { user, userType, loading } = useAuth();
  
  // Show loading state while auth is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Security check: Only allow companies to access this view
  if (!user || userType !== 'company') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">This area is only available for company accounts.</p>
          <Button onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isApplicationsViewOpen, setIsApplicationsViewOpen] = useState(false);
  const [isJobDetailViewOpen, setIsJobDetailViewOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [detailViewJob, setDetailViewJob] = useState<any>(null);
  
  // Use company-specific jobs hook instead of all jobs
  const { data: jobs = [], isLoading: jobsLoading } = useCompanyJobs();
  const selectedJob = jobs.find(job => job.id === selectedJobId) || null;
  
  const [jobData, setJobData] = useState({
    title: '',
    company: '',
    department: '',
    location: '',
    employment_type: 'full-time',
    description: '',
    responsibilities: '',
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

    if (!jobData.title || !jobData.company || !jobData.department || !jobData.location || !jobData.employment_type || !jobData.description || !jobData.responsibilities) {
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
            description: '',
            responsibilities: '',
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
            description: '',
            responsibilities: '',
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
      description: job.description,
      responsibilities: job.responsibilities || '',
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

  const handleViewJobDetail = (job: any) => {
    setDetailViewJob(job);
    setIsJobDetailViewOpen(true);
  };



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
            <h2 className="text-3xl font-bold text-gray-900">Company Dashboard</h2>
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
          <h2 className="text-3xl font-bold text-gray-900">Company Dashboard</h2>
          <p className="text-gray-600 mt-1">Manage your job postings and applications</p>
        </div>
        
        <div className="flex space-x-3">
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
          
          <CompanyResumeUpload onUploadComplete={() => {
            // Refresh applications view if it's open
            if (isApplicationsViewOpen) {
              // The JobApplicationsView will automatically refresh due to React Query
            }
          }} />
        </div>
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
              <Card key={job.id} className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-blue-500 cursor-pointer" onClick={() => handleViewJobDetail(job)}>
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditJob(job);
                        }}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteJob(job.id);
                        }}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        disabled={deleteJobMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewApplications(job.id);
                        }}
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

      {/* Job Detail View Dialog */}
      <Dialog open={isJobDetailViewOpen} onOpenChange={setIsJobDetailViewOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-blue-900">
              {detailViewJob?.title}
            </DialogTitle>
            <DialogDescription className="text-lg text-gray-600">
              {detailViewJob?.company} • {detailViewJob?.department} • {detailViewJob?.location}
            </DialogDescription>
          </DialogHeader>

          {detailViewJob && (
            <div className="space-y-6">
              {/* Job Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium">{detailViewJob.location}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Briefcase className="h-5 w-5 mr-2 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="font-medium">{detailViewJob.department}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Employment Type</p>
                    <p className="font-medium">{formatEmploymentType(detailViewJob.employment_type)}</p>
                  </div>
                </div>
              </div>

              {/* Job Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Job Description</h3>
                <div className="bg-white border rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {detailViewJob.description}
                  </p>
                </div>
              </div>

              {/* Key Responsibilities */}
              {detailViewJob.responsibilities && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Responsibilities</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="text-gray-700 space-y-2">
                      {detailViewJob.responsibilities.split('\n').filter((resp: string) => resp.trim()).map((resp: string, index: number) => (
                        <div key={index} className="flex items-start">
                          <span className="text-blue-600 mr-2 mt-1">•</span>
                          <span>{resp.trim()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Requirements */}
              {detailViewJob.requirements && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="text-gray-700 space-y-2">
                      {detailViewJob.requirements.split('\n').filter((req: string) => req.trim()).map((req: string, index: number) => (
                        <div key={index} className="flex items-start">
                          <span className="text-yellow-600 mr-2 mt-1">•</span>
                          <span>{req.trim()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Benefits */}
              {detailViewJob.benefits && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Benefits</h3>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {detailViewJob.benefits}
                    </p>
                  </div>
                </div>
              )}

              {/* Job Info */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Posted: {formatDate(detailViewJob.created_at)}</span>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                    Active
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 border-t pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsJobDetailViewOpen(false);
                    handleViewApplications(detailViewJob.id);
                  }}
                  className="flex items-center"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Applications
                </Button>
                <Button
                  onClick={() => {
                    setIsJobDetailViewOpen(false);
                    handleEditJob(detailViewJob);
                  }}
                  className="flex items-center bg-blue-600 hover:bg-blue-700"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Job
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompanyView;
