import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { ctosApi, clientConnectionsApi, OccupancyStats, Cto, PortsStatusResponse } from './src/services/api';

type Screen = 'map' | 'add-cto' | 'cto-details' | 'search';

export default function App() {
  const [screen, setScreen] = useState<Screen>('map');
  const [ctos, setCtos] = useState<OccupancyStats[]>([]);
  const [selectedCto, setSelectedCto] = useState<Cto | null>(null);
  const [portsStatus, setPortsStatus] = useState<PortsStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    latitude: -23.550520,
    longitude: -46.633308,
    splitterType: '1x8',
    totalPorts: 8,
    status: 'ATIVA' as 'ATIVA' | 'PLANEJADA' | 'MANUTENCAO',
    installationDate: new Date().toISOString().split('T')[0],
  });

  const [connectModalVisible, setConnectModalVisible] = useState(false);
  const [connectPortNumber, setConnectPortNumber] = useState(0);
  const [connectionData, setConnectionData] = useState({
    contractId: '',
    onuSerialNumber: '',
  });

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Permissão de localização é necessária');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      setFormData(prev => ({
        ...prev,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      }));
    })();

    loadCtos();
  }, []);

  const loadCtos = async () => {
    try {
      setLoading(true);
      const response = await ctosApi.getOccupancyStats();
      setCtos(response.data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar as CTOs. Verifique se o backend está rodando.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCto = async () => {
    try {
      await ctosApi.create(formData);
      Alert.alert('Sucesso', 'CTO criada com sucesso!');
      await loadCtos();
      setScreen('map');
      setFormData({
        name: '',
        latitude: location?.coords.latitude || -23.550520,
        longitude: location?.coords.longitude || -46.633308,
        splitterType: '1x8',
        totalPorts: 8,
        status: 'ATIVA',
        installationDate: new Date().toISOString().split('T')[0],
      });
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.message || 'Erro ao criar CTO');
    }
  };

  const handleCtoPress = async (cto: OccupancyStats) => {
    try {
      const response = await ctosApi.getById(cto.id);
      setSelectedCto(response.data);
      
      const portsResponse = await clientConnectionsApi.getPortsStatus(cto.id);
      setPortsStatus(portsResponse.data);
      
      setScreen('cto-details');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar detalhes da CTO');
    }
  };

  const handleConnectClient = async () => {
    if (!selectedCto) return;

    try {
      await clientConnectionsApi.create({
        ctoId: selectedCto.id,
        portNumber: connectPortNumber,
        contractId: connectionData.contractId,
        onuSerialNumber: connectionData.onuSerialNumber,
        connectionDate: new Date().toISOString().split('T')[0],
      });

      Alert.alert('Sucesso', 'Cliente conectado com sucesso!');
      setConnectModalVisible(false);
      setConnectionData({ contractId: '', onuSerialNumber: '' });
      
      const portsResponse = await clientConnectionsApi.getPortsStatus(selectedCto.id);
      setPortsStatus(portsResponse.data);
      await loadCtos();
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.message || 'Erro ao conectar cliente');
    }
  };

  const getMarkerColor = (level: 'low' | 'medium' | 'high') => {
    return level === 'low' ? 'green' : level === 'medium' ? 'orange' : 'red';
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📡 ISP CTO Manager</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.headerButton, screen === 'map' && styles.headerButtonActive]}
            onPress={() => setScreen('map')}
          >
            <Text style={styles.headerButtonText}>Mapa</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerButton, screen === 'add-cto' && styles.headerButtonActive]}
            onPress={() => setScreen('add-cto')}
          >
            <Text style={styles.headerButtonText}>+ CTO</Text>
          </TouchableOpacity>
        </View>
      </View>

      {screen === 'map' && (
        <MapView
          provider={PROVIDER_DEFAULT}
          style={styles.map}
          initialRegion={{
            latitude: location?.coords.latitude || -23.550520,
            longitude: location?.coords.longitude || -46.633308,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          showsUserLocation
        >
          {ctos.map((cto) => (
            <Marker
              key={cto.id}
              coordinate={{
                latitude: cto.latitude,
                longitude: cto.longitude,
              }}
              pinColor={getMarkerColor(cto.occupancyLevel)}
              onPress={() => handleCtoPress(cto)}
              title={cto.name}
              description={`${cto.occupiedPorts}/${cto.totalPorts} portas`}
            />
          ))}
        </MapView>
      )}

      {screen === 'add-cto' && (
        <ScrollView style={styles.formContainer}>
          <Text style={styles.formTitle}>Nova CTO</Text>

          <Text style={styles.label}>Nome/ID da CTO</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholder="Ex: CTO-01-B03"
          />

          <Text style={styles.label}>Latitude</Text>
          <TextInput
            style={styles.input}
            value={formData.latitude.toString()}
            onChangeText={(text) => setFormData({ ...formData, latitude: parseFloat(text) || 0 })}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Longitude</Text>
          <TextInput
            style={styles.input}
            value={formData.longitude.toString()}
            onChangeText={(text) => setFormData({ ...formData, longitude: parseFloat(text) || 0 })}
            keyboardType="numeric"
          />

          <TouchableOpacity
            style={styles.locationButton}
            onPress={async () => {
              const loc = await Location.getCurrentPositionAsync({});
              setFormData({
                ...formData,
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
              });
            }}
          >
            <Text style={styles.locationButtonText}>📍 Usar Localização Atual</Text>
          </TouchableOpacity>

          <Text style={styles.label}>Tipo de Splitter</Text>
          <View style={styles.pickerContainer}>
            {['1x8', '1x16', '1x32'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.pickerOption,
                  formData.splitterType === type && styles.pickerOptionActive,
                ]}
                onPress={() => setFormData({
                  ...formData,
                  splitterType: type,
                  totalPorts: parseInt(type.split('x')[1]),
                })}
              >
                <Text style={styles.pickerOptionText}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleCreateCto}>
            <Text style={styles.submitButtonText}>Salvar CTO</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {screen === 'cto-details' && selectedCto && portsStatus && (
        <ScrollView style={styles.detailsContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setScreen('map')}
          >
            <Text style={styles.backButtonText}>← Voltar</Text>
          </TouchableOpacity>

          <View style={styles.detailsHeader}>
            <Text style={styles.detailsTitle}>{selectedCto.name}</Text>
            <Text style={styles.detailsSubtitle}>Status: {selectedCto.status}</Text>
            <Text style={styles.detailsSubtitle}>
              Ocupação: {portsStatus.occupiedPorts}/{portsStatus.totalPorts} portas
            </Text>
          </View>

          <Text style={styles.portsTitle}>Portas do Splitter</Text>

          {portsStatus.ports.map((port) => (
            <View
              key={port.portNumber}
              style={[
                styles.portCard,
                port.status === 'available' ? styles.portAvailable : styles.portOccupied,
              ]}
            >
              <View style={styles.portHeader}>
                <Text style={styles.portNumber}>Porta {port.portNumber}</Text>
                <Text style={[
                  styles.portStatus,
                  port.status === 'available' ? styles.statusAvailable : styles.statusOccupied,
                ]}>
                  {port.status === 'available' ? 'Livre' : 'Ocupada'}
                </Text>
              </View>

              {port.connection ? (
                <View style={styles.connectionInfo}>
                  <Text style={styles.connectionText}>Contrato: {port.connection.contractId}</Text>
                  <Text style={styles.connectionText}>ONU: {port.connection.onuSerialNumber}</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.connectButton}
                  onPress={() => {
                    setConnectPortNumber(port.portNumber);
                    setConnectModalVisible(true);
                  }}
                >
                  <Text style={styles.connectButtonText}>Conectar Cliente</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>
      )}

      <Modal
        visible={connectModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setConnectModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Conectar Cliente - Porta {connectPortNumber}</Text>

            <Text style={styles.label}>ID do Contrato</Text>
            <TextInput
              style={styles.input}
              value={connectionData.contractId}
              onChangeText={(text) => setConnectionData({ ...connectionData, contractId: text })}
              placeholder="Ex: CONTRATO-12345"
            />

            <Text style={styles.label}>Serial da ONU</Text>
            <TextInput
              style={styles.input}
              value={connectionData.onuSerialNumber}
              onChangeText={(text) => setConnectionData({ ...connectionData, onuSerialNumber: text })}
              placeholder="Ex: HWTC1234ABCD"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setConnectModalVisible(false);
                  setConnectionData({ contractId: '', onuSerialNumber: '' });
                }}
              >
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmitButton}
                onPress={handleConnectClient}
              >
                <Text style={styles.modalSubmitButtonText}>Conectar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#6b7280' },
  header: { backgroundColor: '#1f2937', paddingTop: 50, paddingBottom: 16, paddingHorizontal: 16 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: 'white', marginBottom: 12 },
  headerButtons: { flexDirection: 'row', gap: 8 },
  headerButton: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#4b5563', borderRadius: 4 },
  headerButtonActive: { backgroundColor: '#3b82f6' },
  headerButtonText: { color: 'white', fontSize: 14, fontWeight: '500' },
  map: { flex: 1 },
  formContainer: { flex: 1, padding: 16 },
  formTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 8, marginTop: 12 },
  input: { backgroundColor: 'white', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 4, padding: 12, fontSize: 14 },
  locationButton: { backgroundColor: '#6366f1', padding: 12, borderRadius: 4, marginTop: 12, alignItems: 'center' },
  locationButtonText: { color: 'white', fontSize: 14, fontWeight: '500' },
  pickerContainer: { flexDirection: 'row', gap: 8 },
  pickerOption: { flex: 1, padding: 12, backgroundColor: 'white', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 4, alignItems: 'center' },
  pickerOptionActive: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  pickerOptionText: { fontSize: 14, fontWeight: '500' },
  submitButton: { backgroundColor: '#10b981', padding: 16, borderRadius: 4, marginTop: 24, marginBottom: 32, alignItems: 'center' },
  submitButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  detailsContainer: { flex: 1, padding: 16 },
  backButton: { marginBottom: 16 },
  backButtonText: { color: '#3b82f6', fontSize: 16, fontWeight: '500' },
  detailsHeader: { backgroundColor: 'white', padding: 16, borderRadius: 8, marginBottom: 16 },
  detailsTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  detailsSubtitle: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  portsTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  portCard: { padding: 16, borderRadius: 8, marginBottom: 12, borderWidth: 1 },
  portAvailable: { backgroundColor: '#f0fdf4', borderColor: '#10b981' },
  portOccupied: { backgroundColor: '#fef3c7', borderColor: '#f59e0b' },
  portHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  portNumber: { fontSize: 16, fontWeight: 'bold' },
  portStatus: { fontSize: 12, fontWeight: '500', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12 },
  statusAvailable: { backgroundColor: '#d1fae5', color: '#065f46' },
  statusOccupied: { backgroundColor: '#fef3c7', color: '#92400e' },
  connectionInfo: { marginTop: 8 },
  connectionText: { fontSize: 13, color: '#374151', marginTop: 4 },
  connectButton: { backgroundColor: '#10b981', padding: 8, borderRadius: 4, marginTop: 8, alignItems: 'center' },
  connectButtonText: { color: 'white', fontSize: 12, fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', padding: 24, borderRadius: 8, width: '90%', maxWidth: 400 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 24 },
  modalCancelButton: { flex: 1, padding: 12, backgroundColor: '#e5e7eb', borderRadius: 4, alignItems: 'center' },
  modalCancelButtonText: { color: '#374151', fontSize: 14, fontWeight: '500' },
  modalSubmitButton: { flex: 1, padding: 12, backgroundColor: '#10b981', borderRadius: 4, alignItems: 'center' },
  modalSubmitButtonText: { color: 'white', fontSize: 14, fontWeight: '500' },
});

