import { useState } from "react";
import { useSMSAnalytics, useSMSSummary, useSMSWallet } from "@/features/general/hooks/useSMS";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/common/components/ui/card";
import { Button } from "@/common/components/ui/button";
import { Loader } from "@/common/components/ui/ProfessionalLoader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/common/components/ui/table";
import { Badge } from "@/common/components/ui/badge";
import { DatePicker } from "@/common/components/ui/date-picker";
import { Label } from "@/common/components/ui/label";
import { Wallet, Send, CheckCircle2, Clock, AlertTriangle, ShieldCheck, Download, Filter, ExternalLink } from "lucide-react";
import { format, subDays, differenceInDays } from "date-fns";
import { motion } from "framer-motion";
import { useToast } from "@/common/hooks/use-toast";

const SMSReports = () => {
  const { toast } = useToast();
  
  // State for date ranges
  const [summaryRange, setSummaryRange] = useState({
    from_date: format(subDays(new Date(), 29), "yyyy-MM-dd"), // 30 days total (e.g. 01 to 30)
    to_date: format(new Date(), "yyyy-MM-dd"),
  });

  const [analyticsRange, setAnalyticsRange] = useState({
    from_date: format(subDays(new Date(), 2), "yyyy-MM-dd"), // 2 days ago (e.g. 28th to 30th)
    to_date: format(new Date(), "yyyy-MM-dd"),
  });

  const { data: summaryResp, isLoading: isSummaryLoading, refetch: refetchSummary } = useSMSSummary(summaryRange);
  const { data: analyticsResp, isLoading: isAnalyticsLoading, refetch: refetchAnalytics } = useSMSAnalytics(analyticsRange);
  const { data: walletResp, isLoading: isWalletLoading } = useSMSWallet();

  const handleFetchSummary = () => {
    const diff = differenceInDays(new Date(summaryRange.to_date), new Date(summaryRange.from_date));
    if (diff > 30) {
      toast({
        title: "Invalid Range",
        description: "You can fetch only 30 days of summary at a time.",
        variant: "destructive",
      });
      return;
    }
    refetchSummary();
  };

  const handleFetchAnalytics = () => {
    const diff = differenceInDays(new Date(analyticsRange.to_date), new Date(analyticsRange.from_date));
    if (diff > 3) {
      toast({
        title: "Invalid Range",
        description: "You can fetch only 3 days of analytics logs at a time.",
        variant: "destructive",
      });
      return;
    }
    refetchAnalytics();
  };

  const exportToExcel = async () => {
    if (!analyticsResp?.data || analyticsResp.data.length === 0) {
      toast({ title: "No Data", description: "No records found to export.", variant: "destructive" });
      return;
    }

    const ExcelJSImport: any = await import("exceljs");
    const ExcelJS = ExcelJSImport?.default ?? ExcelJSImport;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("SMS Usage Logs");

    worksheet.columns = [
      { header: "Request ID", key: "request_id", width: 25 },
      { header: "Mobile", key: "mobile", width: 15 },
      { header: "Status", key: "status", width: 15 },
      { header: "Description", key: "desc", width: 30 },
      { header: "Cost (₹)", key: "cost", width: 10 },
      { header: "Time", key: "time", width: 20 },
    ];

    analyticsResp.data.forEach((report: any) => {
      report.delivery_status?.forEach((item: any) => {
        worksheet.addRow({
          request_id: report.request_id,
          mobile: item.mobile,
          status: item.status,
          desc: item.status_description,
          cost: parseFloat(item.amount_debited),
          time: item.sent_timestamp 
            ? format(new Date(item.sent_timestamp * 1000), "yyyy-MM-dd HH:mm:ss") 
            : item.sent_time,
        });
      });
    });

    // Formatting
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEEEEEE" } };

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SMS_Logs_${analyticsRange.from_date}_to_${analyticsRange.to_date}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({ title: "Export Success", description: "Usage logs exported to Excel.", variant: "success" });
  };

  const statusColors: Record<string, string> = {
    DELIVERED: "bg-green-100 text-green-800 border-green-200",
    FAILED: "bg-red-100 text-red-800 border-red-200",
    PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
    BLOCKED: "bg-slate-100 text-slate-800 border-slate-200",
  };

  const SummaryCard = ({ title, value, icon: Icon, colorClass, subtitle }: any) => (
    <Card className="overflow-hidden border-none shadow-sm bg-white h-24 px-2 py-2">
      <CardContent className="p-4 flex flex-col justify-center h-full">
        <div className="flex justify-between items-center h-full">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</p>
            <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
            {subtitle && <p className="text-[10px] text-muted-foreground leading-none">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-xl ${colorClass}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-5">
      {/* Wallet Balance Widget - Scaled Up */}
      <div className="flex justify-between items-center py-2">
        <div>
           <h2 className="text-2xl font-bold tracking-tight">SMS Analytics</h2>
           <p className="text-sm text-muted-foreground">Monitor performance and logs.</p>
        </div>
        
        <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-2 flex items-center gap-6 shadow-sm">
          <div className="hidden sm:flex bg-primary/10 p-2 rounded-full text-primary">
            <Wallet className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70">Wallet Balance</p>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold">₹{walletResp?.wallet || "0.00"}</span>
              <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                ~{walletResp?.sms_count || 0} SMS
              </span>
            </div>
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            className="h-9 text-xs border-primary/20 hover:bg-primary/10 px-3 font-semibold"
            onClick={() => window.open("https://www.fast2sms.com/dashboard/wallet", "_blank")}
          >
            Top Up <ExternalLink className="h-3 w-3 ml-2" />
          </Button>
        </div>
      </div>

      {/* Summary Filter - Better Font and Layout */}
      <Card className="border-none shadow-sm overflow-hidden bg-white/50">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-end gap-4">
            <div className="grid grid-cols-2 gap-4 flex-1">
               <div className="space-y-1.5 text-xs">
                 <Label className="font-semibold ml-1">From Date</Label>
                 <DatePicker 
                   value={summaryRange.from_date} 
                   onChange={(val) => setSummaryRange({ ...summaryRange, from_date: val })}
                   className="h-9"
                 />
               </div>
               <div className="space-y-1.5 text-xs">
                 <Label className="font-semibold ml-1">To Date</Label>
                 <DatePicker 
                   value={summaryRange.to_date} 
                   onChange={(val) => setSummaryRange({ ...summaryRange, to_date: val })}
                   className="h-9"
                 />
               </div>
            </div>
            <Button size="sm" onClick={handleFetchSummary} className="h-9 gap-2 px-6 text-xs font-bold uppercase tracking-wide">
               <Filter className="h-4 w-4" /> Apply Filter
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground px-1 pt-2">Maximum 30 days range supported by the provider.</p>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {isSummaryLoading ? (
           Array(4).fill(0).map((_, i) => (
              <Card key={i} className="h-28 animate-pulse bg-muted/20 border-none" />
           ))
         ) : (
           <>
             <SummaryCard 
               title="Total Sent" 
               value={summaryResp?.data?.sent || 0} 
               icon={Send} 
               colorClass="bg-blue-100 text-blue-600"
             />
             <SummaryCard 
               title="Delivered" 
               value={summaryResp?.data?.delivered || 0} 
               icon={CheckCircle2} 
               colorClass="bg-green-100 text-green-600"
             />
             <SummaryCard 
               title="Failed" 
               value={summaryResp?.data?.failed || 0} 
               icon={AlertTriangle} 
               colorClass="bg-red-100 text-red-800"
             />
             <SummaryCard 
               title="Other Status" 
               value={(summaryResp?.data?.pending || 0) + (summaryResp?.data?.blocked || 0)} 
               subtitle={`${summaryResp?.data?.pending || 0} Pending, ${summaryResp?.data?.blocked || 0} Blocked`}
               icon={ShieldCheck} 
               colorClass="bg-slate-100 text-slate-600"
             />
           </>
         )}
      </div>

      {/* Analytics Results Table - Enhanced Font Sizes */}
      <Card className="border-none shadow-sm overflow-hidden bg-white">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 p-5 border-b">
           <div className="space-y-1">
             <CardTitle className="text-base font-bold uppercase tracking-tight">Transaction Logs</CardTitle>
             <CardDescription className="text-xs">Detailed logs (Max 3 days range).</CardDescription>
           </div>
           <div className="flex items-center gap-3">
              <div className="flex items-center bg-muted/30 p-1.5 rounded-xl gap-2 border border-muted">
                 <DatePicker 
                   value={analyticsRange.from_date} 
                   onChange={(val) => {
                     setAnalyticsRange({ ...analyticsRange, from_date: val });
                   }}
                   className="h-8 w-[160px] text-[11px] border-none shadow-none bg-transparent hover:bg-white"
                 />
                 <span className="text-muted-foreground text-sm px-1 font-bold">~</span>
                 <DatePicker 
                   value={analyticsRange.to_date} 
                   onChange={(val) => {
                     setAnalyticsRange({ ...analyticsRange, to_date: val });
                   }}
                   className="h-8 w-[160px] text-[11px] border-none shadow-none bg-transparent hover:bg-white"
                 />
              </div>
              <Button size="sm" onClick={handleFetchAnalytics} className="h-9 px-4 text-xs font-bold uppercase tracking-wide">
                Apply Logs
              </Button>
              <Button variant="outline" size="sm" onClick={exportToExcel} className="h-9 gap-2 text-xs border-dashed font-bold hover:bg-green-50 hover:text-green-700 hover:border-green-200">
                <Download className="h-4 w-4" /> Export Excel
              </Button>
           </div>
        </CardHeader>
        <CardContent className="p-0">
           {isAnalyticsLoading ? (
             <div className="py-24">
               <Loader.Data message="Fetching detailed logs..." />
             </div>
           ) : (
             <div className="overflow-x-auto">
               <Table>
                 <TableHeader className="bg-muted/30">
                   <TableRow className="hover:bg-transparent border-none">
                     <TableHead className="text-xs uppercase font-extrabold tracking-wider pl-6 h-11">Request ID</TableHead>
                     <TableHead className="text-xs uppercase font-extrabold tracking-wider h-11">Recipient</TableHead>
                     <TableHead className="text-xs uppercase font-extrabold tracking-wider h-11">Status</TableHead>
                     <TableHead className="text-xs uppercase font-extrabold tracking-wider text-right h-11">Debit</TableHead>
                     <TableHead className="text-xs uppercase font-extrabold tracking-wider text-right pr-6 h-11">Sent Time</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {analyticsResp?.data?.map((report: any) => (
                     report.delivery_status?.map((item: any, idx: number) => (
                        <TableRow key={`${report.request_id}-${idx}`} className="text-sm border-muted/50 hover:bg-muted/5 transition-colors h-14">
                          <TableCell className="font-mono text-xs text-muted-foreground pl-6">{report.request_id}</TableCell>
                          <TableCell className="font-semibold text-sm tracking-tight">{item.mobile}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`text-xs py-0.5 px-2 font-semibold shadow-none whitespace-nowrap ${statusColors[(item.status || "").toUpperCase()] || ""}`}>
                              {item.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono font-extrabold text-primary text-base">₹{item.amount_debited}</TableCell>
                          <TableCell className="text-right text-muted-foreground font-semibold pr-6 text-sm">
                            {item.sent_timestamp ? (
                               format(new Date(item.sent_timestamp * 1000), "MMM d, HH:mm")
                            ) : item.sent_time ? (
                               item.sent_time
                            ) : "N/A"}
                          </TableCell>
                        </TableRow>
                     ))
                   ))}
                   {(!analyticsResp?.data || analyticsResp.data.length === 0) && (
                     <TableRow>
                       <TableCell colSpan={5} className="text-center py-24 text-muted-foreground italic">
                         <div className="flex flex-col items-center gap-3 opacity-60">
                            <Clock className="h-10 w-10 text-muted-foreground/30" />
                            <p className="text-base font-medium">No analytics logs found for this period.</p>
                         </div>
                       </TableCell>
                     </TableRow>
                   )}
                 </TableBody>
               </Table>
             </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SMSReports;
