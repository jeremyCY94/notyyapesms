// smsService.js
import * as SMS from 'expo-sms';
import { DatabaseService } from './databaseService';

export const sendSMSNotificationExpo= async (message:any) => {
  try {
    const isAvailable = await SMS.isAvailableAsync();
    if (!isAvailable) {
      console.log('❌ SMS no disponible en este dispositivo');
      return;
    }

    // Obtener números desde la base de datos
    const numbers = await DatabaseService.getAllNumbers();
    
    if (numbers.length === 0) {
      console.log('❌ No hay números registrados para enviar SMS');
      return;
    }

    const phoneNumbers = numbers.map((item:any) => item.value);
    const smsText = `Notificación: ${message}`;
    
    await SMS.sendSMSAsync(phoneNumbers, smsText);
    console.log(`✅ SMS enviado exitosamente a ${numbers.length} número(s)`);
    
  } catch (error) {
    console.error('❌ Error enviando SMS:', error);
  }
};