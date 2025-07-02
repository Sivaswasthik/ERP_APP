import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, ShoppingCart, Package, Users, TrendingUp, TrendingDown } from "lucide-react";

export default function KPICards() {
  const { data: kpis, isLoading } = useQuery({
    queryKey: ["/api/dashboard/kpis"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Revenue",
      value: `$${kpis?.totalRevenue?.toLocaleString() || '0'}`,
      change: "+12.5%",
      icon: DollarSign,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      trend: TrendingUp,
      trendColor: "text-green-600"
    },
    {
      title: "Active Orders",
      value: kpis?.activeOrders?.toString() || '0',
      change: "+8.2%",
      icon: ShoppingCart,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      trend: TrendingUp,
      trendColor: "text-blue-600"
    },
    {
      title: "Inventory Items",
      value: kpis?.inventoryItems?.toString() || '0',
      change: "-2.1%",
      icon: Package,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      trend: TrendingDown,
      trendColor: "text-orange-600"
    },
    {
      title: "Employees",
      value: kpis?.employees?.toString() || '0',
      change: "+3 new",
      icon: Users,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      trend: TrendingUp,
      trendColor: "text-green-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const Trend = card.trend;
        
        return (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  <p className={`text-sm mt-1 flex items-center ${card.trendColor}`}>
                    <Trend className="w-3 h-3 mr-1" />
                    {card.change}
                  </p>
                </div>
                <div className={`w-12 h-12 ${card.iconBg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`${card.iconColor} text-xl`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
