import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { OccupancyStats } from '../services/api';

// Fix para os ícones do Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Ícones customizados por nível de ocupação
const getMarkerIcon = (occupancyLevel: 'low' | 'medium' | 'high') => {
  const colors = {
    low: '#10b981',    // Verde
    medium: '#f59e0b', // Amarelo
    high: '#ef4444',   // Vermelho
  };

  const color = colors[occupancyLevel];

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: white;
        font-size: 12px;
      ">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

interface MapViewProps {
  ctos: OccupancyStats[];
  onCtoClick?: (cto: OccupancyStats) => void;
  selectedCtoId?: string;
}

// Componente para ajustar o centro do mapa
function MapController({ ctos }: { ctos: OccupancyStats[] }) {
  const map = useMap();

  useEffect(() => {
    if (ctos.length > 0) {
      const bounds = L.latLngBounds(
        ctos.map(cto => [cto.latitude, cto.longitude] as [number, number])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [ctos, map]);

  return null;
}

export default function MapView({ ctos, onCtoClick, selectedCtoId }: MapViewProps) {
  const [center] = useState<[number, number]>([-23.550520, -46.633308]); // São Paulo como padrão

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {ctos.length > 0 && <MapController ctos={ctos} />}
        
        {ctos.map((cto) => (
          <Marker
            key={cto.id}
            position={[cto.latitude, cto.longitude]}
            icon={getMarkerIcon(cto.occupancyLevel)}
            eventHandlers={{
              click: () => onCtoClick?.(cto),
            }}
          >
            <Popup>
              <div style={{ minWidth: '200px' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: 'bold' }}>
                  {cto.name}
                </h3>
                <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                  <p style={{ margin: '5px 0' }}>
                    <strong>Status:</strong> {cto.status}
                  </p>
                  <p style={{ margin: '5px 0' }}>
                    <strong>Ocupação:</strong> {cto.occupiedPorts}/{cto.totalPorts} portas ({cto.occupancyRate}%)
                  </p>
                  <p style={{ margin: '5px 0' }}>
                    <strong>Portas Livres:</strong> {cto.availablePorts}
                  </p>
                  <div style={{
                    marginTop: '10px',
                    padding: '8px',
                    borderRadius: '4px',
                    backgroundColor: cto.occupancyLevel === 'low' ? '#d1fae5' :
                                     cto.occupancyLevel === 'medium' ? '#fef3c7' : '#fee2e2',
                    color: cto.occupancyLevel === 'low' ? '#065f46' :
                           cto.occupancyLevel === 'medium' ? '#92400e' : '#991b1b',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                  }}>
                    {cto.occupancyLevel === 'low' && 'Baixa Ocupação'}
                    {cto.occupancyLevel === 'medium' && 'Ocupação Moderada'}
                    {cto.occupancyLevel === 'high' && 'Alta Ocupação'}
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

