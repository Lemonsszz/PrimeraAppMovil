
import { View, Text, StyleSheet } from 'react-native'

export default function Inicio(){
  return(
    <View style ={styles.contenedor}>
    <Text style={styles.texto}>Pantalla Perfil</Text>


    
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