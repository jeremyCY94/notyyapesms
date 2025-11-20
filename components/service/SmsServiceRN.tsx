// smsService.js
import { DatabaseService } from './databaseService';

// Para React Native
import { SendDirectSms } from 'react-native-send-direct-sms';

// O si prefieres mantener compatibilidad con Expo, usa esta alternativa
export const sendSMSNotificationRN = async (message:any) => {
  try {
    const numbers = await DatabaseService.getAllNumbers();
    
    if (numbers.length === 0) {
      console.log('❌ No hay números registrados para enviar SMS');
      return;
    }

    const phoneNumbers = numbers.map((item:any )=> item.value);

    const smsText = parsePaymentMessageAdvanced(message);
    
    // Configuración para enviar automáticamente
    const options = {
      // iOS
      // successTypes: ['sent', 'queued'], // 'sent' para enviado, 'queued' para encolado
      // Android
      allowAndroidSendWithoutReadPermission: true
    };

    // Enviar a cada número individualmente
     // Enviar con delays entre mensajes
    for (let i = 0; i < phoneNumbers.length; i++) {
      const phoneNumber = phoneNumbers[i];
      
      // Esperar entre 2-5 segundos entre mensajes
      if (i > 0) {
        const delay = 3000 + Math.random() * 3000; // 2-5 segundos
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      await sendSingleSMS(phoneNumber, smsText, options);
      
      // Si son muchos números, hacer pausas más largas cada 5 mensajes
      if ((i + 1) % 5 === 0) {
        console.log(`⏸️  Pausa después de ${i + 1} mensajes`);
        await new Promise(resolve => setTimeout(resolve, 10000)); // 10 segundos
      }
    }
    console.log(`✅ SMS enviados automáticamente a ${numbers.length} número(s)`);
    
    
  } catch (error) {
    console.error('❌ Error enviando SMS:', error);
  }
};

//Notificación Yape: Juan F. Garcia A. te envió un pago por S/ 1. El cód. de seguridad es: 542
const sendSingleSMS = (phoneNumber:any, message:any, options:any) => {
  return new Promise((resolve, reject) => {
    SendDirectSms(phoneNumber, message)
    .then((res) => {resolve(res); console.log(`✅  mensaje enviado ${phoneNumber}`, message);})
    .catch((err) =>{reject(err); console.log('❌ Error enviando SMS:',err)})
  });
};




// Versión más robusta con diferentes patrones de mensaje
export const parsePaymentMessageAdvanced = (message:any) => {
  if (!message || typeof message !== 'string' || message.split('S/').length <=1) {
    return 'Formato de mensaje inválido';
  }

  try {

    const arrayPart = message.split('S/')

    let name = arrayPart[0].split('te')[0];
    let amount = arrayPart[1].split('El')[0];
    let securityCode = arrayPart[1].split(':')[1];

    // Patrón 1: "Nombre te envió un pago por S/ X. El cód. de seguridad es: Y"
    let pattern1 = /^(.*?)\s+te\s+envió\s+(?:un\s+)?pago\s+por\s+S\/\s*([\d.,]+)\.?\s*(?:El\s+)?cód\.?\s*de\s+seguridad\s+es:\s*(\d+)/i;
    
    // Patrón 2: "Nombre te pagó S/ X. Cód. de seguridad: Y"
    let pattern2 = /^(.*?)\s+te\s+pagó\s+S\/\s*([\d.,]+)\.?\s*(?:Cód\.?\s*de\s+seguridad:?\s*)(\d+)/i;
    
    // Patrón 3: "Recibiste S/ X de Nombre. Código: Y"
    let pattern3 = /Recibiste\s+S\/\s*([\d.,]+)\s+de\s+(.*?)\.?\s*(?:Código:?\s*)(\d+)/i;

    let match;

    if ((match = message.match(pattern1))) {
      name = match[1].trim();
      amount = `S/ ${match[2]}`;
      securityCode = match[3];
    } else if ((match = message.match(pattern2))) {
      name = match[1].trim();
      amount = `S/ ${match[2]}`;
      securityCode = match[3];
    } else if ((match = message.match(pattern3))) {
      name = match[2].trim();
      amount = `S/ ${match[1]}`;
      securityCode = match[3];
    } else {
      // Fallback: intentar extraer componentes por separado
      const nameFallback = message.match(/^(.*?)(?=\s+te\s+(?:envió|pagó)|Recibiste)/);
      if (nameFallback) name = nameFallback[1].trim();

      const amountFallback = message.match(/S\/\s*([\d.,]+)/);
      if (amountFallback) amount = `S/ ${amountFallback[1]}`;

      const codeFallback = message.match(/(?:cód\.?|codigo|código|code)[\s:]*(\d+)/i);
      if (codeFallback) securityCode = codeFallback[1];
    }

    // Limpiar y formatear el nombre (remover puntos innecesarios al final)
    name = name.replace(/\.+$/, '').trim();

    return `${name} pago ${amount}. Cod.Seg.${securityCode}`;
    
  } catch (error) {
    console.error('Error parseando mensaje de pago:', error);
    return 'Error procesando el mensaje';
  }
};