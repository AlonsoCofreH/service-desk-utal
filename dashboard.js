document.addEventListener("DOMContentLoaded", () => {
  // Referencias a elementos DOM
  const loginForm = document.getElementById("loginForm");
  const dashboardScreen = document.getElementById("dashboardScreen");
  const loginScreen = document.getElementById("loginScreen");
  const userNameSpan = document.getElementById("userName");
  const logoutButton = document.getElementById("logoutButton");
  const dateRange = document.getElementById("dateRange");
  const customDateRange = document.getElementById("customDateRange");
  const startDate = document.getElementById("startDate");
  const endDate = document.getElementById("endDate");
  const refreshBtn = document.getElementById("refreshBtn");
  const agentMetricsSection = document.getElementById("agentMetricsSection");

  // Variables globales
  let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
  let charts = {};
  let currentDateRange = 'month';
  let startDateValue = null;
  let endDateValue = null;

  // Si hay un usuario en localStorage, iniciar sesión automáticamente
  if (currentUser) {
    iniciarSesion(currentUser);
  }

  // Event Listeners
  loginForm.addEventListener("submit", handleLogin);
  logoutButton.addEventListener("click", handleLogout);
  dateRange.addEventListener("change", handleDateRangeChange);
  startDate.addEventListener("change", handleCustomDateChange);
  endDate.addEventListener("change", handleCustomDateChange);
  refreshBtn.addEventListener("click", cargarDashboard);

  // Funciones principales
  async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    
    if (!email || !password) {
      mostrarMensaje("Por favor, complete todos los campos", "error");
      return;
    }

    try {
      const verificacion = await verificarUsuarioAutorizado(email);
      
      if (!verificacion.autorizado) {
        mostrarMensaje(verificacion.mensaje, "error");
        return;
      }

      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;

      currentUser = {
        email: user.email,
        role: verificacion.rol
      };
      
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      
      iniciarSesion(currentUser);
      mostrarMensaje("Inicio de sesión exitoso", "success");
    } catch (error) {
      console.error("Error de autenticación:", error);
      
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

  async function handleLogout() {
    try {
      await auth.signOut();
      localStorage.removeItem("currentUser");
      currentUser = null;
      
      loginScreen.style.display = "flex";
      dashboardScreen.style.display = "none";
      
      // Limpiar gráficos
      Object.values(charts).forEach(chart => {
        if (chart && chart.destroy) {
          chart.destroy();
        }
      });
      charts = {};
      
      mostrarMensaje("Sesión cerrada exitosamente", "success");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      mostrarMensaje("Error al cerrar sesión", "error");
    }
  }

  function iniciarSesion(user) {
    loginScreen.style.display = "none";
    dashboardScreen.style.display = "block";
    userNameSpan.textContent = user.email;
    
    // Mostrar métricas de agente si es agente
    if (user.role === 'agente') {
      agentMetricsSection.style.display = "block";
    }
    
    // Cargar dashboard
    cargarDashboard();
  }

  function handleDateRangeChange() {
    currentDateRange = dateRange.value;
    
    if (currentDateRange === 'custom') {
      customDateRange.style.display = "flex";
      // Establecer fechas por defecto (último mes)
      const end = new Date();
      const start = new Date();
      start.setMonth(start.getMonth() - 1);
      
      startDate.value = start.toISOString().split('T')[0];
      endDate.value = end.toISOString().split('T')[0];
      
      startDateValue = start;
      endDateValue = end;
    } else {
      customDateRange.style.display = "none";
      startDateValue = null;
      endDateValue = null;
    }
    
    cargarDashboard();
  }

  function handleCustomDateChange() {
    if (startDate.value && endDate.value) {
      startDateValue = new Date(startDate.value);
      endDateValue = new Date(endDate.value);
      cargarDashboard();
    }
  }

  async function cargarDashboard() {
    try {
      mostrarCarga(true);
      
      // Obtener fechas del período seleccionado
      const { start, end } = obtenerFechasPeriodo();
      
      // Cargar todos los tickets del período
      const tickets = await obtenerTicketsPeriodo(start, end);
      
      // Calcular métricas
      const metricas = calcularMetricas(tickets);
      
      // Actualizar KPI cards
      actualizarKPICards(metricas);
      
      // Crear/actualizar gráficos
      await crearGraficos(tickets, metricas);
      
      // Actualizar tabla de problemas principales
      actualizarTablaProblemas(tickets);
      
      // Actualizar métricas de agente si aplica
      if (currentUser.role === 'agente') {
        await actualizarMetricasAgente(tickets);
      }
      
      mostrarCarga(false);
    } catch (error) {
      console.error("Error al cargar dashboard:", error);
      mostrarMensaje("Error al cargar el dashboard", "error");
      mostrarCarga(false);
    }
  }

  function obtenerFechasPeriodo() {
    const ahora = new Date();
    let start, end;
    
    switch (currentDateRange) {
      case 'today':
        start = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
        end = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), 23, 59, 59);
        break;
      case 'week':
        const inicioSemana = new Date(ahora);
        inicioSemana.setDate(ahora.getDate() - ahora.getDay());
        start = new Date(inicioSemana.getFullYear(), inicioSemana.getMonth(), inicioSemana.getDate());
        end = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), 23, 59, 59);
        break;
      case 'month':
        start = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        end = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), 23, 59, 59);
        break;
      case 'quarter':
        const quarter = Math.floor(ahora.getMonth() / 3);
        start = new Date(ahora.getFullYear(), quarter * 3, 1);
        end = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), 23, 59, 59);
        break;
      case 'year':
        start = new Date(ahora.getFullYear(), 0, 1);
        end = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), 23, 59, 59);
        break;
      case 'custom':
        start = startDateValue;
        end = endDateValue;
        break;
      default:
        start = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        end = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), 23, 59, 59);
    }
    
    return { start, end };
  }

  async function obtenerTicketsPeriodo(start, end) {
    try {
      const querySnapshot = await ticketsCollection
        .where('fechaCreacion', '>=', firebase.firestore.Timestamp.fromDate(start))
        .where('fechaCreacion', '<=', firebase.firestore.Timestamp.fromDate(end))
        .get();
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        fechaCreacion: doc.data().fechaCreacion?.toDate?.() || new Date(),
        fechaLimite: doc.data().fechaLimite?.toDate?.() || new Date(),
        fechaResolucion: doc.data().fechaResolucion?.toDate?.() || null
      }));
    } catch (error) {
      console.error("Error al obtener tickets:", error);
      return [];
    }
  }

  function calcularMetricas(tickets) {
    const total = tickets.length;
    const pendientes = tickets.filter(t => t.estado === 'Abierto' || t.estado === 'En Proceso').length;
    const resueltos = tickets.filter(t => t.estado === 'Cerrado').length;
    
    // Calcular tiempo promedio de resolución
    const ticketsResueltos = tickets.filter(t => t.estado === 'Cerrado' && t.fechaResolucion);
    let tiempoPromedio = 0;
    if (ticketsResueltos.length > 0) {
      const tiempos = ticketsResueltos.map(t => {
        const inicio = t.fechaCreacion;
        const fin = t.fechaResolucion;
        return (fin - inicio) / (1000 * 60 * 60); // Horas
      });
      tiempoPromedio = tiempos.reduce((a, b) => a + b, 0) / tiempos.length;
    }
    
    // Calcular cumplimiento SLA
    const ticketsConSLA = tickets.filter(t => t.fechaLimite);
    let cumplimientoSLA = 0;
    if (ticketsConSLA.length > 0) {
      const cumplidos = ticketsConSLA.filter(t => {
        if (t.estado === 'Cerrado' && t.fechaResolucion) {
          return t.fechaResolucion <= t.fechaLimite;
        }
        return new Date() <= t.fechaLimite;
      }).length;
      cumplimientoSLA = (cumplidos / ticketsConSLA.length) * 100;
    }
    
    // Calcular tiempo primera respuesta (simulado)
    const tiempoPrimeraRespuesta = 2.5; // Horas promedio
    
    // Calcular tendencias (simulado)
    const tendencias = {
      total: Math.random() * 20 - 10, // -10% a +10%
      pendientes: Math.random() * 30 - 15,
      resueltos: Math.random() * 25 - 12,
      tiempoResolucion: Math.random() * 40 - 20,
      sla: Math.random() * 15 - 7,
      primeraRespuesta: Math.random() * 30 - 15
    };
    
    return {
      total,
      pendientes,
      resueltos,
      tiempoPromedio,
      cumplimientoSLA,
      tiempoPrimeraRespuesta,
      tendencias
    };
  }

  function actualizarKPICards(metricas) {
    document.getElementById('totalTickets').textContent = metricas.total;
    document.getElementById('pendingTickets').textContent = metricas.pendientes;
    document.getElementById('resolvedTickets').textContent = metricas.resueltos;
    document.getElementById('avgResolutionTime').textContent = `${metricas.tiempoPromedio.toFixed(1)}h`;
    document.getElementById('slaCompliance').textContent = `${metricas.cumplimientoSLA.toFixed(1)}%`;
    document.getElementById('firstResponseTime').textContent = `${metricas.tiempoPrimeraRespuesta.toFixed(1)}h`;
    
    // Actualizar tendencias
    document.getElementById('ticketsTrend').textContent = `${metricas.tendencias.total.toFixed(1)}%`;
    document.getElementById('pendingTrend').textContent = `${metricas.tendencias.pendientes.toFixed(1)}%`;
    document.getElementById('resolvedTrend').textContent = `${metricas.tendencias.resueltos.toFixed(1)}%`;
    document.getElementById('resolutionTrend').textContent = `${metricas.tendencias.tiempoResolucion.toFixed(1)}%`;
    document.getElementById('slaTrend').textContent = `${metricas.tendencias.sla.toFixed(1)}%`;
    document.getElementById('responseTrend').textContent = `${metricas.tendencias.primeraRespuesta.toFixed(1)}%`;
  }

  async function crearGraficos(tickets, metricas) {
    // Gráfico de distribución por servicio
    crearGraficoServicios(tickets);
    
    // Gráfico de evolución temporal
    crearGraficoEvolucion(tickets);
    
    // Gráfico de prioridades
    crearGraficoPrioridades(tickets);
    
    // Gráfico de rendimiento por agente
    crearGraficoAgentes(tickets);
  }

  function crearGraficoServicios(tickets) {
    const ctx = document.getElementById('serviceChart').getContext('2d');
    
    // Agrupar tickets por servicio
    const servicios = {};
    tickets.forEach(ticket => {
      servicios[ticket.servicio] = (servicios[ticket.servicio] || 0) + 1;
    });
    
    const labels = Object.keys(servicios);
    const data = Object.values(servicios);
    const colors = [
      '#667eea', '#f093fb', '#4facfe', '#43e97b', 
      '#fa709a', '#a8edea', '#ffecd2', '#ff9a9e'
    ];
    
    if (charts.serviceChart) {
      charts.serviceChart.destroy();
    }
    
    charts.serviceChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors.slice(0, labels.length),
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  function crearGraficoEvolucion(tickets) {
    const ctx = document.getElementById('evolutionChart').getContext('2d');
    
    // Agrupar tickets por día
    const dias = {};
    tickets.forEach(ticket => {
      const fecha = ticket.fechaCreacion.toISOString().split('T')[0];
      if (!dias[fecha]) {
        dias[fecha] = { creados: 0, resueltos: 0 };
      }
      dias[fecha].creados++;
      if (ticket.estado === 'Cerrado') {
        dias[fecha].resueltos++;
      }
    });
    
    const labels = Object.keys(dias).sort();
    const datosCreados = labels.map(fecha => dias[fecha].creados);
    const datosResueltos = labels.map(fecha => dias[fecha].resueltos);
    
    if (charts.evolutionChart) {
      charts.evolutionChart.destroy();
    }
    
    charts.evolutionChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Tickets Creados',
          data: datosCreados,
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          tension: 0.4
        }, {
          label: 'Tickets Resueltos',
          data: datosResueltos,
          borderColor: '#43e97b',
          backgroundColor: 'rgba(67, 233, 123, 0.1)',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  function crearGraficoPrioridades(tickets) {
    const ctx = document.getElementById('priorityChart').getContext('2d');
    
    // Agrupar tickets por prioridad
    const prioridades = {};
    tickets.forEach(ticket => {
      prioridades[ticket.prioridad] = (prioridades[ticket.prioridad] || 0) + 1;
    });
    
    const labels = Object.keys(prioridades);
    const data = Object.values(prioridades);
    const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6'];
    
    if (charts.priorityChart) {
      charts.priorityChart.destroy();
    }
    
    charts.priorityChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors.slice(0, labels.length),
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }

  function crearGraficoAgentes(tickets) {
    const ctx = document.getElementById('agentChart').getContext('2d');
    
    // Agrupar tickets por agente
    const agentes = {};
    tickets.forEach(ticket => {
      if (ticket.asignadoA) {
        if (!agentes[ticket.asignadoA]) {
          agentes[ticket.asignadoA] = { asignados: 0, resueltos: 0 };
        }
        agentes[ticket.asignadoA].asignados++;
        if (ticket.estado === 'Cerrado') {
          agentes[ticket.asignadoA].resueltos++;
        }
      }
    });
    
    const labels = Object.keys(agentes);
    const datosAsignados = labels.map(agente => agentes[agente].asignados);
    const datosResueltos = labels.map(agente => agentes[agente].resueltos);
    
    if (charts.agentChart) {
      charts.agentChart.destroy();
    }
    
    charts.agentChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Asignados',
          data: datosAsignados,
          backgroundColor: '#667eea'
        }, {
          label: 'Resueltos',
          data: datosResueltos,
          backgroundColor: '#43e97b'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  function actualizarTablaProblemas(tickets) {
    const tbody = document.getElementById('topIssuesBody');
    tbody.innerHTML = '';
    
    // Agrupar tickets por servicio y tipo
    const problemas = {};
    tickets.forEach(ticket => {
      const clave = `${ticket.servicio} - ${ticket.tipoServicio}`;
      problemas[clave] = (problemas[clave] || 0) + 1;
    });
    
    // Ordenar por cantidad y tomar los top 10
    const topProblemas = Object.entries(problemas)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
    
    const total = tickets.length;
    
    topProblemas.forEach(([problema, cantidad]) => {
      const porcentaje = ((cantidad / total) * 100).toFixed(1);
      const tendencia = Math.random() > 0.5 ? '↗️' : '↘️';
      
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${problema.split(' - ')[0]}</td>
        <td>${problema.split(' - ')[1]}</td>
        <td>${cantidad}</td>
        <td>${porcentaje}%</td>
        <td>${tendencia}</td>
      `;
      tbody.appendChild(row);
    });
  }

  async function actualizarMetricasAgente(tickets) {
    const misTickets = tickets.filter(t => t.asignadoA === currentUser.email);
    const misResueltos = misTickets.filter(t => t.estado === 'Cerrado');
    
    // Calcular tiempo promedio personal
    let miTiempoPromedio = 0;
    if (misResueltos.length > 0) {
      const tiempos = misResueltos.map(t => {
        const inicio = t.fechaCreacion;
        const fin = t.fechaResolucion;
        return (fin - inicio) / (1000 * 60 * 60); // Horas
      });
      miTiempoPromedio = tiempos.reduce((a, b) => a + b, 0) / tiempos.length;
    }
    
    // Calcular cumplimiento SLA personal
    const misTicketsConSLA = misTickets.filter(t => t.fechaLimite);
    let miCumplimientoSLA = 0;
    if (misTicketsConSLA.length > 0) {
      const cumplidos = misTicketsConSLA.filter(t => {
        if (t.estado === 'Cerrado' && t.fechaResolucion) {
          return t.fechaResolucion <= t.fechaLimite;
        }
        return new Date() <= t.fechaLimite;
      }).length;
      miCumplimientoSLA = (cumplidos / misTicketsConSLA.length) * 100;
    }
    
    // Actualizar métricas personales
    document.getElementById('myAssignedTickets').textContent = misTickets.length;
    document.getElementById('myResolvedTickets').textContent = misResueltos.length;
    document.getElementById('myAvgTime').textContent = `${miTiempoPromedio.toFixed(1)}h`;
    document.getElementById('mySLACompliance').textContent = `${miCumplimientoSLA.toFixed(1)}%`;
  }

  function mostrarCarga(mostrar) {
    const elementos = document.querySelectorAll('.kpi-card, .chart-container, .table-section');
    elementos.forEach(el => {
      if (mostrar) {
        el.classList.add('loading');
      } else {
        el.classList.remove('loading');
      }
    });
  }

  function mostrarMensaje(mensaje, tipo) {
    // Crear elemento de mensaje
    const mensajeEl = document.createElement('div');
    mensajeEl.className = `mensaje ${tipo}`;
    mensajeEl.textContent = mensaje;
    mensajeEl.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      color: white;
      font-weight: 600;
      z-index: 1000;
      animation: slideIn 0.3s ease;
      background: ${tipo === 'success' ? '#10b981' : '#ef4444'};
    `;
    
    document.body.appendChild(mensajeEl);
    
    // Remover después de 3 segundos
    setTimeout(() => {
      mensajeEl.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        if (mensajeEl.parentNode) {
          mensajeEl.parentNode.removeChild(mensajeEl);
        }
      }, 300);
    }, 3000);
  }

  // Escuchar cambios en el estado de autenticación
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      const verificacion = await verificarUsuarioAutorizado(user.email);
      if (verificacion.autorizado) {
        currentUser = {
          email: user.email,
          role: verificacion.rol
        };
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
        iniciarSesion(currentUser);
      }
    } else {
      currentUser = null;
      localStorage.removeItem("currentUser");
    }
  });

  // Estilos CSS para animaciones de mensajes
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}); 