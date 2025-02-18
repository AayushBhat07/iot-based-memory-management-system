
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Upload = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Upload Photos</h1>
      <Button onClick={() => navigate("/photographer/dashboard")}>
        Back to Dashboard
      </Button>
    </div>
  );
};

export default Upload;
