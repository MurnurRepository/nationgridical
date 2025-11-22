import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield } from "lucide-react";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [countryName, setCountryName] = useState("");
  const [capitalName, setCapitalName] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: async (data: { username: string; password: string }) => {
      const result = await apiRequest("POST", "/api/auth/login", data);
      return result;
    },
    onSuccess: () => {
      setLocation("/game");
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "Invalid credentials",
      });
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: { username: string; password: string; countryName: string; capitalCityName: string }) => {
      const result = await apiRequest("POST", "/api/auth/signup", data);
      return result;
    },
    onSuccess: () => {
      setLocation("/game");
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Signup failed",
        description: error.message || "Could not create account",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      loginMutation.mutate({ username, password });
    } else {
      if (!countryName || !capitalName) {
        toast({
          variant: "destructive",
          title: "Missing information",
          description: "Please provide country name and capital city",
        });
        return;
      }
      signupMutation.mutate({ username, password, countryName, capitalCityName: capitalName });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10">
              <Shield className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-display font-bold text-primary">COMMAND NATIONS</h1>
            </div>
          </div>
          <CardTitle className="text-center">{isLogin ? "Welcome Back" : "Create Your Nation"}</CardTitle>
          <CardDescription className="text-center">
            {isLogin 
              ? "Sign in to continue your conquest" 
              : "Build your empire and dominate the world"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                data-testid="input-username"
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                data-testid="input-password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="country">Country Name</Label>
                  <Input
                    id="country"
                    data-testid="input-country-name"
                    type="text"
                    placeholder="Name your nation"
                    value={countryName}
                    onChange={(e) => setCountryName(e.target.value)}
                    required={!isLogin}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capital">Capital City</Label>
                  <Input
                    id="capital"
                    data-testid="input-capital-name"
                    type="text"
                    placeholder="Name your capital"
                    value={capitalName}
                    onChange={(e) => setCapitalName(e.target.value)}
                    required={!isLogin}
                  />
                </div>
              </>
            )}
            <Button 
              type="submit" 
              className="w-full"
              data-testid={isLogin ? "button-login" : "button-signup"}
              disabled={loginMutation.isPending || signupMutation.isPending}
            >
              {loginMutation.isPending || signupMutation.isPending 
                ? "Please wait..." 
                : isLogin ? "Sign In" : "Create Nation"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            variant="ghost"
            onClick={() => setIsLogin(!isLogin)}
            data-testid="button-toggle-auth-mode"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
