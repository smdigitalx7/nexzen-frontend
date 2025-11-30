import { Users, GraduationCap, BookOpen, Building2 } from "lucide-react";
import { useLocation } from "wouter";

interface DashboardOverviewProps {
  data: {
    total_students: number;
    total_teachers: number;
    total_classes: number;
    total_branches: number;
  };
}

export const DashboardOverview = ({ data }: DashboardOverviewProps) => {
  const [, setLocation] = useLocation();

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-blue-100/50 shadow-sm">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDYwIDAgTCAwIDAgMCA2MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZTVlN2ViIiBzdHJva2Utd2lkdGg9IjEiIG9wYWNpdHk9IjAuMyIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40"></div>
      <div className="relative px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">
              Institutional Overview
            </h2>
            <p className="text-sm text-slate-600">Key metrics at a glance</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-white/60 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
            onClick={() => setLocation("/school/admissions")}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                  Students
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {data.total_students.toLocaleString()}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Across all branches
            </p>
          </div>

          <div
            className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-white/60 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
            onClick={() => setLocation("/employees")}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-purple-100 group-hover:bg-purple-200 transition-colors">
                <GraduationCap className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                  Teachers
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {data.total_teachers.toLocaleString()}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500 font-medium">Teaching staff</p>
          </div>

          <div
            className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-white/60 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
            onClick={() => setLocation("/school/academic")}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-indigo-100 group-hover:bg-indigo-200 transition-colors">
                <BookOpen className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                  Classes
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {data.total_classes.toLocaleString()}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500 font-medium">Active classes</p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-white/60 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-teal-100 group-hover:bg-teal-200 transition-colors">
                <Building2 className="h-5 w-5 text-teal-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                  Branches
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {data.total_branches.toLocaleString()}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Institute branches
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
