
import { supabase } from "@/integrations/supabase/client";
import { NextResponse } from "next/server";

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

      const { data: isAllowed } = await supabase.rpc('check_rate_limit', {
        p_ip_address: clientIp,
        p_endpoint: endpoint,
        p_max_requests: config.rateLimit.maxRequests,
        p_window_seconds: config.rateLimit.windowSeconds
      });

      if (!isAllowed) {
        return new Response('Rate limit exceeded', { status: 429 });
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
          .from('user_profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (!profile || !config.roles.includes(profile.role)) {
          return new Response('Forbidden', { status: 403 });
        }
      }
    }

    return null; // Continue to next middleware/route handler
  } catch (error) {
    console.error('Security middleware error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
