import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Check, User } from "lucide-react";

export default function RecentActivity() {
  const activities = [
    {
      id: 1,
      type: "order",
      message: "New order #12345 created",
      time: "2 minutes ago",
      icon: Plus,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      id: 2,
      type: "inventory",
      message: "Inventory updated for Product ABC",
      time: "15 minutes ago",
      icon: Check,
      iconBg: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      id: 3,
      type: "employee",
      message: "New employee Sarah Johnson onboarded",
      time: "1 hour ago",
      icon: User,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activity.icon;
            
            return (
              <div key={activity.id} className="flex items-start space-x-3" role="listitem">
                <div className={`w-8 h-8 ${activity.iconBg} rounded-full flex items-center justify-center flex-shrink-0`} aria-hidden="true">
                  <Icon className={`${activity.iconColor} text-xs`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500" aria-label={`Time: ${activity.time}`}>{activity.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
