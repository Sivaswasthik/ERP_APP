import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function Landing() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let result;
    if (isRegistering) {
      result = await register(email, password, firstName, lastName);
    } else {
      result = await login(email, password);
    }

    if (result.success) {
      toast({
        title: "Success",
        description: isRegistering ? "Registration successful!" : "Login successful!",
      });
      // Redirection is now handled by the useEffect in App.tsx based on isAuthenticated state
    } else {
      toast({
        title: "Error",
        description: result.error || "An error occurred.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-primary-500 flex items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-full mb-4">
              <Building className="text-white text-2xl" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Enterprise ERP</CardTitle>
            <p className="text-gray-600 mt-2">{isRegistering ? "Create your account" : "Sign in to your account"}</p>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <form onSubmit={handleSubmit}>
            {isRegistering && (
              <>
                <div className="mb-4">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    aria-label="First Name"
                  />
                </div>
                <div className="mb-4">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    aria-label="Last Name"
                  />
                </div>
              </>
            )}
            <div className="mb-4">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-label="Email"
              />
            </div>
            <div className="mb-6">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                aria-label="Password"
              />
            </div>
            <Button type="submit" className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-md transition duration-200">
              {isRegistering ? "Register" : "Sign In"}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <Button variant="link" onClick={() => setIsRegistering(!isRegistering)} aria-label={isRegistering ? "Switch to Sign In" : "Switch to Register"}>
              {isRegistering ? "Already have an account? Sign In" : "Don't have an account? Register"}
            </Button>
          </div>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">Professional ERP Solution</p>
            <p className="text-xs text-gray-500">Manage your business operations efficiently</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
