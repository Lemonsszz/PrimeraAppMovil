
import React, { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';

import { auth } from '../firebaseconfig';

import { router } from 'expo-router';

export default function Login() {

  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');

  const iniciarSesion = async () => {

    if (correo === '' || contraseña === '') {
      Alert.alert('ACCESS DENIED', 'Complete todos los campos');
      return;
    }

    try {

      const usuario = await signInWithEmailAndPassword(
        auth,
        correo,
        contraseña
      );

      console.log('✅ LOGIN CORRECTO:', usuario.user.email);

      router.replace('/inicio');

    } catch (error: any) {

      console.log('🔥 ERROR FIREBASE:', error.code);
      console.log('🔥 MENSAJE:', error.message);

      Alert.alert(
        'ACCESS DENIED',
        'Correo o contraseña incorrectos'
      );
    }
  };

  const crearCuenta = async () => {

    if (correo === '' || contraseña === '') {
      Alert.alert('ERROR', 'Complete todos los campos');
      return;
    }

    try {

      const usuario = await createUserWithEmailAndPassword(
        auth,
        correo,
        contraseña
      );

      console.log('✅ CUENTA CREADA:', usuario.user.email);

      Alert.alert(
        'ACCESS GRANTED',
        'Cuenta creada correctamente'
      );

      router.replace('/inicio');

    } catch (error: any) {

      console.log('🔥 ERROR CREANDO CUENTA:', error.code);
      console.log('🔥 MENSAJE:', error.message);

      if (error.code === 'auth/email-already-in-use') {

        Alert.alert(
          'ERROR',
          'Este correo ya está registrado'
        );

      } else if (error.code === 'auth/weak-password') {

        Alert.alert(
          'ERROR',
          'La contraseña debe tener al menos 6 caracteres'
        );

      } else if (error.code === 'auth/invalid-email') {

        Alert.alert(
          'ERROR',
          'El correo electrónico no es válido'
        );

      } else {

        Alert.alert(
          'ERROR',
          'No se pudo crear la cuenta'
        );
      }
    }
  };

  return (
    <View style={styles.contenedor}>

      {/* DECORACIÓN DE FONDO */}

      <Text style={styles.codigoFondo}>
        01 10 01 11 00 10 01
      </Text>

      <Text style={styles.codigoFondo2}>
        0x00FF88 // SYSTEM // ACCESS
      </Text>


      {/* LOGO */}

      <View style={styles.logoContainer}>

        <Text style={styles.logo}>
          CYBERVAULT_
        </Text>

        <Text style={styles.version}>
          SECURITY COMMAND CENTER
        </Text>

      </View>


      {/* ESTADO DEL SISTEMA */}

      <View style={styles.estado}>

        <View style={styles.punto} />

        <Text style={styles.estadoTexto}>
          SYSTEM ONLINE
        </Text>

        <Text style={styles.versionTexto}>
          v1.0.0
        </Text>

      </View>


      {/* PANEL */}

      <View style={styles.panel}>

        <Text style={styles.titulo}>
          $ AUTHENTICATION_
        </Text>

        <Text style={styles.subtitulo}>
          SECURE SYSTEM ACCESS
        </Text>


        {/* CORREO */}

        <Text style={styles.label}>
          &gt; USER_EMAIL
        </Text>

        <TextInput
          style={styles.input}
          placeholder="operator@cybervault.com"
          placeholderTextColor="#50864C"
          value={correo}
          onChangeText={setCorreo}
          keyboardType="email-address"
          autoCapitalize="none"
        />


        {/* CONTRASEÑA */}

        <Text style={styles.label}>
          &gt; PASSWORD
        </Text>

        <TextInput
          style={styles.input}
          placeholder="••••••••••••"
          placeholderTextColor="#50864C"
          value={contraseña}
          onChangeText={setContraseña}
          secureTextEntry
        />


        {/* BOTÓN LOGIN */}

        <TouchableOpacity
          style={styles.botonLogin}
          onPress={iniciarSesion}
        >

          <Text style={styles.textoLogin}>
            [ ACCESS SYSTEM ]
          </Text>

        </TouchableOpacity>


        {/* CREAR CUENTA */}

        <TouchableOpacity
          style={styles.botonCrear}
          onPress={crearCuenta}
        >

          <Text style={styles.textoCrear}>
            [ CREATE ACCOUNT ]
          </Text>

        </TouchableOpacity>


        {/* ENTRAR SIN CUENTA (para probar notificaciones) */}

        <TouchableOpacity
          style={styles.botonInvitado}
          onPress={() => router.replace('/inicio')}
        >

          <Text style={styles.textoInvitado}>
            [ ENTRAR COMO INVITADO ]
          </Text>

        </TouchableOpacity>

      </View>


      {/* INFORMACIÓN INFERIOR */}

      <View style={styles.footer}>

        <Text style={styles.footerTexto}>
          ENCRYPTION: ACTIVE
        </Text>

        <Text style={styles.footerTexto}>
          DATABASE: CONNECTED
        </Text>

        <Text style={styles.footerTexto}>
          AUTH: FIREBASE
        </Text>

      </View>

    </View>
  );
}


const styles = StyleSheet.create({

  contenedor: {
    flex: 1,
    backgroundColor: '#050805',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },


  /* FONDO */

  codigoFondo: {
    position: 'absolute',
    top: 40,
    left: 15,
    color: '#3B4B33',
    fontSize: 12,
    opacity: 0.7,
  },

  codigoFondo2: {
    position: 'absolute',
    bottom: 45,
    right: 15,
    color: '#3B4B33',
    fontSize: 10,
    opacity: 0.7,
  },


  /* LOGO */

  logoContainer: {
    alignItems: 'center',
    marginBottom: 18,
  },

  logo: {
    color: '#61CF5A',
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 2,
  },

  version: {
    color: '#50864C',
    fontSize: 10,
    marginTop: 5,
    letterSpacing: 2,
  },


  /* ESTADO */

  estado: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#3B4B33',
    paddingVertical: 9,
    marginBottom: 20,
  },

  punto: {
    width: 7,
    height: 7,
    borderRadius: 10,
    backgroundColor: '#61CF5A',
    marginRight: 8,
  },

  estadoTexto: {
    color: '#61CF5A',
    fontSize: 11,
    fontWeight: 'bold',
    flex: 1,
  },

  versionTexto: {
    color: '#50864C',
    fontSize: 10,
  },


  /* PANEL */

  panel: {
    backgroundColor: '#080D0A',
    borderWidth: 1,
    borderColor: '#3B4B33',
    padding: 20,
    borderRadius: 4,
  },

  titulo: {
    color: '#61CF5A',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },

  subtitulo: {
    color: '#50864C',
    fontSize: 10,
    marginBottom: 25,
    letterSpacing: 1,
  },


  /* INPUTS */

  label: {
    color: '#63AD58',
    fontSize: 11,
    marginBottom: 7,
    fontWeight: 'bold',
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#3B4B33',
    backgroundColor: '#050805',
    color: '#61CF5A',
    paddingHorizontal: 14,
    marginBottom: 18,
    borderRadius: 3,
    fontSize: 14,
  },


  /* LOGIN */

  botonLogin: {
    height: 48,
    backgroundColor: '#61CF5A',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 3,
    marginTop: 5,
  },

  textoLogin: {
    color: '#050805',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1,
  },


  /* CREAR CUENTA */

  botonCrear: {
    height: 45,
    borderWidth: 1,
    borderColor: '#3B4B33',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 3,
    marginTop: 12,
  },

  textoCrear: {
    color: '#61CF5A',
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 1,
  },

  botonInvitado: {
    marginTop: 18,
    alignItems: 'center',
  },

  textoInvitado: {
    color: '#50864C',
    fontSize: 11,
    letterSpacing: 1,
  },


  /* FOOTER */

  footer: {
    marginTop: 18,
    alignItems: 'center',
  },

  footerTexto: {
    color: '#50864C',
    fontSize: 9,
    marginVertical: 2,
    letterSpacing: 1,
  },

});

