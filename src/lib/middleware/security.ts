
import { supabase } from "@/integrations/supabase/client";

export interface SecurityConfig {
  requireAuth?: boolean;
  roles?: string[];
  rateLimit?: {
    maxRequests: number;
    windowSeconds: number;
  };
}

export async function securityMiddleware(request: Request, config: SecurityConfig = {}) {
  try {
    // Check HTTPS
    if (process.env.NODE_ENV === 'production' && !request.url.startsWith('https')) {
      return new Response('HTTPS is required', { status: 403 });
    }

    // Rate limiting
    if (config.rateLimit) {
      const clientIp = request.headers.get('x-forwarded-for') || '0.0.0.0';
      const endpoint = new URL(request.url).pathname;

      const { data: isAllowed, error: rateLimitError } = await supabase.rpc('check_rate_limit', {
        p_ip_address: clientIp,
        p_endpoint: endpoint,
        p_max_requests: config.rateLimit.maxRequests,
        p_window_seconds: config.rateLimit.windowSeconds
      });

      if (rateLimitError || !isAllowed) {
        return new Response('Rate limit exceeded', { 
          status: 429,
          headers: {
            'Retry-After': config.rateLimit.windowSeconds.toString()
          }
        });
      }
    }

    // Authentication check
    if (config.requireAuth) {
      const { data: { session }, error: authError } = await supabase.auth.getSession();

      if (authError || !session) {
        return new Response('Unauthorized', { status: 401 });
      }

      // Role-based access control
      if (config.roles && config.roles.length > 0) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (!profile || !config.roles.includes(profile.role)) {
          // Log unauthorized access attempt
          await supabase.rpc('log_audit_event', {
            p_action: 'UNAUTHORIZED_ACCESS',
            p_resource_type: 'route',
            p_resource_id: new URL(request.url).pathname,
            p_metadata: JSON.stringify({
              required_roles: config.roles,
              user_role: profile?.role
            })
          });

          return new Response('Forbidden', { status: 403 });
        }
      }

      // Log successful access
      await supabase.rpc('log_audit_event', {
        p_action: 'ACCESS',
        p_resource_type: 'route',
        p_resource_id: new URL(request.url).pathname,
        p_metadata: JSON.stringify({
          method: request.method,
          user_agent: request.headers.get('user-agent')
        })
      });
    }

    return null; // Continue to next middleware/route handler
  } catch (error) {
    console.error('Security middleware error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
