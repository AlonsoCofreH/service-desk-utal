document.addEventListener("DOMContentLoaded", () => {
  // Referencias a elementos DOM
  const loginForm = document.getElementById("loginForm");
  const appScreen = document.getElementById("appScreen");
  const loginScreen = document.getElementById("loginScreen");
  const userNameSpan = document.getElementById("userName");
  const logoutButton = document.getElementById("logoutButton");
  const ticketFormContainer = document.getElementById("ticketFormContainer");
  const ticketForm = document.getElementById("ticketForm");
  const ticketList = document.getElementById("ticketList");
  const unassignedTicketsContainer = document.getElementById("unassignedTicketsContainer");
  const unassignedTickets = document.getElementById("unassignedTickets");
  const impactSelect = document.getElementById("impact");
  const urgencySelect = document.getElementById("urgency");
  const priorityValue = document.getElementById("priorityValue");
  const slaValue = document.getElementById("slaValue");
  const ticketService = document.getElementById("ticketService");
  const ticketType = document.getElementById("ticketType");

  const serviciosPorCategoria = {
    "Computadora": {
      tipos: {
        "No enciende": { tipo: "incidente", urgencia: "alta", impacto: "alto" },
        "Pantalla azul": { tipo: "incidente", urgencia: "alta", impacto: "alto" },
        "Lentitud": { tipo: "incidente", urgencia: "media", impacto: "medio" },
        "Problemas de software": { tipo: "incidente", urgencia: "media", impacto: "medio" },
        "Problemas de hardware": { tipo: "incidente", urgencia: "alta", impacto: "alto" },
        "Virus/Malware": { tipo: "incidente", urgencia: "alta", impacto: "alto" }
      }
    },
    "SAP": {
      tipos: {
        "Crear cuenta": { tipo: "solicitud", urgencia: "media", impacto: "medio" },
        "Recuperar contraseña": { tipo: "incidente", urgencia: "alta", impacto: "alto" },
        "Problemas de acceso": { tipo: "incidente", urgencia: "alta", impacto: "alto" },
        "Error en transacción": { tipo: "incidente", urgencia: "alta", impacto: "alto" },
        "Solicitud de permisos": { tipo: "solicitud", urgencia: "media", impacto: "medio" }
      }
    },
    "Biblioteca": {
      tipos: {
        "Préstamo de libros": { tipo: "solicitud", urgencia: "baja", impacto: "bajo" },
        "Acceso a recursos digitales": { tipo: "incidente", urgencia: "media", impacto: "medio" },
        "Renovación de membresía": { tipo: "solicitud", urgencia: "baja", impacto: "bajo" },
        "Problemas con devolución": { tipo: "incidente", urgencia: "media", impacto: "medio" },
        "Solicitud de material": { tipo: "solicitud", urgencia: "baja", impacto: "bajo" }
      }
    },
    "Internet": {
      tipos: {
        "Sin conexión": { tipo: "incidente", urgencia: "alta", impacto: "alto" },
        "Conexión lenta": { tipo: "incidente", urgencia: "media", impacto: "medio" },
        "Problemas con WiFi": { tipo: "incidente", urgencia: "alta", impacto: "alto" },
        "Configuración de red": { tipo: "solicitud", urgencia: "media", impacto: "medio" },
        "Problemas de DNS": { tipo: "incidente", urgencia: "alta", impacto: "alto" }
      }
    },
    "Office365": {
      tipos: {
        "Crear cuenta": { tipo: "solicitud", urgencia: "media", impacto: "medio" },
        "Recuperar contraseña": { tipo: "incidente", urgencia: "alta", impacto: "alto" },
        "Instalación": { tipo: "solicitud", urgencia: "media", impacto: "medio" },
        "Problemas de sincronización": { tipo: "incidente", urgencia: "media", impacto: "medio" },
        "Solicitud de licencia": { tipo: "solicitud", urgencia: "baja", impacto: "bajo" }
      }
    },
    "Impresora": {
      tipos: {
        "No imprime": { tipo: "incidente", urgencia: "alta", impacto: "alto" },
        "Atasco de papel": { tipo: "incidente", urgencia: "media", impacto: "medio" },
        "Problemas de conexión": { tipo: "incidente", urgencia: "alta", impacto: "alto" },
        "Cambio de tóner": { tipo: "solicitud", urgencia: "media", impacto: "medio" },
        "Configuración de red": { tipo: "solicitud", urgencia: "media", impacto: "medio" }
      }
    },
    "Access Point": {
      tipos: {
        "Sin señal": { tipo: "incidente", urgencia: "alta", impacto: "alto" },
        "Problemas de conexión": { tipo: "incidente", urgencia: "alta", impacto: "alto" },
        "Configuración": { tipo: "solicitud", urgencia: "media", impacto: "medio" },
        "Reemplazo de equipo": { tipo: "solicitud", urgencia: "media", impacto: "medio" },
        "Problemas de cobertura": { tipo: "incidente", urgencia: "alta", impacto: "alto" }
      }
    },
    "Biométrico": {
      tipos: {
        "Registro de huella": { tipo: "solicitud", urgencia: "media", impacto: "medio" },
        "Problemas de acceso": { tipo: "incidente", urgencia: "alta", impacto: "alto" },
        "Reemplazo de tarjeta": { tipo: "solicitud", urgencia: "media", impacto: "medio" },
        "Error de lectura": { tipo: "incidente", urgencia: "alta", impacto: "alto" },
        "Mantenimiento": { tipo: "solicitud", urgencia: "baja", impacto: "bajo" }
      }
    }
  };

  // Eliminar la carga desde localStorage
  let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
  // Ya no necesitamos cargar tickets desde localStorage
  // let tickets = JSON.parse(localStorage.getItem("tickets")) || [];

  // Variable para controlar si ya se ha iniciado sesión
  let sesionIniciada = false;
  
  // Si hay un usuario en localStorage, verificar si Firebase Auth también está autenticado
  // Esta verificación se manejará en el listener onAuthStateChanged principal

  // Event Listeners
  loginForm.addEventListener("submit", handleLogin);
  logoutButton.addEventListener("click", handleLogout);
  ticketForm.addEventListener("submit", createTicket);
  ticketService.addEventListener("change", handleServiceChange);
  ticketType.addEventListener("change", handleTypeChange);
  
  // Funciones principales
  async function handleLogin(e) {
    e.preventDefault();
    
    // Validar el formulario
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    
    if (!email || !password) {
      mostrarMensaje("Por favor, complete todos los campos", "error");
      return;
    }

    try {
      // Verificar si el usuario está autorizado
      const verificacion = await verificarUsuarioAutorizado(email);
      
      if (!verificacion.autorizado) {
        mostrarMensaje(verificacion.mensaje, "error");
        return;
      }

      // Intentar iniciar sesión con Firebase
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // Guardar información del usuario
      currentUser = {
        email: user.email,
        role: verificacion.rol
      };
      
      // Guardar en localStorage
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      
      // No llamar a iniciarSesion aquí, se manejará en onAuthStateChanged
      mostrarMensaje("Inicio de sesión exitoso", "success");
    } catch (error) {
      console.error("Error de autenticación:", error);
      
      // Manejar errores específicos
      let mensaje = "Error al iniciar sesión";
      if (error.code === 'auth/user-not-found') {
        mensaje = "El usuario no existe";
      } else if (error.code === 'auth/wrong-password') {
        mensaje = "Contraseña incorrecta";
      } else if (error.code === 'auth/invalid-email') {
        mensaje = "Correo electrónico inválido";
      }
      
      mostrarMensaje(mensaje, "error");
    }
  }

  // Función para registrar un nuevo usuario (primera vez)
  async function registrarPrimerUsuario(email, password, rol) {
    try {
      // Crear usuario en Firebase Auth
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // Registrar en la colección de usuarios autorizados
      const resultado = await registrarUsuarioAutorizado(email, rol);
      
      if (resultado.exito) {
        mostrarMensaje("Usuario registrado exitosamente", "success");
        return true;
      } else {
        mostrarMensaje(resultado.mensaje, "error");
        return false;
      }
    } catch (error) {
      console.error("Error al registrar usuario:", error);
      mostrarMensaje("Error al registrar el usuario", "error");
      return false;
    }
  }

  // Escuchar cambios en el estado de autenticación
  auth.onAuthStateChanged(async (user) => {
    if (user && !sesionIniciada) {
      // Usuario ha iniciado sesión y no se ha iniciado sesión antes
      const verificacion = await verificarUsuarioAutorizado(user.email);
      if (verificacion.autorizado) {
        currentUser = {
          email: user.email,
          role: verificacion.rol
        };
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
        sesionIniciada = true;
        iniciarSesion(currentUser);
      } else {
        // Si el usuario no está autorizado, cerrar sesión
        await auth.signOut();
        mostrarMensaje(verificacion.mensaje, "error");
      }
    } else if (!user && sesionIniciada) {
      // Usuario ha cerrado sesión y la sesión estaba iniciada
      sesionIniciada = false;
      handleLogout();
    }
  });

  async function handleLogout() {
    try {
      await auth.signOut();
      currentUser = null;
      localStorage.removeItem("currentUser");
      
      // Limpiar completamente el estado
      sesionIniciada = false;
      ticketList.innerHTML = "";
      unassignedTickets.innerHTML = "";
      
      loginScreen.style.display = "block";
      appScreen.style.display = "none";
      document.getElementById("loginForm").reset();
      mostrarMensaje("Sesión cerrada exitosamente", "success");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      mostrarMensaje("Error al cerrar sesión", "error");
    }
  }

  function iniciarSesion(user) {
    console.log("Iniciando sesión como:", user);
    
    // Verificar que no se haya iniciado sesión ya
    if (sesionIniciada && appScreen.style.display !== "none") {
      console.log("Sesión ya iniciada, evitando duplicación");
      return;
    }
    
    userNameSpan.textContent = user.email;
    loginScreen.style.display = "none";
    appScreen.style.display = "block";

    // Limpiar contenedores antes de cargar
    ticketList.innerHTML = "";
    unassignedTickets.innerHTML = "";

    if (user.role === "agente") {
      console.log("Configurando vista de agente");
      ticketFormContainer.style.display = "none";
      unassignedTicketsContainer.style.display = "block";
      // Asegurarnos de que ambas funciones se ejecuten
      Promise.all([
        mostrarTicketsSinAsignar(),
        mostrarTicketsAsignados()
      ]).catch(error => {
        console.error("Error al cargar tickets del agente:", error);
      });
    } else {
      console.log("Configurando vista de usuario");
      ticketFormContainer.style.display = "block";
      unassignedTicketsContainer.style.display = "none";
      mostrarTickets();
    }
  }

  async function createTicket(e) {
    e.preventDefault();
    
    console.log("Iniciando creación de ticket...");
    console.log("Usuario actual:", currentUser);
    
    const servicio = document.getElementById("ticketService").value;
    const tipoServicio = document.getElementById("ticketType").value;
    const descripcion = document.getElementById("ticketDescription").value;
    
    console.log("Datos del formulario:", {
      servicio,
      tipoServicio,
      descripcion
    });
    
    if (!servicio || !tipoServicio || !descripcion) {
      console.log("Error: Campos incompletos");
      mostrarMensaje("Por favor, complete todos los campos del ticket", "error");
      return;
    }

    const info = serviciosPorCategoria[servicio].tipos[tipoServicio];
    console.log("Información del servicio:", info);
    
    const impacto = info.impacto;
    const urgencia = info.urgencia;
    const tipo = info.tipo;
    
    const prioridad = calcularPrioridad(impacto, urgencia);
    const sla = obtenerSLA(servicio, tipoServicio);
    
    // Calcular la fecha límite como timestamp
    const horasSLA = parseInt(sla.split(' ')[0]);
    const fechaLimite = new Date();
    fechaLimite.setHours(fechaLimite.getHours() + horasSLA);

    console.log("Cálculos realizados:", {
      impacto,
      urgencia,
      tipo,
      prioridad,
      sla,
      fechaLimite: fechaLimite.toISOString()
    });

    const nuevoTicket = {
      tipo,
      servicio,
      tipoServicio,
      descripcion,
      impacto,
      urgencia,
      prioridad,
      sla,
      fechaLimite: firebase.firestore.Timestamp.fromDate(fechaLimite),
      creadoPor: currentUser.email
    };

    console.log("Ticket a crear:", nuevoTicket);

    try {
      console.log("Intentando crear ticket en Firebase...");
      const resultado = await crearTicketEnFirebase(nuevoTicket);
      console.log("Resultado de creación:", resultado);
      
      if (resultado.exito) {
        console.log("Ticket creado exitosamente");
        mostrarTickets();
        ticketForm.reset();
        priorityValue.textContent = "N/A";
        slaValue.textContent = "N/A";
        mostrarMensaje(`Ticket creado exitosamente`, "success");
      } else {
        console.log("Error al crear ticket:", resultado.mensaje);
        mostrarMensaje(resultado.mensaje, "error");
      }
    } catch (error) {
      console.error("Error detallado al crear ticket:", error);
      console.error("Stack trace:", error.stack);
      mostrarMensaje("Error al crear el ticket", "error");
    }
  }

  function handleServiceChange() {
    const servicio = ticketService.value;
    const tipos = Object.keys(serviciosPorCategoria[servicio]?.tipos || {});

    // Limpiar tipos anteriores
    ticketType.innerHTML = '<option value="" disabled selected>Selecciona el tipo de servicio</option>';

    // Agregar nuevos tipos
    tipos.forEach(tipo => {
      const option = document.createElement("option");
      option.value = tipo;
      option.textContent = tipo;
      ticketType.appendChild(option);
    });

    // Limpiar valores de impacto y urgencia
    document.getElementById("impact").value = "";
    document.getElementById("urgency").value = "";
    updatePriorityAndSLA();
  }

  function handleTypeChange() {
    const servicio = ticketService.value;
    const tipo = ticketType.value;
    
    if (servicio && tipo) {
      const info = serviciosPorCategoria[servicio].tipos[tipo];
      if (info) {
        document.getElementById("impact").value = info.impacto;
        document.getElementById("urgency").value = info.urgencia;
        updatePriorityAndSLA();
      }
    }
  }

  function updatePriorityAndSLA() {
    const servicio = ticketService.value;
    const tipo = ticketType.value;
    
    if (servicio && tipo) {
      const info = serviciosPorCategoria[servicio].tipos[tipo];
      if (info) {
        document.getElementById("impact").value = info.impacto;
        document.getElementById("urgency").value = info.urgencia;
        
        const prioridad = calcularPrioridad(info.impacto, info.urgencia);
        priorityValue.textContent = prioridad;
        
        const sla = obtenerSLA(servicio, tipo);
        slaValue.textContent = sla;
        
        // Actualizar el tipo de ticket (incidente/solicitud)
        document.getElementById("ticketTypeValue").textContent = 
          info.tipo === 'incidente' ? 'Incidente' : 'Solicitud';
      }
    } else {
      priorityValue.textContent = "N/A";
      slaValue.textContent = "N/A";
      document.getElementById("ticketTypeValue").textContent = "N/A";
    }
  }

  function calcularPrioridad(impacto, urgencia) {
    // Matriz de prioridad
    const matriz = {
      'alto': { 'alta': 'Alta', 'media': 'Alta', 'baja': 'Media' },
      'medio': { 'alta': 'Alta', 'media': 'Media', 'baja': 'Baja' },
      'bajo': { 'alta': 'Media', 'media': 'Baja', 'baja': 'Baja' }
    };
    
    return matriz[impacto][urgencia];
  }

  function obtenerSLA(servicio) {
    // SLA basado en el servicio
    const slas = {
      'Computadora': '4 horas',
      'Internet': '2 horas',
      'Access Point': '4 horas',
      'Impresora': '8 horas',
      'Biométrico': '4 horas',
      'SAP': '24 horas',
      'Biblioteca': '24 horas',
      'Office365': '24 horas'
    };
    
    return slas[servicio] || '24 horas';
  }

  function calcularFechaLimite(sla) {
    if (!sla || sla === 'N/A') return 'No definido';
    
    const horasSLA = parseInt(sla.split(' ')[0]);
    const fechaLimite = new Date();
    fechaLimite.setHours(fechaLimite.getHours() + horasSLA);
    
    return fechaLimite.toLocaleString();
  }

  async function mostrarTickets() {
    // Limpiar contenedor antes de cargar
    ticketList.innerHTML = "";
    
    try {
      const misTickets = await obtenerTicketsUsuario(currentUser.email);
      
      if (misTickets.length === 0) {
        ticketList.innerHTML = '<p class="mensaje-info">No tienes tickets creados.</p>';
        return;
      }
      
      // Verificar que no haya duplicados por ID
      const ticketsUnicos = misTickets.filter((ticket, index, self) => 
        index === self.findIndex(t => t.id === ticket.id)
      );
      
      // Verificar que no existan elementos duplicados en el DOM
      const ticketsExistentes = new Set();
      ticketsUnicos.forEach(ticket => {
        if (!ticketsExistentes.has(ticket.id)) {
          ticketsExistentes.add(ticket.id);
          const div = crearElementoTicket(ticket, "usuario");
          ticketList.appendChild(div);
        }
      });
    } catch (error) {
      console.error("Error al mostrar tickets:", error);
      mostrarMensaje("Error al cargar los tickets", "error");
    }
  }

  async function mostrarTicketsSinAsignar() {
    // Limpiar contenedor antes de cargar
    unassignedTickets.innerHTML = "";
    
    try {
      console.log("Obteniendo tickets sin asignar...");
      const ticketsSinAsignar = await obtenerTicketsSinAsignar();
      console.log("Tickets sin asignar encontrados:", ticketsSinAsignar);
      
      if (ticketsSinAsignar.length === 0) {
        unassignedTickets.innerHTML = '<p class="mensaje-info">No hay tickets sin asignar.</p>';
        return;
      }
      
      // Verificar que no haya duplicados por ID
      const ticketsUnicos = ticketsSinAsignar.filter((ticket, index, self) => 
        index === self.findIndex(t => t.id === ticket.id)
      );
      
      // Verificar que no existan elementos duplicados en el DOM
      const ticketsExistentes = new Set();
      ticketsUnicos.forEach(ticket => {
        if (!ticketsExistentes.has(ticket.id)) {
          ticketsExistentes.add(ticket.id);
          console.log("Procesando ticket sin asignar:", ticket);
          const div = crearElementoTicket(ticket, "agente-sinasignar");
          unassignedTickets.appendChild(div);
        }
      });
    } catch (error) {
      console.error("Error al mostrar tickets sin asignar:", error);
      mostrarMensaje("Error al cargar los tickets sin asignar", "error");
    }
  }

  async function mostrarTicketsAsignados() {
    // Limpiar contenedor antes de cargar
    ticketList.innerHTML = "";
    
    try {
      console.log("Obteniendo tickets asignados para:", currentUser.email);
      const ticketsAsignados = await obtenerTicketsAsignados(currentUser.email);
      console.log("Tickets asignados encontrados:", ticketsAsignados);
      
      if (ticketsAsignados.length === 0) {
        ticketList.innerHTML = '<p class="mensaje-info">No tienes tickets asignados.</p>';
        return;
      }
      
      // Verificar que no haya duplicados por ID
      const ticketsUnicos = ticketsAsignados.filter((ticket, index, self) => 
        index === self.findIndex(t => t.id === ticket.id)
      );
      
      // Verificar que no existan elementos duplicados en el DOM
      const ticketsExistentes = new Set();
      ticketsUnicos.forEach(ticket => {
        if (!ticketsExistentes.has(ticket.id)) {
          ticketsExistentes.add(ticket.id);
          console.log("Procesando ticket asignado:", ticket);
          const div = crearElementoTicket(ticket, "agente-asignado");
          ticketList.appendChild(div);
        }
      });
    } catch (error) {
      console.error("Error al mostrar tickets asignados:", error);
      mostrarMensaje("Error al cargar los tickets asignados", "error");
    }
  }

  // Función auxiliar para formatear fechas
  function formatearFecha(timestamp) {
    if (!timestamp) return 'N/A';
    
    try {
      // Si es un timestamp de Firestore
      if (timestamp && typeof timestamp.toDate === 'function') {
        const fecha = timestamp.toDate();
        return fecha.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      
      // Si es un timestamp normal (número)
      if (typeof timestamp === 'number') {
        const fecha = new Date(timestamp);
        return fecha.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      
      // Si es una fecha (Date)
      if (timestamp instanceof Date) {
        return timestamp.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }

      // Si es un string de fecha
      if (typeof timestamp === 'string') {
        const fecha = new Date(timestamp);
        if (!isNaN(fecha.getTime())) {
          return fecha.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        }
      }

      console.warn('Formato de fecha no reconocido:', timestamp);
      return 'Fecha no válida';
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'Error en fecha';
    }
  }

  // Función para calcular tiempo restante
  function calcularTiempoRestante(fechaLimite) {
    if (!fechaLimite) return 'N/A';
    
    try {
      let fechaLimiteDate;
      
      // Si es un timestamp de Firestore
      if (fechaLimite && typeof fechaLimite.toDate === 'function') {
        fechaLimiteDate = fechaLimite.toDate();
      }
      // Si es un timestamp normal (número)
      else if (typeof fechaLimite === 'number') {
        fechaLimiteDate = new Date(fechaLimite);
      }
      // Si es una fecha (Date)
      else if (fechaLimite instanceof Date) {
        fechaLimiteDate = fechaLimite;
      }
      // Si es un string de fecha
      else if (typeof fechaLimite === 'string') {
        fechaLimiteDate = new Date(fechaLimite);
      }
      
      if (!fechaLimiteDate || isNaN(fechaLimiteDate.getTime())) {
        console.warn('Fecha límite no válida:', fechaLimite);
        return 'Fecha no válida';
      }

      const ahora = new Date();
      const diferencia = fechaLimiteDate - ahora;
      
      if (diferencia < 0) return 'Vencido';
      
      const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
      const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
      
      if (dias > 0) return `${dias}d ${horas}h restantes`;
      if (horas > 0) return `${horas}h ${minutos}m restantes`;
      return `${minutos}m restantes`;
    } catch (error) {
      console.error('Error al calcular tiempo restante:', error);
      return 'Error en cálculo';
    }
  }

  function crearElementoTicket(ticket, tipo) {
    const div = document.createElement("div");
    div.className = `ticket ${ticket.prioridad.toLowerCase()}`;
    div.dataset.id = ticket.id;
    
    // Formatear fechas
    const fechaCreacionFormateada = formatearFecha(ticket.fechaCreacion);
    const tiempoRestante = calcularTiempoRestante(ticket.fechaLimite);
    
    // Información básica del ticket
    let contenido = `
      <div class="ticket-header">
        <span class="ticket-id">Ticket #${ticket.id}</span>
        <span class="ticket-estado ${ticket.estado.toLowerCase().replace(/\s+/g, '-')}">${ticket.estado}</span>
      </div>
      <div class="ticket-body">
        <p><strong>Tipo:</strong> ${ticket.tipo}</p>
        <p><strong>Servicio:</strong> ${ticket.servicio}</p>
        <p><strong>Descripción:</strong> ${ticket.descripcion}</p>
        <p><strong>Prioridad:</strong> <span class="prioridad ${ticket.prioridad.toLowerCase()}">${ticket.prioridad}</span></p>
        <p><strong>SLA:</strong> ${ticket.sla}</p>
        <p><strong>Fecha creación:</strong> ${fechaCreacionFormateada}</p>
        <p><strong>Tiempo restante:</strong> ${tiempoRestante}</p>
    `;
    
    // Añadir información específica según el tipo de usuario
    if (tipo === "usuario") {
      contenido += `
        <p><strong>Estado:</strong> ${ticket.estado}</p>
        ${ticket.asignadoA ? `<p><strong>Asignado a:</strong> ${ticket.asignadoA}</p>` : ''}
        <button class="btn-detalles" onclick="verDetalles('${ticket.id}')">Ver detalles</button>
      `;
    } else if (tipo === "agente-sinasignar") {
      contenido += `
        <p><strong>Creado por:</strong> ${ticket.creadoPor}</p>
        <button class="btn-asignar" onclick="asignarTicket('${ticket.id}')">Asignarme este ticket</button>
      `;
    } else if (tipo === "agente-asignado") {
      contenido += `
        <p><strong>Creado por:</strong> ${ticket.creadoPor}</p>
        <div class="controles-ticket">
          ${ticket.estado !== "Finalizado" ? 
            `<button class="btn-finalizar" onclick="cambiarEstado('${ticket.id}', 'Finalizado')">Finalizar Ticket</button>` : ''}
          ${ticket.estado !== "En proceso" && ticket.estado !== "Finalizado" ? 
            `<button class="btn-proceso" onclick="cambiarEstado('${ticket.id}', 'En proceso')">Marcar En Proceso</button>` : ''}
          <button class="btn-detalles" onclick="verDetalles('${ticket.id}')">Ver detalles</button>
        </div>
      `;
    }
    
    contenido += `</div>`;
    div.innerHTML = contenido;
    
    return div;
  }

  // Modificar las funciones de asignación y cambio de estado
  window.asignarTicket = async function(ticketId) {
    try {
      console.log("Intentando asignar ticket:", ticketId);
      const ahora = new Date();
      
      const resultado = await actualizarTicketEnFirebase(ticketId, {
        asignadoA: currentUser.email,
        estado: "En proceso",
        historial: firebase.firestore.FieldValue.arrayUnion({
          fecha: firebase.firestore.Timestamp.fromDate(ahora),
          accion: "Ticket asignado",
          usuario: currentUser.email
        })
      });

      console.log("Resultado de asignación:", resultado);

      if (resultado.exito) {
        await Promise.all([
          mostrarTicketsSinAsignar(),
          mostrarTicketsAsignados()
        ]);
        mostrarMensaje(`El ticket #${ticketId} ha sido asignado a ti.`, "success");
      } else {
        mostrarMensaje(resultado.mensaje, "error");
      }
    } catch (error) {
      console.error("Error al asignar ticket:", error);
      mostrarMensaje("Error al asignar el ticket", "error");
    }
  };

  window.cambiarEstado = async function(ticketId, nuevoEstado) {
    try {
      console.log("Intentando cambiar estado del ticket:", ticketId, "a:", nuevoEstado);
      const ahora = new Date();
      
      const resultado = await actualizarTicketEnFirebase(ticketId, {
        estado: nuevoEstado,
        historial: firebase.firestore.FieldValue.arrayUnion({
          fecha: firebase.firestore.Timestamp.fromDate(ahora),
          accion: `Ticket marcado como ${nuevoEstado}`,
          usuario: currentUser.email
        })
      });

      console.log("Resultado de cambio de estado:", resultado);

      if (resultado.exito) {
        await mostrarTicketsAsignados();
        mostrarMensaje(`El ticket #${ticketId} ha sido marcado como ${nuevoEstado}.`, "success");
      } else {
        mostrarMensaje(resultado.mensaje, "error");
      }
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      mostrarMensaje("Error al cambiar el estado del ticket", "error");
    }
  };

  window.verDetalles = function(ticketId) {
    const ticket = tickets.find(t => t.id === ticketId);
    
    if (ticket) {
      // Crear y mostrar modal
      mostrarModalDetalles(ticket);
    }
  };

  function mostrarModalDetalles(ticket) {
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.innerHTML = `
      <div class="modal-contenido">
        <span class="cerrar">&times;</span>
        <h2>Detalles del Ticket #${ticket.id}</h2>
        
        <div class="detalles-ticket">
          <div class="info-principal">
            <p><strong>Servicio:</strong> ${ticket.servicio}</p>
            <p><strong>Tipo de Servicio:</strong> ${ticket.tipoServicio}</p>
            <p><strong>Descripción:</strong> ${ticket.descripcion}</p>
            <p><strong>Impacto:</strong> ${ticket.impacto} | <strong>Urgencia:</strong> ${ticket.urgencia}</p>
            <p><strong>Prioridad:</strong> <span class="prioridad ${ticket.prioridad.toLowerCase()}">${ticket.prioridad}</span></p>
            <p><strong>SLA:</strong> ${ticket.sla}</p>
            <p><strong>Estado:</strong> <span class="ticket-estado ${ticket.estado.toLowerCase().replace(/\s+/g, '-')}">${ticket.estado}</span></p>
            <p><strong>Fecha creación:</strong> ${ticket.fechaCreacion}</p>
            <p><strong>Fecha límite:</strong> ${ticket.fechaLimite}</p>
            <p><strong>Creado por:</strong> ${ticket.creadoPor}</p>
            <p><strong>Asignado a:</strong> ${ticket.asignadoA || "Sin asignar"}</p>
          </div>
          
          <h3>Historial</h3>
          <div class="historial-ticket">
            ${ticket.historial.map(h => `
              <div class="entrada-historial">
                <p><strong>${h.fecha}</strong> - ${h.accion} por ${h.usuario}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Mostrar el modal
    setTimeout(() => {
      modal.style.display = "flex";
    }, 10);
    
    // Evento para cerrar el modal
    const cerrar = modal.querySelector(".cerrar");
    cerrar.addEventListener("click", () => {
      modal.style.opacity = "0";
      setTimeout(() => {
        document.body.removeChild(modal);
      }, 300);
    });
    
    // Cerrar el modal al hacer clic fuera
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.opacity = "0";
        setTimeout(() => {
          document.body.removeChild(modal);
        }, 300);
      }
    });
  }

  function mostrarMensaje(mensaje, tipo) {
    const mensajeDiv = document.createElement("div");
    mensajeDiv.className = `mensaje ${tipo}`;
    mensajeDiv.textContent = mensaje;
    
    document.body.appendChild(mensajeDiv);
    
    setTimeout(() => {
      mensajeDiv.classList.add("mostrar");
    }, 10);
    
    setTimeout(() => {
      mensajeDiv.classList.remove("mostrar");
      setTimeout(() => {
        document.body.removeChild(mensajeDiv);
      }, 300);
    }, 3000);
  }
});