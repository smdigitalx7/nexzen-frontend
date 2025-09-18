import { useMemo, useState } from "react";
import { useBranches, useDeleteBranch } from "@/lib/hooks/useBranches";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function BranchesManagement() {
  const { data, isLoading, error } = useBranches();
  const del = useDeleteBranch();
  const { toast } = useToast();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const list = data || [];
    if (!q) return list;
    const s = q.toLowerCase();
    return list.filter((b) =>
      [b.branch_name, b.branch_type, b.branch_address || "", b.contact_email || "", b.contact_phone || ""]
        .join(" ")
        .toLowerCase()
        .includes(s)
    );
  }, [data, q]);

  const onDelete = async (id: number) => {
    try {
      await del.mutateAsync(id);
      toast({ title: "Branch deleted" });
    } catch (e: any) {
      toast({ title: "Failed to delete", description: e?.message || "", variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Branches</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 mb-4">
          <Input placeholder="Search branches..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {isLoading && <div>Loading...</div>}
        {error && <div className="text-red-600">Failed to load branches</div>}
        {!isLoading && !error && (
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-3">Name</th>
                  <th className="py-2 pr-3">Type</th>
                  <th className="py-2 pr-3">Address</th>
                  <th className="py-2 pr-3">Contact</th>
                  <th className="py-2 pr-3">Active</th>
                  <th className="py-2 pr-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.branch_id} className="border-b hover:bg-muted/30">
                    <td className="py-2 pr-3 font-medium">{b.branch_name}</td>
                    <td className="py-2 pr-3">{b.branch_type}</td>
                    <td className="py-2 pr-3">{b.branch_address || "-"}</td>
                    <td className="py-2 pr-3">{b.contact_email || b.contact_phone || "-"}</td>
                    <td className="py-2 pr-3">{b.is_active ? "Yes" : "No"}</td>
                    <td className="py-2 pr-3">
                      <div className="flex items-center gap-2 justify-end">
                        {/* Placeholder for edit */}
                        <Button variant="outline" size="sm" disabled>
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => onDelete(b.branch_id)}
                          disabled={del.isPending}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td className="py-6 text-center text-muted-foreground" colSpan={6}>
                      No branches found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


