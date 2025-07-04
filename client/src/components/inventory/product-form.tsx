import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { insertProductSchema, type IProduct } from "@shared/schema";
import { z } from "zod";

type FormData = z.infer<typeof insertProductSchema>;

interface ProductFormProps {
  product?: IProduct | null;
  onClose: () => void;
}

export default function ProductForm({ product, onClose }: ProductFormProps) {
  const { toast } = useToast();
  const isEditing = !!product;

  const form = useForm<FormData>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      sku: product?.sku || "",
      category: product?.category || "",
      price: product?.price || 0,
      stock: product?.stock || 0,
      status: product?.status || "active",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (isEditing && product) {
        await apiRequest("PUT", `/api/products/${product.id}`, data);
      } else {
        await apiRequest("POST", "/api/products", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Success",
        description: `Product ${isEditing ? "updated" : "created"} successfully`,
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

      // Attempt to parse server-side validation errors
      const errorMessage = error.message;
      const validationPrefix = "Validation Error: ";
      if (errorMessage.startsWith(validationPrefix)) {
        const validationErrors = errorMessage.substring(validationPrefix.length).split(', ');
        validationErrors.forEach(err => {
          // This is a simplistic parsing. A more robust solution might involve
          // the server returning a structured error object.
          // For now, assuming format "field is required" or "field must be type"
          const parts = err.split(' ');
          const fieldName = parts[0].toLowerCase(); // e.g., "name", "price"

          // Map common Zod error messages to form fields
          if (form.getValues().hasOwnProperty(fieldName)) {
            form.setError(fieldName as keyof FormData, {
              type: "server",
              message: err,
            });
          } else if (fieldName === 'price' && form.getValues().hasOwnProperty('price')) {
            form.setError('price', { type: "server", message: err });
          } else if (fieldName === 'stock' && form.getValues().hasOwnProperty('stock')) {
            form.setError('stock', { type: "server", message: err });
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
          description: `Failed to ${isEditing ? "update" : "create"} product: ${error.message}`,
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
        <Button variant="outline" onClick={onClose} aria-label="Back to Inventory Table">
          <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
          Back
        </Button>
        <h2 className="text-2xl font-bold text-gray-900">
          {isEditing ? "Edit Product" : "Add New Product"}
        </h2>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" aria-label={isEditing ? "Edit Product Form" : "Add New Product Form"}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter product name" {...field} aria-required="true" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter SKU" {...field} aria-required="true" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger aria-label="Select product category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="electronics">Electronics</SelectItem>
                          <SelectItem value="clothing">Clothing</SelectItem>
                          <SelectItem value="home">Home & Garden</SelectItem>
                          <SelectItem value="furniture">Furniture</SelectItem>
                          <SelectItem value="toys">Toys</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price ($)</FormLabel>
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
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Quantity</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field} 
                          onChange={e => field.onChange(parseInt(e.target.value))}
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
                          <SelectTrigger aria-label="Select product status">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="discontinued">Discontinued</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter product description" 
                        rows={4}
                        {...field} 
                        aria-required="true"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={onClose} aria-label="Cancel">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending}
                  className="bg-primary-500 hover:bg-primary-600"
                  aria-label={isEditing ? "Update Product" : "Create Product"}
                >
                  {createMutation.isPending 
                    ? (isEditing ? "Updating..." : "Creating...") 
                    : (isEditing ? "Update Product" : "Create Product")
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
