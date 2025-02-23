
import { useEffect } from "react";

const resources = [
  // Add your critical JavaScript resources here
  "/src/main.tsx",
  // Add more as needed
];

export function ScriptPreload() {
  useEffect(() => {
    resources.forEach((resource) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "script";
      link.href = resource;
      document.head.appendChild(link);
    });
  }, []);

  return null;
}
