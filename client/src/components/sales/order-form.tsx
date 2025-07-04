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
import { insertOrderSchema, type IOrder } from "@shared/schema";
import { z } from "zod";

type FormData = z.infer<typeof insertOrderSchema>;

interface OrderFormProps {
  order?: IOrder | null;
  onClose: () => void;
}

export default function OrderForm({ order, onClose }: OrderFormProps) {
  const { toast } = useToast();
  const isEditing = !!order;

  const form = useForm<FormData>({
    resolver: zodResolver(insertOrderSchema),
    defaultValues: {
      orderNumber: order?.orderNumber || `ORD-${Date.now()}`,
      customerName: order?.customerName || "",
      customerEmail: order?.customerEmail || "",
      totalAmount: order?.totalAmount || 0,
      status: order?.status || "pending",
      type: order?.type || "sale",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (isEditing && order) {
        await apiRequest("PUT", `/api/orders/${order.id}`, data);
      } else {
        await apiRequest("POST", "/api/orders", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Success",
        description: `Order ${isEditing ? "updated" : "created"} successfully`,
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
          } else if (fieldName === 'totalamount' && form.getValues().hasOwnProperty('totalAmount')) {
            form.setError('totalAmount', { type: "server", message: err });
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
          description: `Failed to ${isEditing ? "update" : "create"} order: ${error.message}`,
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
        <Button variant="outline" onClick={onClose} aria-label="Back to Orders Table">
          <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
          Back
        </Button>
        <h2 className="text-2xl font-bold text-gray-900">
          {isEditing ? "Edit Order" : "Create New Order"}
        </h2>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Order Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" aria-label={isEditing ? "Edit Order Form" : "Create New Order Form"}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="orderNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter order number" {...field} aria-required="true" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger aria-label="Select order type">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="sale">Sale</SelectItem>
                          <SelectItem value="purchase">Purchase</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter customer name" {...field} aria-required="true" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customerEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="Enter customer email" 
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
                  name="totalAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Amount ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="0.00" 
                          {...field} 
                          onChange={e => field.onChange(parseFloat(e.target.value))}
                          aria-required="true"
                        />
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
                          <SelectTrigger aria-label="Select order status">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
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
                  aria-label={isEditing ? "Update Order" : "Create Order"}
                >
                  {createMutation.isPending 
                    ? (isEditing ? "Updating..." : "Creating...") 
                    : (isEditing ? "Update Order" : "Create Order")
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
