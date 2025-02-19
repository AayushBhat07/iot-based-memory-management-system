
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
          // Redirect based on the required role
          if (requiredRole === 'photographer') {
            navigate('/photographer/login');
          } else if (requiredRole === 'client') {
            navigate('/user/login'); // Assuming you have a user login page
          } else {
            navigate('/');
          }
          return;
        }

        if (requiredRole) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          if (profileError || !profile || profile.role !== requiredRole) {
            toast({
              variant: "destructive",
              title: "Access denied",
              description: requiredRole === 'photographer' 
                ? "This page is only accessible to photographers" 
                : "This page is only accessible to clients",
            });
            // Redirect to appropriate home page based on role
            if (profile?.role === 'photographer') {
              navigate('/photographer/dashboard');
            } else if (profile?.role === 'client') {
              navigate('/user/dashboard');
            } else {
              navigate('/');
            }
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
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        if (requiredRole === 'photographer') {
          navigate('/photographer/login');
        } else if (requiredRole === 'client') {
          navigate('/user/login');
        } else {
          navigate('/');
        }
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
