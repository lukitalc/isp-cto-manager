import { useState, useEffect } from 'react';
import { Cto } from '../services/api';

interface CtoFormProps {
  cto?: Cto;
  onSubmit: (data: CtoFormData) => Promise<void>;
  onCancel: () => void;
}

export interface CtoFormData {
  name: string;
  latitude: number;
  longitude: number;
  splitterType: string;
  totalPorts: number;
  status: 'ATIVA' | 'PLANEJADA' | 'MANUTENCAO';
  installationDate?: string;
}

export default function CtoForm({ cto, onSubmit, onCancel }: CtoFormProps) {
  const [formData, setFormData] = useState<CtoFormData>({
    name: '',
    latitude: -23.550520,
    longitude: -46.633308,
    splitterType: '1x8',
    totalPorts: 8,
    status: 'ATIVA',
    installationDate: new Date().toISOString().split('T')[0],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cto) {
      setFormData({
        name: cto.name,
        latitude: cto.latitude,
        longitude: cto.longitude,
        splitterType: cto.splitterType,
        totalPorts: cto.totalPorts,
        status: cto.status,
        installationDate: cto.installationDate || new Date().toISOString().split('T')[0],
      });
    }
  }, [cto]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await onSubmit(formData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao salvar CTO');
    } finally {
      setLoading(false);
    }
  };

  const handleSplitterTypeChange = (type: string) => {
    setFormData({
      ...formData,
      splitterType: type,
      totalPorts: type === '1x8' ? 8 : type === '1x16' ? 16 : parseInt(type.split('x')[1]) || 8,
    });
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          setError('Não foi possível obter a localização atual');
        }
      );
    } else {
      setError('Geolocalização não é suportada pelo navegador');
    }
  };

  return (
    <div style={{
      backgroundColor: 'white',
      padding: '24px',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      maxWidth: '600px',
      margin: '0 auto',
    }}>
      <h2 style={{ marginTop: 0, marginBottom: '24px' }}>
        {cto ? 'Editar CTO' : 'Nova CTO'}
      </h2>

      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          color: '#991b1b',
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '16px',
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Nome/ID da CTO *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px',
            }}
            placeholder="Ex: CTO-01-B03"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Latitude *
            </label>
            <input
              type="number"
              step="any"
              value={formData.latitude}
              onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
              required
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Longitude *
            </label>
            <input
              type="number"
              step="any"
              value={formData.longitude}
              onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
              required
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleGetCurrentLocation}
          style={{
            marginBottom: '16px',
            padding: '8px 16px',
            backgroundColor: '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          📍 Usar Localização Atual
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Tipo de Splitter *
            </label>
            <select
              value={formData.splitterType}
              onChange={(e) => handleSplitterTypeChange(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            >
              <option value="1x8">1x8</option>
              <option value="1x16">1x16</option>
              <option value="1x32">1x32</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Total de Portas
            </label>
            <input
              type="number"
              value={formData.totalPorts}
              readOnly
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: '#f3f4f6',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Status *
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              required
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            >
              <option value="ATIVA">Ativa</option>
              <option value="PLANEJADA">Planejada</option>
              <option value="MANUTENCAO">Manutenção</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Data de Instalação
            </label>
            <input
              type="date"
              value={formData.installationDate}
              onChange={(e) => setFormData({ ...formData, installationDate: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onCancel}
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
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
}

