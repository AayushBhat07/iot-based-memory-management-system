
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700">
      <div className="glass-card p-8 rounded-2xl text-center">
        <h1 className="text-4xl font-bold mb-4 text-white">404</h1>
        <p className="text-xl text-white/80 mb-4">Oops! Page not found</p>
        <a href="/" className="text-[#F97316] hover:text-[#F97316]/80 underline">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
