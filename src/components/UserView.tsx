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
               <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                 <div className="overflow-x-auto">
                   <table className="w-full">
                                           <thead className="bg-gradient-to-r from-blue-600 to-blue-700 border-b-2 border-blue-800">
                        <tr>
                          <th className="px-8 py-6 text-left text-xs font-bold text-white uppercase tracking-wider">
                            Position & Company
                          </th>
                          <th className="px-8 py-6 text-left text-xs font-bold text-white uppercase tracking-wider">
                            Location
                          </th>
                          <th className="px-8 py-6 text-left text-xs font-bold text-white uppercase tracking-wider">
                            Department
                          </th>
                          <th className="px-8 py-6 text-left text-xs font-bold text-white uppercase tracking-wider">
                            Type & Posted
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y-2 divide-blue-100">
                       {currentJobs.map((job, index) => (
                         <tr 
                           key={job.id} 
                           className={`group hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-indigo-50/80 transition-all duration-300 cursor-pointer ${
                             index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                           }`}
                           onClick={() => handleJobClick(job.id)}
                         >
                                                       <td className="px-8 py-6">
                              <div className="flex items-start">
                                <div className="flex-shrink-0 h-8 w-8 bg-blue-50 border-2 border-blue-200 rounded-lg flex items-center justify-center group-hover:border-blue-300 group-hover:bg-blue-100 transition-all duration-300">
                                  <Building className="h-4 w-4 text-blue-600" />
                                </div>
                                <div className="ml-3">
                                  <div className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-300 mb-1">
                                    {job.title}
                                  </div>
                                  <div className="text-sm font-medium text-slate-600">
                                    {job.company}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-7 w-7 bg-emerald-50 border-2 border-emerald-200 rounded-lg flex items-center justify-center">
                                  <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-semibold text-slate-900">
                                    {job.location}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-7 w-7 bg-violet-50 border-2 border-violet-200 rounded-lg flex items-center justify-center">
                                  <Users className="h-3.5 w-3.5 text-violet-600" />
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-semibold text-slate-900">
                                    {job.department}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex flex-col space-y-2">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-6 w-6 bg-amber-50 border-2 border-amber-200 rounded-md flex items-center justify-center">
                                    <Clock className="h-3 w-3 text-amber-600" />
                                  </div>
                                  <div className="ml-2">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm">
                                      {job.employment_type}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-6 w-6 bg-slate-50 border-2 border-slate-200 rounded-md flex items-center justify-center">
                                    <Calendar className="h-3 w-3 text-slate-600" />
                                  </div>
                                  <div className="ml-2">
                                    <div className="text-xs font-medium text-slate-600">
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
               </div>
             </div>

                         {/* Mobile Card View */}
             <div className="lg:hidden space-y-4">
               {currentJobs.map((job, index) => (
                 <div 
                   key={job.id} 
                   className={`bg-white rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 cursor-pointer group ${
                     index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                   }`}
                   onClick={() => handleJobClick(job.id)}
                 >
                   <div className="p-6">
                     {/* Job Title */}
                     <div className="mb-6">
                       <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-300 mb-2">
                         {job.title}
                       </h3>
                     </div>

                     {/* Company and Location Row */}
                     <div className="flex items-center justify-between mb-6">
                       <div className="flex items-center">
                         <div className="flex-shrink-0 h-8 w-8 bg-blue-50 border-2 border-blue-200 rounded-lg flex items-center justify-center">
                           <Building className="h-4 w-4 text-blue-600" />
                         </div>
                         <div className="ml-4">
                           <div className="text-sm font-semibold text-slate-900">
                             {job.company}
                           </div>
                         </div>
                       </div>
                       <div className="flex items-center">
                         <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
                           <MapPin className="h-5 w-5 text-white" />
                         </div>
                         <div className="ml-3">
                           <div className="text-sm font-semibold text-slate-900">
                             {job.location}
                           </div>
                         </div>
                       </div>
                     </div>

                     {/* Department and Employment Type Row */}
                     <div className="flex items-center justify-between mb-6">
                       <div className="flex items-center">
                         <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center shadow-sm">
                           <Users className="h-5 w-5 text-white" />
                         </div>
                         <div className="ml-3">
                           <div className="text-sm font-semibold text-slate-900">
                             {job.department}
                           </div>
                         </div>
                       </div>
                       <div className="flex items-center">
                         <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-sm">
                           <Clock className="h-5 w-5 text-white" />
                         </div>
                         <div className="ml-3">
                           <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm">
                             {job.employment_type}
                           </span>
                         </div>
                       </div>
                     </div>

                     {/* Posted Date and View Details */}
                     <div className="flex items-center justify-between pt-4 border-t border-gray-100/60">
                       <div className="flex items-center">
                         <div className="flex-shrink-0 h-8 w-8 bg-gradient-to-br from-slate-500 to-slate-600 rounded-lg flex items-center justify-center shadow-sm">
                           <Calendar className="h-4 w-4 text-white" />
                         </div>
                         <div className="ml-3">
                           <div className="text-xs font-medium text-slate-600">
                             Posted {new Date(job.created_at).toLocaleDateString()}
                           </div>
                         </div>
                       </div>
                       <div className="flex items-center text-blue-600 group-hover:text-blue-700 transition-colors duration-300">
                         <span className="text-sm font-bold mr-2">View Details</span>
                         <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                       </div>
                     </div>
                   </div>
                 </div>
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
