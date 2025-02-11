
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
        navigate("/photographer/options");
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
    "Capturing Moments That Last Forever.",
    "Creating Memories One Click at a Time.",
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-primary/10 to-secondary relative">
      <div className="w-full max-w-6xl mx-auto mb-12 flex justify-between px-8">
        {messages.slice(0, 2).map((message, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: -20 }}
            animate={{ 
              opacity: 0.9,
              y: 0,
            }}
            transition={{ 
              duration: 0.8,
              delay: index * 0.2,
              ease: "easeOut"
            }}
            className="max-w-xs p-6 glass-card rounded-2xl"
          >
            <p className="text-primary/90 text-sm font-medium">{message}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex items-start gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 0.9, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-xs p-6 glass-card rounded-2xl"
        >
          <p className="text-primary/90 text-sm font-medium">{messages[2]}</p>
        </motion.div>

        <div className="glass-card p-8 rounded-2xl w-full max-w-md z-10">
          <h2 className="text-2xl font-bold text-center mb-6 text-primary">Photographer Portal</h2>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/50"
              />
            </div>
            <div className="space-y-2">
              <Button
                type="submit"
                className="w-full bg-primary/90 hover:bg-primary"
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Sign In"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full border-primary/20 hover:bg-primary/10"
                onClick={handleSignUp}
                disabled={isLoading}
              >
                Sign Up
              </Button>
            </div>
          </form>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 0.9, x: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="max-w-xs p-6 glass-card rounded-2xl"
        >
          <p className="text-primary/90 text-sm font-medium">{messages[3]}</p>
        </motion.div>
      </div>
    </div>
  );
};

export default PhotographerLogin;
