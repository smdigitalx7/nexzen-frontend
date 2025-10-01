import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SectionMappingTabProps {
  backendClasses: any[];
  selectedClass: string;
  setSelectedClass: (classId: string) => void;
  selectedSection: string;
  setSelectedSection: (section: string) => void;
}

export const SectionMappingTab = ({
  backendClasses,
  selectedClass,
  setSelectedClass,
  selectedSection,
  setSelectedSection,
}: SectionMappingTabProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {backendClasses.map((c) => (
              <SelectItem key={c.class_id} value={c.class_name}>
                {c.class_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={selectedSection}
          onValueChange={setSelectedSection}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Section" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="A">A</SelectItem>
            <SelectItem value="B">B</SelectItem>
            <SelectItem value="C">C</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">Apply Filters</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bulk Section Mapping</CardTitle>
          <CardDescription>
            Assign or change sections mid-year
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-3">
            <Button variant="outline">Assign Selected to A</Button>
            <Button variant="outline">Assign Selected to B</Button>
            <Button variant="outline">Assign Selected to C</Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Current Section</TableHead>
                <TableHead>Change To</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { id: 1, name: "Student 1" },
                { id: 2, name: "Student 2" },
                { id: 3, name: "Student 3" },
                { id: 4, name: "Student 4" },
                { id: 5, name: "Student 5" }
              ].map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{backendClasses[0]?.class_name || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">A</Badge>
                  </TableCell>
                  <TableCell>
                    <Select>
                      <SelectTrigger className="w-24">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                        <SelectItem value="C">C</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
