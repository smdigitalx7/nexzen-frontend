import { motion } from "framer-motion";
import SMSManagement from "./SMS/SMSManagement";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/common/components/ui/tooltip";

const AnnouncementsManagement = () => {
  return (
    <div className="space-y-6 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SMS Hub</h1>
          <p className="text-muted-foreground">
            Manage your DLT-compliant SMS communications and templates.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href="https://www.airtel.in/business/commercial-communication/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex items-center justify-center p-2 bg-white border border-[#E11900]/50 rounded-xl hover:border-[#E11900] transition-all h-14 w-36 overflow-hidden shadow-sm"
                >
                  <img 
                    src="/assets/airteldltlogo.png" 
                    alt="Airtel DLT" 
                    className="h-full w-full object-contain transition-all duration-300 transform group-hover:scale-105" 
                  />
                </a>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs font-semibold">
                Go to Airtel DLT Portal
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href="https://www.fast2sms.com/dashboard/dlt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex items-center justify-center p-2 bg-[#2C2C2C] border border-[#3C3C3C] rounded-xl hover:border-primary/40 transition-all h-14 w-36 overflow-hidden shadow-sm"
                >
                  <img 
                    src="/assets/Fast2SMS.png" 
                    alt="Fast2SMS" 
                    className="h-full w-full object-contain transition-all duration-300 transform group-hover:scale-105" 
                  />
                </a>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs font-semibold">
                Go to Fast2SMS Dashboard
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <SMSManagement />
      </motion.div>
    </div>
  );
};

export default AnnouncementsManagement;
