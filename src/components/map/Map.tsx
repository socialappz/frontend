import { useEffect } from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  FeatureGroup,
  Rectangle,
  useMap,
} from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import osm from "./osm-providers";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "./map.css";
import { isValidLatLng } from "../../functions/isValidierung";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png",
});

type LatLngArray = [number, number];

interface MapProps {
  bottomLeft: LatLngArray | null;
  topRight: LatLngArray | null;
  setBottomLeft: (bounds: LatLngArray) => void;
  setTopRight: (bounds: LatLngArray) => void;
}

function FitBoundsControl({
  bottomLeft,
  topRight,
}: {
  bottomLeft: LatLngArray;
  topRight: LatLngArray;
}) {
  const map = useMap();
  
 useEffect(() => {
  if (isValidLatLng(bottomLeft) && isValidLatLng(topRight)) {
    map.fitBounds([bottomLeft, topRight]);
  }
}, [map, bottomLeft, topRight]);

  return null;
}

const MapComponent = ({
  bottomLeft,
  topRight,
  setBottomLeft,
  setTopRight,
}: MapProps) => {
  const ZOOM_LEVEL = 12;

  const _created = (e: any) => {
    const ne = e.layer._bounds._northEast;
    const sw = e.layer._bounds._southWest;
    setTopRight([ne.lat, ne.lng]);
    setBottomLeft([sw.lat, sw.lng]);
  };


  

  const fallbackCenter: LatLngArray = [52.52, 13.405];
  const center: LatLngArray = !bottomLeft || !topRight || (bottomLeft[0] === 0 && bottomLeft[1] === 0)
    ? fallbackCenter
    : [ (bottomLeft[0] + topRight[0]) / 2, (bottomLeft[1] + topRight[1]) / 2 ];

  return (
   <div className="w-full h-full">
      <MapContainer
        center={center || fallbackCenter}
        zoom={ZOOM_LEVEL}
        className="map-container "
      >
        <TileLayer url={osm.maptiler.url} attribution={osm.maptiler.attribution} />
        <FeatureGroup>
          {isValidLatLng(bottomLeft) && isValidLatLng(topRight) && (
            <Rectangle bounds={[bottomLeft, topRight]} pathOptions={{ color: "green" }} />
          )}
          <EditControl
            position="topright"
            onCreated={_created}
            draw={{
              rectangle: { showArea: false },
              circle: false,
              circlemarker: false,
              marker: false,
              polygon: false,
              polyline: false,
            }}
          />
        </FeatureGroup>
        {bottomLeft && topRight && <FitBoundsControl bottomLeft={bottomLeft} topRight={topRight} />}
      </MapContainer>
    </div>
  );
};
export default MapComponent;
