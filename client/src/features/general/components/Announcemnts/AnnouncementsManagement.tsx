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
            {import.meta.env.VITE_DLT_REGISTRATION_URL && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={import.meta.env.VITE_DLT_REGISTRATION_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex items-center justify-center p-2 bg-white border border-[#E11900]/50 rounded-xl hover:border-[#E11900] transition-all h-14 w-36 overflow-hidden shadow-sm"
                  >
                    <img 
                      src={import.meta.env.VITE_DLT_LOGO || "/assets/airteldltlogo.png"} 
                      alt={import.meta.env.VITE_DLT_PORTAL_NAME || "Airtel DLT"} 
                      className="h-full w-full object-contain transition-all duration-300 transform group-hover:scale-105" 
                    />
                  </a>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs font-semibold">
                  {import.meta.env.VITE_DLT_TOOLTIP || "Go to Airtel DLT Portal"}
                </TooltipContent>
              </Tooltip>
            )}

            {import.meta.env.VITE_SMS_DASHBOARD_URL && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={import.meta.env.VITE_SMS_DASHBOARD_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex items-center justify-center p-2 bg-[#2C2C2C] border border-[#3C3C3C] rounded-xl hover:border-primary/40 transition-all h-14 w-36 overflow-hidden shadow-sm"
                  >
                    <img 
                      src={import.meta.env.VITE_SMS_PROVIDER_LOGO || "/assets/Fast2SMS.png"} 
                      alt={import.meta.env.VITE_SMS_PROVIDER_NAME || "Fast2SMS"} 
                      className="h-full w-full object-contain transition-all duration-300 transform group-hover:scale-105" 
                    />
                  </a>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs font-semibold">
                  {import.meta.env.VITE_SMS_TOOLTIP || "Go to Fast2SMS Dashboard"}
                </TooltipContent>
              </Tooltip>
            )}
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
