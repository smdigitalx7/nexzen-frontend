import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Bus,
  Users,
  Route,
  Edit,
  Trash2,
  Navigation,
  DollarSign,
  Eye,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useAuthStore } from "@/store/authStore";
import { useBusRoutes, useBusRoute, useDeleteBusRoute, useCreateBusRoute, useUpdateBusRoute, useDistanceSlabs, useCreateDistanceSlab, useUpdateDistanceSlab } from "@/lib/hooks/useTransport";


const TransportManagement = () => {
  const { user, currentBranch } = useAuthStore();
  const { data: routesData = [], isLoading: routesLoading, error: routesError } = useBusRoutes();
  const { data: slabsData = [], isLoading: feesLoading, error: feesError } = useDistanceSlabs();
  const deleteRouteMutation = useDeleteBusRoute();
  const createRouteMutation = useCreateBusRoute();
  const updateRouteMutation = useUpdateBusRoute();
  const updateFeeMutation = useUpdateDistanceSlab();
  const createFeeMutation = useCreateDistanceSlab();
  const busRoutes = routesData.map((r) => ({
    id: r.bus_route_id,
    route_number: r.route_no || "-",
    route_name: r.route_name || "-",
    vehicle_number: r.vehicle_number || "-",
    vehicle_capacity: r.vehicle_capacity ?? 0,
    driver_id: r.driver_employee_id ? String(r.driver_employee_id) : "-",
    driver_name: "-", // This would need to be fetched from employee service
    distance_km: r.total_distance ?? 0,
    estimated_duration: r.estimated_duration ?? 0,
    pickup_time: "-", // Not available in current schema
    drop_time: "-", // Not available in current schema
    active: r.is_active ?? true,
    students_count: 0, // This would need to be calculated from student transport assignments
    fuel_cost: 0, // Not available in current schema
    maintenance_cost: 0, // Not available in current schema
  }));
  const transportFeeStructures = slabsData.map((f) => ({
    id: f.slab_id,
    route_name: f.slab_name,
    stop_name: `${f.min_distance}${f.max_distance ? `-${f.max_distance}` : "+"} km`,
    distance_km: f.max_distance ?? 0,
    total_fee: f.fee_amount,
    active: true,
    students_count: 0,
  }));
  const [activeTab, setActiveTab] = useState("routes");
  const [isAddRouteOpen, setIsAddRouteOpen] = useState(false);
  const [isAddFeeOpen, setIsAddFeeOpen] = useState(false);
  const [isEditFeeOpen, setIsEditFeeOpen] = useState(false);
  const [isViewRouteOpen, setIsViewRouteOpen] = useState(false);
  const [confirmRouteDeleteId, setConfirmRouteDeleteId] = useState<number | null>(null);
  const [viewRouteId, setViewRouteId] = useState<number | null>(null);
  
  // Get route data from the list instead of individual API call
  const viewRouteData = viewRouteId ? routesData.find(route => route.bus_route_id === viewRouteId) : null;
  const viewRouteLoading = routesLoading;
  const viewRouteError = routesError;
  const [searchTerm, setSearchTerm] = useState("");
  const [routeForm, setRouteForm] = useState({
    vehicle_number: "",
    vehicle_capacity: "",
    registration_number: "",
    driver_employee_id: "",
    route_no: "",
    route_name: "",
    start_location: "",
    end_location: "",
    total_distance: "",
    estimated_duration: "",
    is_active: true,
  });
  const [isEditingRoute, setIsEditingRoute] = useState(false);
  const [routeEditingId, setRouteEditingId] = useState<number | null>(null);
  const [newFee, setNewFee] = useState({
    slab_name: "",
    min_distance: "",
    max_distance: "",
    fee_amount: "",
  });

  const [editFeeId, setEditFeeId] = useState<number | null>(null);
  const [editFeeForm, setEditFeeForm] = useState({
    slab_name: "",
    min_distance: "",
    max_distance: "",
    fee_amount: "",
  });

  // Removed Student Assignments and Expenses state and helpers

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getRouteUtilization = (students: number, capacity: number) => {
    return (students / capacity) * 100;
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return "text-red-600";
    if (utilization >= 75) return "text-yellow-600";
    return "text-green-600";
  };

  const handleAddRoute = () => {
    const required = [
      routeForm.vehicle_number,
      routeForm.vehicle_capacity,
      routeForm.registration_number,
      routeForm.driver_employee_id,
      routeForm.route_no,
      routeForm.route_name,
      routeForm.start_location,
      routeForm.end_location,
      routeForm.total_distance,
      routeForm.estimated_duration,
    ];
    if (required.some((v) => !v)) return;
    createRouteMutation.mutate({
      vehicle_number: routeForm.vehicle_number,
      vehicle_capacity: parseInt(routeForm.vehicle_capacity),
      registration_number: routeForm.registration_number,
      driver_employee_id: parseInt(routeForm.driver_employee_id),
      route_no: routeForm.route_no,
      route_name: routeForm.route_name,
      start_location: routeForm.start_location,
      end_location: routeForm.end_location,
      total_distance: parseFloat(routeForm.total_distance),
      estimated_duration: parseInt(routeForm.estimated_duration),
      is_active: routeForm.is_active,
    });
    setRouteForm({
      vehicle_number: "",
      vehicle_capacity: "",
      registration_number: "",
      driver_employee_id: "",
      route_no: "",
      route_name: "",
      start_location: "",
      end_location: "",
      total_distance: "",
      estimated_duration: "",
      is_active: true,
    });
    setIsAddRouteOpen(false);
  };

  const handleAddSlab = () => {
    if (!newFee.slab_name || !newFee.min_distance || !newFee.fee_amount) return;
    createFeeMutation.mutate({
      slab_name: newFee.slab_name,
      min_distance: parseFloat(newFee.min_distance),
      max_distance: newFee.max_distance ? parseFloat(newFee.max_distance) : null,
      fee_amount: parseFloat(newFee.fee_amount),
    } as any);
    setNewFee({ slab_name: "", min_distance: "", max_distance: "", fee_amount: "" });
    setIsAddFeeOpen(false);
  };

  const filteredRoutes = busRoutes.filter(
    (route) =>
      route.route_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.route_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.vehicle_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalStudents = busRoutes.reduce(
    (sum, route) => sum + route.students_count,
    0
  );
  const totalCapacity = busRoutes.reduce(
    (sum, route) => sum + route.vehicle_capacity,
    0
  );
  const overallUtilization = (totalStudents / totalCapacity) * 100;
  const totalFuelCost = busRoutes.reduce((sum, route) => sum + (route.fuel_cost || 0), 0);
  const totalMaintenanceCost = busRoutes.reduce((sum, route) => sum + (route.maintenance_cost || 0), 0);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Transport Management
          </h1>
          <p className="text-muted-foreground">
            Advanced route optimization and transport operations management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Bus className="h-3 w-3" />
            {currentBranch?.branch_name}
          </Badge>
        </div>
      </motion.div>

      {/* Transport Overview Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Routes</CardTitle>
            <Route className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {busRoutes.filter((r) => r.active).length}
            </div>
            <p className="text-xs text-muted-foreground">Transport routes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalStudents}
            </div>
            <p className="text-xs text-muted-foreground">
              Students using transport
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Route Utilization
            </CardTitle>
            <Navigation className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {overallUtilization.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Average capacity usage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(totalFuelCost + totalMaintenanceCost)}
            </div>
            <p className="text-xs text-muted-foreground">Fuel + Maintenance</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="routes">Bus Routes</TabsTrigger>
            <TabsTrigger value="fees">Distance Slabs</TabsTrigger>
          </TabsList>

          {/* Bus Routes Tab */}
          <TabsContent value="routes" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Search routes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Badge variant="outline">{filteredRoutes.length} Routes</Badge>
              </div>
              <Dialog open={isAddRouteOpen} onOpenChange={(open) => { if (!open) { setIsEditingRoute(false); setRouteEditingId(null);} setIsAddRouteOpen(open); }}>
                <DialogTrigger asChild>
                  <Button className="gap-2" onClick={() => { setIsEditingRoute(false); setRouteEditingId(null); }}>
                    <Plus className="h-4 w-4" />
                    Add Route
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{isEditingRoute ? "Edit Bus Route" : "Add New Bus Route"}</DialogTitle>
                    <DialogDescription>
                      {isEditingRoute ? "Update route details" : "Create a new transport route with vehicle and driver details"}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="route_no">Route Number</Label>
                        <Input
                          id="route_no"
                          value={routeForm.route_no}
                          onChange={(e) => setRouteForm({ ...routeForm, route_no: e.target.value })}
                          placeholder="R001"
                        />
                      </div>
                      <div>
                        <Label htmlFor="route_name">Route Name</Label>
                        <Input
                          id="route_name"
                          value={routeForm.route_name}
                          onChange={(e) => setRouteForm({ ...routeForm, route_name: e.target.value })}
                          placeholder="City Center"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="vehicle_number">Vehicle Number</Label>
                        <Input id="vehicle_number" value={routeForm.vehicle_number} onChange={(e) => setRouteForm({ ...routeForm, vehicle_number: e.target.value })} placeholder="TN01AB1234" />
                      </div>
                      <div>
                        <Label htmlFor="vehicle_capacity">
                          Vehicle Capacity
                        </Label>
                        <Input id="vehicle_capacity" type="number" value={routeForm.vehicle_capacity} onChange={(e) => setRouteForm({ ...routeForm, vehicle_capacity: e.target.value })} placeholder="40" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="total_distance">Distance (km)</Label>
                        <Input id="total_distance" type="number" step="0.1" value={routeForm.total_distance} onChange={(e) => setRouteForm({ ...routeForm, total_distance: e.target.value })} placeholder="15.5" />
                      </div>
                      <div>
                        <Label htmlFor="estimated_duration">
                          Duration (min)
                        </Label>
                        <Input id="estimated_duration" type="number" value={routeForm.estimated_duration} onChange={(e) => setRouteForm({ ...routeForm, estimated_duration: e.target.value })} placeholder="45" />
                      </div>
                      <div>
                        <Label htmlFor="driver_employee_id">Driver Employee ID</Label>
                        <Input id="driver_employee_id" value={routeForm.driver_employee_id} onChange={(e) => setRouteForm({ ...routeForm, driver_employee_id: e.target.value })} placeholder="25" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="start_location">Start Location</Label>
                        <Input id="start_location" value={routeForm.start_location} onChange={(e) => setRouteForm({ ...routeForm, start_location: e.target.value })} />
                      </div>
                      <div>
                        <Label htmlFor="end_location">End Location</Label>
                        <Input id="end_location" value={routeForm.end_location} onChange={(e) => setRouteForm({ ...routeForm, end_location: e.target.value })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="registration_number">Registration Number</Label>
                        <Input id="registration_number" value={routeForm.registration_number} onChange={(e) => setRouteForm({ ...routeForm, registration_number: e.target.value })} placeholder="REG123" />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddRouteOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={() => {
                      if (isEditingRoute && routeEditingId) {
                        updateRouteMutation.mutate({
                          id: routeEditingId,
                          payload: {
                            route_no: routeForm.route_no || undefined,
                            route_name: routeForm.route_name || undefined,
                            is_active: routeForm.is_active,
                          }
                        });
                        setIsAddRouteOpen(false);
                        setIsEditingRoute(false);
                        setRouteEditingId(null);
                      } else {
                        handleAddRoute();
                      }
                    }}>{isEditingRoute ? "Update Route" : "Add Route"}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {routesLoading ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-muted-foreground">Loading routes...</span>
                  </div>
                </CardContent>
              </Card>
            ) : routesError ? (
              <Card>
                <CardContent className="p-6 text-center text-red-600">
                  <div className="flex flex-col items-center gap-2">
                    <span>Error loading routes</span>
                    <span className="text-sm text-muted-foreground">{routesError.message}</span>
                  </div>
                </CardContent>
              </Card>
            ) : filteredRoutes.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  {searchTerm ? "No routes match your search." : "No routes found. Click 'Add Route' to create the first route."}
                </CardContent>
              </Card>
            ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredRoutes.map((route, index) => {
                const utilization = getRouteUtilization(
                  route.students_count,
                  route.vehicle_capacity
                );
                return (
                  <motion.div
                    key={route.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover-elevate">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                              <Bus className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">
                                {route.route_number !== "-" ? route.route_number : "Route #" + route.id}
                              </CardTitle>
                              <CardDescription>
                                {route.route_name !== "-" ? route.route_name : "Unnamed Route"}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge
                            variant={route.active ? "default" : "secondary"}
                          >
                            {route.active ? "Active" : "Inactive"}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setViewRouteId(route.id);
                              setIsViewRouteOpen(true);
                            }}
                            title="View route details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setIsEditingRoute(true);
                              setRouteEditingId(route.id);
                              setIsAddRouteOpen(true);
                              setRouteForm({
                                ...routeForm,
                                route_no: route.route_number || "",
                                route_name: route.route_name || "",
                                is_active: route.active,
                              });
                            }}
                            title="Edit route"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setConfirmRouteDeleteId(route.id)}
                            className="text-red-600 hover:text-red-700"
                            title="Delete route"
                            aria-label="Delete route"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span>Driver ID:</span>
                            <span className="font-medium">
                              {route.driver_id !== "-" ? `#${route.driver_id}` : "Not Assigned"}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Distance:</span>
                            <span className="font-medium">
                              {route.distance_km > 0 ? `${route.distance_km} km` : "Not Set"}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Duration:</span>
                            <span className="font-medium">
                              {route.estimated_duration > 0 ? `${route.estimated_duration} min` : "Not Set"}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Registration:</span>
                            <span className="font-medium">
                              {routesData.find(r => r.bus_route_id === route.id)?.registration_number || "Not Set"}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Start Location:</span>
                            <span className="font-medium">
                              {routesData.find(r => r.bus_route_id === route.id)?.start_location || "Not Set"}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
            )}
          </TabsContent>

          {/* Transport Fees Tab */}
          <TabsContent value="fees" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Search transport fees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Badge variant="outline">
                  {
                    slabsData.filter(
                      (slab) =>
                        slab.slab_name
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase())
                    ).length
                  }{" "}
                  Distance Slabs
                </Badge>
              </div>
              <Dialog open={isAddFeeOpen} onOpenChange={setIsAddFeeOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Fee
                  </Button>
                </DialogTrigger>
            <DialogContent>
                  <DialogHeader>
                <DialogTitle>Add Distance Slab</DialogTitle>
                <DialogDescription>Define fee by distance range</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="slab_name">Slab Name</Label>
                    <Input id="slab_name" value={newFee.slab_name} onChange={(e) => setNewFee({ ...newFee, slab_name: e.target.value })} placeholder="0-3 km" />
                  </div>
                  <div>
                    <Label htmlFor="min_distance">Min Distance (km)</Label>
                    <Input id="min_distance" type="number" step="0.1" value={newFee.min_distance} onChange={(e) => setNewFee({ ...newFee, min_distance: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="max_distance">Max Distance (km)</Label>
                    <Input id="max_distance" type="number" step="0.1" value={newFee.max_distance} onChange={(e) => setNewFee({ ...newFee, max_distance: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="fee_amount">Fee Amount</Label>
                        <Input
                          id="fee_amount"
                          type="number"
                      value={newFee.fee_amount}
                      onChange={(e) => setNewFee({ ...newFee, fee_amount: e.target.value })}
                          placeholder="e.g. 1500"
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddFeeOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddSlab}
                    >
                      Add Slab
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {slabsData.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  No distance slabs found. Click "Add Fee" to create one.
                </CardContent>
              </Card>
            ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Slab</TableHead>
                  <TableHead>Range</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slabsData
                  .filter(
                    (slab) =>
                      slab.slab_name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                  )
                  .map((slab) => (
                    <TableRow key={slab.slab_id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-medium">{slab.slab_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {slab.min_distance} - {slab.max_distance || '∞'} km
                      </TableCell>
                      <TableCell className="text-right font-semibold text-green-700">
                        ₹{slab.fee_amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditFeeId(slab.slab_id);
                              setEditFeeForm({
                                slab_name: slab.slab_name,
                                min_distance: slab.min_distance.toString(),
                                max_distance: slab.max_distance?.toString() || "",
                                fee_amount: slab.fee_amount.toString(),
                              });
                              setIsEditFeeOpen(true);
                            }}
                            title="Edit slab"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // Add delete functionality here
                            }}
                            className="text-red-600 hover:text-red-700"
                            title="Delete slab"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            )}
          {/* Edit Fee Dialog */}
          <Dialog open={isEditFeeOpen} onOpenChange={setIsEditFeeOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Distance Slab</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="edit_slab_name">Slab Name</Label>
                    <Input id="edit_slab_name" value={editFeeForm.slab_name} onChange={(e) => setEditFeeForm({ ...editFeeForm, slab_name: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="edit_min_distance">Min Distance</Label>
                    <Input id="edit_min_distance" type="number" step="0.1" value={editFeeForm.min_distance} onChange={(e) => setEditFeeForm({ ...editFeeForm, min_distance: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="edit_max_distance">Max Distance</Label>
                    <Input id="edit_max_distance" type="number" step="0.1" value={editFeeForm.max_distance} onChange={(e) => setEditFeeForm({ ...editFeeForm, max_distance: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="edit_fee_amount">Fee Amount</Label>
                    <Input id="edit_fee_amount" type="number" value={editFeeForm.fee_amount} onChange={(e) => setEditFeeForm({ ...editFeeForm, fee_amount: e.target.value })} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditFeeOpen(false)}>Cancel</Button>
                <Button onClick={() => {
                  if (!editFeeId) return;
                  updateFeeMutation.mutate({
                    id: editFeeId,
                    payload: {
                      slab_name: editFeeForm.slab_name || undefined,
                      min_distance: editFeeForm.min_distance ? parseFloat(editFeeForm.min_distance) : undefined,
                      max_distance: editFeeForm.max_distance ? parseFloat(editFeeForm.max_distance) : undefined,
                      fee_amount: editFeeForm.fee_amount ? parseFloat(editFeeForm.fee_amount) : undefined,
                    }
                  });
                  setIsEditFeeOpen(false);
                }}>Update Fee</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </TabsContent>

        </Tabs>
        
        {/* View Route Details Dialog */}
        <Dialog open={isViewRouteOpen} onOpenChange={(open) => {
          setIsViewRouteOpen(open);
          if (!open) {
            setViewRouteId(null);
          }
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Bus className="h-5 w-5" />
                Route Details
              </DialogTitle>
              <DialogDescription>
                Complete information for {viewRouteData?.route_name || 'this route'}
              </DialogDescription>
            </DialogHeader>
            {viewRouteLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-slate-600">Loading route details...</p>
                </div>
              </div>
            ) : viewRouteError ? (
              <div className="text-center py-8 text-red-600">
                <p>Failed to load route details.</p>
                <p className="text-sm text-muted-foreground mt-1">{viewRouteError.message}</p>
              </div>
            ) : viewRouteData ? (
              <div className="space-y-6">
                {/* Route Header */}
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    <Bus className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{viewRouteData.route_no} - {viewRouteData.route_name}</h3>
                    <p className="text-sm text-muted-foreground">Route ID: #{viewRouteData.bus_route_id}</p>
                  </div>
                  <Badge variant={viewRouteData.is_active ? "default" : "secondary"} className="ml-auto">
                    {viewRouteData.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>

                {/* Route Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Vehicle Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Bus className="h-4 w-4" />
                        Vehicle Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Vehicle Number:</span>
                        <span className="font-medium">{viewRouteData.vehicle_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Registration:</span>
                        <span className="font-medium">{viewRouteData.registration_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Capacity:</span>
                        <span className="font-medium">{viewRouteData.vehicle_capacity} students</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Driver ID:</span>
                        <span className="font-medium">{viewRouteData.driver_employee_id ? `#${viewRouteData.driver_employee_id}` : "Not Assigned"}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Route Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Route className="h-4 w-4" />
                        Route Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Start Location:</span>
                        <span className="font-medium">{viewRouteData.start_location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">End Location:</span>
                        <span className="font-medium">{viewRouteData.end_location || "Not Set"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Distance:</span>
                        <span className="font-medium">{viewRouteData.total_distance ? `${viewRouteData.total_distance} km` : "Not Set"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Duration:</span>
                        <span className="font-medium">{viewRouteData.estimated_duration ? `${viewRouteData.estimated_duration} min` : "Not Set"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Route Number:</span>
                        <span className="font-medium">{viewRouteData.route_no}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Timestamps */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Timestamps</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Created:</span>
                      <span className="font-medium">{new Date(viewRouteData.created_at).toLocaleString()}</span>
                    </div>
                    {viewRouteData.updated_at && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Last Updated:</span>
                        <span className="font-medium">{new Date(viewRouteData.updated_at).toLocaleString()}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : null}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewRouteOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Confirm Route Delete */}
        <AlertDialog open={confirmRouteDeleteId !== null} onOpenChange={(open) => { if (!open) setConfirmRouteDeleteId(null); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Route</AlertDialogTitle>
              <AlertDialogDescription>This action will permanently delete this route.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => { if (confirmRouteDeleteId) deleteRouteMutation.mutate(confirmRouteDeleteId); setConfirmRouteDeleteId(null); }} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
      </motion.div>
    </div>
  );
};

export default TransportManagement;
