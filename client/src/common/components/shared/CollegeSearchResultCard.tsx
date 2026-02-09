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
  CreditCard,
  AlertCircle,
  Hash,
} from "lucide-react";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/common/components/ui/accordion";
import { Separator } from "@/common/components/ui/separator";
import { Progress } from "@/common/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/common/components/ui/tooltip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/common/components/ui/table";
import type { CollegeFullStudentRead } from "@/features/college/types";
import { cn } from "@/common/utils";

interface CollegeSearchResultCardProps {
  result: CollegeFullStudentRead;
  onCollectFee?: () => void;
}

export function CollegeSearchResultCard({ result, onCollectFee }: CollegeSearchResultCardProps) {
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

  // Calculate payment progress
  const calculatePaymentProgress = (totalFee: number, balance: number) => {
    if (totalFee === 0) return 100;
    return Math.round(((totalFee - balance) / totalFee) * 100);
  };

  const tuitionProgress = result.tuition_fee_balance_summary
    ? calculatePaymentProgress(
        result.tuition_fee_balance_summary.total_fee,
        tuitionBalance
      )
    : 100;
  
  const transportProgress = result.transport_fee_balance_summary
    ? calculatePaymentProgress(
        result.transport_fee_balance_summary.total_amount_paid + transportBalance,
        transportBalance
      )
    : 100;

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full"
      >
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-muted/30">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-foreground">
                {studentDetails.student_name}
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {getClassDisplay()} · {studentDetails.academic_year}
              </p>
              <p className="text-xs text-muted-foreground mt-1 font-mono">
                {studentDetails.admission_no}
                {studentDetails.roll_number && ` · Roll ${studentDetails.roll_number}`}
                {studentDetails.branch_name && ` · ${studentDetails.branch_name}`}
              </p>
            </div>
            {onCollectFee && hasOutstandingBalance && (
              <Button
                onClick={onCollectFee}
                size="sm"
                className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <CreditCard className="h-4 w-4 mr-1.5" />
                Collect Fee
              </Button>
            )}
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <span className="text-muted-foreground">Outstanding</span>
            <span className={cn(
              "font-semibold",
              hasOutstandingBalance ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
            )}>
              {formatCurrency(totalBalance)}
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">Tuition</span>
            <span className={cn(
              "font-medium",
              tuitionBalance > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
            )}>
              {formatCurrency(tuitionBalance)}
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">Transport</span>
            <span className={cn(
              "font-medium",
              transportBalance > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
            )}>
              {formatCurrency(transportBalance)}
            </span>
          </div>

            {result.transport_assignment && (
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bus className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold text-foreground">Transport</span>
                  </div>
                  {result.transport_assignment.is_active !== null && (
                    <Badge
                      variant={result.transport_assignment.is_active ? "default" : "secondary"}
                      className={cn(
                        "text-xs",
                        result.transport_assignment.is_active && "bg-emerald-600 hover:bg-emerald-700"
                      )}
                    >
                      {result.transport_assignment.is_active ? "Active" : "Inactive"}
                    </Badge>
                  )}
                </div>
                <div className="p-4">
                  {(result.transport_assignment.start_date || result.transport_assignment.end_date) && (
                    <p className="text-xs text-muted-foreground mb-3">
                      {formatDate(result.transport_assignment.start_date || "")}
                      {result.transport_assignment.end_date && ` – ${formatDate(result.transport_assignment.end_date)}`}
                    </p>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {result.transport_assignment.route_name && (
                      <div>
                        <p className="text-xs text-muted-foreground">Route</p>
                        <p className="text-sm font-medium text-foreground">
                          {result.transport_assignment.route_name}
                          {result.transport_assignment.route_no && ` #${result.transport_assignment.route_no}`}
                        </p>
                      </div>
                    )}
                    {result.transport_assignment.vehicle_number && (
                      <div>
                        <p className="text-xs text-muted-foreground">Vehicle</p>
                        <p className="text-sm font-medium text-foreground font-mono">{result.transport_assignment.vehicle_number}</p>
                      </div>
                    )}
                    {result.transport_assignment.pickup_point && (
                      <div>
                        <p className="text-xs text-muted-foreground">Pickup</p>
                        <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          {result.transport_assignment.pickup_point}
                        </p>
                      </div>
                    )}
                    {result.transport_assignment.slab_name && (
                      <div>
                        <p className="text-xs text-muted-foreground">Distance</p>
                        <p className="text-sm font-medium text-foreground">{result.transport_assignment.slab_name}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {(result.tuition_fee_balance_summary || result.transport_fee_balance_summary) && (
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="fee-summary" className="border-0">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/30 [&[data-state=open]]:bg-muted/30">
                      <div className="flex items-center gap-3 text-left">
                        <span className="text-lg font-semibold text-foreground">₹</span>
                        <div>
                          <span className="text-sm font-semibold text-foreground">Fee summary</span>
                          <p className="text-xs text-muted-foreground mt-0.5">Breakdown and payment status</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-6 pt-6">
                          {/* Tuition Fee */}
                          {result.tuition_fee_balance_summary && (
                            <div className="bg-gradient-to-br from-blue-50/80 via-indigo-50/80 to-blue-50/80 rounded-2xl p-7 border-2 border-blue-200/60 shadow-lg hover:shadow-xl transition-shadow">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-3">
                                    <div className="w-3 h-3 bg-blue-600 rounded-full shadow-md ring-2 ring-blue-200"></div>
                                    <h3 className="text-lg font-bold text-slate-900">Tuition Fee</h3>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 ml-6">
                                    <div className="bg-white/60 rounded-lg p-3 border border-blue-100/50">
                                      <p className="text-xs font-semibold text-slate-500 mb-1">Group Fee</p>
                                      <p className="text-sm font-bold text-slate-900">{formatCurrency(result.tuition_fee_balance_summary.group_fee)}</p>
                                    </div>
                                    <div className="bg-white/60 rounded-lg p-3 border border-blue-100/50">
                                      <p className="text-xs font-semibold text-slate-500 mb-1">Course Fee</p>
                                      <p className="text-sm font-bold text-slate-900">{formatCurrency(result.tuition_fee_balance_summary.course_fee)}</p>
                                    </div>
                                    <div className="bg-white/60 rounded-lg p-3 border border-blue-100/50">
                                      <p className="text-xs font-semibold text-slate-500 mb-1">Actual Fee</p>
                                      <p className="text-sm font-bold text-slate-900">{formatCurrency(result.tuition_fee_balance_summary.actual_fee)}</p>
                                    </div>
                                    {result.tuition_fee_balance_summary.concession_amount > 0 && (
                                      <div className="bg-white/60 rounded-lg p-3 border border-emerald-100/50">
                                        <p className="text-xs font-semibold text-slate-500 mb-1">Concession</p>
                                        <p className="text-sm font-bold text-emerald-600">{formatCurrency(result.tuition_fee_balance_summary.concession_amount)}</p>
                                      </div>
                                    )}
                                    <div className="bg-white/60 rounded-lg p-3 border border-blue-100/50">
                                      <p className="text-xs font-semibold text-slate-500 mb-1">Total Fee</p>
                                      <p className="text-sm font-bold text-slate-900">{formatCurrency(result.tuition_fee_balance_summary.total_fee)}</p>
                                    </div>
                                  </div>
                                  <div className="mt-4 ml-6">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-xs font-semibold text-slate-600">Payment Progress</span>
                                      <span className="text-xs font-bold text-slate-700">{tuitionProgress}%</span>
                                    </div>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="w-full">
                                          <Progress value={tuitionProgress} className="h-2.5 bg-blue-100" />
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="font-semibold">{tuitionProgress}% paid</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>
                                </div>
                                <div className="text-right ml-4">
                                  <Badge
                                    variant={tuitionBalance > 0 ? "destructive" : "default"}
                                    className={`text-xs mb-3 px-3 py-1.5 font-semibold shadow-sm ${tuitionBalance === 0 ? "bg-emerald-500 hover:bg-emerald-600 text-white" : ""}`}
                                  >
                                    {tuitionBalance > 0 ? "Outstanding" : "Paid"}
                                  </Badge>
                                  <p className={`text-3xl font-extrabold ${tuitionBalance > 0 ? "text-red-600" : "text-emerald-600"}`}>
                                    {formatCurrency(tuitionBalance)}
                                  </p>
                                </div>
                              </div>

                              {/* Book Fee */}
                              {result.tuition_fee_balance_summary.book_fee > 0 && (
                                <>
                                  <Separator className="my-4 bg-slate-200/60" />
                                  <div className="pt-4">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Book Fee</p>
                                        <p className="text-sm text-slate-700">
                                          {formatCurrency(result.tuition_fee_balance_summary.book_fee)} <span className="text-slate-500">(Paid: {formatCurrency(result.tuition_fee_balance_summary.book_paid)})</span>
                                        </p>
                                      </div>
                                      <Badge
                                        variant={result.tuition_fee_balance_summary.book_paid_status === "PAID" ? "default" : "destructive"}
                                        className={`text-xs px-2.5 py-1 font-semibold shadow-sm ${result.tuition_fee_balance_summary.book_paid_status === "PAID" ? "bg-emerald-500 hover:bg-emerald-600 text-white" : ""}`}
                                      >
                                        {result.tuition_fee_balance_summary.book_paid_status === "PAID" ? "Paid" : "Pending"}
                                      </Badge>
                                    </div>
                                  </div>
                                </>
                              )}

                              {/* Term-wise Breakdown */}
                              <div className="mt-8 pt-6 border-t-2 border-blue-200/60">
                                <p className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-4">Term-wise Breakdown</p>
                                <Table>
                                  <TableHeader>
                                    <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                                      <TableHead className="font-semibold text-slate-700">Term</TableHead>
                                      <TableHead className="font-semibold text-slate-700 text-right">Amount</TableHead>
                                      <TableHead className="font-semibold text-slate-700 text-right">Paid</TableHead>
                                      <TableHead className="font-semibold text-slate-700 text-right">Balance</TableHead>
                                      <TableHead className="font-semibold text-slate-700 text-center">Status</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {result.tuition_fee_balance_summary.term1 && (
                                      <TableRow>
                                        <TableCell className="font-semibold text-slate-900">Term 1</TableCell>
                                        <TableCell className="text-right font-bold text-slate-900">{formatCurrency(result.tuition_fee_balance_summary.term1.amount)}</TableCell>
                                        <TableCell className="text-right font-bold text-emerald-600">{formatCurrency(result.tuition_fee_balance_summary.term1.paid)}</TableCell>
                                        <TableCell className={cn(
                                          "text-right font-bold",
                                          result.tuition_fee_balance_summary.term1.balance > 0 ? "text-red-600" : "text-emerald-600"
                                        )}>
                                          {formatCurrency(result.tuition_fee_balance_summary.term1.balance)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                          <Badge
                                            variant={result.tuition_fee_balance_summary.term1.balance > 0 ? "destructive" : "default"}
                                            className={`text-xs px-2 py-1 ${result.tuition_fee_balance_summary.term1.balance === 0 ? "bg-emerald-500 hover:bg-emerald-600 text-white" : ""}`}
                                          >
                                            {result.tuition_fee_balance_summary.term1.status}
                                          </Badge>
                                        </TableCell>
                                      </TableRow>
                                    )}
                                    {result.tuition_fee_balance_summary.term2 && (
                                      <TableRow>
                                        <TableCell className="font-semibold text-slate-900">Term 2</TableCell>
                                        <TableCell className="text-right font-bold text-slate-900">{formatCurrency(result.tuition_fee_balance_summary.term2.amount)}</TableCell>
                                        <TableCell className="text-right font-bold text-emerald-600">{formatCurrency(result.tuition_fee_balance_summary.term2.paid)}</TableCell>
                                        <TableCell className={cn(
                                          "text-right font-bold",
                                          result.tuition_fee_balance_summary.term2.balance > 0 ? "text-red-600" : "text-emerald-600"
                                        )}>
                                          {formatCurrency(result.tuition_fee_balance_summary.term2.balance)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                          <Badge
                                            variant={result.tuition_fee_balance_summary.term2.balance > 0 ? "destructive" : "default"}
                                            className={`text-xs px-2 py-1 ${result.tuition_fee_balance_summary.term2.balance === 0 ? "bg-emerald-500 hover:bg-emerald-600 text-white" : ""}`}
                                          >
                                            {result.tuition_fee_balance_summary.term2.status}
                                          </Badge>
                                        </TableCell>
                                      </TableRow>
                                    )}
                                    {result.tuition_fee_balance_summary.term3 && (
                                      <TableRow>
                                        <TableCell className="font-semibold text-slate-900">Term 3</TableCell>
                                        <TableCell className="text-right font-bold text-slate-900">{formatCurrency(result.tuition_fee_balance_summary.term3.amount)}</TableCell>
                                        <TableCell className="text-right font-bold text-emerald-600">{formatCurrency(result.tuition_fee_balance_summary.term3.paid)}</TableCell>
                                        <TableCell className={cn(
                                          "text-right font-bold",
                                          result.tuition_fee_balance_summary.term3.balance > 0 ? "text-red-600" : "text-emerald-600"
                                        )}>
                                          {formatCurrency(result.tuition_fee_balance_summary.term3.balance)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                          <Badge
                                            variant={result.tuition_fee_balance_summary.term3.balance > 0 ? "destructive" : "default"}
                                            className={`text-xs px-2 py-1 ${result.tuition_fee_balance_summary.term3.balance === 0 ? "bg-emerald-500 hover:bg-emerald-600 text-white" : ""}`}
                                          >
                                            {result.tuition_fee_balance_summary.term3.status}
                                          </Badge>
                                        </TableCell>
                                      </TableRow>
                                    )}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          )}

                          {/* Transport Fee */}
                          {result.transport_fee_balance_summary && (
                            <div className="bg-gradient-to-br from-purple-50/80 via-pink-50/80 to-purple-50/80 rounded-2xl p-7 border-2 border-purple-200/60 shadow-lg hover:shadow-xl transition-shadow">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-3">
                                    <div className="w-3 h-3 bg-purple-600 rounded-full shadow-md ring-2 ring-purple-200"></div>
                                    <h3 className="text-lg font-bold text-slate-900">Transport Fee</h3>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 ml-6">
                                    <div className="bg-white/60 rounded-lg p-3 border border-purple-100/50">
                                      <p className="text-xs font-semibold text-slate-500 mb-1">Paid Months</p>
                                      <p className="text-sm font-bold text-emerald-600">{result.transport_fee_balance_summary.months_paid_count}</p>
                                    </div>
                                    <div className="bg-white/60 rounded-lg p-3 border border-red-100/50">
                                      <p className="text-xs font-semibold text-slate-500 mb-1">Pending Months</p>
                                      <p className="text-sm font-bold text-red-600">{result.transport_fee_balance_summary.months_pending_count}</p>
                                    </div>
                                    <div className="bg-white/60 rounded-lg p-3 border border-purple-100/50">
                                      <p className="text-xs font-semibold text-slate-500 mb-1">Total Paid</p>
                                      <p className="text-sm font-bold text-slate-900">{formatCurrency(result.transport_fee_balance_summary.total_amount_paid)}</p>
                                    </div>
                                  </div>
                                  <div className="mt-4 ml-6">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-xs font-semibold text-slate-600">Payment Progress</span>
                                      <span className="text-xs font-bold text-slate-700">{transportProgress}%</span>
                                    </div>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="w-full">
                                          <Progress value={transportProgress} className="h-2.5 bg-purple-100" />
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="font-semibold">{transportProgress}% paid</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>
                                </div>
                                <div className="text-right ml-4">
                                  <Badge
                                    variant={transportBalance > 0 ? "destructive" : "default"}
                                    className={`text-xs mb-3 px-3 py-1.5 font-semibold shadow-sm ${transportBalance === 0 ? "bg-emerald-500 hover:bg-emerald-600 text-white" : ""}`}
                                  >
                                    {transportBalance > 0 ? "Outstanding" : "Paid"}
                                  </Badge>
                                  <p className={`text-3xl font-extrabold ${transportBalance > 0 ? "text-red-600" : "text-emerald-600"}`}>
                                    {formatCurrency(transportBalance)}
                                  </p>
                                </div>
                              </div>

                              {/* Monthly Payment Breakdown */}
                              <div className="mt-8 pt-6 border-t-2 border-purple-200/60">
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
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
              </div>
            )}

            {receiptsCount > 0 && (
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="payment-history" className="border-0">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/30 [&[data-state=open]]:bg-muted/30">
                      <div className="flex items-center gap-3 text-left">
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <span className="text-sm font-semibold text-foreground">Payment history</span>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {receiptsCount} receipt{receiptsCount !== 1 ? "s" : ""} · {formatCurrency(totalReceiptsAmount)}
                          </p>
                        </div>
                      </div>
                    </AccordionTrigger>
                      <AccordionContent>
                        <div className="pt-4">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                                <TableHead className="font-semibold text-slate-700">Receipt No</TableHead>
                                <TableHead className="font-semibold text-slate-700">Date</TableHead>
                                <TableHead className="font-semibold text-slate-700">Payment Mode</TableHead>
                                <TableHead className="font-semibold text-slate-700">Purpose</TableHead>
                                <TableHead className="font-semibold text-slate-700 text-right">Amount</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {result.income_receipts_list?.map((receipt) => (
                                <TableRow key={receipt.income_id} className="hover:bg-slate-50/50">
                                  <TableCell className="font-mono font-semibold text-slate-900">
                                    {receipt.receipt_no}
                                  </TableCell>
                                  <TableCell className="text-slate-600">
                                    <div className="flex items-center gap-2">
                                      <Calendar className="h-4 w-4 text-slate-400" />
                                      <span>{formatDate(receipt.payment_date)}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-slate-600">
                                    <div className="flex items-center gap-2">
                                      <CreditCard className="h-4 w-4 text-slate-400" />
                                      <span>{receipt.payment_mode}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-slate-700">
                                    {receipt.purpose}
                                  </TableCell>
                                  <TableCell className="text-right font-bold text-slate-900">
                                    {formatCurrency(receipt.total_amount)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
              </div>
            )}
          </div>

          <div className="px-5 py-3 border-t border-border bg-muted/20 flex items-center justify-center gap-2 text-sm">
            {hasOutstandingBalance ? (
              <>
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="font-medium text-red-600 dark:text-red-400">Outstanding balance</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span className="font-medium text-emerald-600 dark:text-emerald-400">All fees paid</span>
              </>
            )}
          </div>
      </div>
      </motion.div>
    </TooltipProvider>
  );
}
