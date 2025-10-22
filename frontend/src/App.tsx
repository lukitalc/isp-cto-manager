import { useState, useEffect } from 'react';
import MapView from './components/MapView';
import CtoForm from './components/CtoForm';
import type { CtoFormData } from './components/CtoForm';
import CtoDetails from './components/CtoDetails';
import ConnectClientModal from './components/ConnectClientModal';
import { ctosApi, clientConnectionsApi } from './services/api';
import type { OccupancyStats, Cto } from './services/api';

type View = 'map' | 'add-cto' | 'edit-cto' | 'search';

function App() {
  const [view, setView] = useState<View>('map');
  const [ctos, setCtos] = useState<OccupancyStats[]>([]);
  const [selectedCto, setSelectedCto] = useState<Cto | null>(null);
  const [editingCto, setEditingCto] = useState<Cto | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  
  // Estado para modal de conexão
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [connectModalData, setConnectModalData] = useState<{ ctoId: string; portNumber: number } | null>(null);

  useEffect(() => {
    loadCtos();
  }, []);

  const loadCtos = async () => {
    try {
      setLoading(true);
      const response = await ctosApi.getOccupancyStats();
      setCtos(response.data);
    } catch (error) {
      console.error('Erro ao carregar CTOs:', error);
      alert('Erro ao carregar CTOs. Verifique se o backend está rodando.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCto = async (data: CtoFormData) => {
    await ctosApi.create(data);
    await loadCtos();
    setView('map');
  };

  const handleUpdateCto = async (data: CtoFormData) => {
    if (editingCto) {
      await ctosApi.update(editingCto.id, data);
      await loadCtos();
      setEditingCto(null);
      setView('map');
    }
  };

  const handleCtoClick = async (cto: OccupancyStats) => {
    try {
      const response = await ctosApi.getById(cto.id);
      setSelectedCto(response.data);
    } catch (error) {
      console.error('Erro ao carregar detalhes da CTO:', error);
    }
  };

  const handleConnectClient = (ctoId: string, portNumber: number) => {
    setConnectModalData({ ctoId, portNumber });
    setConnectModalOpen(true);
  };

  const handleSubmitConnection = async (data: any) => {
    await clientConnectionsApi.create(data);
    await loadCtos();
    if (selectedCto) {
      const response = await ctosApi.getById(selectedCto.id);
      setSelectedCto(response.data);
    }
  };

  const handleDisconnectClient = async (connectionId: string) => {
    await clientConnectionsApi.delete(connectionId);
    await loadCtos();
    if (selectedCto) {
      const response = await ctosApi.getById(selectedCto.id);
      setSelectedCto(response.data);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    try {
      // Tentar buscar por contrato primeiro
      try {
        const response = await clientConnectionsApi.searchByContract(searchTerm);
        setSearchResult(response.data);
        return;
      } catch (err) {
        // Se não encontrar por contrato, tentar por serial
        const response = await clientConnectionsApi.searchByOnuSerial(searchTerm);
        if (response.data.length > 0) {
          setSearchResult(response.data[0]);
        } else {
          setSearchResult(null);
          alert('Cliente não encontrado');
        }
      }
    } catch (error) {
      console.error('Erro na busca:', error);
      alert('Erro ao buscar cliente');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#1f2937',
        color: 'white',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
          📡 ISP CTO Manager
        </h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setView('map')}
            style={{
              padding: '8px 16px',
              backgroundColor: view === 'map' ? '#3b82f6' : '#4b5563',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            🗺️ Mapa
          </button>
          <button
            onClick={() => setView('add-cto')}
            style={{
              padding: '8px 16px',
              backgroundColor: view === 'add-cto' ? '#3b82f6' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            ➕ Nova CTO
          </button>
          <button
            onClick={() => setView('search')}
            style={{
              padding: '8px 16px',
              backgroundColor: view === 'search' ? '#3b82f6' : '#4b5563',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            🔍 Buscar Cliente
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {view === 'map' && (
          <>
            {loading ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                fontSize: '18px',
                color: '#6b7280',
              }}>
                Carregando CTOs...
              </div>
            ) : (
              <MapView
                ctos={ctos}
                onCtoClick={handleCtoClick}
              />
            )}
            {selectedCto && (
              <CtoDetails
                cto={selectedCto}
                onClose={() => setSelectedCto(null)}
                onConnectClient={handleConnectClient}
                onDisconnectClient={handleDisconnectClient}
              />
            )}
          </>
        )}

        {view === 'add-cto' && (
          <div style={{ padding: '24px', overflowY: 'auto', height: '100%' }}>
            <CtoForm
              onSubmit={handleCreateCto}
              onCancel={() => setView('map')}
            />
          </div>
        )}

        {view === 'edit-cto' && editingCto && (
          <div style={{ padding: '24px', overflowY: 'auto', height: '100%' }}>
            <CtoForm
              cto={editingCto}
              onSubmit={handleUpdateCto}
              onCancel={() => {
                setEditingCto(null);
                setView('map');
              }}
            />
          </div>
        )}

        {view === 'search' && (
          <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}>
              <h2 style={{ marginTop: 0, marginBottom: '24px' }}>Buscar Cliente</h2>
              
              <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ID do Contrato ou Serial da ONU"
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px',
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                  }}
                >
                  Buscar
                </button>
              </div>

              {searchResult && (
                <div style={{
                  padding: '16px',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #10b981',
                  borderRadius: '8px',
                }}>
                  <h3 style={{ marginTop: 0, marginBottom: '12px', color: '#065f46' }}>
                    Cliente Encontrado
                  </h3>
                  <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
                    <p><strong>ID do Contrato:</strong> {searchResult.contractId}</p>
                    <p><strong>Serial da ONU:</strong> {searchResult.onuSerialNumber}</p>
                    <p><strong>CTO:</strong> {searchResult.cto?.name}</p>
                    <p><strong>Porta:</strong> {searchResult.portNumber}</p>
                    {searchResult.connectionDate && (
                      <p><strong>Data de Conexão:</strong> {new Date(searchResult.connectionDate).toLocaleDateString('pt-BR')}</p>
                    )}
                  </div>
                  <button
                    onClick={async () => {
                      const response = await ctosApi.getById(searchResult.ctoId);
                      setSelectedCto(response.data);
                      setView('map');
                    }}
                    style={{
                      marginTop: '12px',
                      padding: '8px 16px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                    }}
                  >
                    Ver no Mapa
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modal de Conexão */}
      {connectModalOpen && connectModalData && (
        <ConnectClientModal
          ctoId={connectModalData.ctoId}
          portNumber={connectModalData.portNumber}
          onSubmit={handleSubmitConnection}
          onClose={() => {
            setConnectModalOpen(false);
            setConnectModalData(null);
          }}
        />
      )}
    </div>
  );
}

export default App;

