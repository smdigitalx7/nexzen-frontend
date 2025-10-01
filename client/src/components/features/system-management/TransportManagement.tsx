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
import { useBusRoutes, useDeleteBusRoute, useCreateBusRoute, useUpdateBusRoute, useDistanceSlabs, useCreateDistanceSlab, useUpdateDistanceSlab } from "@/lib/hooks/useTransport";


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
    driver_name: "-",
    distance_km: r.total_distance ?? 0,
    estimated_duration: r.estimated_duration ?? 0,
    pickup_time: "-",
    drop_time: "-",
    active: r.is_active ?? true,
    students_count: 0,
    fuel_cost: 0,
    maintenance_cost: 0,
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
  const [confirmRouteDeleteId, setConfirmRouteDeleteId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [routeForm, setRouteForm] = useState({
    vehicle_number: "",
    vehicle_capacity: "",
    registration_number: "",
    driver_employee_id: "",
    route_no: "",
    route_name: "",
    start_location: "",
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

            {filteredRoutes.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  No routes found. Click "Add Route" to create the first route.
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
                                {route.route_number}
                              </CardTitle>
                              <CardDescription>
                                {route.route_name}
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
                            <span>Vehicle:</span>
                            <span className="font-medium">
                              {route.vehicle_number}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Driver:</span>
                            <span className="font-medium">
                              {route.driver_name}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Distance:</span>
                            <span className="font-medium">
                              {route.distance_km} km
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Duration:</span>
                            <span className="font-medium">
                              {route.estimated_duration} min
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Students:</span>
                            <span className="font-medium">
                              {route.students_count}/{route.vehicle_capacity}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Utilization:</span>
                              <span
                                className={`font-medium ${getUtilizationColor(
                                  utilization
                                )}`}
                              >
                                {utilization.toFixed(1)}%
                              </span>
                            </div>
                            <Progress value={utilization} className="h-2" />
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Timing:</span>
                            <span className="font-medium">
                              {route.pickup_time} - {route.drop_time}
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
                    transportFeeStructures.filter(
                      (f) =>
                        f.route_name
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        f.stop_name
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase())
                    ).length
                  }{" "}
                  Fee Structures
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

            {transportFeeStructures.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  No fee structures found. Click "Add Fee" to create one.
                </CardContent>
              </Card>
            ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Slab</TableHead>
                  <TableHead>Range</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transportFeeStructures
                  .filter(
                    (f) =>
                      f.route_name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      f.stop_name.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((fee) => (
                    <TableRow key={fee.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-medium">{fee.route_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{fee.stop_name}</TableCell>
                      <TableCell className="text-right font-semibold text-green-700">
                        {formatCurrency(fee.total_fee)}
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
