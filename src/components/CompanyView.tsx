
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, MapPin, Clock, DollarSign, Calendar } from 'lucide-react';
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
          <p className="text-gray-600 mt-1">Manage your job postings and attract top talent</p>
        </div>
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Job
        </Button>
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

      {/* Posted Jobs */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Posted Jobs ({jobs.length})</h3>
        <div className="grid gap-6">
          {jobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-blue-500">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl text-blue-900">{job.title}</CardTitle>
                    <CardDescription className="text-lg font-medium text-gray-700">{job.company}</CardDescription>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(job.postedDate).toLocaleDateString()}
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
                </div>
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompanyView;
