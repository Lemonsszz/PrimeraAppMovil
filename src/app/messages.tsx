
import { View, Text, StyleSheet } from 'react-native'
import * as Notifications from 'expo-notifications';
import {Button} from 'react-native-paper'

export default function Mensajes(){
    const click=()=>{
    alert("Se hizo Click");
  }
  const MostrarNotificaciones=async()=>{
    await Notifications.scheduleNotificationAsync({
      content:{
        title:"Notificacion de Prueba",
        body:"Tienes una nueva notificacion",
      },
      trigger:null
    });
  };
  return(
    <View style ={styles.contenedor}>
    <Text style={styles.texto}>Pantalla Mensajes</Text>
    <Button title="aceptar" mode="contained"
      onPress={click} />

    
    </View>
  );
}

const styles=StyleSheet.create({
  contenedor:{
    backgroundColor:"#ff0000",
    justifyContent:"center",
    alignItems:"center",
    flex:1
  },
  texto:{
    fontSize:30
  }
})