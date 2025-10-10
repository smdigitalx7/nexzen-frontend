import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransportFeeBalancesPanel } from "@/components/features/academic-management/financial-management/components/TransportFeeBalancesPanel";
import { TuitionFeeBalancesPanel } from "@/components/features/academic-management/financial-management/components/TuitionFeeBalancesPanel";
import { TuitionFeeStructuresPanel } from "@/components/features/academic-management/financial-management/components/TuitionFeeStructuresPanel";

export default function CollegeFeesManagement() {
  return (
    <Tabs defaultValue="tuition-balances">
      <TabsList>
        <TabsTrigger value="tuition-balances">Tuition Balances</TabsTrigger>
        <TabsTrigger value="transport-balances">Transport Balances</TabsTrigger>
        <TabsTrigger value="tuition-structures">Tuition Structures</TabsTrigger>
      </TabsList>
      <TabsContent value="tuition-balances">
        <TuitionFeeBalancesPanel />
      </TabsContent>
      <TabsContent value="transport-balances">
        <TransportFeeBalancesPanel />
      </TabsContent>
      <TabsContent value="tuition-structures">
        <TuitionFeeStructuresPanel />
      </TabsContent>
    </Tabs>
  );
}


