import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Debug: Log da URL da API
console.log('🔗 API Base URL:', API_BASE_URL);
console.log('🔗 VITE_API_URL:', import.meta.env.VITE_API_URL);

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tipos
export interface Cto {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  splitterType: string;
  totalPorts: number;
  status: 'ATIVA' | 'PLANEJADA' | 'MANUTENCAO';
  installationDate?: string;
  connections?: ClientConnection[];
  createdAt: string;
  updatedAt: string;
}

export interface ClientConnection {
  id: string;
  ctoId: string;
  portNumber: number;
  contractId: string;
  onuSerialNumber: string;
  connectionDate?: string;
  cto?: Cto;
  createdAt: string;
  updatedAt: string;
}

export interface OccupancyStats {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  status: string;
  totalPorts: number;
  occupiedPorts: number;
  availablePorts: number;
  occupancyRate: number;
  occupancyLevel: 'low' | 'medium' | 'high';
}

export interface PortStatus {
  portNumber: number;
  status: 'occupied' | 'available';
  connection: {
    id: string;
    contractId: string;
    onuSerialNumber: string;
    connectionDate?: string;
  } | null;
}

export interface PortsStatusResponse {
  ctoId: string;
  ctoName: string;
  totalPorts: number;
  occupiedPorts: number;
  availablePorts: number;
  ports: PortStatus[];
}

// API de CTOs
export const ctosApi = {
  getAll: (status?: string) => 
    api.get<Cto[]>('/ctos', { params: { status } }),
  
  getById: (id: string) => 
    api.get<Cto>(`/ctos/${id}`),
  
  create: (data: Omit<Cto, 'id' | 'createdAt' | 'updatedAt' | 'connections'>) => 
    api.post<Cto>('/ctos', data),
  
  update: (id: string, data: Partial<Omit<Cto, 'id' | 'createdAt' | 'updatedAt' | 'connections'>>) => 
    api.patch<Cto>(`/ctos/${id}`, data),
  
  delete: (id: string) => 
    api.delete(`/ctos/${id}`),
  
  getOccupancyStats: () => 
    api.get<OccupancyStats[]>('/ctos/occupancy-stats'),
};

// API de Conexões de Clientes
export const clientConnectionsApi = {
  getAll: () => 
    api.get<ClientConnection[]>('/client-connections'),
  
  getById: (id: string) => 
    api.get<ClientConnection>(`/client-connections/${id}`),
  
  create: (data: Omit<ClientConnection, 'id' | 'createdAt' | 'updatedAt' | 'cto'>) => 
    api.post<ClientConnection>('/client-connections', data),
  
  update: (id: string, data: Partial<Omit<ClientConnection, 'id' | 'createdAt' | 'updatedAt' | 'cto'>>) => 
    api.patch<ClientConnection>(`/client-connections/${id}`, data),
  
  delete: (id: string) => 
    api.delete(`/client-connections/${id}`),
  
  searchByContract: (contractId: string) => 
    api.get<ClientConnection>(`/client-connections/search/contract/${contractId}`),
  
  searchByOnuSerial: (onuSerial: string) => 
    api.get<ClientConnection[]>(`/client-connections/search/onu/${onuSerial}`),
  
  getPortsStatus: (ctoId: string) => 
    api.get<PortsStatusResponse>(`/client-connections/ports-status/${ctoId}`),
};

