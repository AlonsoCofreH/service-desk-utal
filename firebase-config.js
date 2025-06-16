// Configuración de Firebase
const firebaseConfig = {
  // Aquí irán tus credenciales de Firebase
  // Las obtendrás al crear un proyecto en Firebase Console
  apiKey: "AIzaSyDJskEsYxYnmUqbFSi_3nTs28SI43-OFB0",
  authDomain: "service-desk-utal.firebaseapp.com",
  projectId: "service-desk-utal",
  storageBucket: "service-desk-utal.firebasestorage.app",
  messagingSenderId: "645284310843",
  appId: "1:645284310843:web:d1bb90989ba46ee296d11e",
  measurementId: "G-HYNK57GS0T"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Referencias a los servicios que usaremos
const auth = firebase.auth();
const db = firebase.firestore();

// Colección de usuarios autorizados
const usuariosAutorizados = db.collection('usuariosAutorizados');
// Colección de tickets
const ticketsCollection = db.collection('tickets');

// Función para verificar si un correo está autorizado
async function verificarUsuarioAutorizado(email) {
  try {
    console.log("Verificando usuario:", email);
    const querySnapshot = await usuariosAutorizados.where('email', '==', email).get();
    
    console.log("Resultados de la búsqueda:", querySnapshot.size, "documentos encontrados");
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      console.log("Documento encontrado:", doc.data());
      return {
        autorizado: true,
        rol: doc.data().rol
      };
    }
    
    console.log("No se encontró el documento para el email:", email);
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
    await usuariosAutorizados.add({
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

// Funciones para manejar tickets
async function crearTicketEnFirebase(ticket) {
  try {
    const docRef = await ticketsCollection.add({
      ...ticket,
      fechaCreacion: firebase.firestore.FieldValue.serverTimestamp(),
      fechaLimite: ticket.fechaLimite,
      estado: "Abierto",
      asignadoA: null,
      historial: [{
        fecha: new Date().toLocaleString(),
        accion: "Ticket creado",
        usuario: ticket.creadoPor
      }]
    });
    return {
      exito: true,
      id: docRef.id,
      mensaje: "Ticket creado exitosamente"
    };
  } catch (error) {
    console.error("Error al crear ticket:", error);
    return {
      exito: false,
      mensaje: "Error al crear el ticket"
    };
  }
}

async function actualizarTicketEnFirebase(ticketId, datos) {
  try {
    await ticketsCollection.doc(ticketId).update(datos);
    return {
      exito: true,
      mensaje: "Ticket actualizado exitosamente"
    };
  } catch (error) {
    console.error("Error al actualizar ticket:", error);
    return {
      exito: false,
      mensaje: "Error al actualizar el ticket"
    };
  }
}

async function obtenerTicketsUsuario(email) {
  try {
    const querySnapshot = await ticketsCollection
      .where('creadoPor', '==', email)
      .orderBy('fechaCreacion', 'desc')
      .get();
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error al obtener tickets:", error);
    return [];
  }
}

async function obtenerTicketsSinAsignar() {
  try {
    const querySnapshot = await ticketsCollection
      .where('asignadoA', '==', null)
      .orderBy('fechaCreacion', 'desc')
      .get();
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error al obtener tickets sin asignar:", error);
    return [];
  }
}

async function obtenerTicketsAsignados(email) {
  try {
    const querySnapshot = await ticketsCollection
      .where('asignadoA', '==', email)
      .orderBy('fechaCreacion', 'desc')
      .get();
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error al obtener tickets asignados:", error);
    return [];
  }
}