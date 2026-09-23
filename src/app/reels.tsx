import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {Card, Button} from 'react-native-paper';
import { useState, useEffect} from 'react'; //gestion de estados, y control de cambios
import {ref, onValue} from 'firebase/database'; //ref permite diferenciar la rama que quiero traer
import {database} from '../firebaseconfig';

export default function Comandos() {
  console.log("🔥 ENTRE A COMANDOS");
 //definir las variables de los datos
const [productos,setProductos]=useState([]);

useEffect(()=>{
  const productosObtener=ref(database,"Productos");
  const prod=onValue(productosObtener, (snapshot)=>{
  const datos = snapshot.val();
  console.log("DATOS FIREBASE:", datos);
    if (datos){
      const listaProductos=Object.keys(datos).map((id)=>({
        id:id,
        nombre:datos[id].nombre,
        precio:datos[id].precio,
        imagen:datos[id].imagen,
        descripcion:datos[id].descripcion
        
      }));
      setProductos(listaProductos);
    }
    else{
      setProductos([]);
    }
  })
  //limpieza de datos
  return()=>prod();
}, []);


  return (
    <View style={styles.contenedor}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.logo}>CARRERA</Text>
        <Text style={styles.logo}>INFORMACIÓN ACADÉMICA</Text>
        <Text style={styles.subtitulo}>Estudios Universitarios</Text>
      </View>
  
      <FlatList
          data={productos}
          numColumns={3}
          keyExtractor={(item)=>item.id}
          renderItem={({item})=>(
            <Card style={styles.card}>
              <Card.Cover
                source={{uri:item.imagen}}
              />
              <Card.Content>
                <Text style={styles.texto}>{item.nombre} </Text>
              </Card.Content>
              <Card.Actions>
                <Button
                  mode="outlined"
                  onPress={()=>alert(item.nombre)}
                >
                  VER CARRERA
                </Button>
              </Card.Actions>
            </Card>
          )}  
      />
    </View>


  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#050805',
    paddingTop: 55,
    paddingHorizontal: 20,
  },
    icono: {
    color: '#00FF88',
    fontSize: 15,
    fontWeight: '900',
    marginRight: 15,
  },

  header: {
    marginBottom: 25,
  },

  logo: {
    color: '#00FF88',
    fontSize: 26,
    fontWeight: '900',
  },

  subtitulo: {
    color: '#526158',
    fontSize: 11,
    letterSpacing: 3,
    marginTop: 5,
  },

  comando: {
    backgroundColor: '#080D0A',
    borderWidth: 1,
    borderColor: '#123D29',
    borderRadius: 10,
    padding: 18,
    marginBottom: 15,
  },

  categoria: {
    color: '#00FF88',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 8,
  },

  nombre: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '700',
    marginBottom: 8,
  },

  descripcion: {
    color: '#819187',
    fontSize: 13,
    lineHeight: 19,
  },

  boton: {
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#00FF88',
    borderRadius: 6,
    paddingVertical: 9,
    alignItems: 'center',
    flexDirection: 'row',     // Alinea los elementos en fila (uno al lado del otro)    // Centra verticalmente el texto y el icono
    justifyContent: 'center',
  },

  textoBoton: {
    color: '#00FF88',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginRight: 8,
    
  },
    texto:{
    fontSize:30
  },
  card:{
    flex:1,
    margin:10
  }
});