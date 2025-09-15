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

// Mock data for transport management
const mockBusRoutes = [
  {
    id: 1,
    route_number: "R001",
    route_name: "City Center",
    vehicle_number: "TN01AB1234",
    vehicle_capacity: 40,
    driver_id: "EMP025",
    driver_name: "Rajesh Kumar",
    distance_km: 15.5,
    estimated_duration: 45,
    pickup_time: "07:15",
    drop_time: "15:45",
    active: true,
    students_count: 35,
    fuel_cost: 800,
    maintenance_cost: 500,
  },
  {
    id: 2,
    route_number: "R002",
    route_name: "North District",
    vehicle_number: "TN02CD5678",
    vehicle_capacity: 35,
    driver_id: "EMP026",
    driver_name: "Suresh Patel",
    distance_km: 22.3,
    estimated_duration: 60,
    pickup_time: "07:00",
    drop_time: "16:00",
    active: true,
    students_count: 28,
    fuel_cost: 1200,
    maintenance_cost: 750,
  },
  {
    id: 3,
    route_number: "R003",
    route_name: "South Zone",
    vehicle_number: "TN03EF9012",
    vehicle_capacity: 45,
    driver_id: "EMP027",
    driver_name: "Vikram Singh",
    distance_km: 18.7,
    estimated_duration: 50,
    pickup_time: "07:30",
    drop_time: "15:30",
    active: true,
    students_count: 42,
    fuel_cost: 950,
    maintenance_cost: 600,
  },
];

const mockBusStops = [
  {
    id: 1,
    route_id: 1,
    stop_name: "Main Market",
    stop_sequence: 1,
    pickup_time: "07:15",
    drop_time: "15:45",
    distance_from_start: 0,
    landmark: "Near City Bank",
    students_count: 12,
  },
  {
    id: 2,
    route_id: 1,
    stop_name: "Central Plaza",
    stop_sequence: 2,
    pickup_time: "07:25",
    drop_time: "15:35",
    distance_from_start: 3.2,
    landmark: "Opposite Metro Station",
    students_count: 8,
  },
  {
    id: 3,
    route_id: 1,
    stop_name: "Garden View",
    stop_sequence: 3,
    pickup_time: "07:35",
    drop_time: "15:25",
    distance_from_start: 6.8,
    landmark: "Near Public Garden",
    students_count: 15,
  },
  {
    id: 4,
    route_id: 2,
    stop_name: "North Point",
    stop_sequence: 1,
    pickup_time: "07:00",
    drop_time: "16:00",
    distance_from_start: 0,
    landmark: "Near North Mall",
    students_count: 18,
  },
  {
    id: 5,
    route_id: 2,
    stop_name: "Tech Park",
    stop_sequence: 2,
    pickup_time: "07:15",
    drop_time: "15:45",
    distance_from_start: 8.5,
    landmark: "IT Park Entrance",
    students_count: 10,
  },
];

const mockTransportFeeStructures = [
  {
    id: 1,
    route_id: 1,
    stop_id: 1,
    route_name: "R001-City Center",
    stop_name: "Main Market",
    distance_km: 3.2,
    term_1_fee: 1200,
    term_2_fee: 1200,
    total_fee: 2400,
    effective_from: "2024-04-01",
    effective_to: "2025-03-31",
    active: true,
    students_count: 12,
  },
  {
    id: 2,
    route_id: 1,
    stop_id: 2,
    route_name: "R001-City Center",
    stop_name: "Central Plaza",
    distance_km: 6.8,
    term_1_fee: 1500,
    term_2_fee: 1500,
    total_fee: 3000,
    effective_from: "2024-04-01",
    effective_to: "2025-03-31",
    active: true,
    students_count: 8,
  },
  {
    id: 3,
    route_id: 2,
    stop_id: 4,
    route_name: "R002-North District",
    stop_name: "North Point",
    distance_km: 8.5,
    term_1_fee: 1800,
    term_2_fee: 1800,
    total_fee: 3600,
    effective_from: "2024-04-01",
    effective_to: "2025-03-31",
    active: true,
    students_count: 18,
  },
];

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
  const [busRoutes, setBusRoutes] = useState(mockBusRoutes);
  const [busStops, setBusStops] = useState(mockBusStops);
  const [transportFeeStructures, setTransportFeeStructures] = useState(
    mockTransportFeeStructures
  );
  const [studentAssignments, setStudentAssignments] = useState(
    mockStudentTransportAssignments
  );
  const [activeTab, setActiveTab] = useState("routes");
  const [isAddRouteOpen, setIsAddRouteOpen] = useState(false);
  const [isAddStopOpen, setIsAddStopOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newRoute, setNewRoute] = useState({
    route_number: "",
    route_name: "",
    vehicle_number: "",
    vehicle_capacity: "",
    driver_id: "",
    distance_km: "",
    estimated_duration: "",
    pickup_time: "",
    drop_time: "",
  });
  const [newStop, setNewStop] = useState({
    route_id: "",
    stop_name: "",
    stop_sequence: "",
    pickup_time: "",
    drop_time: "",
    distance_from_start: "",
    landmark: "",
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
    const newId = Math.max(...busRoutes.map((r) => r.id)) + 1;
    const route = {
      id: newId,
      ...newRoute,
      vehicle_capacity: parseInt(newRoute.vehicle_capacity),
      distance_km: parseFloat(newRoute.distance_km),
      estimated_duration: parseInt(newRoute.estimated_duration),
      driver_name: "New Driver", // This would be fetched from employee data
      active: true,
      students_count: 0,
      fuel_cost: 0,
      maintenance_cost: 0,
    };

    setBusRoutes([...busRoutes, route]);
    setNewRoute({
      route_number: "",
      route_name: "",
      vehicle_number: "",
      vehicle_capacity: "",
      driver_id: "",
      distance_km: "",
      estimated_duration: "",
      pickup_time: "",
      drop_time: "",
    });
    setIsAddRouteOpen(false);
  };

  const handleAddStop = () => {
    const newId = Math.max(...busStops.map((s) => s.id)) + 1;
    const stop = {
      id: newId,
      ...newStop,
      route_id: parseInt(newStop.route_id),
      stop_sequence: parseInt(newStop.stop_sequence),
      distance_from_start: parseFloat(newStop.distance_from_start),
      students_count: 0,
    };

    setBusStops([...busStops, stop]);
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
  const totalFuelCost = busRoutes.reduce(
    (sum, route) => sum + route.fuel_cost,
    0
  );
  const totalMaintenanceCost = busRoutes.reduce(
    (sum, route) => sum + route.maintenance_cost,
    0
  );

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
              <Dialog open={isAddRouteOpen} onOpenChange={setIsAddRouteOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Route
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Bus Route</DialogTitle>
                    <DialogDescription>
                      Create a new transport route with vehicle and driver
                      details
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="route_number">Route Number</Label>
                        <Input
                          id="route_number"
                          value={newRoute.route_number}
                          onChange={(e) =>
                            setNewRoute({
                              ...newRoute,
                              route_number: e.target.value,
                            })
                          }
                          placeholder="R001"
                        />
                      </div>
                      <div>
                        <Label htmlFor="route_name">Route Name</Label>
                        <Input
                          id="route_name"
                          value={newRoute.route_name}
                          onChange={(e) =>
                            setNewRoute({
                              ...newRoute,
                              route_name: e.target.value,
                            })
                          }
                          placeholder="City Center"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="vehicle_number">Vehicle Number</Label>
                        <Input
                          id="vehicle_number"
                          value={newRoute.vehicle_number}
                          onChange={(e) =>
                            setNewRoute({
                              ...newRoute,
                              vehicle_number: e.target.value,
                            })
                          }
                          placeholder="TN01AB1234"
                        />
                      </div>
                      <div>
                        <Label htmlFor="vehicle_capacity">
                          Vehicle Capacity
                        </Label>
                        <Input
                          id="vehicle_capacity"
                          type="number"
                          value={newRoute.vehicle_capacity}
                          onChange={(e) =>
                            setNewRoute({
                              ...newRoute,
                              vehicle_capacity: e.target.value,
                            })
                          }
                          placeholder="40"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="distance_km">Distance (km)</Label>
                        <Input
                          id="distance_km"
                          type="number"
                          step="0.1"
                          value={newRoute.distance_km}
                          onChange={(e) =>
                            setNewRoute({
                              ...newRoute,
                              distance_km: e.target.value,
                            })
                          }
                          placeholder="15.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="estimated_duration">
                          Duration (min)
                        </Label>
                        <Input
                          id="estimated_duration"
                          type="number"
                          value={newRoute.estimated_duration}
                          onChange={(e) =>
                            setNewRoute({
                              ...newRoute,
                              estimated_duration: e.target.value,
                            })
                          }
                          placeholder="45"
                        />
                      </div>
                      <div>
                        <Label htmlFor="driver_id">Driver ID</Label>
                        <Input
                          id="driver_id"
                          value={newRoute.driver_id}
                          onChange={(e) =>
                            setNewRoute({
                              ...newRoute,
                              driver_id: e.target.value,
                            })
                          }
                          placeholder="EMP025"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="pickup_time">Pickup Time</Label>
                        <Input
                          id="pickup_time"
                          type="time"
                          value={newRoute.pickup_time}
                          onChange={(e) =>
                            setNewRoute({
                              ...newRoute,
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
                          value={newRoute.drop_time}
                          onChange={(e) =>
                            setNewRoute({
                              ...newRoute,
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
                      onClick={() => setIsAddRouteOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddRoute}>Add Route</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

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
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
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
            </div>

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
      </motion.div>
    </div>
  );
};

export default TransportManagement;
