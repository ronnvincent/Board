import { useEffect } from "react";
import L from "leaflet";
import "leaflet-routing-machine";
import { useMap } from "react-leaflet";

export default function RoutingMachine({
  userPos,
  targetPos
}: {
  userPos: [number, number];
  targetPos: [number, number];
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(userPos[0], userPos[1]),
        L.latLng(targetPos[0], targetPos[1])
      ],
      routeWhileDragging: false,
      addWaypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: false,
      lineOptions: {
        styles: [{ color: "#173f39", weight: 4 }],
        extendToWaypoints: true,
        missingRouteTolerance: 10
      },
      createMarker: () => null
    }).addTo(map);

    const container = routingControl.getContainer();
    if (container) {
      container.style.display = "none";
    }

    return () => {
      map.removeControl(routingControl);
    };
  }, [map, userPos, targetPos]);

  return null;
}
