import { useMemo } from "react";

import { useCurrentLocation } from "@/src/hooks/search/useCurrentLocation";

export interface CurrentCoordinates {
  x: number;
  y: number;
}

export function useCurrentCoordinates(): CurrentCoordinates | null {
  const { camera } = useCurrentLocation();

  return useMemo(
    () => (camera ? { x: camera.longitude, y: camera.latitude } : null),
    [camera],
  );
}
