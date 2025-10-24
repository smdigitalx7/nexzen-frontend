/**
 * Multiple Payment Form Integration Example
 * Shows how to integrate the multiple payment form with existing CollectFee components
 */

import React, { useState } from 'react';
import { SchoolMultiplePaymentForm } from '@/components/features/school/fees/multiple-payment/SchoolMultiplePaymentForm';
import { CollegeMultiplePaymentForm } from '@/components/features/college/fees/multiple-payment/CollegeMultiplePaymentForm';
import type { StudentInfo, FeeBalance, MultiplePaymentData } from '@/components/shared/payment/types/PaymentTypes';

// Example integration with existing CollectFee component
export const CollectFeeWithMultiplePayment = () => {
  const [selectedStudent, setSelectedStudent] = useState<StudentInfo | null>(null);
  const [feeBalances, setFeeBalances] = useState<FeeBalance | null>(null);
  const [showMultiplePayment, setShowMultiplePayment] = useState(false);
  const [institutionType, setInstitutionType] = useState<'school' | 'college'>('school');

  // Mock student data - replace with actual data from your system
  const mockStudent: StudentInfo = {
    studentId: '123',
    admissionNo: 'ADM001',
    name: 'John Doe',
    className: '5th Grade',
    academicYear: '2025-2026'
  };

  // Mock fee balances - replace with actual data from your system
  const mockFeeBalances: FeeBalance = {
    bookFee: {
      total: 1500,
      paid: 0,
      outstanding: 1500
    },
    tuitionFee: {
      total: institutionType === 'college' ? 45000 : 30000,
      term1: { paid: 0, outstanding: institutionType === 'college' ? 15000 : 15000 },
      term2: { paid: 0, outstanding: institutionType === 'college' ? 15000 : 15000 },
      ...(institutionType === 'college' && {
        term3: { paid: 0, outstanding: 15000 }
      })
    },
    transportFee: {
      total: institutionType === 'college' ? 6000 : 4000,
      term1: { paid: 0, outstanding: institutionType === 'college' ? 2000 : 2000 },
      term2: { paid: 0, outstanding: institutionType === 'college' ? 2000 : 2000 },
      ...(institutionType === 'college' && {
        term3: { paid: 0, outstanding: 2000 }
      })
    }
  };

  const handleStudentSelect = (student: StudentInfo) => {
    setSelectedStudent(student);
    setFeeBalances(mockFeeBalances);
  };

  const handlePaymentComplete = async (paymentData: MultiplePaymentData) => {
    try {
      // Transform data for your API
      const apiPayload = {
        details: paymentData.details.map(detail => ({
          purpose: detail.purpose,
          custom_purpose_name: detail.custom_purpose_name || null,
          term_number: detail.term_number || null,
          paid_amount: detail.paid_amount,
          payment_method: detail.payment_method,
        })),
        remarks: paymentData.remarks || null,
      };

      // Call your existing API endpoint
      const endpoint = institutionType === 'school' 
        ? `/api/v1/school/income/pay-fee/${paymentData.admissionNo}`
        : `/api/v1/college/income/pay-fee/${paymentData.admissionNo}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(apiPayload),
      });

      if (!response.ok) {
        throw new Error('Payment processing failed');
      }

      const result = await response.json();
      
      if (result.success) {
        // Handle successful payment
        console.log('Payment completed successfully:', result);
        
        // Close the form and refresh data
        setShowMultiplePayment(false);
        setSelectedStudent(null);
        setFeeBalances(null);
        
        // Show success message
        alert('Payment completed successfully!');
        
        // Refresh fee balances or navigate back to fee management
        // You can call your existing refresh functions here
      } else {
        throw new Error(result.message || 'Payment processing failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert(`Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleCancel = () => {
    setShowMultiplePayment(false);
    setSelectedStudent(null);
    setFeeBalances(null);
  };

  return (
    <div className="space-y-6">
      {/* Institution Type Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setInstitutionType('school')}
          className={`px-4 py-2 rounded ${
            institutionType === 'school' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          School
        </button>
        <button
          onClick={() => setInstitutionType('college')}
          className={`px-4 py-2 rounded ${
            institutionType === 'college' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          College
        </button>
      </div>

      {/* Student Selection */}
      {!selectedStudent && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Select Student</h2>
          <button
            onClick={() => handleStudentSelect(mockStudent)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Select Mock Student (John Doe)
          </button>
        </div>
      )}

      {/* Multiple Payment Form */}
      {selectedStudent && feeBalances && showMultiplePayment && (
        <div>
          {institutionType === 'school' ? (
            <SchoolMultiplePaymentForm
              student={selectedStudent}
              feeBalances={feeBalances}
              onPaymentComplete={handlePaymentComplete}
              onCancel={handleCancel}
            />
          ) : (
            <CollegeMultiplePaymentForm
              student={selectedStudent}
              feeBalances={feeBalances}
              onPaymentComplete={handlePaymentComplete}
              onCancel={handleCancel}
            />
          )}
        </div>
      )}

      {/* Show Multiple Payment Button */}
      {selectedStudent && !showMultiplePayment && (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold">Selected Student: {selectedStudent.name}</h3>
            <p>Admission No: {selectedStudent.admissionNo}</p>
            <p>Class: {selectedStudent.className}</p>
          </div>
          
          <button
            onClick={() => setShowMultiplePayment(true)}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
          >
            Start Multiple Payment
          </button>
          
          <button
            onClick={() => setSelectedStudent(null)}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 ml-2"
          >
            Change Student
          </button>
        </div>
      )}
    </div>
  );
};

export default CollectFeeWithMultiplePayment;
