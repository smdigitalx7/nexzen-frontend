import { useState } from "react";
import { Database, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { useToast } from "@/common/hooks/use-toast";
import { useCacheManagement } from "@/store/cacheStore";
import { queryClient } from "@/core/query";

const DataManagementTab = () => {
  const { toast } = useToast();
  const { clear: clearCache, stats, size } = useCacheManagement();
  const [isClearing, setIsClearing] = useState(false);

  const clearBrowserCache = async () => {
    // Clear browser cache using Cache API if available
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      } catch (error) {
        console.error('Failed to clear browser cache:', error);
      }
    }

    // Clear service worker cache
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(
          registrations.map(registration => registration.unregister())
        );
      } catch (error) {
        console.error('Failed to unregister service workers:', error);
      }
    }
  };

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      // Clear React Query cache
      queryClient.clear();
      
      // Clear cache store
      clearCache();

      // Clear browser cache
      await clearBrowserCache();

      // Invalidate all queries so active views refetch fresh data
      await queryClient.invalidateQueries();

      toast({
        title: "Cache Cleared",
        description: "All cached data including browser cache has been cleared. Active data will refetch automatically.",
        variant: "success",
      });
    } catch (error) {
      console.error("Failed to clear cache:", error);
      toast({
        title: "Error",
        description: "Failed to clear cache. Please try again.",
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
          <h2 className="text-2xl font-semibold text-foreground">
            Data Management
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Backup, export, and data management
          </p>
        </div>
      </div>

      <div className="space-y-8 max-w-3xl">
        {/* Cache Statistics */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-foreground mb-1">
              Cache Statistics
            </h3>
            <p className="text-sm text-muted-foreground">
              View current cache status and statistics
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg border">
              <p className="text-sm text-muted-foreground mb-1">Cache Entries</p>
              <p className="text-2xl font-semibold">{stats.totalEntries}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border">
              <p className="text-sm text-muted-foreground mb-1">Cache Size</p>
              <p className="text-2xl font-semibold">{size}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border">
              <p className="text-sm text-muted-foreground mb-1">Hit Rate</p>
              <p className="text-2xl font-semibold">
                {(stats.hitRate * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {/* Clear Cache Section */}
        <div className="space-y-6 pt-6 border-t">
          <div>
            <h3 className="text-lg font-medium text-foreground mb-1">
              Clear Cache
            </h3>
            <p className="text-sm text-muted-foreground">
              Clear all cached API responses, application cache, and browser cache. The page will automatically reload after clearing to apply changes.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900 mb-1">
                    What gets cleared?
                  </p>
                  <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>React Query cache (API responses)</li>
                    <li>Application cache store</li>
                    <li>Browser cache (Cache API)</li>
                    <li>Service worker cache</li>
                    <li>Your login session will be preserved</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button
              onClick={handleClearCache}
              disabled={isClearing}
              variant="outline"
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {isClearing ? "Clearing..." : "Clear Cache"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataManagementTab;
