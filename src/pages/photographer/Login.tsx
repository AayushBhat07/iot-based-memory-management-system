
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

const PhotographerLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error signing in",
          description: error.message,
        });
      } else {
        toast({
          title: "Signed in successfully",
          description: "Welcome back!",
        });
        navigate("/photographer/upload");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("already registered") || error.message.includes("already exists")) {
          toast({
            variant: "destructive",
            title: "Account already exists",
            description: "Please sign in instead of signing up.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Error signing up",
            description: error.message,
          });
        }
      } else {
        toast({
          title: "Sign up successful",
          description: "Please check your email for verification.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const messages = [
    "Experience the Difference. Professional Photography That Shines.",
    "More Than Just Photos, We Deliver Art.",
    "Let Us Tell Your Story Through Photography. Get in Touch!",
    "We Didn't Just Take Pictures, We Experienced the Event With You!",
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-gray-900 to-black relative overflow-hidden">
      {/* Floating Messages */}
      {messages.map((message, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 0.9,
            y: 0,
            x: `${(index % 2 === 0 ? -1 : 1) * (15 + index * 5)}%`,
          }}
          transition={{ 
            duration: 0.8,
            delay: index * 0.2,
            ease: "easeOut"
          }}
          className={`absolute ${
            index % 2 === 0 ? 'left-1/4' : 'right-1/4'
          } ${
            index < 2 ? 'top-1/4' : 'bottom-1/4'
          } transform -translate-x-1/2 max-w-xs
          p-6 rounded-2xl bg-white/10 backdrop-blur-lg
          border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)]
          hover:shadow-[0_8px_32px_rgba(31,38,135,0.15)]
          transition-all duration-300 hover:-translate-y-1`}
        >
          <p className="text-white/90 text-sm font-medium">{message}</p>
        </motion.div>
      ))}

      {/* Login Form */}
      <div className="p-8 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_32px_rgba(31,38,135,0.15)] transition-all duration-300 w-full max-w-md z-10">
        <h2 className="text-2xl font-bold text-center mb-6 text-white">Photographer Portal</h2>
        <form onSubmit={handleSignIn} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-white/10 border-white/20 text-white"
            />
          </div>
          <div className="space-y-2">
            <Button
              type="submit"
              className="w-full bg-white/20 hover:bg-white/30 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Sign In"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full border-white/20 text-white hover:bg-white/10"
              onClick={handleSignUp}
              disabled={isLoading}
            >
              Sign Up
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PhotographerLogin;
