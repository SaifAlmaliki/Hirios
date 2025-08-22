import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { 
  MapPin, 
  Clock, 
  Calendar, 
  Users, 
  Briefcase, 
  Search,
  ArrowRight,
  Building
} from 'lucide-react';
import { Job } from '../hooks/useJobs';

interface UserViewProps {
  jobs: Job[];
}

const UserView: React.FC<UserViewProps> = ({ jobs }) => {
  const navigate = useNavigate();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 10;
  
  // Search state (client-based)
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter jobs based on search (client-side filtering)
  const filteredJobs = useMemo(() => {
    if (!searchTerm.trim()) return jobs;
    
    const searchLower = searchTerm.toLowerCase();
    return jobs.filter(job => 
      job.title.toLowerCase().includes(searchLower) ||
      job.company.toLowerCase().includes(searchLower) ||
      job.department.toLowerCase().includes(searchLower) ||
      job.location.toLowerCase().includes(searchLower) ||
      job.employment_type.toLowerCase().includes(searchLower)
    );
  }, [jobs, searchTerm]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const startIndex = (currentPage - 1) * jobsPerPage;
  const endIndex = startIndex + jobsPerPage;
  const currentJobs = filteredJobs.slice(startIndex, endIndex);

  // Reset to first page when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleJobClick = (jobId: string) => {
    navigate(`/job-details/${jobId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Current Job Postings</h2>
        <p className="text-lg text-gray-600">Discover your next career opportunity</p>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            placeholder="Search jobs by title, company, department, location, or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 pr-4 py-4 text-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl shadow-sm"
          />
        </div>
      </div>

      {/* Results Count */}
      <div className="text-center text-sm text-gray-600">
        Showing {filteredJobs.length} of {jobs.length} jobs
      </div>

      {/* Job Table */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <Card className="text-center py-16 bg-gray-50 border-0 shadow-sm">
            <CardContent>
              <div className="text-gray-500">
                <Briefcase className="h-16 w-16 mx-auto mb-6 text-gray-400" />
                <h3 className="text-xl font-semibold mb-3">
                  {jobs.length === 0 ? 'No Jobs Available' : 'No Jobs Match Your Search'}
                </h3>
                <p className="text-lg">
                  {jobs.length === 0 
                    ? 'Check back later for new opportunities!' 
                    : 'Try adjusting your search terms.'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <Card className="border-0 shadow-lg overflow-hidden">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                                         <table className="w-full">
                       <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                         <tr>
                           <th className="px-8 py-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                             Position & Company
                           </th>
                           <th className="px-8 py-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                             Location
                           </th>
                           <th className="px-8 py-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                             Department
                           </th>
                           <th className="px-8 py-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                             Type & Posted
                           </th>
                         </tr>
                       </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {currentJobs.map((job, index) => (
                                                     <tr 
                             key={job.id} 
                             className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 cursor-pointer ${
                               index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                             }`}
                             onClick={() => handleJobClick(job.id)}
                           >
                             <td className="px-8 py-6">
                               <div className="flex items-start">
                                 <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                   <Building className="h-5 w-5 text-blue-600" />
                                 </div>
                                 <div className="ml-4">
                                   <div className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors duration-200 mb-1">
                                     {job.title}
                                   </div>
                                   <div className="text-sm font-medium text-gray-600">
                                     {job.company}
                                   </div>
                                 </div>
                               </div>
                             </td>
                             <td className="px-8 py-6 whitespace-nowrap">
                               <div className="flex items-center">
                                 <div className="flex-shrink-0 h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                                   <MapPin className="h-4 w-4 text-green-600" />
                                 </div>
                                 <div className="ml-3">
                                   <div className="text-sm font-medium text-gray-900">
                                     {job.location}
                                   </div>
                                 </div>
                               </div>
                             </td>
                             <td className="px-8 py-6 whitespace-nowrap">
                               <div className="flex items-center">
                                 <div className="flex-shrink-0 h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                                   <Users className="h-4 w-4 text-purple-600" />
                                 </div>
                                 <div className="ml-3">
                                   <div className="text-sm font-medium text-gray-900">
                                     {job.department}
                                   </div>
                                 </div>
                               </div>
                             </td>
                             <td className="px-8 py-6">
                               <div className="flex flex-col space-y-2">
                                 <div className="flex items-center">
                                   <div className="flex-shrink-0 h-6 w-6 bg-orange-100 rounded-full flex items-center justify-center">
                                     <Clock className="h-3 w-3 text-orange-600" />
                                   </div>
                                   <div className="ml-2">
                                     <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                       {job.employment_type}
                                     </span>
                                   </div>
                                 </div>
                                 <div className="flex items-center">
                                   <div className="flex-shrink-0 h-6 w-6 bg-gray-100 rounded-full flex items-center justify-center">
                                     <Calendar className="h-3 w-3 text-gray-600" />
                                   </div>
                                   <div className="ml-2">
                                     <div className="text-xs text-gray-500">
                                       {new Date(job.created_at).toLocaleDateString()}
                                     </div>
                                   </div>
                                 </div>
                               </div>
                             </td>
                           </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {currentJobs.map((job, index) => (
                <Card 
                  key={job.id} 
                  className={`border-0 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                  }`}
                  onClick={() => handleJobClick(job.id)}
                >
                  <CardContent className="p-6">
                    {/* Job Title */}
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors duration-200 mb-2">
                        {job.title}
                      </h3>
                    </div>

                    {/* Company and Location Row */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Building className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {job.company}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                          <MapPin className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="ml-2">
                          <div className="text-sm font-medium text-gray-900">
                            {job.location}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Department and Employment Type Row */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {job.department}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <Clock className="h-4 w-4 text-orange-600" />
                        </div>
                        <div className="ml-2">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                            {job.employment_type}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Posted Date and View Details */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-6 w-6 bg-gray-100 rounded-full flex items-center justify-center">
                          <Calendar className="h-3 w-3 text-gray-600" />
                        </div>
                        <div className="ml-2">
                          <div className="text-xs text-gray-500">
                            Posted {new Date(job.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center text-blue-600 hover:text-blue-700">
                        <span className="text-sm font-medium mr-1">View Details</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1) setCurrentPage(currentPage - 1);
                        }}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(page);
                          }}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                        }}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}

            {/* Page Info */}
            {totalPages > 1 && (
              <div className="text-center text-sm text-gray-600 mt-4">
                Page {currentPage} of {totalPages} • Showing {startIndex + 1}-{Math.min(endIndex, filteredJobs.length)} of {filteredJobs.length} jobs
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserView;
