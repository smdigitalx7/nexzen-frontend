/**
 * College Search Result Card Component
 * Modern, refreshing design for comprehensive college student search results
 */
import { motion } from "framer-motion";
import {
  GraduationCap,
  Bus,
  Calendar,
  MapPin,
  CheckCircle,
  Receipt,
  Building2,
  FileText,
  CreditCard,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Hash,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { CollegeFullStudentRead } from "@/lib/types/college";

interface CollegeSearchResultCardProps {
  result: CollegeFullStudentRead;
  onCollectFee?: () => void;
}

export function CollegeSearchResultCard({ result, onCollectFee }: CollegeSearchResultCardProps) {
  const [expandedSections, setExpandedSections] = useState<{
    fees: boolean;
    receipts: boolean;
  }>({
    fees: false,
    receipts: false,
  });
  
  const studentDetails = result.student_details;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Format month
  const formatMonth = (monthString: string) => {
    if (!monthString) return "";
    try {
      const [year, month] = monthString.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
      });
    } catch {
      return monthString;
    }
  };

  // Get class display with group and course
  const getClassDisplay = () => {
    const parts = [studentDetails.class_name];
    if (studentDetails.group_name) {
      parts.push(studentDetails.group_name);
    }
    if (studentDetails.course_name) {
      parts.push(studentDetails.course_name);
    }
    return parts.join(" - ");
  };

  // Calculate fee status
  const tuitionBalance = result.tuition_fee_balance_summary?.overall_balance || 0;
  const transportBalance = result.transport_fee_balance_summary?.total_amount_pending || 0;
  const totalBalance = tuitionBalance + transportBalance;
  const hasOutstandingBalance = totalBalance > 0;

  // Get receipts count
  const receiptsCount = result.income_receipts_list?.length || 0;
  const totalReceiptsAmount = result.income_receipts_list?.reduce((sum, r) => sum + r.total_amount, 0) || 0;

  const toggleSection = (section: "fees" | "receipts") => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <Card className="border-0 shadow-xl bg-white overflow-hidden">
        {/* Hero Header */}
        <div className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-pink-800 text-white p-8">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djJoLTJ2LTJoLTJ2LTJoMnYtMmgyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
          <div className="relative flex items-start gap-6">
            <div className="relative shrink-0">
              <div className="h-20 w-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl border border-white/30">
                <GraduationCap className="h-10 w-10 text-white" />
              </div>
              {studentDetails.student_status === "ACTIVE" && (
                <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-emerald-400 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                  <div className="h-2 w-2 bg-white rounded-full"></div>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h1 className="text-3xl font-bold mb-2 tracking-tight">{studentDetails.student_name}</h1>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-3 py-1 text-sm font-semibold">
                      {getClassDisplay()}
                    </Badge>
                    <Badge className="bg-emerald-500/20 text-emerald-100 border-emerald-400/30 backdrop-blur-sm px-3 py-1 text-sm">
                      {studentDetails.academic_year}
                    </Badge>
                    <Badge 
                      variant={studentDetails.enrollment_status ? "default" : "secondary"}
                      className="text-xs px-2 py-1 bg-white/20 text-white border-white/30"
                    >
                      {studentDetails.enrollment_status ? "✓ Enrolled" : "Not Enrolled"}
                    </Badge>
                  </div>
                </div>
                {onCollectFee && hasOutstandingBalance && (
                  <Button
                    onClick={onCollectFee}
                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm px-4 py-2 text-base font-semibold"
                    size="default"
                  >
                    <CreditCard className="h-5 w-5" />
                    Collect Fee
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-purple-100">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  <span className="font-mono font-semibold">{studentDetails.admission_no}</span>
                </div>
                {studentDetails.roll_number && (
                  <>
                    <span className="text-purple-300">•</span>
                    <span>Roll: <span className="font-semibold">{studentDetails.roll_number}</span></span>
                  </>
                )}
                <span className="text-purple-300">•</span>
                <div className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  <span>{studentDetails.branch_name}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <CardContent className="p-0">
          {/* Quick Stats Bar */}
          <div className="bg-slate-50 border-b px-8 py-4">
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                  <Wallet className="h-3.5 w-3.5" />
                  Total Outstanding
                </div>
                <p className={`text-2xl font-bold ${hasOutstandingBalance ? "text-red-600" : "text-emerald-600"}`}>
                  {formatCurrency(totalBalance)}
                </p>
              </div>
              <div className="text-center border-x border-slate-200">
                <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                  <span className="text-lg font-bold">₹</span>
                  Tuition Fee
                </div>
                <p className={`text-xl font-bold ${tuitionBalance > 0 ? "text-red-600" : "text-emerald-600"}`}>
                  {formatCurrency(tuitionBalance)}
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                  <Bus className="h-3.5 w-3.5" />
                  Transport Fee
                </div>
                <p className={`text-xl font-bold ${transportBalance > 0 ? "text-red-600" : "text-emerald-600"}`}>
                  {formatCurrency(transportBalance)}
                </p>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Transport Assignment */}
            {result.transport_assignment && (
              <div className="relative">
                <div className="absolute -left-3 top-0 bottom-0 w-1 bg-gradient-to-b from-green-400 to-emerald-600 rounded-full"></div>
                <div className="pl-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                        <Bus className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">Transport Assignment</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Route and vehicle details</p>
                      </div>
                    </div>
                    {result.transport_assignment.is_active !== null && (
                      <Badge
                        variant={result.transport_assignment.is_active ? "default" : "secondary"}
                        className={`${result.transport_assignment.is_active ? "bg-emerald-500" : ""}`}
                      >
                        {result.transport_assignment.is_active ? "Active" : "Inactive"}
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.transport_assignment.route_name && (
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Route</p>
                        <p className="text-base font-bold text-slate-900">
                          {result.transport_assignment.route_name}
                          {result.transport_assignment.route_no && (
                            <span className="text-slate-600 font-normal ml-2 text-sm">#{result.transport_assignment.route_no}</span>
                          )}
                        </p>
                      </div>
                    )}
                    {result.transport_assignment.vehicle_number && (
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Vehicle</p>
                        <p className="text-base font-bold text-slate-900 font-mono">{result.transport_assignment.vehicle_number}</p>
                      </div>
                    )}
                    {result.transport_assignment.pickup_point && (
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Pickup Point</p>
                        <p className="text-base font-semibold text-slate-900 flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-emerald-600" />
                          {result.transport_assignment.pickup_point}
                        </p>
                      </div>
                    )}
                    {(result.transport_assignment.start_date || result.transport_assignment.end_date) && (
                      <div className="md:col-span-2 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-200">
                        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Assignment Period</p>
                        <p className="text-sm font-medium text-slate-700">
                          {result.transport_assignment.start_date && (
                            <span>From <span className="font-bold">{formatDate(result.transport_assignment.start_date)}</span></span>
                          )}
                          {result.transport_assignment.start_date && result.transport_assignment.end_date && (
                            <span className="mx-3 text-slate-400">→</span>
                          )}
                          {result.transport_assignment.end_date && (
                            <span>Until <span className="font-bold">{formatDate(result.transport_assignment.end_date)}</span></span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Fee Summary */}
            {(result.tuition_fee_balance_summary || result.transport_fee_balance_summary) && (
              <div className="relative">
                <div className="absolute -left-3 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-indigo-600 rounded-full"></div>
                <div className="pl-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                        <span className="text-2xl font-bold text-blue-600">₹</span>
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">Fee Summary</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Complete fee breakdown and payment status</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-3 text-xs"
                      onClick={() => toggleSection("fees")}
                    >
                      {expandedSections.fees ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-1.5" />
                          Collapse
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-1.5" />
                          Expand
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {/* Tuition Fee */}
                    {result.tuition_fee_balance_summary && (
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-100">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                              <h3 className="text-base font-bold text-slate-900">Tuition Fee</h3>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 ml-4">
                              <div>
                                <span className="text-slate-500">Group Fee:</span> <span className="font-bold text-slate-900">{formatCurrency(result.tuition_fee_balance_summary.group_fee)}</span>
                              </div>
                              <span className="text-slate-300">•</span>
                              <div>
                                <span className="text-slate-500">Course Fee:</span> <span className="font-bold text-slate-900">{formatCurrency(result.tuition_fee_balance_summary.course_fee)}</span>
                              </div>
                              <span className="text-slate-300">•</span>
                              <div>
                                <span className="text-slate-500">Actual:</span> <span className="font-bold text-slate-900">{formatCurrency(result.tuition_fee_balance_summary.actual_fee)}</span>
                              </div>
                              {result.tuition_fee_balance_summary.concession_amount > 0 && (
                                <>
                                  <span className="text-slate-300">•</span>
                                  <div>
                                    <span className="text-slate-500">Concession:</span> <span className="font-bold text-emerald-600">{formatCurrency(result.tuition_fee_balance_summary.concession_amount)}</span>
                                  </div>
                                </>
                              )}
                              <span className="text-slate-300">•</span>
                              <div>
                                <span className="text-slate-500">Total:</span> <span className="font-bold text-slate-900">{formatCurrency(result.tuition_fee_balance_summary.total_fee)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <Badge
                              variant={tuitionBalance > 0 ? "destructive" : "default"}
                              className={`text-xs mb-2 ${tuitionBalance === 0 ? "bg-emerald-500" : ""}`}
                            >
                              {tuitionBalance > 0 ? "Outstanding" : "Paid"}
                            </Badge>
                            <p className={`text-2xl font-black ${tuitionBalance > 0 ? "text-red-600" : "text-emerald-600"}`}>
                              {formatCurrency(tuitionBalance)}
                            </p>
                          </div>
                        </div>

                        {/* Book Fee */}
                        {result.tuition_fee_balance_summary.book_fee > 0 && (
                          <div className="pt-4 mt-4 border-t-2 border-blue-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Book Fee</p>
                                <p className="text-sm text-slate-700">
                                  {formatCurrency(result.tuition_fee_balance_summary.book_fee)} <span className="text-slate-500">(Paid: {formatCurrency(result.tuition_fee_balance_summary.book_paid)})</span>
                                </p>
                              </div>
                              <Badge
                                variant={result.tuition_fee_balance_summary.book_paid_status === "PAID" ? "default" : "destructive"}
                                className={`text-xs ${result.tuition_fee_balance_summary.book_paid_status === "PAID" ? "bg-emerald-500" : ""}`}
                              >
                                {result.tuition_fee_balance_summary.book_paid_status === "PAID" ? "Paid" : "Pending"}
                              </Badge>
                            </div>
                          </div>
                        )}

                        {/* Term-wise Breakdown */}
                        {expandedSections.fees && (
                          <div className="mt-6 pt-6 border-t-2 border-blue-200">
                            <p className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-4">Term-wise Breakdown</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {result.tuition_fee_balance_summary.term1 && (
                                <div className="bg-white rounded-xl p-4 border-2 border-slate-200 shadow-sm">
                                  <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-bold text-slate-900">Term 1</span>
                                    <Badge
                                      variant={result.tuition_fee_balance_summary.term1.balance > 0 ? "destructive" : "default"}
                                      className={`text-xs ${result.tuition_fee_balance_summary.term1.balance === 0 ? "bg-emerald-500" : ""}`}
                                    >
                                      {result.tuition_fee_balance_summary.term1.status}
                                    </Badge>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                      <span className="text-slate-500">Amount</span>
                                      <span className="font-bold text-slate-900">{formatCurrency(result.tuition_fee_balance_summary.term1.amount)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                      <span className="text-slate-500">Paid</span>
                                      <span className="font-bold text-emerald-600">{formatCurrency(result.tuition_fee_balance_summary.term1.paid)}</span>
                                    </div>
                                    <div className="pt-2 border-t border-slate-200 flex justify-between">
                                      <span className="text-xs font-semibold text-slate-700">Balance</span>
                                      <span className={`text-sm font-bold ${result.tuition_fee_balance_summary.term1.balance > 0 ? "text-red-600" : "text-emerald-600"}`}>
                                        {formatCurrency(result.tuition_fee_balance_summary.term1.balance)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                              {result.tuition_fee_balance_summary.term2 && (
                                <div className="bg-white rounded-xl p-4 border-2 border-slate-200 shadow-sm">
                                  <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-bold text-slate-900">Term 2</span>
                                    <Badge
                                      variant={result.tuition_fee_balance_summary.term2.balance > 0 ? "destructive" : "default"}
                                      className={`text-xs ${result.tuition_fee_balance_summary.term2.balance === 0 ? "bg-emerald-500" : ""}`}
                                    >
                                      {result.tuition_fee_balance_summary.term2.status}
                                    </Badge>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                      <span className="text-slate-500">Amount</span>
                                      <span className="font-bold text-slate-900">{formatCurrency(result.tuition_fee_balance_summary.term2.amount)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                      <span className="text-slate-500">Paid</span>
                                      <span className="font-bold text-emerald-600">{formatCurrency(result.tuition_fee_balance_summary.term2.paid)}</span>
                                    </div>
                                    <div className="pt-2 border-t border-slate-200 flex justify-between">
                                      <span className="text-xs font-semibold text-slate-700">Balance</span>
                                      <span className={`text-sm font-bold ${result.tuition_fee_balance_summary.term2.balance > 0 ? "text-red-600" : "text-emerald-600"}`}>
                                        {formatCurrency(result.tuition_fee_balance_summary.term2.balance)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                              {result.tuition_fee_balance_summary.term3 && (
                                <div className="bg-white rounded-xl p-4 border-2 border-slate-200 shadow-sm">
                                  <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-bold text-slate-900">Term 3</span>
                                    <Badge
                                      variant={result.tuition_fee_balance_summary.term3.balance > 0 ? "destructive" : "default"}
                                      className={`text-xs ${result.tuition_fee_balance_summary.term3.balance === 0 ? "bg-emerald-500" : ""}`}
                                    >
                                      {result.tuition_fee_balance_summary.term3.status}
                                    </Badge>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                      <span className="text-slate-500">Amount</span>
                                      <span className="font-bold text-slate-900">{formatCurrency(result.tuition_fee_balance_summary.term3.amount)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                      <span className="text-slate-500">Paid</span>
                                      <span className="font-bold text-emerald-600">{formatCurrency(result.tuition_fee_balance_summary.term3.paid)}</span>
                                    </div>
                                    <div className="pt-2 border-t border-slate-200 flex justify-between">
                                      <span className="text-xs font-semibold text-slate-700">Balance</span>
                                      <span className={`text-sm font-bold ${result.tuition_fee_balance_summary.term3.balance > 0 ? "text-red-600" : "text-emerald-600"}`}>
                                        {formatCurrency(result.tuition_fee_balance_summary.term3.balance)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Transport Fee */}
                    {result.transport_fee_balance_summary && (
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-100">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                              <h3 className="text-base font-bold text-slate-900">Transport Fee</h3>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 ml-4">
                              <div>
                                <span className="text-slate-500">Paid:</span> <span className="font-bold text-emerald-600">{result.transport_fee_balance_summary.months_paid_count}</span> months
                              </div>
                              <span className="text-slate-300">•</span>
                              <div>
                                <span className="text-slate-500">Pending:</span> <span className="font-bold text-red-600">{result.transport_fee_balance_summary.months_pending_count}</span> months
                              </div>
                              <span className="text-slate-300">•</span>
                              <div>
                                <span className="text-slate-500">Total Paid:</span> <span className="font-bold text-slate-900">{formatCurrency(result.transport_fee_balance_summary.total_amount_paid)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <Badge
                              variant={transportBalance > 0 ? "destructive" : "default"}
                              className={`text-xs mb-2 ${transportBalance === 0 ? "bg-emerald-500" : ""}`}
                            >
                              {transportBalance > 0 ? "Outstanding" : "Paid"}
                            </Badge>
                            <p className={`text-2xl font-black ${transportBalance > 0 ? "text-red-600" : "text-emerald-600"}`}>
                              {formatCurrency(transportBalance)}
                            </p>
                          </div>
                        </div>

                        {/* Monthly Payment Breakdown */}
                        {expandedSections.fees && (
                          <div className="mt-6 pt-6 border-t-2 border-purple-200">
                            <p className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-4">Monthly Payment Breakdown</p>
                            
                            {/* Payment Period Range */}
                            {(result.transport_fee_balance_summary.first_expected_payment_month || result.transport_fee_balance_summary.last_expected_payment_month) && (
                              <div className="mb-6 p-4 bg-gradient-to-r from-slate-50 to-purple-50 rounded-xl border-2 border-slate-200">
                                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Payment Period</p>
                                <div className="flex items-center gap-3 text-sm">
                                  {result.transport_fee_balance_summary.first_expected_payment_month && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-slate-500">From:</span>
                                      <span className="font-bold text-slate-900">{formatMonth(result.transport_fee_balance_summary.first_expected_payment_month)}</span>
                                    </div>
                                  )}
                                  {result.transport_fee_balance_summary.first_expected_payment_month && result.transport_fee_balance_summary.last_expected_payment_month && (
                                    <span className="text-slate-400">→</span>
                                  )}
                                  {result.transport_fee_balance_summary.last_expected_payment_month && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-slate-500">Until:</span>
                                      <span className="font-bold text-slate-900">{formatMonth(result.transport_fee_balance_summary.last_expected_payment_month)}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            <div className="space-y-4">
                              {/* Monthly Payments */}
                              {result.transport_fee_balance_summary.monthly_payments && result.transport_fee_balance_summary.monthly_payments.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">Paid Months</p>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {result.transport_fee_balance_summary.monthly_payments.map((payment, idx) => (
                                      <div key={idx} className={`rounded-xl p-3 border-2 ${
                                        payment.payment_status === "PAID" 
                                          ? "bg-emerald-50 border-emerald-200" 
                                          : "bg-yellow-50 border-yellow-200"
                                      }`}>
                                        <div className="flex items-center justify-between mb-1">
                                          <p className="text-xs font-bold text-slate-900">{formatMonth(payment.payment_month)}</p>
                                          {payment.payment_status && (
                                            <Badge
                                              variant={payment.payment_status === "PAID" ? "default" : "secondary"}
                                              className={`text-xs h-4 px-1.5 ${payment.payment_status === "PAID" ? "bg-emerald-500" : "bg-yellow-500"}`}
                                            >
                                              {payment.payment_status}
                                            </Badge>
                                          )}
                                        </div>
                                        <p className={`text-sm font-black mb-1 ${
                                          payment.payment_status === "PAID" ? "text-emerald-700" : "text-yellow-700"
                                        }`}>
                                          {formatCurrency(payment.amount_paid)}
                                        </p>
                                        {payment.receipt_no && (
                                          <p className="text-xs text-slate-600 mt-1 font-mono">#{payment.receipt_no}</p>
                                        )}
                                        {payment.payment_created_at && (
                                          <p className="text-xs text-slate-500 mt-0.5">
                                            {formatDate(payment.payment_created_at)}
                                          </p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {/* Expected Payments */}
                              {result.transport_fee_balance_summary.expected_payments && result.transport_fee_balance_summary.expected_payments.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">Expected Payments</p>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {result.transport_fee_balance_summary.expected_payments.map((payment, idx) => (
                                      <div key={idx} className={`rounded-xl p-3 border-2 ${
                                        payment.payment_status === "PAID" 
                                          ? "bg-emerald-50 border-emerald-200" 
                                          : "bg-red-50 border-red-200"
                                      }`}>
                                        <p className="text-xs font-bold text-slate-900 mb-2">{formatMonth(payment.expected_payment_month)}</p>
                                        <Badge
                                          variant={payment.payment_status === "PAID" ? "default" : "destructive"}
                                          className={`text-xs ${payment.payment_status === "PAID" ? "bg-emerald-500" : ""}`}
                                        >
                                          {payment.payment_status}
                                        </Badge>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Payment History */}
            {receiptsCount > 0 && (
              <div className="relative">
                <div className="absolute -left-3 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-400 to-pink-600 rounded-full"></div>
                <div className="pl-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                        <Receipt className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">Payment History</h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {receiptsCount} receipt{receiptsCount !== 1 ? "s" : ""} • Total: {formatCurrency(totalReceiptsAmount)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-3 text-xs"
                      onClick={() => toggleSection("receipts")}
                    >
                      {expandedSections.receipts ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-1.5" />
                          Collapse
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-1.5" />
                          Expand
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {expandedSections.receipts && (
                    <div className="space-y-3 max-h-[600px] overflow-y-auto scrollbar-hide pr-2">
                      {result.income_receipts_list?.map((receipt) => (
                        <motion.div
                          key={receipt.income_id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="bg-white rounded-xl p-5 border-2 border-slate-200 hover:border-purple-300 hover:shadow-lg transition-all"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                  <FileText className="h-4 w-4 text-purple-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-slate-900 font-mono">{receipt.receipt_no}</p>
                                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      <span>{formatDate(receipt.payment_date)}</span>
                                    </div>
                                    <span>•</span>
                                    <div className="flex items-center gap-1">
                                      <CreditCard className="h-3 w-3" />
                                      <span>{receipt.payment_mode}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <p className="text-xl font-black text-slate-900">
                                {formatCurrency(receipt.total_amount)}
                              </p>
                            </div>
                          </div>
                          <div className="pt-4 border-t border-slate-200">
                            <p className="text-xs font-semibold text-slate-700 mb-3 uppercase tracking-wide">
                              Purpose: <span className="text-slate-900 normal-case">{receipt.purpose}</span>
                            </p>
                            {receipt.particulars && receipt.particulars.length > 0 && (
                              <div className="space-y-2">
                                {receipt.particulars.map((particular, idx) => (
                                  <div key={idx} className="flex items-center justify-between text-xs py-2 px-3 bg-slate-50 rounded-lg border border-slate-200">
                                    <span className="text-slate-700 font-medium">{particular.desc}</span>
                                    <span className="font-bold text-slate-900">
                                      {formatCurrency(particular.amount)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Status Footer */}
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-t-2 border-slate-200 px-8 py-6">
            <div className="flex items-center justify-center gap-3">
              {hasOutstandingBalance ? (
                <>
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <span className="text-sm font-bold text-red-600">Outstanding Balance Detected</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm font-bold text-emerald-600">All Fees Paid - Account in Good Standing</span>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
