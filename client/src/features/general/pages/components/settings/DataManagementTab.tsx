import { useState } from "react";
import { Database, Trash2, AlertTriangle, Cloud, ShieldCheck, Clock, ExternalLink, CheckCircle2 } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { useToast } from "@/common/hooks/use-toast";
import { useCacheManagement } from "@/store/cacheStore";
import { queryClient } from "@/core/query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Separator } from "@/common/components/ui/separator";

const DataManagementTab = () => {
  const { toast } = useToast();
  const { clear: clearCache } = useCacheManagement();
  const [isClearing, setIsClearing] = useState(false);

  const clearBrowserCache = async () => {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
      } catch (error) {
        console.error('Failed to clear browser cache:', error);
      }
    }

    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(registration => registration.unregister()));
      } catch (error) {
        console.error('Failed to unregister service workers:', error);
      }
    }
  };

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      // 1. Clear React Query cache
      queryClient.clear();
      
      // 2. Clear app state cache
      clearCache();

      // 3. Clear Local Storage
      localStorage.clear();
      
      // 4. Clear Session Storage
      sessionStorage.clear();

      // 5. Clear Cookies
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      }

      // 6. Clear browser cache storage
      await clearBrowserCache();

      toast({
        title: "All Data Cleared",
        description: "Cache, Storage, and Sessions have been wiped. System will reload in 2 seconds.",
      });

      // Reload to ensure all fresh states
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error("Failed to clear cache:", error);
      toast({
        title: "Error",
        description: "Failed to clear data. Please try again.",
        variant: "destructive",
      });
      setIsClearing(false);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Database className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 font-outfit">
            Data & Backup Management
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage system data, backups, and local cache
          </p>
        </div>
      </div>

      <div className="space-y-10 max-w-5xl">
        {/* Database Backup System Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-green-600" />
                Database Backup System
              </h3>
              <p className="text-sm text-slate-500">
                Automated 24/7 protection for your institutional data
              </p>
            </div>
            <Button 
                onClick={() => window.open('https://drive.google.com/drive/folders/169bNImY07pS5OitQd4F2jWk7pI8J2L8C', '_blank')}
                className="gap-2 bg-blue-600 hover:bg-blue-700 h-9"
            >
              <Cloud className="h-4 w-4" />
              Access Backups on Google Drive
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-slate-200 shadow-none bg-slate-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                  <Clock className="h-4 w-4 text-blue-500" />
                  Real-time Logging
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Every single change to your database is recorded in real-time. This allows recovery to any specific point in time if needed.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-none bg-slate-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Daily Snapshots
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Complete database snapshots are taken every night at 1:00 AM and stored securely in the cloud.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-none bg-slate-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                  <ShieldCheck className="h-4 w-4 text-purple-500" />
                  Weekly Integrity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Weekly complete backups with automated "Smoke Tests" to verify that data can be restored successfully.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100">
             <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-blue-600" />
                Point-in-Time Recovery (PITR)
             </h4>
             <p className="text-xs text-blue-800 leading-relaxed">
                Even if data is accidentally deleted at 3:47 PM, our system can restore the database to 3:46 PM by combining snapshots with real-time logs. We keep these logs for 15 days to ensure maximum safety.
             </p>
          </div>
        </section>

        <Separator />

        {/* Clear Cache Section */}
        <section className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              Local Cache Management
            </h3>
            <p className="text-sm text-slate-500">
              Clear local data if you encounter synchronization issues or want to perform a hard reset.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-start">
             <div className="flex-1 space-y-4">
                <div className="p-5 bg-red-50/50 rounded-lg border border-red-100">
                  <h4 className="text-sm font-semibold text-red-900 mb-3">⚠️ Critical reset warning</h4>
                  <ul className="text-xs text-red-800 space-y-2 list-disc list-inside opacity-90">
                    <li>This will log you out of all sessions</li>
                    <li>Wipes LocalStorage and SessionStorage</li>
                    <li>Clears all application cookies</li>
                    <li>Deletes Service Worker and Browser Cache</li>
                  </ul>
                </div>
                <Button
                  onClick={handleClearCache}
                  disabled={isClearing}
                  variant="destructive"
                  className="gap-2 h-10 px-6 font-medium"
                >
                  <Trash2 className="h-4 w-4" />
                  {isClearing ? "Wiping Data..." : "Clear All Cache & Data"}
                </Button>
             </div>

             <div className="w-full md:w-80 p-5 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="text-sm font-semibold text-slate-900 mb-4">When to use?</h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-slate-700 mb-1">Stale Data</p>
                    <p className="text-[11px] text-slate-500 leading-normal">If updates made by other users aren't showing up correctly.</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-700 mb-1">Login Issues</p>
                    <p className="text-[11px] text-slate-500 leading-normal">If you cannot switch branches or have difficulty logging in.</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-700 mb-1">Performance</p>
                    <p className="text-[11px] text-slate-500 leading-normal">To free up browser storage space and refresh app logic.</p>
                  </div>
                </div>
             </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DataManagementTab;
