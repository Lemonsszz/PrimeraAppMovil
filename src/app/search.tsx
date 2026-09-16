import {
  View,
  Text,
  StyleSheet,
  TextInput,
  StatusBar,
  FlatList
} from 'react-native';
import {Card, Button} from 'react-native-paper';
export default function Buscar() {

  const productos=[
    {
      id:"1",
      nombre:"Desarrollo de Aplicaciones Móoviles",
      precio:4800,
      imagen:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRujrRj4WOIVbXLj2Op_pZmCdjDcXsti64bZIQOHZs1sw&s=10"
    },
    {
      id:"2",
      nombre:"Seguridad TI",
      precio:6500,
      imagen:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSDg0gScoTq445f_d4n4g7-dGrmGQDZSJPg-vUFqRVJrA&s=10"
    },
    {
      id:"3",
      nombre:"Ingeniería de Software I",
      precio:4800,
      imagen:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTuEI7d-76Ihsk0isLwlULh6lKETCy8LuJcKYw4WlNu2Q&s=10"
    },
    {
      id:"4",
      nombre:"Diseño Cross Media",
      precio:6500,
      imagen:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROS6KHGpFflCLDCBB5PVsditlYoH6Jp1SWgk7TH24P9A&s=10"
    },
    {
      id:"5",
      nombre:"Redes III",
      precio:4800,
      imagen:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcChglAEl2kjDYexR8WyYsm8EwUcxvw3Q7vTlxfv4ndQ&s=10"
    },
  ]
  return (
    <View style={styles.contenedor}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.logo}>MATERIAS</Text>
        <Text style={styles.subtitulo}>Materias del estudiante</Text>
      </View>

      <TextInput
        style={styles.buscar}
        placeholder="Buscar materia..."
        placeholderTextColor="#526158"
      />

      <Text style={styles.resultados}>RESULTADOS</Text>
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
                  VER MATERIA
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

  buscar: {
    height: 50,
    backgroundColor: '#080D0A',
    borderWidth: 1,
    borderColor: '#123D29',
    borderRadius: 8,
    paddingHorizontal: 15,
    color: '#FFFFFF',
    fontSize: 14,
  },

  resultados: {
    color: '#00FF88',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 25,
    marginBottom: 12,
  },

  comando: {
    backgroundColor: '#080D0A',
    borderWidth: 1,
    borderColor: '#123D29',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },

  nombre: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  descripcion: {
    color: '#718078',
    fontSize: 12,
    marginTop: 5,
  },
      texto:{
    fontSize:30
  },
    card:{
    flex:1,
    margin:10
  }
});