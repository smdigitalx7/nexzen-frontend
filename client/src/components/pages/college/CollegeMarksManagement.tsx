import React from "react";
import { useCollegeExamMarks } from "@/lib/hooks/college/use-college-exam-marks";
import { useCollegeTestMarks } from "@/lib/hooks/college/use-college-test-marks";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnhancedDataTable } from "@/components/shared/EnhancedDataTable";

export default function CollegeMarksManagement() {
  const exams = useCollegeExamMarks();
  const tests = useCollegeTestMarks();

  return (
    <Tabs defaultValue="exams">
      <TabsList>
        <TabsTrigger value="exams">Exam Marks</TabsTrigger>
        <TabsTrigger value="tests">Test Marks</TabsTrigger>
      </TabsList>
      <TabsContent value="exams">
        <EnhancedDataTable
          data={exams.examMarks}
          columns={exams.columns}
          isLoading={exams.isLoading}
          title="College Exam Marks"
        />
      </TabsContent>
      <TabsContent value="tests">
        <EnhancedDataTable
          data={tests.testMarks}
          columns={tests.columns}
          isLoading={tests.isLoading}
          title="College Test Marks"
        />
      </TabsContent>
    </Tabs>
  );
}


