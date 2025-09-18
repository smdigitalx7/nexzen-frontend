import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Bus,
  MapPin,
  Clock,
  Users,
  Route,
  Edit,
  Trash2,
  Eye,
  Navigation,
  DollarSign,
  AlertTriangle,
  CheckCircle,
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useBusRoutes, useBusStops, useTransportFees, useCreateBusStop, useDeleteBusStop, useDeleteBusRoute, useDeleteTransportFee, useCreateTransportFee, useCreateBusRoute, useUpdateBusRoute, useUpdateBusStop, useUpdateTransportFee } from "@/lib/hooks/useTransport";

// Removed mock data. Using backend data via hooks.

const mockVehicleExpenses = [
  {
    id: 1,
    date: "2025-08-01",
    vehicle_number: "TN01AB1234",
    type: "Fuel",
    amount: 2800,
    remarks: "Diesel refill",
  },
  {
    id: 2,
    date: "2025-08-05",
    vehicle_number: "TN01AB1234",
    type: "Maintenance",
    amount: 1500,
    remarks: "Brake pads",
  },
  {
    id: 3,
    date: "2025-08-10",
    vehicle_number: "TN02CD5678",
    type: "Fuel",
    amount: 3000,
    remarks: "Diesel refill",
  },
];

const mockStudentTransportAssignments = [
  {
    id: 1,
    student_id: "STU2024156",
    student_name: "Priya Patel",
    class_name: "Class 8",
    route_id: 1,
    route_name: "R001-City Center",
    stop_id: 1,
    stop_name: "Main Market",
    assignment_date: "2024-04-01",
    academic_year: "2024-25",
    active: true,
    pickup_time: "07:15",
    drop_time: "15:45",
  },
  {
    id: 2,
    student_id: "STU2024157",
    student_name: "Arjun Sharma",
    class_name: "Class 9",
    route_id: 2,
    route_name: "R002-North District",
    stop_id: 4,
    stop_name: "North Point",
    assignment_date: "2024-04-01",
    academic_year: "2024-25",
    active: true,
    pickup_time: "07:00",
    drop_time: "16:00",
  },
];

const TransportManagement = () => {
  const { user, currentBranch } = useAuthStore();
  const { data: routesData = [], isLoading: routesLoading, error: routesError } = useBusRoutes();
  const { data: stopsData = [], isLoading: stopsLoading, error: stopsError } = useBusStops();
  const { data: feesData = [], isLoading: feesLoading, error: feesError } = useTransportFees();
  const deleteRouteMutation = useDeleteBusRoute();
  const deleteFeeMutation = useDeleteTransportFee();
  const createRouteMutation = useCreateBusRoute();
  const updateRouteMutation = useUpdateBusRoute();
  const updateStopMutation = useUpdateBusStop();
  const updateFeeMutation = useUpdateTransportFee();
  const createFeeMutation = useCreateTransportFee();
  // Adapt backend data to UI expectations (temporary fields like students_count are defaulted)
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
  const busStops = stopsData.map((s) => ({
    id: s.stop_id,
    route_id: s.bus_route_id,
    stop_name: s.stop_name,
    stop_sequence: s.stop_sequence,
    pickup_time: String(s.pickup_time),
    drop_time: String(s.drop_time),
    distance_from_start: s.distance_from_start ?? 0,
    landmark: s.landmark,
    students_count: 0,
  }));
  const transportFeeStructures = feesData.map((f) => ({
    id: f.fee_structure_id,
    route_id: f.bus_route_id,
    stop_id: f.stop_id,
    route_name: String(f.bus_route_id),
    stop_name: String(f.stop_id),
    distance_km: 0,
    term_1_fee: f.fee_amount,
    term_2_fee: 0,
    total_fee: f.fee_amount,
    effective_from: f.effective_from_date || "",
    effective_to: f.effective_to_date || "",
    active: true,
    students_count: 0,
  }));
  const [studentAssignments, setStudentAssignments] = useState(
    mockStudentTransportAssignments
  );
  const [activeTab, setActiveTab] = useState("routes");
  const [isAddRouteOpen, setIsAddRouteOpen] = useState(false);
  const [isAddStopOpen, setIsAddStopOpen] = useState(false);
  const [isAddFeeOpen, setIsAddFeeOpen] = useState(false);
  const [isEditStopOpen, setIsEditStopOpen] = useState(false);
  const [isEditFeeOpen, setIsEditFeeOpen] = useState(false);
  const [confirmRouteDeleteId, setConfirmRouteDeleteId] = useState<number | null>(null);
  const [confirmFeeDeleteId, setConfirmFeeDeleteId] = useState<number | null>(null);
  const [confirmStopDeleteId, setConfirmStopDeleteId] = useState<number | null>(null);
  const createStopMutation = useCreateBusStop();
  const deleteStopMutation = useDeleteBusStop();
  const [searchTerm, setSearchTerm] = useState("");
  const [routeForm, setRouteForm] = useState({
    vehicle_number: "",
    vehicle_capacity: "",
    registration_number: "",
    insurance_expiry: "",
    fitness_expiry: "",
    permit_expiry: "",
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
  const [newStop, setNewStop] = useState({
    route_id: "",
    stop_name: "",
    stop_sequence: "",
    pickup_time: "",
    drop_time: "",
    distance_from_start: "",
    landmark: "",
  });

  const [newFee, setNewFee] = useState({
    bus_route_id: "",
    stop_id: "",
    fee_amount: "",
    effective_from_date: "",
    effective_to_date: "",
  });

  const [editStopId, setEditStopId] = useState<number | null>(null);
  const [editStopForm, setEditStopForm] = useState({
    stop_name: "",
    stop_sequence: "",
    pickup_time: "",
    drop_time: "",
    landmark: "",
    distance_from_start: "",
  });

  const [editFeeId, setEditFeeId] = useState<number | null>(null);
  const [editFeeForm, setEditFeeForm] = useState({
    fee_amount: "",
    effective_from_date: "",
    effective_to_date: "",
  });

  const [expenses, setExpenses] = useState(mockVehicleExpenses);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const exportExpenses = () => {
    const rows = [
      ["Date", "Vehicle", "Type", "Amount", "Remarks"],
      ...expenses.map((e) => [
        e.date,
        e.vehicle_number,
        e.type,
        String(e.amount),
        e.remarks,
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transport_expenses_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
      routeForm.insurance_expiry,
      routeForm.fitness_expiry,
      routeForm.permit_expiry,
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
      insurance_expiry: routeForm.insurance_expiry,
      fitness_expiry: routeForm.fitness_expiry,
      permit_expiry: routeForm.permit_expiry,
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
      insurance_expiry: "",
      fitness_expiry: "",
      permit_expiry: "",
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

  const handleAddStop = () => {
    if (!newStop.route_id || !newStop.stop_name || !newStop.stop_sequence || !newStop.pickup_time || !newStop.drop_time || !newStop.landmark) {
      return;
    }
    createStopMutation.mutate({
      bus_route_id: parseInt(newStop.route_id),
      stop_name: newStop.stop_name,
      stop_sequence: parseInt(newStop.stop_sequence),
      pickup_time: newStop.pickup_time,
      drop_time: newStop.drop_time,
      landmark: newStop.landmark,
      distance_from_start: newStop.distance_from_start ? parseFloat(newStop.distance_from_start) : null,
    });

    setNewStop({
      route_id: "",
      stop_name: "",
      stop_sequence: "",
      pickup_time: "",
      drop_time: "",
      distance_from_start: "",
      landmark: "",
    });
    setIsAddStopOpen(false);
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="routes">Bus Routes</TabsTrigger>
            <TabsTrigger value="stops">Bus Stops</TabsTrigger>
            <TabsTrigger value="fees">Transport Fees</TabsTrigger>
            <TabsTrigger value="assignments">Student Assignments</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
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
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="registration_number">Registration Number</Label>
                        <Input id="registration_number" value={routeForm.registration_number} onChange={(e) => setRouteForm({ ...routeForm, registration_number: e.target.value })} placeholder="REG123" />
                      </div>
                      <div>
                        <Label htmlFor="insurance_expiry">Insurance Expiry</Label>
                        <Input id="insurance_expiry" type="date" value={routeForm.insurance_expiry} onChange={(e) => setRouteForm({ ...routeForm, insurance_expiry: e.target.value })} />
                      </div>
                      <div>
                        <Label htmlFor="fitness_expiry">Fitness Expiry</Label>
                        <Input id="fitness_expiry" type="date" value={routeForm.fitness_expiry} onChange={(e) => setRouteForm({ ...routeForm, fitness_expiry: e.target.value })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="permit_expiry">Permit Expiry</Label>
                        <Input id="permit_expiry" type="date" value={routeForm.permit_expiry} onChange={(e) => setRouteForm({ ...routeForm, permit_expiry: e.target.value })} />
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

          {/* Bus Stops Tab */}
          <TabsContent value="stops" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Search stops..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Badge variant="outline">
                  {
                    busStops.filter(
                      (s) =>
                        s.stop_name
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        s.landmark
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase())
                    ).length
                  }{" "}
                  Stops
                </Badge>
              </div>
              <Dialog open={isAddStopOpen} onOpenChange={setIsAddStopOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Stop
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Bus Stop</DialogTitle>
                    <DialogDescription>
                      Add a new stop to an existing route
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="route_id">Route</Label>
                      <Select
                        value={newStop.route_id}
                        onValueChange={(value) =>
                          setNewStop({ ...newStop, route_id: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select route" />
                        </SelectTrigger>
                        <SelectContent>
                          {busRoutes.map((route) => (
                            <SelectItem
                              key={route.id}
                              value={route.id.toString()}
                            >
                              {route.route_number} - {route.route_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="stop_name">Stop Name</Label>
                      <Input
                        id="stop_name"
                        value={newStop.stop_name}
                        onChange={(e) =>
                          setNewStop({ ...newStop, stop_name: e.target.value })
                        }
                        placeholder="Main Market"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="stop_sequence">Sequence</Label>
                        <Input
                          id="stop_sequence"
                          type="number"
                          value={newStop.stop_sequence}
                          onChange={(e) =>
                            setNewStop({
                              ...newStop,
                              stop_sequence: e.target.value,
                            })
                          }
                          placeholder="1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="distance_from_start">
                          Distance (km)
                        </Label>
                        <Input
                          id="distance_from_start"
                          type="number"
                          step="0.1"
                          value={newStop.distance_from_start}
                          onChange={(e) =>
                            setNewStop({
                              ...newStop,
                              distance_from_start: e.target.value,
                            })
                          }
                          placeholder="3.2"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="landmark">Landmark</Label>
                      <Input
                        id="landmark"
                        value={newStop.landmark}
                        onChange={(e) =>
                          setNewStop({ ...newStop, landmark: e.target.value })
                        }
                        placeholder="Near City Bank"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="pickup_time">Pickup Time</Label>
                        <Input
                          id="pickup_time"
                          type="time"
                          value={newStop.pickup_time}
                          onChange={(e) =>
                            setNewStop({
                              ...newStop,
                              pickup_time: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="drop_time">Drop Time</Label>
                        <Input
                          id="drop_time"
                          type="time"
                          value={newStop.drop_time}
                          onChange={(e) =>
                            setNewStop({
                              ...newStop,
                              drop_time: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddStopOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddStop}>Add Stop</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {busStops.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  No stops yet. Use "Add Stop" to create one for a route.
                </CardContent>
              </Card>
            ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route</TableHead>
                  <TableHead>Stop Name</TableHead>
                  <TableHead>Sequence</TableHead>
                  <TableHead>Distance</TableHead>
                  <TableHead>Timing</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Landmark</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {busStops
                  .filter(
                    (s) =>
                      s.stop_name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      s.landmark
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                  )
                  .map((stop) => {
                    const route = busRoutes.find((r) => r.id === stop.route_id);
                    return (
                      <TableRow key={stop.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Bus className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">
                              {route?.route_number}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {stop.stop_name}
                        </TableCell>
                        <TableCell>{stop.stop_sequence}</TableCell>
                        <TableCell>{stop.distance_from_start} km</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>Pickup: {stop.pickup_time}</div>
                            <div>Drop: {stop.drop_time}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{stop.students_count}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {stop.landmark}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditStopId(stop.id);
                                setEditStopForm({
                                  stop_name: stop.stop_name,
                                  stop_sequence: String(stop.stop_sequence),
                                  pickup_time: String(stop.pickup_time),
                                  drop_time: String(stop.drop_time),
                                  landmark: stop.landmark,
                                  distance_from_start: String(stop.distance_from_start ?? ""),
                                });
                                setIsEditStopOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setConfirmStopDeleteId(stop.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
            )}
          {/* Edit Stop Dialog */}
          <Dialog open={isEditStopOpen} onOpenChange={setIsEditStopOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Bus Stop</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit_stop_name">Stop Name</Label>
                    <Input id="edit_stop_name" value={editStopForm.stop_name} onChange={(e) => setEditStopForm({ ...editStopForm, stop_name: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="edit_stop_sequence">Sequence</Label>
                    <Input id="edit_stop_sequence" type="number" value={editStopForm.stop_sequence} onChange={(e) => setEditStopForm({ ...editStopForm, stop_sequence: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit_pickup_time">Pickup Time</Label>
                    <Input id="edit_pickup_time" type="time" value={editStopForm.pickup_time} onChange={(e) => setEditStopForm({ ...editStopForm, pickup_time: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="edit_drop_time">Drop Time</Label>
                    <Input id="edit_drop_time" type="time" value={editStopForm.drop_time} onChange={(e) => setEditStopForm({ ...editStopForm, drop_time: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit_distance">Distance (km)</Label>
                    <Input id="edit_distance" type="number" step="0.1" value={editStopForm.distance_from_start} onChange={(e) => setEditStopForm({ ...editStopForm, distance_from_start: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="edit_landmark">Landmark</Label>
                    <Input id="edit_landmark" value={editStopForm.landmark} onChange={(e) => setEditStopForm({ ...editStopForm, landmark: e.target.value })} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditStopOpen(false)}>Cancel</Button>
                <Button onClick={() => {
                  if (!editStopId) return;
                  updateStopMutation.mutate({
                    id: editStopId,
                    payload: {
                      stop_name: editStopForm.stop_name,
                      stop_sequence: parseInt(editStopForm.stop_sequence),
                      pickup_time: editStopForm.pickup_time,
                      drop_time: editStopForm.drop_time,
                      landmark: editStopForm.landmark,
                      distance_from_start: editStopForm.distance_from_start ? parseFloat(editStopForm.distance_from_start) : undefined,
                    }
                  });
                  setIsEditStopOpen(false);
                }}>Update Stop</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
                    <DialogTitle>Add Transport Fee</DialogTitle>
                    <DialogDescription>Link a stop to a fee amount</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fee_route">Route</Label>
                        <Select
                          value={newFee.bus_route_id}
                          onValueChange={(value) => setNewFee({ ...newFee, bus_route_id: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select route" />
                          </SelectTrigger>
                          <SelectContent>
                            {busRoutes.map((route) => (
                              <SelectItem key={route.id} value={String(route.id)}>
                                {route.route_number} - {route.route_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="fee_stop">Stop</Label>
                        <Select
                          value={newFee.stop_id}
                          onValueChange={(value) => setNewFee({ ...newFee, stop_id: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select stop" />
                          </SelectTrigger>
                          <SelectContent>
                            {busStops.map((stop) => (
                              <SelectItem key={stop.id} value={String(stop.id)}>
                                {stop.stop_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                      <div>
                        <Label htmlFor="effective_from">Effective From</Label>
                        <Input
                          id="effective_from"
                          type="date"
                          value={newFee.effective_from_date}
                          onChange={(e) => setNewFee({ ...newFee, effective_from_date: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="effective_to">Effective To</Label>
                        <Input
                          id="effective_to"
                          type="date"
                          value={newFee.effective_to_date}
                          onChange={(e) => setNewFee({ ...newFee, effective_to_date: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddFeeOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        if (!newFee.bus_route_id || !newFee.stop_id || !newFee.fee_amount) return;
                        createFeeMutation.mutate({
                          bus_route_id: parseInt(newFee.bus_route_id),
                          stop_id: parseInt(newFee.stop_id),
                          fee_amount: parseFloat(newFee.fee_amount),
                          effective_from_date: newFee.effective_from_date || null,
                          effective_to_date: newFee.effective_to_date || null,
                        });
                        setNewFee({ bus_route_id: "", stop_id: "", fee_amount: "", effective_from_date: "", effective_to_date: "" });
                        setIsAddFeeOpen(false);
                      }}
                    >
                      Add Fee
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {transportFeeStructures
                .filter(
                  (f) =>
                    f.route_name
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    f.stop_name.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((fee, index) => (
                  <motion.div
                    key={fee.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover-elevate">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                              <DollarSign className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">
                                {fee.route_name}
                              </CardTitle>
                              <CardDescription>{fee.stop_name}</CardDescription>
                            </div>
                          </div>
                          <Badge variant={fee.active ? "default" : "secondary"}>
                            {fee.active ? "Active" : "Inactive"}
                          </Badge>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditFeeId(fee.id);
                                setEditFeeForm({
                                  fee_amount: String(fee.total_fee),
                                  effective_from_date: fee.effective_from || "",
                                  effective_to_date: fee.effective_to || "",
                                });
                                setIsEditFeeOpen(true);
                              }}
                              title="Edit fee"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setConfirmFeeDeleteId(fee.id)}
                              className="text-red-600 hover:text-red-700"
                              title="Delete fee"
                              aria-label="Delete fee"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span>Distance:</span>
                            <span className="font-medium">
                              {fee.distance_km} km
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Term 1 Fee:</span>
                            <span className="font-medium">
                              {formatCurrency(fee.term_1_fee)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Term 2 Fee:</span>
                            <span className="font-medium">
                              {formatCurrency(fee.term_2_fee)}
                            </span>
                          </div>
                          <div className="border-t pt-2">
                            <div className="flex justify-between font-bold">
                              <span>Total Fee:</span>
                              <span className="text-green-600">
                                {formatCurrency(fee.total_fee)}
                              </span>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Students: {fee.students_count}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
            </div>
            )}
          {/* Edit Fee Dialog */}
          <Dialog open={isEditFeeOpen} onOpenChange={setIsEditFeeOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Transport Fee</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="edit_fee_amount">Fee Amount</Label>
                    <Input id="edit_fee_amount" type="number" value={editFeeForm.fee_amount} onChange={(e) => setEditFeeForm({ ...editFeeForm, fee_amount: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="edit_effective_from">Effective From</Label>
                    <Input id="edit_effective_from" type="date" value={editFeeForm.effective_from_date} onChange={(e) => setEditFeeForm({ ...editFeeForm, effective_from_date: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="edit_effective_to">Effective To</Label>
                    <Input id="edit_effective_to" type="date" value={editFeeForm.effective_to_date} onChange={(e) => setEditFeeForm({ ...editFeeForm, effective_to_date: e.target.value })} />
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
                      fee_amount: parseFloat(editFeeForm.fee_amount),
                    }
                  });
                  setIsEditFeeOpen(false);
                }}>Update Fee</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </TabsContent>

          {/* Student Assignments Tab */}
          <TabsContent value="assignments" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Search student assignments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Badge variant="outline">
                  {
                    studentAssignments.filter(
                      (a) =>
                        a.student_name
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        a.route_name
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase())
                    ).length
                  }{" "}
                  Assignments
                </Badge>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Stop</TableHead>
                  <TableHead>Timing</TableHead>
                  <TableHead>Assignment Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentAssignments
                  .filter(
                    (a) =>
                      a.student_name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      a.route_name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                  )
                  .map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {assignment.student_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {assignment.student_id}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{assignment.class_name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Bus className="h-4 w-4 text-blue-600" />
                          <span>{assignment.route_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-green-600" />
                          <span>{assignment.stop_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>Pickup: {assignment.pickup_time}</div>
                          <div>Drop: {assignment.drop_time}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(
                          assignment.assignment_date
                        ).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={assignment.active ? "default" : "secondary"}
                        >
                          {assignment.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TabsContent>

          {/* Expenses Tab */}
          <TabsContent value="expenses" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Vehicle maintenance and fuel expenses
              </div>
              <Button
                variant="outline"
                className="gap-2"
                onClick={exportExpenses}
              >
                <DollarSign className="h-4 w-4" /> Export
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>
                      {new Date(e.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{e.vehicle_number}</TableCell>
                    <TableCell>{e.type}</TableCell>
                    <TableCell className="text-green-700 font-medium">
                      ₹{e.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>{e.remarks}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="text-right text-sm font-semibold">
              Total: ₹{totalExpenses.toLocaleString()}
            </div>
          </TabsContent>
        </Tabs>
        {/* Confirm Stop Delete */}
        <AlertDialog open={confirmStopDeleteId !== null} onOpenChange={(open) => { if (!open) setConfirmStopDeleteId(null); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Stop</AlertDialogTitle>
              <AlertDialogDescription>This action will permanently delete this bus stop.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => { if (confirmStopDeleteId) deleteStopMutation.mutate(confirmStopDeleteId); setConfirmStopDeleteId(null); }} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
        {/* Confirm Fee Delete */}
        <AlertDialog open={confirmFeeDeleteId !== null} onOpenChange={(open) => { if (!open) setConfirmFeeDeleteId(null); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Fee</AlertDialogTitle>
              <AlertDialogDescription>This action will permanently delete this fee structure.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => { if (confirmFeeDeleteId) deleteFeeMutation.mutate(confirmFeeDeleteId); setConfirmFeeDeleteId(null); }} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>
    </div>
  );
};

export default TransportManagement;
