import AsyncStorage from '@react-native-async-storage/async-storage';

const CLIENT_ID_KEY = 'mynotes_client_id';

const generateId = () => 'client_' + Math.random().toString(36).slice(2);

export const getOrSetClientId = async () => {
  try {
    let clientId = await AsyncStorage.getItem(CLIENT_ID_KEY);
    if (!clientId) {
      clientId = generateId();
      await AsyncStorage.setItem(CLIENT_ID_KEY, clientId);
    }
    return clientId;
  } catch (e) {
    console.error('AsyncStorage failed, using a temporary client ID.', e);
    return generateId();
  }
};