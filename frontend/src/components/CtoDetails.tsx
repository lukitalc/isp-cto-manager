import { useState, useEffect } from 'react';
import { clientConnectionsApi } from '../services/api';
import type { Cto, PortsStatusResponse } from '../services/api';

interface CtoDetailsProps {
  cto: Cto;
  onClose: () => void;
  onConnectClient: (ctoId: string, portNumber: number) => void;
  onDisconnectClient: (connectionId: string) => void;
}

export default function CtoDetails({ cto, onClose, onConnectClient, onDisconnectClient }: CtoDetailsProps) {
  const [portsStatus, setPortsStatus] = useState<PortsStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPortsStatus();
  }, [cto.id]);

  const loadPortsStatus = async () => {
    try {
      setLoading(true);
      const response = await clientConnectionsApi.getPortsStatus(cto.id);
      setPortsStatus(response.data);
    } catch (error) {
      console.error('Erro ao carregar status das portas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async (connectionId: string) => {
    if (confirm('Deseja realmente desconectar este cliente?')) {
      await onDisconnectClient(connectionId);
      loadPortsStatus();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: '500px',
      height: '100vh',
      backgroundColor: 'white',
      boxShadow: '-2px 0 8px rgba(0,0,0,0.1)',
      overflowY: 'auto',
      zIndex: 1000,
    }}>
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0 }}>Detalhes da CTO</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280',
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '18px' }}>{cto.name}</h3>
          <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
            <p style={{ margin: '4px 0' }}><strong>Status:</strong> {cto.status}</p>
            <p style={{ margin: '4px 0' }}><strong>Tipo de Splitter:</strong> {cto.splitterType}</p>
            <p style={{ margin: '4px 0' }}><strong>Total de Portas:</strong> {cto.totalPorts}</p>
            {portsStatus && (
              <>
                <p style={{ margin: '4px 0' }}>
                  <strong>Portas Ocupadas:</strong> {portsStatus.occupiedPorts}
                </p>
                <p style={{ margin: '4px 0' }}>
                  <strong>Portas Livres:</strong> {portsStatus.availablePorts}
                </p>
              </>
            )}
            <p style={{ margin: '4px 0' }}>
              <strong>Coordenadas:</strong> {Number(cto.latitude).toFixed(6)}, {Number(cto.longitude).toFixed(6)}
            </p>
          </div>
        </div>

        <h3 style={{ marginBottom: '16px' }}>Portas do Splitter</h3>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            Carregando portas...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {portsStatus?.ports.map((port) => (
              <div
                key={port.portNumber}
                style={{
                  padding: '16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  backgroundColor: port.status === 'available' ? '#f0fdf4' : '#fef3c7',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: port.status === 'available' ? '#10b981' : '#f59e0b',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '14px',
                    }}>
                      {port.portNumber}
                    </span>
                    <span style={{ fontWeight: '500', fontSize: '14px' }}>
                      Porta {port.portNumber}
                    </span>
                  </div>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    backgroundColor: port.status === 'available' ? '#d1fae5' : '#fef3c7',
                    color: port.status === 'available' ? '#065f46' : '#92400e',
                  }}>
                    {port.status === 'available' ? 'Livre' : 'Ocupada'}
                  </span>
                </div>

                {port.connection ? (
                  <div style={{ fontSize: '13px', color: '#374151', marginTop: '12px' }}>
                    <p style={{ margin: '4px 0' }}>
                      <strong>Contrato:</strong> {port.connection.contractId}
                    </p>
                    <p style={{ margin: '4px 0' }}>
                      <strong>Serial ONU:</strong> {port.connection.onuSerialNumber}
                    </p>
                    {port.connection.connectionDate && (
                      <p style={{ margin: '4px 0' }}>
                        <strong>Conectado em:</strong> {new Date(port.connection.connectionDate).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                    <button
                      onClick={() => handleDisconnect(port.connection!.id)}
                      style={{
                        marginTop: '8px',
                        padding: '6px 12px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '500',
                      }}
                    >
                      Desconectar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => onConnectClient(cto.id, port.portNumber)}
                    style={{
                      marginTop: '8px',
                      padding: '6px 12px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500',
                    }}
                  >
                    Conectar Cliente
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

