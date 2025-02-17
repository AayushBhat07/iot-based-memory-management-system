
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          toast({
            variant: "destructive",
            title: "Authentication required",
            description: "Please sign in to access this page",
          });
          navigate('/photographer/login');
          return;
        }

        if (requiredRole) {
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          if (profileError || !profile || profile.role !== requiredRole) {
            toast({
              variant: "destructive",
              title: "Access denied",
              description: "You don't have permission to access this page",
            });
            navigate('/');
            return;
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "An error occurred while checking authentication",
        });
        navigate('/photographer/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate('/photographer/login');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate, requiredRole, toast]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
