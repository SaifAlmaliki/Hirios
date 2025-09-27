import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { OfferPDFData } from '@/types/jobOffers';

// Define styles for the PDF
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
    alignItems: 'center',
    marginBottom: 30,
    borderBottom: '2 solid #2563eb',
    paddingBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    backgroundColor: '#2563eb',
    borderRadius: 8,
  },
  companyInfo: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  companyAddress: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'right',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 30,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 10,
    borderBottom: '1 solid #e5e7eb',
    paddingBottom: 5,
  },
  content: {
    fontSize: 12,
    color: '#374151',
    lineHeight: 1.5,
    marginBottom: 8,
  },
  highlight: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  salarySection: {
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  salaryAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#059669',
    textAlign: 'center',
    marginBottom: 5,
  },
  salaryDetails: {
    fontSize: 12,
    color: '#374151',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 10,
    color: '#6b7280',
    borderTop: '1 solid #e5e7eb',
    paddingTop: 15,
  },
  signatureSection: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureLine: {
    borderBottom: '1 solid #374151',
    width: 200,
    marginBottom: 5,
  },
  signatureLabel: {
    fontSize: 10,
    color: '#6b7280',
  },
  expiryNotice: {
    backgroundColor: '#fef3c7',
    border: '1 solid #f59e0b',
    borderRadius: 8,
    padding: 15,
    marginTop: 20,
  },
  expiryText: {
    fontSize: 12,
    color: '#92400e',
    textAlign: 'center',
    fontWeight: 'bold',
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logo} />
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{data.company_name}</Text>
            {data.company_address && (
              <Text style={styles.companyAddress}>{data.company_address}</Text>
            )}
            {data.company_phone && (
              <Text style={styles.companyAddress}>{data.company_phone}</Text>
            )}
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Job Offer Letter</Text>

        {/* Candidate Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dear {data.candidate_name},</Text>
          <Text style={styles.content}>
            We are pleased to offer you the position of <Text style={styles.highlight}>{data.job_title}</Text> at {data.company_name}. 
            We are excited about the possibility of you joining our team and contributing to our continued success.
          </Text>
        </View>

        {/* Salary Section */}
        <View style={styles.salarySection}>
          <Text style={styles.salaryAmount}>
            {formatCurrency(data.salary_amount, data.salary_currency)}
          </Text>
          <Text style={styles.salaryDetails}>Annual Base Salary</Text>
          {data.bonus_amount && (
            <>
              <Text style={styles.salaryAmount}>
                {formatCurrency(data.bonus_amount, data.salary_currency)}
              </Text>
              <Text style={styles.salaryDetails}>
                {data.bonus_description || 'Performance Bonus'}
              </Text>
            </>
          )}
        </View>

        {/* Job Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Position Details</Text>
          <Text style={styles.content}>
            <Text style={styles.highlight}>Position:</Text> {data.job_title}
          </Text>
          <Text style={styles.content}>
            <Text style={styles.highlight}>Reports to:</Text> {data.reports_to}
          </Text>
          <Text style={styles.content}>
            <Text style={styles.highlight}>Start Date:</Text> To be discussed
          </Text>
        </View>

        {/* Benefits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Benefits & Compensation</Text>
          <Text style={styles.content}>{data.benefits}</Text>
          {data.insurance_details && (
            <Text style={styles.content}>
              <Text style={styles.highlight}>Insurance:</Text> {data.insurance_details}
            </Text>
          )}
        </View>

        {/* Terms and Conditions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Terms and Conditions</Text>
          <Text style={styles.content}>
            This offer is contingent upon successful completion of background checks and reference verification. 
            The terms and conditions of employment will be governed by our standard employment agreement.
          </Text>
          <Text style={styles.content}>
            This offer is valid until <Text style={styles.highlight}>{formatDate(data.expiry_date)}</Text>. 
            Please respond to this offer by this date to confirm your acceptance.
          </Text>
        </View>

        {/* Expiry Notice */}
        <View style={styles.expiryNotice}>
          <Text style={styles.expiryText}>
            ⚠️ This offer expires on {formatDate(data.expiry_date)}
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
          This is a confidential job offer letter. Please do not share this document with unauthorized parties.
          For questions regarding this offer, please contact our HR department.
        </Text>
      </Page>
    </Document>
  );
};
