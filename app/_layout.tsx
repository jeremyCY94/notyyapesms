import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemeProvider } from '@/lib/theme-context';
import '../global.css';


import { headlessNotificationListener } from '@/components/service/notificationListenerService';
import * as IntentLauncher from 'expo-intent-launcher';
import { useEffect, useState } from 'react';
import { Alert, AppRegistry, PermissionsAndroid, Platform } from 'react-native';
import { RNAndroidNotificationListenerHeadlessJsName } from 'react-native-android-notification-listener';

export const unstable_settings = {
  anchor: '(tabs)',
};


AppRegistry.registerHeadlessTask(
  RNAndroidNotificationListenerHeadlessJsName,
  () => headlessNotificationListener
);


export default function RootLayout() {

  const colorScheme = useColorScheme();
  const [hasPermission, setHasPermission] = useState(false);

  // ✅ 1. Esta función se llama automáticamente al iniciar la app
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    console.log("Inicializando app...");
    // Verificar permisos existentes
    await requestAllPermissions();
    await checkExistingPermissions();
  };



  // ✅ 3. Verificar permisos existentes
  const checkExistingPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const hasSMSPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.SEND_SMS
        );
        console.log("¿Tiene permiso SMS?", hasSMSPermission);
        setHasPermission(hasSMSPermission);
      } catch (error) {
        console.error('Error verificando permisos:', error);
      }
    }
  };

  // ✅ 4. Solicitar permisos (se llama cuando el usuario presiona el botón)
  const requestAllPermissions = async () => {
    console.log("Solicitando permisos...");
    const smsGranted = await requestSMSPermission();

    if (smsGranted) {
      setHasPermission(true);
      showNotificationSetupInstructions();
    } else {
      Alert.alert('Permiso Denegado', 'Necesitas conceder permiso de SMS para que la app funcione.');
    }
  };

  // ✅ 5. Solicitar permiso específico de SMS
  const requestSMSPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.SEND_SMS,
          {
            title: 'Permiso para Enviar SMS',
            message: 'Esta app necesita permiso para enviar SMS automáticamente',
            buttonPositive: 'OK',
            buttonNegative: 'Cancelar',
          }
        );
        console.log("Resultado permiso SMS:", granted);
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Error solicitando permiso SMS:', err);
        return false;
      }
    }
    return false;
  };

  // ✅ 6. Mostrar instrucciones después de conceder permisos
  const showNotificationSetupInstructions = () => {
    Alert.alert(
      'Paso Final - Activar Servicio de Notificaciones',
      'Ahora debes activar manualmente el servicio de notificaciones en la configuración del sistema:',
      [
        {
          text: 'Abrir Configuración',
          onPress: openNotificationSettings
        },
        {
          text: 'Más Tarde',
          style: 'cancel'
        }
      ]
    );
  };

  // ✅ 7. Abrir configuración de notificaciones
  const openNotificationSettings = async () => {
    if (Platform.OS === 'android') {
      await IntentLauncher.startActivityAsync(
        'android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS'
      );
    }
  };


  return (
    <ThemeProvider defaultTheme='system'>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
