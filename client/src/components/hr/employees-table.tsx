import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Search, Users, CheckCircle, CalendarX, UserX, Eye, Edit } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import EmployeeForm from "./employee-form";
import { Employee as EmployeeType } from "@shared/schema";

export default function EmployeesTable() {
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const { data: employees, isLoading } = useQuery<EmployeeType[]>({
    queryKey: ["/api/employees"],
  });

  const updateEmployeeMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest("PUT", `/api/employees/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      toast({
        title: "Success",
        description: "Employee status updated successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update employee status",
        variant: "destructive",
      });
    },
  });

  const filteredEmployees = employees?.filter(employee =>
    employee.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
      case "on_leave":
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700">On Leave</Badge>;
      case "terminated":
        return <Badge variant="destructive">Terminated</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleEdit = (employee: EmployeeType) => {
    setEditingEmployee(employee);
    setShowEmployeeForm(true);
  };

  const handleCloseForm = () => {
    setShowEmployeeForm(false);
    setEditingEmployee(null);
  };

  if (showEmployeeForm) {
    return <EmployeeForm employee={editingEmployee} onClose={handleCloseForm} />;
  }

  // Calculate summary stats
  const totalEmployees = filteredEmployees.length;
  const presentToday = filteredEmployees.filter(emp => emp.status === "active").length;
  const onLeave = filteredEmployees.filter(emp => emp.status === "on_leave").length;
  const newHiresThisMonth = filteredEmployees.filter(emp => {
    const hireDate = new Date(emp.hireDate);
    const now = new Date();
    return hireDate.getMonth() === now.getMonth() && hireDate.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Human Resources</h2>
          <Button 
            onClick={() => setShowEmployeeForm(true)}
            className="mt-4 sm:mt-0 bg-primary-500 hover:bg-primary-600"
            aria-label="Add New Employee"
          >
            <UserPlus className="w-4 h-4 mr-2" aria-hidden="true" />
            Add Employee
          </Button>
        </div>

      {/* HR Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900" aria-live="polite">{totalEmployees}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center" aria-hidden="true">
                <Users className="text-blue-600 text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Present Today</p>
                <p className="text-2xl font-bold text-gray-900" aria-live="polite">{presentToday}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center" aria-hidden="true">
                <CheckCircle className="text-green-600 text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">On Leave</p>
                <p className="text-2xl font-bold text-gray-900" aria-live="polite">{onLeave}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center" aria-hidden="true">
                <CalendarX className="text-yellow-600 text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New Hires (Month)</p>
                <p className="text-2xl font-bold text-gray-900" aria-live="polite">{newHiresThisMonth}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center" aria-hidden="true">
                <UserPlus className="text-purple-600 text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee Directory */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Employee Directory</CardTitle>
            <div className="flex space-x-3 mt-4 sm:mt-0">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" aria-hidden="true" />
                <Input
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                  aria-label="Search employees by name or email"
                />
              </div>
              <Select aria-label="Filter by department">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center" role="status" aria-live="polite">Loading employees...</div>
          ) : filteredEmployees.length === 0 ? (
            <div className="p-8 text-center text-gray-500" role="status" aria-live="polite">
              No employees found. {searchQuery && "Try adjusting your search terms."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table aria-label="Employee Directory">
                <TableHeader>
                  <TableRow>
                    <TableHead scope="col">Employee</TableHead>
                    <TableHead scope="col">Position</TableHead>
                    <TableHead scope="col">Department</TableHead>
                    <TableHead scope="col">Hire Date</TableHead>
                    <TableHead scope="col">Status</TableHead>
                    <TableHead scope="col">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center" aria-hidden="true">
                            <span className="text-primary-600 font-medium">
                              {employee.firstName[0]}{employee.lastName[0]}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900">
                              {employee.firstName} {employee.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{employee.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{employee.position}</TableCell>
                      <TableCell className="capitalize">{employee.department}</TableCell>
                      <TableCell>
                        {new Date(employee.hireDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(employee.status)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" aria-label={`View details for ${employee.firstName} ${employee.lastName}`}>
                            <Eye className="w-4 h-4" aria-hidden="true" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(employee)}
                            aria-label={`Edit ${employee.firstName} ${employee.lastName}`}
                          >
                            <Edit className="w-4 h-4" aria-hidden="true" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
