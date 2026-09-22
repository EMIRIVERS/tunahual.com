import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: intento de acceso a una ruta que no existe:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <div className="text-center max-w-md">
        <h1 className="mb-4 font-serif text-5xl font-bold text-foreground">404</h1>
        <p className="mb-6 text-xl text-muted-foreground">
          Esta página no existe, pero tu Nahual sí te está esperando.
        </p>
        <Button asChild>
          <a href="/">Volver al inicio</a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
