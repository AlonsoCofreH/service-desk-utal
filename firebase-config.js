// Configuración de Firebase
const firebaseConfig = {
  // Aquí irán tus credenciales de Firebase
  // Las obtendrás al crear un proyecto en Firebase Console
  apiKey: "TU_API_KEY",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "tu-messaging-sender-id",
  appId: "tu-app-id"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Referencias a los servicios que usaremos
const auth = firebase.auth();
const db = firebase.firestore();

// Colección de usuarios autorizados
const usuariosAutorizados = db.collection('usuariosAutorizados');

// Función para verificar si un correo está autorizado
async function verificarUsuarioAutorizado(email) {
  try {
    const doc = await usuariosAutorizados.doc(email).get();
    if (doc.exists) {
      return {
        autorizado: true,
        rol: doc.data().rol
      };
    }
    return {
      autorizado: false,
      mensaje: "Este correo no está autorizado para usar el sistema"
    };
  } catch (error) {
    console.error("Error al verificar usuario:", error);
    return {
      autorizado: false,
      mensaje: "Error al verificar el usuario"
    };
  }
}

// Función para registrar un nuevo usuario autorizado (solo para administradores)
async function registrarUsuarioAutorizado(email, rol) {
  try {
    await usuariosAutorizados.doc(email).set({
      email: email,
      rol: rol,
      fechaRegistro: firebase.firestore.FieldValue.serverTimestamp()
    });
    return {
      exito: true,
      mensaje: "Usuario registrado exitosamente"
    };
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    return {
      exito: false,
      mensaje: "Error al registrar el usuario"
    };
  }
} 