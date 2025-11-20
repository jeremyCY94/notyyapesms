import { DatabaseService } from '@/components/service/databaseService';
import { headlessNotificationListener } from '@/components/service/notificationListenerService';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  AppRegistry,
  FlatList,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { RNAndroidNotificationListenerHeadlessJsName } from 'react-native-android-notification-listener';
import { Icon } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';

// Función para inicializar la base de datos
DatabaseService.initDatabase()
/**
 * AppRegistry should be required early in the require sequence
 * to make sure the JS execution environment is setup before other
 * modules are required.
 */
export default function HomeScreen() {
  const [numbers, setNumbers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentNumber, setCurrentNumber] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);


  // Cargar números cuando la base de datos esté inicializada
  useEffect(() => {

      loadNumbers();
    
  },[]);



  const loadNumbers = async () => {
    
    try {
      setIsLoading(true);
      const allRows:any = await DatabaseService.getAllNumbers();
      setNumbers(allRows);
    } catch (error) {
      console.error('Error loading numbers:', error);
      Alert.alert('Error', 'No se pudieron cargar los números');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    if (currentNumber.trim() === '') {
      Alert.alert('Error', 'Por favor ingrese un número válido');
      return;
    }

    try {
      if (editingId) {
        await DatabaseService.updateNumber(parseInt(editingId),currentNumber)
      } else {
        await DatabaseService.addNumber(currentNumber)
      }

      await loadNumbers();
      
      setCurrentNumber('');
      setEditingId(null);
      setModalVisible(false);
    } catch (error) {
      console.error('Error saving number:', error);
      Alert.alert('Error', 'No se pudo guardar el número');
    }
  };

  const handleEdit = (item:any) => {
    setCurrentNumber(item.value);
    setEditingId(item.id);
    setModalVisible(true);
  };

  const handleDelete = async (id:any) => {

    Alert.alert(
      'Confirmar Eliminación',
      '¿Estás seguro de que quieres eliminar este número?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await DatabaseService.deleteNumber(parseInt(id))
              await loadNumbers();
            } catch (error) {
              console.error('Error deleting number:', error);
              Alert.alert('Error', 'No se pudo eliminar el número');
            }
          },
        },
      ]
    );
  };

  const clearAllNumbers = async () => {
    if (numbers.length === 0 ) return;
    
    Alert.alert(
      'Confirmar',
      '¿Estás seguro de que quieres eliminar TODOS los números?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar Todos',
          style: 'destructive',
          onPress: async () => {
            try {
              await DatabaseService.deleteAllNumbers();
              await loadNumbers();
            } catch (error) {
              console.error('Error deleting all numbers:', error);
              Alert.alert('Error', 'No se pudieron eliminar todos los números');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }:any) => (
    <View className="bg-white p-4 mx-4 my-2 rounded-lg shadow-sm border border-gray-200 flex-row justify-between items-center">
      <View className="flex-1">
        <Text className="text-lg font-medium text-gray-800">
          {item.value}
        </Text>
        {item.createdAt && (
          <Text className="text-xs text-gray-500 mt-1">
            Creado: {new Date(item.createdAt).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        )}
      </View>
      <View className="flex-row space-x-2">
        <TouchableOpacity
          className="bg-blue-500 px-3 py-2 rounded-lg flex-row items-center"
          onPress={() => handleEdit(item)}
        >
          <Icon name="edit" size={16} color="white" />
          <Text className="text-white font-medium ml-1">Editar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          className="bg-red-500 px-3 py-2 rounded-lg flex-row items-center"
          onPress={() => handleDelete(item.id)}
        >
          <Icon name="delete" size={16} color="white" />
          <Text className="text-white font-medium ml-1">Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if ( isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <View className="bg-white p-8 rounded-lg shadow-md items-center">
          <Icon name="hourglass-empty" size={48} color="#3B82F6" />
          <Text className="text-xl font-semibold text-gray-700 mt-4">
            Inicializando base de datos...
          </Text>
          <Text className="text-gray-500 text-center mt-2">
            Por favor espere
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-blue-600 py-6 px-4 shadow-md">
        <Text className="text-2xl font-bold text-white text-center">
          Registro de Números a Notificar
        </Text>
        <Text className="text-blue-100 text-center mt-1">
          {numbers.length} número(s) registrado(s)
        </Text>
      </View>

      {/* Botón de limpiar todos (solo visible si hay números) */}
      {numbers.length > 0 && (
        <View className="px-4 mt-4">
          <TouchableOpacity
            className="bg-red-500 py-3 rounded-lg flex-row justify-center items-center"
            onPress={clearAllNumbers}
          >
            <Icon name="delete-sweep" size={20} color="white" />
            <Text className="text-white font-medium ml-2">
              Eliminar Todos los Números
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Lista de números */}
      <FlatList
        data={numbers}
        renderItem={renderItem}
        keyExtractor={(item:any)=> item.id}
        className="flex-1 mt-4"
        refreshing={isLoading}
        onRefresh={loadNumbers}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center mt-20">
            <Icon name="list-alt" size={64} color="#9CA3AF" />
            <Text className="text-lg text-gray-500 mt-4 text-center">
              No hay números registrados
            </Text>
            <Text className="text-gray-400 text-center mt-2">
              Presiona el botón + para agregar el primer número
            </Text>
          </View>
        }
      />

      {/* Botón flotante para agregar */}
      <View className="absolute bottom-6 right-6">
        <TouchableOpacity
          className="bg-blue-600 w-14 h-14 rounded-full shadow-lg justify-center items-center"
          onPress={() => {
            setCurrentNumber('');
            setEditingId(null);
            setModalVisible(true);
          }}
        >
          <Icon name="add" size={28} color="white" />
        </TouchableOpacity>
      </View>

      {/* Modal para agregar/editar */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-xl p-6 mx-4 w-11/12 shadow-xl">
            <Text className="text-xl font-bold text-gray-800 text-center mb-4">
              {editingId ? 'Editar Número' : 'Agregar Nuevo Número'}
            </Text>
            
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-lg mb-6"
              placeholder="Ingrese el número..."
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              value={currentNumber}
              onChangeText={setCurrentNumber}
              autoFocus
            />

            <View className="flex-row justify-between space-x-3">
              <TouchableOpacity
                className="flex-1 bg-gray-500 py-3 rounded-lg justify-center items-center flex-row"
                onPress={() => {
                  setModalVisible(false);
                  setCurrentNumber('');
                  setEditingId(null);
                }}
              >
                <Icon name="cancel" size={20} color="white" />
                <Text className="text-white font-medium ml-2">
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 bg-blue-600 py-3 rounded-lg justify-center items-center flex-row"
                onPress={handleAdd}
              >
                <Icon 
                  name={editingId ? "save" : "add"} 
                  size={20} 
                  color="white" 
                />
                <Text className="text-white font-medium ml-2">
                  {editingId ? 'Guardar' : 'Agregar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}