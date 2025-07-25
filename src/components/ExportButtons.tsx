import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ExportButtonsProps {
  data: any[];
  stats?: any;
  onPDFExport: () => void;
  className?: string;
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({
  data,
  stats,
  onPDFExport,
  className = ''
}) => {
  const handleExcelExport = () => {
    // Prepare data for Excel export
    const excelData = data.map(result => ({
      'Candidate Name': `${result.first_name} ${result.last_name}`,
      'Email': result.email,
      'Phone': result.phone || '',
      'Job Position': result.job?.title || 'N/A',
      'Overall Fit Score': `${result.overall_fit || 0}%`,
      'Rating': getScoreLabel(result.overall_fit || 0),
      'Date Screened': new Date(result.created_at).toLocaleDateString(),
      'Strengths': result.strengths || '',
      'Weaknesses': result.weaknesses || '',
      'Risk Factors': result.risk_factor || '',
      'Potential Rewards': result.reward_factor || '',
      'AI Justification': result.justification || '',
      'Interview Summary': result.interview_summary || '',
      'Voice Screening Requested': result.voice_screening_requested ? 'Yes' : 'No',
      'Company Notes': result.notes || ''
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths for better readability
    const colWidths = [
      { wch: 20 }, // Candidate Name
      { wch: 25 }, // Email
      { wch: 15 }, // Phone
      { wch: 20 }, // Job Position
      { wch: 15 }, // Overall Fit Score
      { wch: 12 }, // Rating
      { wch: 15 }, // Date Screened
      { wch: 30 }, // Strengths
      { wch: 30 }, // Weaknesses
      { wch: 30 }, // Risk Factors
      { wch: 30 }, // Potential Rewards
      { wch: 40 }, // AI Justification
      { wch: 40 }, // Interview Summary
      { wch: 20 }, // Voice Screening Requested
      { wch: 30 }  // Company Notes
    ];
    ws['!cols'] = colWidths;

    // Add stats as a separate sheet if available
    if (stats) {
      const statsData = [
        { Metric: 'Total Screened', Value: stats.total || 0 },
        { Metric: 'Average Score', Value: `${stats.averageScore || 0}%` },
        { Metric: 'Excellent Fits (>70%)', Value: stats.excellent || 0 },
        { Metric: 'Good Fits (40-70%)', Value: stats.good || 0 },
        { Metric: 'Poor Fits (<40%)', Value: stats.poor || 0 },
        { Metric: 'Recent Count (This Week)', Value: stats.recentCount || 0 }
      ];
      
      const statsWs = XLSX.utils.json_to_sheet(statsData);
      statsWs['!cols'] = [{ wch: 25 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, statsWs, 'Statistics');
    }

    // Add main data sheet
    XLSX.utils.book_append_sheet(wb, ws, 'Screening Results');

    // Generate filename with current date
    const fileName = `screening-results-${new Date().toISOString().split('T')[0]}.xlsx`;

    // Save file
    XLSX.writeFile(wb, fileName);
  };

  // Helper function to get score label
  const getScoreLabel = (score: number) => {
    if (score > 70) return 'Excellent';
    if (score >= 40) return 'Good';
    return 'Poor';
  };

  return (
    <div className={`flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto ${className}`}>
      <Button
        onClick={onPDFExport}
        variant="outline"
        className="flex items-center gap-2 justify-center text-sm border-red-300 text-red-600 hover:bg-red-50"
        size="sm"
      >
        <FileText className="h-4 w-4 flex-shrink-0" />
        <span className="hidden xs:inline">Export PDF</span>
        <span className="xs:hidden">PDF</span>
      </Button>
      
      <Button
        onClick={handleExcelExport}
        variant="outline"
        className="flex items-center gap-2 justify-center text-sm border-green-300 text-green-600 hover:bg-green-50"
        size="sm"
      >
        <FileSpreadsheet className="h-4 w-4 flex-shrink-0" />
        <span className="hidden xs:inline">Export Excel</span>
        <span className="xs:hidden">Excel</span>
      </Button>
    </div>
  );
}; 