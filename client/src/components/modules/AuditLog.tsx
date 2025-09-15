import { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Filter } from "lucide-react";

const mockAudit = [
  {
    id: 1,
    user: "admin@nexzen.edu",
    role: "institute_admin",
    module: "fees",
    action: "CREATE",
    timestamp: "2025-09-10T10:22:00Z",
    remarks: "Added term fee",
  },
  {
    id: 2,
    user: "accountant@nexzen.edu",
    role: "accountant",
    module: "admissions",
    action: "UPDATE",
    timestamp: "2025-09-11T09:10:00Z",
    remarks: "Locked fee",
  },
  {
    id: 3,
    user: "academic@nexzen.edu",
    role: "academic",
    module: "attendance",
    action: "UPLOAD",
    timestamp: "2025-09-12T08:05:00Z",
    remarks: "CSV uploaded",
  },
];

export default function AuditLog() {
  const [search, setSearch] = useState("");
  const [module, setModule] = useState("all");
  const [role, setRole] = useState("all");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const filtered = mockAudit.filter((r) => {
    const q = search.toLowerCase();
    const matchesSearch =
      r.user.toLowerCase().includes(q) || r.remarks.toLowerCase().includes(q);
    const matchesModule = module === "all" || r.module === module;
    const matchesRole = role === "all" || r.role === role;
    const inDate = (() => {
      if (!start && !end) return true;
      const t = new Date(r.timestamp).getTime();
      const s = start ? new Date(start).getTime() : -Infinity;
      const e = end ? new Date(end).getTime() : Infinity;
      return t >= s && t <= e;
    })();
    return matchesSearch && matchesModule && matchesRole && inDate;
  });

  const exportCSV = () => {
    const rows = [
      ["User", "Role", "Module", "Action", "Timestamp", "Remarks"],
      ...filtered.map((r) => [
        r.user,
        r.role,
        r.module,
        r.action,
        r.timestamp,
        r.remarks,
      ]),
    ];
    const csv = rows
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit_log_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Log</h1>
          <p className="text-muted-foreground">
            Immutable record of user actions
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={exportCSV}>
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </motion.div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-3 md:grid-cols-5">
            <Input
              placeholder="Search user/remarks"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select value={module} onValueChange={setModule}>
              <SelectTrigger>
                <SelectValue placeholder="Module" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                <SelectItem value="fees">Fees</SelectItem>
                <SelectItem value="admissions">Admissions</SelectItem>
                <SelectItem value="attendance">Attendance</SelectItem>
                <SelectItem value="transport">Transport</SelectItem>
              </SelectContent>
            </Select>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="institute_admin">Admin</SelectItem>
                <SelectItem value="accountant">Accountant</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
            <Input
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Entries</CardTitle>
          <CardDescription>{filtered.length} records</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.user}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {r.role.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>{r.module}</TableCell>
                  <TableCell>{r.action}</TableCell>
                  <TableCell>
                    {new Date(r.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {r.remarks}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
