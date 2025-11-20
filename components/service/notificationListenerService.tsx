// notificationListener.js

import { Alert } from "react-native";
import { sendSMSNotificationRN } from "./SmsServiceRN";

export const headlessNotificationListener = async ({ notification }:any) => {
  if (!notification) return;

  try {
    const jsonObject = JSON.parse(notification);
    
    // Filtrar por app (ejemplo con Yape)
    if ((jsonObject.app + '').toLowerCase().includes('yape')) {
       
      
      // Extraer información relevante de la notificación
      const message = jsonObject.text || jsonObject.title || 'Nueva notificación';
      
      // Enviar SMS
      await sendSMSNotificationRN(message);
      Alert.alert('📱 Notificación de Yape detectada:', jsonObject.text);
    }
  } catch (error) {
    console.error('❌ Error en headless notification listener:', error);
  }
};