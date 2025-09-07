import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login process
    setTimeout(() => {
      // Demo credentials
      if (credentials.email === "broker@ibarize.com" && credentials.password === "admin123") {
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userRole", "broker");
        toast({
          title: "Success",
          description: "Login successful! Welcome to IBARIZE Dashboard."
        });
        navigate("/dashboard");
      } else {
        toast({
          title: "Error",
          description: "Invalid credentials. Use: broker@ibarize.com / admin123",
          variant: "destructive"
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">
            IBARIZE REAL ESTATE
          </CardTitle>
          <p className="text-muted-foreground">Broker Dashboard Login</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={credentials.email}
                onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                placeholder="broker@ibarize.com"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Enter your password"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary-hover"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground font-medium mb-2">Demo Credentials:</p>
            <div className="text-xs space-y-1">
              <p><strong>Email:</strong> broker@ibarize.com</p>
              <p><strong>Password:</strong> admin123</p>
            </div>
          </div>

          <div className="mt-4 text-center">
            <Button 
              variant="link" 
              onClick={() => navigate("/")}
              className="text-primary"
            >
              Back to Main Site
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;