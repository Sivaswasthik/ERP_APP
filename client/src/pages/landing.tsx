import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-primary-500 flex items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-full mb-4">
              <Building className="text-white text-2xl" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Enterprise ERP</h1>
            <p className="text-gray-600 mt-2">Sign in to your account</p>
          </div>
          
          <Button 
            onClick={handleLogin} 
            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-md transition duration-200"
          >
            Sign In
          </Button>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">Professional ERP Solution</p>
            <p className="text-xs text-gray-500">Manage your business operations efficiently</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
