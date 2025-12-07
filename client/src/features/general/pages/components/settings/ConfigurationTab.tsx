import { Settings } from "lucide-react";
import LogoManagementTab from "@/features/general/components/configurations/LogoManagementTab";
import MonthlyFeeConfigTab from "@/features/college/components/config/MonthlyFeeConfigTab";
import { useAuthStore } from "@/core/auth/authStore";

const ConfigurationTab = () => {
  const { currentBranch } = useAuthStore();
  const isCollege = currentBranch?.branch_type === "COLLEGE";

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Settings className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-foreground">
            Configuration
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            System configuration and settings
          </p>
        </div>
      </div>

      <div className="space-y-8 max-w-4xl">
        {/* Logo Management */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-foreground mb-1">
              Logo Management
            </h3>
            <p className="text-sm text-muted-foreground">
              Manage your institution's logo settings
            </p>
          </div>
          <div className="border rounded-lg p-6">
            <LogoManagementTab />
          </div>
        </div>

        {/* Monthly Fee Config - Only for College */}
        {isCollege && (
          <div className="space-y-4 pt-6 border-t">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-1">
                Monthly Fee Configuration
              </h3>
              <p className="text-sm text-muted-foreground">
                Configure monthly fee settings for college branches
              </p>
            </div>
            <div className="border rounded-lg p-6">
              <MonthlyFeeConfigTab />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfigurationTab;

