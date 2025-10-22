import { useState } from 'react';

interface ConnectClientModalProps {
  ctoId: string;
  portNumber: number;
  onSubmit: (data: { ctoId: string; portNumber: number; contractId: string; onuSerialNumber: string; connectionDate: string }) => Promise<void>;
  onClose: () => void;
}

export default function ConnectClientModal({ ctoId, portNumber, onSubmit, onClose }: ConnectClientModalProps) {
  const [formData, setFormData] = useState({
    contractId: '',
    onuSerialNumber: '',
    connectionDate: new Date().toISOString().split('T')[0],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await onSubmit({
        ctoId,
        portNumber,
        ...formData,
      });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao conectar cliente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '8px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        maxWidth: '500px',
        width: '90%',
      }}>
        <h2 style={{ marginTop: 0, marginBottom: '16px' }}>
          Conectar Cliente - Porta {portNumber}
        </h2>

        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '16px',
            fontSize: '14px',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
              ID do Contrato *
            </label>
            <input
              type="text"
              value={formData.contractId}
              onChange={(e) => setFormData({ ...formData, contractId: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px',
              }}
              placeholder="Ex: CONTRATO-12345"
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
              Serial Number da ONU *
            </label>
            <input
              type="text"
              value={formData.onuSerialNumber}
              onChange={(e) => setFormData({ ...formData, onuSerialNumber: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px',
              }}
              placeholder="Ex: HWTC1234ABCD"
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
              Data de Conexão
            </label>
            <input
              type="date"
              value={formData.connectionDate}
              onChange={(e) => setFormData({ ...formData, connectionDate: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '10px 20px',
                backgroundColor: '#e5e7eb',
                color: '#374151',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 20px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'Conectando...' : 'Conectar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

