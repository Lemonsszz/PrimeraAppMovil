
import { View, Text, StyleSheet, Image, Button, TouchableOpacity } from 'react-native'

export default function Inicio(){
  return(
    <View style ={styles.contenedor}>
    <Text style={styles.texto}>Pantalla Inicio</Text>
    <Image
      source={{uri:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_2u2RmEazdLCl_mUsLV8mOjYlzAH-VC2ThtGkD7aGIQ&s"}}
      style={styles.imagen}
    
    />
    <Button
    title="Boton"

    />
    </View>
  );
}

const styles=StyleSheet.create({
  contenedor:{
    backgroundColor:"#f6efef",
    justifyContent:"center",
    alignItems:"center",
    flex:1
  },
  texto:{
    fontSize:30
  },
  imagen:{

    width:150,
    height:150
    
  }
})