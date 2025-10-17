import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { OfferPDFData } from '@/types/jobOffers';

// Define styles for the PDF - Professional, no color coding
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    borderBottom: '2 solid #2563eb',
    paddingBottom: 12,
  },
  logoContainer: {
    width: 60,
    height: 60,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 55,
    height: 55,
    objectFit: 'contain',
  },
  logoPlaceholder: {
    width: 55,
    height: 55,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    border: '2 solid #e5e7eb',
  },
  companyInfo: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  companyName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  companyAddress: {
    fontSize: 10,
    color: '#4b5563',
    textAlign: 'right',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 30,
    letterSpacing: 1,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 10,
    borderBottom: '2 solid #3b82f6',
    paddingBottom: 5,
  },
  content: {
    fontSize: 11,
    color: '#374151',
    lineHeight: 1.5,
    marginBottom: 6,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#000000',
  },
  salarySection: {
    backgroundColor: '#eff6ff',
    border: '2 solid #3b82f6',
    padding: 16,
    borderRadius: 6,
    marginBottom: 20,
  },
  salaryItem: {
    fontSize: 11,
    color: '#374151',
    lineHeight: 1.5,
    marginBottom: 6,
  },
  salaryAmount: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#000000',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 10,
    color: '#6b7280',
    borderTop: '1 solid #d1d5db',
    paddingTop: 15,
  },
  signatureSection: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureLine: {
    borderBottom: '1 solid #000000',
    width: 200,
    marginBottom: 5,
  },
  signatureLabel: {
    fontSize: 10,
    color: '#6b7280',
  },
  // New professional styles
  offerDate: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'right',
    marginBottom: 20,
  },
});

interface OfferPDFDocumentProps {
  data: OfferPDFData;
}

export const OfferPDFDocument: React.FC<OfferPDFDocumentProps> = ({ data }) => {
  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      if (!dateString || dateString.trim() === '') {
        return 'Invalid Date';
      }
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'Invalid Date';
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            {data.company_logo_url ? (
              <Image src={data.company_logo_url} style={styles.logo} />
            ) : (
              <View style={styles.logoPlaceholder} />
            )}
          </View>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{data.company_name || 'Company Name'}</Text>
            {data.company_address && data.company_address.trim() && data.company_address.trim().length > 0 && (
              <Text style={styles.companyAddress}>{data.company_address}</Text>
            )}
            {data.company_phone && data.company_phone.trim() && data.company_phone.trim().length > 0 && (
              <Text style={styles.companyAddress}>{data.company_phone}</Text>
            )}
          </View>
        </View>

        {/* Offer Date */}
        <Text style={styles.offerDate}>
          Offer Date: {formatDate(data.offer_date)}
        </Text>

        {/* Title */}
        <Text style={styles.title}>Employment Offer Letter</Text>

        {/* Salutation */}
        <View style={styles.section}>
          <Text style={styles.content}>
            Dear {data.candidate_name || 'Candidate'},
          </Text>
          <Text style={styles.content}>
            We are pleased to extend an offer of employment for the position of <Text style={styles.boldText}>{data.job_title || 'Position'}</Text> at {data.company_name || 'our company'}. 
            We are confident that your skills and experience will make a valuable contribution to our team.
          </Text>
        </View>

        {/* Compensation Section */}
        <View style={styles.salarySection}>
          <Text style={styles.sectionTitle}>Compensation Package</Text>
          <Text style={styles.salaryItem}>
            <Text style={styles.boldText}>Annual Base Salary:</Text> <Text style={styles.salaryAmount}>{formatCurrency(data.salary_amount, data.salary_currency)}</Text>
          </Text>
          {data.bonus_amount && data.bonus_amount > 0 && (
            <Text style={styles.salaryItem}>
              <Text style={styles.boldText}>{data.bonus_description || 'Performance Bonus'}:</Text> <Text style={styles.salaryAmount}>{formatCurrency(data.bonus_amount, data.salary_currency)}</Text>
            </Text>
          )}
          <Text style={styles.salaryItem}>
            <Text style={styles.boldText}>Payment Schedule:</Text> Monthly
          </Text>
        </View>

        {/* Position Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Position Details</Text>
          <Text style={styles.content}>
            <Text style={styles.boldText}>Job Title:</Text> {data.job_title || 'Position'}
          </Text>
          <Text style={styles.content}>
            <Text style={styles.boldText}>Department:</Text> To be determined
          </Text>
          <Text style={styles.content}>
            <Text style={styles.boldText}>Reports to:</Text> {data.reports_to || 'To be determined'}
          </Text>
          <Text style={styles.content}>
            <Text style={styles.boldText}>Start Date:</Text> {data.start_date ? formatDate(data.start_date) : 'To be determined'}
          </Text>
          {data.end_date && data.end_date.trim() && (
            <Text style={styles.content}>
              <Text style={styles.boldText}>Contract End Date:</Text> {formatDate(data.end_date)}
            </Text>
          )}
          <Text style={styles.content}>
            <Text style={styles.boldText}>Employment Type:</Text> {data.end_date && data.end_date.trim() ? 'Contract' : 'Full-time'}
          </Text>
        </View>

        {/* Benefits & Perks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Benefits & Perks</Text>
          <Text style={styles.content}>{data.benefits || 'Standard company benefits apply'}</Text>
          {data.insurance_details && data.insurance_details.trim() && data.insurance_details.trim().length > 0 && (
            <Text style={styles.content}>
              <Text style={styles.boldText}>Insurance Details:</Text> {data.insurance_details}
            </Text>
          )}
        </View>

        {/* Terms and Conditions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Terms and Conditions</Text>
          <Text style={styles.content}>
            This offer is contingent upon successful completion of background checks, reference verification, and any required pre-employment screenings. 
            The terms and conditions of employment will be governed by our standard employment agreement, which will be provided upon acceptance of this offer.
          </Text>
          <Text style={styles.content}>
            This offer is valid until <Text style={styles.boldText}>{formatDate(data.expiry_date)}</Text>. 
            Please respond to this offer by this date to confirm your acceptance. If you have any questions or need clarification on any aspect of this offer, please do not hesitate to contact us.
          </Text>
        </View>


        {/* Signature Section */}
        <View style={styles.signatureSection}>
          <View>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Candidate Signature</Text>
            <Text style={styles.signatureLabel}>Date</Text>
          </View>
          <View>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Company Representative</Text>
            <Text style={styles.signatureLabel}>Date</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          This is a confidential employment offer letter. Please do not share this document with unauthorized parties.
          For questions regarding this offer, please contact our Human Resources department.
        </Text>
      </Page>
    </Document>
  );
};
