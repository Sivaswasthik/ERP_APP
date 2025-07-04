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
import { insertTransactionSchema, type ITransaction } from "@shared/schema";
import { z } from "zod";

type FormData = z.infer<typeof insertTransactionSchema>;

interface TransactionFormProps {
  transaction?: ITransaction | null;
  onClose: () => void;
}

export default function TransactionForm({ transaction, onClose }: TransactionFormProps) {
  const { toast } = useToast();
  const isEditing = !!transaction;

  const form = useForm<FormData>({
    resolver: zodResolver(insertTransactionSchema),
    defaultValues: {
      description: transaction?.description || "",
      amount: transaction?.amount || 0,
      type: transaction?.type || "income",
      category: transaction?.category || "",
      date: transaction?.date ? new Date(transaction.date) : new Date(),
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (isEditing && transaction) {
        await apiRequest("PUT", `/api/transactions/${transaction.id}`, data);
      } else {
        await apiRequest("POST", "/api/transactions", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({
        title: "Success",
        description: `Transaction ${isEditing ? "updated" : "created"} successfully`,
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
          } else if (fieldName === 'amount' && form.getValues().hasOwnProperty('amount')) {
            form.setError('amount', { type: "server", message: err });
          } else if (fieldName === 'date' && form.getValues().hasOwnProperty('date')) {
            form.setError('date', { type: "server", message: err });
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
          description: `Failed to ${isEditing ? "update" : "create"} transaction: ${error.message}`,
          variant: "destructive",
        });
      }
    },
  });

  const onSubmit = (data: FormData) => {
    createMutation.mutate(data);
  };

  const watchedType = form.watch("type");

  const getCategoryOptions = (type: string) => {
    switch (type) {
      case "income":
        return [
          { value: "sales_revenue", label: "Sales Revenue" },
          { value: "service_income", label: "Service Income" },
          { value: "interest_income", label: "Interest Income" },
          { value: "other_income", label: "Other Income" },
        ];
      case "expense":
        return [
          { value: "office_expenses", label: "Office Expenses" },
          { value: "marketing", label: "Marketing" },
          { value: "utilities", label: "Utilities" },
          { value: "payroll", label: "Payroll" },
          { value: "rent", label: "Rent" },
          { value: "supplies", label: "Supplies" },
          { value: "travel", label: "Travel" },
          { value: "other_expenses", label: "Other Expenses" },
        ];
      case "transfer":
        return [
          { value: "bank_transfer", label: "Bank Transfer" },
          { value: "internal_transfer", label: "Internal Transfer" },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={onClose} aria-label="Back to Transactions Table">
          <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
          Back
        </Button>
        <h2 className="text-2xl font-bold text-gray-900">
          {isEditing ? "Edit Transaction" : "Add New Transaction"}
        </h2>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" aria-label={isEditing ? "Edit Transaction Form" : "Add New Transaction Form"}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transaction Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger aria-label="Select transaction type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="income">Income</SelectItem>
                          <SelectItem value="expense">Expense</SelectItem>
                          <SelectItem value="transfer">Transfer</SelectItem>
                        </SelectContent>
                      </Select>
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
                          <SelectTrigger aria-label="Select transaction category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getCategoryOptions(watchedType).map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount ($)</FormLabel>
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
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transaction Date</FormLabel>
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

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter transaction description" 
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
                  aria-label={isEditing ? "Update Transaction" : "Create Transaction"}
                >
                  {createMutation.isPending 
                    ? (isEditing ? "Updating..." : "Creating...") 
                    : (isEditing ? "Update Transaction" : "Create Transaction")
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
