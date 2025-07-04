import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText, UserPlus, BarChart3 } from "lucide-react";

export default function QuickActions() {
  const actions = [
    {
      label: "Add Product",
      icon: PlusCircle,
      onClick: () => console.log("Add Product")
    },
    {
      label: "Create Order",
      icon: FileText,
      onClick: () => console.log("Create Order")
    },
    {
      label: "Add Employee",
      icon: UserPlus,
      onClick: () => console.log("Add Employee")
    },
    {
      label: "Generate Report",
      icon: BarChart3,
      onClick: () => console.log("Generate Report")
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {actions.map((action, index) => {
            const Icon = action.icon;
            
            return (
              <Button
                key={index}
                variant="outline"
                className="flex flex-col items-center p-4 h-auto bg-gray-50 hover:bg-gray-100 transition duration-200"
                onClick={action.onClick}
                aria-label={action.label}
              >
                <Icon className="text-primary-600 text-2xl mb-2" aria-hidden="true" />
                <span className="text-sm font-medium text-gray-900">{action.label}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
