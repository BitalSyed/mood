
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Heart, Loader2, Mail, Lock } from "lucide-react";
import { toast } from "sonner";

const Verify = () => {
  const [otp, setotp] = useState("");
  const { verify, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        await verify({ 
            otp
          });
          setotp("")
    } catch (error) {
      // Error handling is done in the AuthContext
    }
  };

  return (
    <div className="container max-w-md mx-auto px-4 py-8">
      <div className="text-center mb-8 animate-in">
        <div className="inline-flex items-center justify-center mb-4">
          <Heart className="h-8 w-8 text-primary animate-pulse" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Verify MoodScape</h1>
        <p className="text-muted-foreground">Start your journey to better mental wellness</p>
      </div>

      <Card className="animate-in">
        <CardHeader>
          <CardTitle>Verify OTP</CardTitle>
          <CardDescription>Enter your OTP to verify your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="XXXXXX"
                  className="pl-10"
                  value={otp}
                  onChange={(e) => setotp(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Already have an account?{" "}
        <Link to="/login" className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default Verify;
