import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { insertEmployeeSchema, type IEmployee } from "@shared/schema";
import { z } from "zod";

type FormData = z.infer<typeof insertEmployeeSchema>;

interface EmployeeFormProps {
  employee?: IEmployee | null;
  onClose: () => void;
}

export default function EmployeeForm({ employee, onClose }: EmployeeFormProps) {
  const { toast } = useToast();
  const isEditing = !!employee;

  const form = useForm<FormData>({
    resolver: zodResolver(insertEmployeeSchema),
    defaultValues: {
      employeeId: employee?.employeeId || `EMP-${Date.now()}`,
      firstName: employee?.firstName || "",
      lastName: employee?.lastName || "",
      email: employee?.email || "",
      position: employee?.position || "",
      department: employee?.department || "",
      salary: employee?.salary || undefined,
      hireDate: employee?.hireDate ? new Date(employee.hireDate) : new Date(),
      status: employee?.status || "active",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (isEditing && employee) {
        await apiRequest("PUT", `/api/employees/${employee.id}`, data);
      } else {
        await apiRequest("POST", "/api/employees", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      toast({
        title: "Success",
        description: `Employee ${isEditing ? "updated" : "created"} successfully`,
      });
      onClose();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 500);
        return;
      }

      const errorMessage = error.message;
      const validationPrefix = "Validation Error: ";
      if (errorMessage.startsWith(validationPrefix)) {
        const validationErrors = errorMessage.substring(validationPrefix.length).split(', ');
        validationErrors.forEach(err => {
          const parts = err.split(' ');
          const fieldName = parts[0].toLowerCase();

          if (form.getValues().hasOwnProperty(fieldName)) {
            form.setError(fieldName as keyof FormData, {
              type: "server",
              message: err,
            });
          } else if (fieldName === 'hiredate' && form.getValues().hasOwnProperty('hireDate')) {
            form.setError('hireDate', { type: "server", message: err });
          } else if (fieldName === 'salary' && form.getValues().hasOwnProperty('salary')) {
            form.setError('salary', { type: "server", message: err });
          }
        });
        toast({
          title: "Validation Error",
          description: "Please check the form for errors.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: `Failed to ${isEditing ? "update" : "create"} employee: ${error.message}`,
          variant: "destructive",
        });
      }
    },
  });

  const onSubmit = (data: FormData) => {
    createMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={onClose} aria-label="Back to Employee Table">
          <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
          Back
        </Button>
        <h2 className="text-2xl font-bold text-gray-900">
          {isEditing ? "Edit Employee" : "Add New Employee"}
        </h2>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" aria-label={isEditing ? "Edit Employee Form" : "Add New Employee Form"}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="employeeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employee ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter employee ID" {...field} aria-required="true" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger aria-label="Select employee status">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="on_leave">On Leave</SelectItem>
                          <SelectItem value="terminated">Terminated</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter first name" {...field} aria-required="true" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter last name" {...field} aria-required="true" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="Enter email address" 
                          {...field} 
                          aria-required="true"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter position" {...field} aria-required="true" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger aria-label="Select department">
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="engineering">Engineering</SelectItem>
                          <SelectItem value="sales">Sales</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="hr">HR</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="operations">Operations</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="salary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salary (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="0.00" 
                          {...field} 
                          value={field.value ?? ''} // Handle undefined for optional number input
                          onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          aria-label="Employee Salary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hireDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hire Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          value={field.value ? field.value.toISOString().split('T')[0] : ''}
                          onChange={e => field.onChange(new Date(e.target.value))}
                          aria-required="true"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={onClose} aria-label="Cancel">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending}
                  className="bg-primary-500 hover:bg-primary-600"
                  aria-label={isEditing ? "Update Employee" : "Create Employee"}
                >
                  {createMutation.isPending 
                    ? (isEditing ? "Updating..." : "Creating...") 
                    : (isEditing ? "Update Employee" : "Create Employee")
                  }
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
