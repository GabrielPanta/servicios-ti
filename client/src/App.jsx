import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Server, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowLeft, 
  Shield, 
  Zap, 
  ChevronRight,
  ClipboardCheck,
  Search,
  Plus,
  X,
  Trash2,
  Pencil,
  BarChart3,
  FileText,
  MessageSquare,
  XCircle,
  Download,
  LogOut,
  Mail,
  User,
  Settings,
  HelpCircle,
  Activity,
  Briefcase,
  Layers,
  Database
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

function App() {
  const [servicios, setServicios] = useState([]);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevaDescripcion, setNuevaDescripcion] = useState('');
  const [editNombre, setEditNombre] = useState('');
  const [editDescripcion, setEditDescripcion] = useState('');
  const [creando, setCreando] = useState(false);
  const [editando, setEditando] = useState(false);
  const [stats, setStats] = useState(null);
  // Observaciones
  const [obsModalCaso, setObsModalCaso] = useState(null);
  const [obsTexto, setObsTexto] = useState('');
  // Toast
  const [toast, setToast] = useState(null);

  // Auth
  const [authToken, setAuthToken] = useState(localStorage.getItem('token'));
  const [userEmail, setUserEmail] = useState(localStorage.getItem('email') || '');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authView, setAuthView] = useState('login'); // 'login' | 'register' | 'verify'
  const [authLoading, setAuthLoading] = useState(false);
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' | 'riesgos'

  // Riesgos Informáticos
  const [riesgos, setRiesgos] = useState([]);
  const [showRiskForm, setShowRiskForm] = useState(false);
  const [riesgoSeleccionado, setRiesgoSeleccionado] = useState(null);
  const [riskForm, setRiskForm] = useState({
    nombre_proyecto: '',
    solicitante: userEmail,
    departamento: 'Operaciones de Ciberseguridad',
    tipo_riesgo: 'Infraestructura',
    severidad: 'Medio',
    descripcion: '',
    sistemas_afectados: [],
    impacto_financiero: ''
  });
  const [guardandoRiesgo, setGuardandoRiesgo] = useState(false);

  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/verificar/')) {
      const token = path.split('/')[2];
      verificarCuenta(token);
    } else if (authToken) {
      setupAxios();
      fetchServicios();
      fetchStats();
      fetchRiesgos();
    }
  }, [authToken]);

  const setupAxios = () => {
    axios.interceptors.request.clear();
    axios.interceptors.response.clear();
    axios.interceptors.request.use(config => {
      config.headers.Authorization = `Bearer ${authToken}`;
      return config;
    });
    axios.interceptors.response.use(res => res, error => {
      if (error.response?.status === 401 || error.response?.status === 403) {
        handleLogout();
      }
      return Promise.reject(error);
    });
  };

  const verificarCuenta = async (token) => {
    setAuthView('verify');
    setAuthLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE}/verificar/${token}`);
      showToast(data.message, 'success');
      setTimeout(() => {
        window.history.pushState({}, '', '/');
        setAuthView('login');
      }, 3000);
    } catch (error) {
      showToast(error.response?.data?.error || 'Error al verificar la cuenta', 'danger');
      setTimeout(() => {
        window.history.pushState({}, '', '/');
        setAuthView('login');
      }, 3000);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!authEmail || !authPassword) return;
    setAuthLoading(true);
    try {
      if (authView === 'login') {
        const { data } = await axios.post(`${API_BASE}/login`, { email: authEmail, password: authPassword });
        localStorage.setItem('token', data.token);
        localStorage.setItem('email', data.email);
        setAuthToken(data.token);
        setUserEmail(data.email);
        showToast('Inicio de sesión exitoso');
      } else if (authView === 'register') {
        const { data } = await axios.post(`${API_BASE}/registro`, { email: authEmail, password: authPassword });
        showToast(data.message || 'Revisa tu correo para verificar tu cuenta', 'success');
        setAuthView('login');
        setAuthPassword('');
      }
    } catch (error) {
      showToast(error.response?.data?.error || 'Error de autenticación', 'danger');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    setAuthToken(null);
    setUserEmail('');
    setServicios([]);
    setStats(null);
    setServicioSeleccionado(null);
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchServicios = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/servicios`);
      setServicios(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching services:', error);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/estadisticas`);
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRiesgos = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/riesgos`);
      setRiesgos(data);
    } catch (error) {
      console.error('Error fetching risks:', error);
    }
  };

  const handleCrearRiesgo = async (e) => {
    e.preventDefault();
    setGuardandoRiesgo(true);
    try {
      await axios.post(`${API_BASE}/riesgos`, riskForm);
      showToast('Solicitud de riesgo enviada con éxito');
      setShowRiskForm(false);
      fetchRiesgos();
      setRiskForm({
        nombre_proyecto: '',
        solicitante: userEmail,
        departamento: 'Operaciones de Ciberseguridad',
        tipo_riesgo: 'Infraestructura',
        severidad: 'Medio',
        descripcion: '',
        sistemas_afectados: [],
        impacto_financiero: ''
      });
    } catch (error) {
      console.error('Error saving risk:', error);
      showToast('Error al enviar la solicitud', 'danger');
    } finally {
      setGuardandoRiesgo(false);
    }
  };

  const fetchDetalleServicio = async (id) => {
    try {
      const { data } = await axios.get(`${API_BASE}/servicios/${id}`);
      setServicioSeleccionado(data);
    } catch (error) {
      console.error('Error fetching service detail:', error);
    }
  };

  const handleValidar = async (caso_id, resultado, observaciones) => {
    try {
      await axios.post(`${API_BASE}/validaciones`, { caso_id, resultado, observaciones });
      fetchDetalleServicio(servicioSeleccionado.id);
      fetchServicios();
      fetchStats();
      showToast(`Prueba marcada como "${resultado}"`);
    } catch (error) {
      console.error('Error saving validation:', error);
    }
  };

  const handleGuardarObs = async () => {
    if (!obsModalCaso) return;
    try {
      const resultado = obsModalCaso.resultado || 'Pendiente';
      await axios.post(`${API_BASE}/validaciones`, { 
        caso_id: obsModalCaso.id, 
        resultado, 
        observaciones: obsTexto 
      });
      setObsModalCaso(null);
      setObsTexto('');
      fetchDetalleServicio(servicioSeleccionado.id);
      showToast('Observación guardada');
    } catch (error) {
      console.error('Error saving observation:', error);
    }
  };

  const handleCrearServicio = async (e) => {
    e.preventDefault();
    if (!nuevoNombre.trim()) return;
    setCreando(true);
    try {
      await axios.post(`${API_BASE}/servicios`, {
        nombre: nuevoNombre,
        descripcion: nuevaDescripcion
      });
      setNuevoNombre('');
      setNuevaDescripcion('');
      setShowModal(false);
      fetchServicios();
      fetchStats();
      showToast('Servicio creado con éxito');
    } catch (error) {
      console.error('Error creating service:', error);
    } finally {
      setCreando(false);
    }
  };

  const handleEliminarServicio = async () => {
    if (!window.confirm(`¿Estás seguro de eliminar "${servicioSeleccionado.nombre}"?`)) return;
    try {
      await axios.delete(`${API_BASE}/servicios/${servicioSeleccionado.id}`);
      setServicioSeleccionado(null);
      fetchServicios();
      fetchStats();
      showToast('Servicio eliminado', 'danger');
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  const abrirEditModal = () => {
    setEditNombre(servicioSeleccionado.nombre);
    setEditDescripcion(servicioSeleccionado.descripcion || '');
    setShowEditModal(true);
  };

  const handleEditarServicio = async (e) => {
    e.preventDefault();
    if (!editNombre.trim()) return;
    setEditando(true);
    try {
      await axios.put(`${API_BASE}/servicios/${servicioSeleccionado.id}`, {
        nombre: editNombre,
        descripcion: editDescripcion
      });
      setShowEditModal(false);
      fetchDetalleServicio(servicioSeleccionado.id);
      fetchServicios();
      showToast('Servicio actualizado');
    } catch (error) {
      console.error('Error editing service:', error);
    } finally {
      setEditando(false);
    }
  };

  // ======= EXPORTAR PDF =======
  const exportarPDF = () => {
    if (!servicioSeleccionado) return;
    const s = servicioSeleccionado;
    const fecha = new Date().toLocaleDateString('es-PE');
    
    const contenido = `
      <html>
      <head>
        <title>Reporte - ${s.nombre}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1e293b; }
          h1 { color: #4f46e5; border-bottom: 3px solid #4f46e5; padding-bottom: 10px; }
          .info { background: #f1f5f9; padding: 16px; border-radius: 8px; margin: 20px 0; }
          .info p { margin: 6px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #4f46e5; color: white; padding: 12px; text-align: left; }
          td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
          tr:nth-child(even) { background: #f8fafc; }
          .paso { color: #10b981; font-weight: bold; }
          .fallo { color: #ef4444; font-weight: bold; }
          .pendiente { color: #64748b; }
          .footer { margin-top: 40px; text-align: center; color: #94a3b8; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>📋 Reporte de Validación de Servicio</h1>
        <div class="info">
          <p><strong>Servicio:</strong> ${s.nombre}</p>
          <p><strong>Descripción:</strong> ${s.descripcion || 'Sin descripción'}</p>
          <p><strong>Estado:</strong> ${s.estado}</p>
          <p><strong>Fecha del reporte:</strong> ${fecha}</p>
        </div>
        <h2>Resultados de Pruebas</h2>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Categoría</th>
              <th>Descripción</th>
              <th>Resultado</th>
              <th>Observaciones</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            ${s.pruebas.map((p, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${p.categoria}</td>
                <td>${p.descripcion}</td>
                <td class="${p.resultado === 'Pasó' ? 'paso' : p.resultado === 'Falló' ? 'fallo' : 'pendiente'}">${p.resultado || 'Pendiente'}</td>
                <td>${p.observaciones || '-'}</td>
                <td>${p.fecha_validacion ? new Date(p.fecha_validacion).toLocaleDateString('es-PE') : '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">
          <p>Generado automáticamente por el Sistema de Validación de Servicios TI — ${fecha}</p>
        </div>
      </body>
      </html>
    `;

    const ventana = window.open('', '_blank');
    ventana.document.write(contenido);
    ventana.document.close();
    ventana.print();
  };

  const exportarRiesgoPDF = () => {
    const r = riesgoSeleccionado;
    const fecha = new Date().toLocaleDateString('es-PE');
    
    const contenido = `
      <html>
      <head>
        <title>Ficha de Riesgo - ${r.nombre_proyecto}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; }
          h1 { color: #0f172a; border-bottom: 2px solid #6366f1; padding-bottom: 10px; }
          .severity { display: inline-block; padding: 5px 12px; border-radius: 6px; font-weight: bold; font-size: 0.8rem; margin-bottom: 20px; }
          .bajo { background: #d1fae5; color: #065f46; }
          .medio { background: #fef3c7; color: #92400e; }
          .alto { background: #fee2e2; color: #991b1b; }
          .critico { background: #ffe4e6; color: #9f1239; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
          .info-item { background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
          .label { font-size: 0.75rem; color: #64748b; text-transform: uppercase; font-weight: bold; margin-bottom: 5px; }
          .value { font-size: 1rem; font-weight: 600; }
          .description { margin-top: 30px; background: #ffffff; padding: 20px; border-radius: 10px; border: 1px solid #e2e8f0; line-height: 1.6; }
          .footer { margin-top: 50px; font-size: 0.8rem; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h1 style="margin: 0;">🛡️ Ficha Técnica de Riesgo TI</h1>
          <span class="severity ${r.severidad.toLowerCase()}">SEVERIDAD: ${r.severidad.toUpperCase()}</span>
        </div>
        
        <div class="description">
          <div class="label">Proyecto / Solicitud</div>
          <div style="font-size: 1.5rem; font-weight: 800; color: #6366f1;">${r.nombre_proyecto}</div>
        </div>

        <div class="info-grid" style="margin-top: 20px;">
          <div class="info-item">
            <div class="label">Solicitante</div>
            <div class="value">${r.solicitante}</div>
          </div>
          <div class="info-item">
            <div class="label">Departamento</div>
            <div class="value">${r.departamento}</div>
          </div>
          <div class="info-item">
            <div class="label">Tipo de Riesgo</div>
            <div class="value">${r.tipo_riesgo}</div>
          </div>
          <div class="info-item">
            <div class="label">Impacto Financiero Est.</div>
            <div class="value" style="color: #ef4444;">$${Number(r.impacto_financiero).toLocaleString()}</div>
          </div>
        </div>

        <div class="description">
          <div class="label">Descripción Detallada</div>
          <p>${r.descripcion}</p>
        </div>

        <div class="description">
          <div class="label">Sistemas e Infraestructura Afectada</div>
          <ul style="margin-top: 10px;">
            ${JSON.parse(r.sistemas_afectados || '[]').map(sys => `<li>${sys}</li>`).join('')}
          </ul>
        </div>

        <div class="footer">
          Generado automáticamente por RiskShield Pro — ${fecha}<br/>
          Marco Normativo: ISO 27001 / ITIL 4
        </div>
      </body>
      </html>
    `;

    const ventana = window.open('', '_blank');
    ventana.document.write(contenido);
    ventana.document.close();
    ventana.print();
  };

  const getStatusBadge = (estado) => {
    switch (estado) {
      case 'Validado': return <span className="badge badge-valid">Validado</span>;
      case 'En Proceso': return <span className="badge badge-process">En Proceso</span>;
      case 'Rechazado': return <span className="badge badge-reject">Rechazado</span>;
      default: return <span className="badge badge-pending">Pendiente</span>;
    }
  };

  const filteredServicios = servicios.filter(s => 
    s.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!authToken && authView === 'verify') {
    return (
      <div className="auth-container">
        <div className="glass-card auth-card" style={{ textAlign: 'center' }}>
          <Mail size={48} color="var(--primary)" style={{ marginBottom: '20px' }} />
          <div className="auth-header">
            <h2>Verificando Cuenta</h2>
            <p style={{ color: 'var(--text-muted)' }}>{authLoading ? 'Por favor espera...' : 'Redirigiendo...'}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!authToken) {
    return (
      <div className="auth-container">
        <AnimatePresence>
          {toast && (
            <motion.div
              className={`toast toast-${toast.type}`}
              initial={{ opacity: 0, y: -40, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: -40, x: '-50%' }}
            >
              {toast.type === 'success' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
              {toast.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lado Visual (Hero) */}
        <div className="auth-visual-side">
          <motion.div 
            className="auth-visual-content"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
              <Shield size={42} color="white" />
              <h2 style={{ color: 'white', fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>RiskShield Pro</h2>
            </div>
            <h1>Protección y Cumplimiento de Nivel Empresarial</h1>
            <p>Monitoree riesgos en tiempo real, gestione validaciones de infraestructura y asegure la integridad de sus servicios críticos con nuestra plataforma avanzada.</p>
          </motion.div>
        </div>

        {/* Lado del Formulario */}
        <div className="auth-form-side">
          <motion.div 
            className="auth-card" 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="auth-header">
              <h2>{authView === 'login' ? 'Bienvenido' : 'Crear Cuenta'}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                {authView === 'login' ? 'Ingrese sus credenciales para acceder.' : 'Únase a nuestra red de seguridad empresarial.'}
              </p>
            </div>

            <div className="auth-tabs">
              <div className={`auth-tab ${authView === 'login' ? 'active' : ''}`} onClick={() => setAuthView('login')}>
                Iniciar Sesión
              </div>
              <div className={`auth-tab ${authView === 'register' ? 'active' : ''}`} onClick={() => setAuthView('register')}>
                Registrarse
              </div>
            </div>

            <form onSubmit={handleAuth}>
              <div className="form-group">
                <label>Correo Electrónico Corporativo</label>
                <input type="email" placeholder="ejemplo@empresa.com" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Contraseña</label>
                <input type="password" placeholder="••••••••" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} required />
              </div>
              
              {authView === 'login' && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                  <a href="#" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>¿Olvidó su contraseña?</a>
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-full" disabled={authLoading} style={{ height: '52px', fontSize: '1.1rem' }}>
                {authLoading ? 'Procesando...' : authView === 'login' ? 'Ingresar al Dashboard' : 'Comenzar Ahora'}
              </button>
            </form>

            <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                &copy; 2026 RiskShield Pro. Todos los derechos reservados.<br/>
                Sistema de Gestión de Riesgos e Infraestructura TI.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* ============ TOAST ============ */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className={`toast toast-${toast.type}`}
            initial={{ opacity: 0, y: -40, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -40, x: '-50%' }}
          >
            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============ SIDEBAR ============ */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Shield size={28} color="var(--primary)" />
          <h2>RiskShield Pro</h2>
        </div>

        <nav className="sidebar-nav">
          <div 
            className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
            onClick={() => { setActiveView('dashboard'); setServicioSeleccionado(null); }}
          >
            <Activity size={20} />
            <span>Validaciones</span>
          </div>
          <div 
            className={`nav-item ${activeView === 'riesgos' ? 'active' : ''}`}
            onClick={() => { setActiveView('riesgos'); setShowRiskForm(false); }}
          >
            <AlertCircle size={20} />
            <span>Riesgos</span>
          </div>
          <div className="nav-item">
            <FileText size={20} />
            <span>Informes</span>
          </div>
          <div className="nav-item">
            <Settings size={20} />
            <span>Configuración</span>
          </div>
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <div className="nav-item">
            <HelpCircle size={20} />
            <span>Soporte</span>
          </div>
          <div className="nav-item" onClick={handleLogout} style={{ color: 'var(--danger)' }}>
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <div className="dashboard-container">
          <AnimatePresence mode="wait">
            {activeView === 'dashboard' ? (
              <motion.div 
                key="dashboard-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {/* ============ VISTAS DE SERVICIOS (EXISTENTE) ============ */}
                {!servicioSeleccionado ? (
                  <motion.div key="servicios-list">
                    <header className="header">
                      <div className="title-section">
                        <h1>Validación de Servicios</h1>
                        <p>Gestión de calidad y despliegue de infraestructura TI</p>
                      </div>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div className="search-box glass-card" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center' }}>
                          <Search size={18} style={{ marginRight: '10px', color: 'var(--text-muted)' }} />
                          <input type="text" placeholder="Buscar servicio..." style={{ background: 'none', border: 'none', color: 'var(--text-main)', outline: 'none', width: '160px' }} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                          <Plus size={18} /> Nuevo Servicio
                        </button>
                        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '10px' }}>
                          <User size={18} color="var(--primary)" />
                          <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 500 }}>{userEmail}</span>
                        </div>
                      </div>
                    </header>

                    {/* ESTADÍSTICAS */}
                    {stats && (
                      <div className="stats-grid">
                        <div className="stat-card glass-card">
                          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)' }}><BarChart3 size={22} color="#818cf8" /></div>
                          <div className="stat-info">
                            <span className="stat-number">{stats.servicios.total}</span>
                            <span className="stat-label">Total Servicios</span>
                          </div>
                        </div>
                        <div className="stat-card glass-card">
                          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)' }}><CheckCircle2 size={22} color="#34d399" /></div>
                          <div className="stat-info">
                            <span className="stat-number">{stats.servicios.validados}</span>
                            <span className="stat-label">Validados</span>
                          </div>
                        </div>
                        <div className="stat-card glass-card">
                          <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.15)' }}><XCircle size={22} color="#f87171" /></div>
                          <div className="stat-info">
                            <span className="stat-number">{stats.servicios.rechazados}</span>
                            <span className="stat-label">Rechazados</span>
                          </div>
                        </div>
                        <div className="stat-card glass-card">
                          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)' }}><Clock size={22} color="#fbbf24" /></div>
                          <div className="stat-info">
                            <span className="stat-number">{stats.servicios.pendientes + stats.servicios.enProceso}</span>
                            <span className="stat-label">Pendientes</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {loading ? (
                      <div style={{ textAlign: 'center', padding: '100px' }}>Cargando servicios...</div>
                    ) : (
                      <div className="grid">
                        {filteredServicios.map((s) => (
                          <div key={s.id} className="glass-card service-card" onClick={() => fetchDetalleServicio(s.id)}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                              <div className="glass-card" style={{ padding: '10px', borderRadius: '12px' }}><Server size={24} color="var(--primary)" /></div>
                              {getStatusBadge(s.estado)}
                            </div>
                            <h3>{s.nombre}</h3>
                            <p>{s.descripcion}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Creado: {new Date(s.fecha_creacion).toLocaleDateString()}</span>
                              <ChevronRight size={18} color="var(--primary)" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div key="servicio-detalle">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                      <button className="btn btn-primary" onClick={() => { setServicioSeleccionado(null); fetchServicios(); fetchStats(); }}>
                        <ArrowLeft size={18} /> Volver
                      </button>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="btn btn-edit" onClick={exportarPDF}>
                          <Download size={18} /> Exportar PDF
                        </button>
                        <button className="btn btn-edit" onClick={abrirEditModal}>
                          <Pencil size={18} /> Editar
                        </button>
                        <button className="btn btn-danger" onClick={handleEliminarServicio}>
                          <Trash2 size={18} /> Eliminar
                        </button>
                      </div>
                    </div>

                    <div className="glass-card" style={{ padding: '30px', marginBottom: '30px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>{servicioSeleccionado.nombre}</h2>
                          <p style={{ color: 'var(--text-muted)' }}>{servicioSeleccionado.descripcion}</p>
                        </div>
                        {getStatusBadge(servicioSeleccionado.estado)}
                      </div>
                    </div>

                    <div className="grid" style={{ gridTemplateColumns: '1fr' }}>
                      {servicioSeleccionado.pruebas.map((p) => (
                        <div key={p.id} className="glass-card" style={{ padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
                          <div style={{ flex: 1, minWidth: '250px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                              {p.categoria === 'Seguridad' && <Shield size={16} color="var(--danger)" />}
                              {p.categoria === 'Rendimiento' && <Zap size={16} color="var(--warning)" />}
                              {p.categoria === 'Conectividad' && <Server size={16} color="var(--primary)" />}
                              {p.categoria === 'Funcionalidad' && <ClipboardCheck size={16} color="var(--accent)" />}
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>{p.categoria}</span>
                            </div>
                            <h4 style={{ fontSize: '1.1rem' }}>{p.descripcion}</h4>
                            {p.observaciones && (
                              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px', fontStyle: 'italic' }}>
                                💬 {p.observaciones}
                              </p>
                            )}
                          </div>

                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button 
                              className={`btn ${p.resultado === 'Pasó' ? 'btn-primary' : 'glass-card'}`}
                              onClick={() => handleValidar(p.id, 'Pasó', p.observaciones || '')}
                              style={{ background: p.resultado === 'Pasó' ? 'var(--success)' : '' }}
                            >
                              <CheckCircle2 size={16} /> Pasó
                            </button>
                            <button 
                              className={`btn ${p.resultado === 'Falló' ? 'btn-primary' : 'glass-card'}`}
                              onClick={() => handleValidar(p.id, 'Falló', p.observaciones || '')}
                              style={{ background: p.resultado === 'Falló' ? 'var(--danger)' : '' }}
                            >
                              <AlertCircle size={16} /> Falló
                            </button>
                            <button 
                              className="btn glass-card"
                              onClick={() => { setObsModalCaso(p); setObsTexto(p.observaciones || ''); }}
                              title="Agregar observación"
                            >
                              <MessageSquare size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="riesgos-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {/* ============ VISTAS DE RIESGOS ============ */}
                {riesgoSeleccionado ? (
                  <motion.div key="riesgo-detalle" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                      <button className="btn btn-primary" onClick={() => setRiesgoSeleccionado(null)}>
                        <ArrowLeft size={18} /> Volver a la Lista
                      </button>
                      <button className="btn btn-edit" onClick={exportarRiesgoPDF}>
                        <Download size={18} /> Exportar Ficha Técnica
                      </button>
                    </div>

                    <div className="grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div className="glass-card" style={{ padding: '30px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                            <div>
                              <span className={`severity-badge severity-${riesgoSeleccionado.severidad.toLowerCase()}`} style={{ marginBottom: '10px', display: 'inline-block' }}>
                                Severidad: {riesgoSeleccionado.severidad}
                              </span>
                              <h2 style={{ fontSize: '2.2rem', fontWeight: 800 }}>{riesgoSeleccionado.nombre_proyecto}</h2>
                            </div>
                            {getStatusBadge(riesgoSeleccionado.estado)}
                          </div>
                          <p style={{ fontSize: '1.1rem', color: 'var(--text-main)', lineHeight: '1.6' }}>{riesgoSeleccionado.descripcion}</p>
                        </div>

                        <div className="glass-card" style={{ padding: '30px' }}>
                          <div className="section-title" style={{ marginBottom: '20px' }}>
                            <Database size={20} color="var(--primary)" />
                            <h3>Sistemas e Infraestructura Afectada</h3>
                          </div>
                          <div className="systems-grid">
                            {JSON.parse(riesgoSeleccionado.sistemas_afectados || '[]').map(sys => (
                              <div key={sys} className="system-checkbox active" style={{ cursor: 'default' }}>
                                <Database size={16} />
                                <span>{sys}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div className="glass-card" style={{ padding: '25px' }}>
                          <h4 style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '15px' }}>Detalles de la Solicitud</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Solicitante</label>
                              <span style={{ fontWeight: 600 }}>{riesgoSeleccionado.solicitante}</span>
                            </div>
                            <div>
                              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Departamento</label>
                              <span style={{ fontWeight: 600 }}>{riesgoSeleccionado.departamento}</span>
                            </div>
                            <div>
                              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Tipo de Riesgo</label>
                              <span style={{ fontWeight: 600 }}>{riesgoSeleccionado.tipo_riesgo}</span>
                            </div>
                            <div>
                              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Impacto Financiero Est.</label>
                              <span style={{ fontWeight: 700, color: 'var(--danger)', fontSize: '1.2rem' }}>
                                ${Number(riesgoSeleccionado.impacto_financiero).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="help-box" style={{ padding: '25px', flexDirection: 'column', alignItems: 'flex-start', gap: '15px' }}>
                          <div>
                            <h4 style={{ margin: 0 }}>Análisis de Cumplimiento</h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '5px' }}>Esta solicitud está siendo revisada bajo el marco normativo ISO 27001.</p>
                          </div>
                          <button className="btn btn-primary btn-full" style={{ fontSize: '0.9rem' }}>Contactar Auditor</button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : !showRiskForm ? (
                  <div>
                    <header className="header">
                      <div className="title-section">
                        <h1>Gestión de Riesgos</h1>
                        <p>Evaluación y mitigación de amenazas informáticas</p>
                      </div>
                      <button className="btn btn-primary" onClick={() => setShowRiskForm(true)}>
                        <Plus size={18} /> Nueva Solicitud
                      </button>
                    </header>

                    <div className="grid">
                      {riesgos.length === 0 ? (
                        <div className="glass-card" style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center' }}>
                          <AlertCircle size={48} color="var(--text-muted)" style={{ marginBottom: '20px' }} />
                          <h3>No hay solicitudes de riesgo</h3>
                          <p style={{ color: 'var(--text-muted)' }}>Crea una nueva solicitud para comenzar la evaluación.</p>
                        </div>
                      ) : (
                        riesgos.map(r => (
                          <div key={r.id} className="glass-card risk-card" onClick={() => setRiesgoSeleccionado(r)} style={{ cursor: 'pointer' }}>
                            <div className="risk-header">
                              <span className={`severity-badge severity-${r.severidad.toLowerCase()}`}>{r.severidad}</span>
                              {getStatusBadge(r.estado)}
                            </div>
                            <h3 style={{ fontSize: '1.1rem' }}>{r.nombre_proyecto}</h3>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', height: '3em', overflow: 'hidden' }}>{r.descripcion}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <Briefcase size={14} /> {r.departamento}
                              </span>
                              <span>{new Date(r.fecha_creacion).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ marginBottom: '30px' }}>
                      <button className="btn btn-primary" onClick={() => setShowRiskForm(false)}>
                        <ArrowLeft size={18} /> Volver
                      </button>
                    </div>

                    <div className="glass-card" style={{ padding: '40px' }}>
                      <div className="header" style={{ marginBottom: '40px' }}>
                        <div className="title-section">
                          <h2 style={{ fontSize: '2rem' }}>Nueva Solicitud de Evaluación de Riesgos</h2>
                          <p>Complete los detalles para iniciar el proceso de cumplimiento</p>
                        </div>
                      </div>

                      <form onSubmit={handleCrearRiesgo}>
                        {/* Información General */}
                        <div className="glass-card form-section">
                          <div className="section-title">
                            <Activity size={20} color="var(--primary)" />
                            <h3>Información General</h3>
                          </div>
                          <div className="form-grid">
                            <div className="form-group">
                              <label>Nombre del Proyecto</label>
                              <input 
                                type="text" 
                                placeholder="Ingrese el nombre formal del proyecto" 
                                value={riskForm.nombre_proyecto}
                                onChange={e => setRiskForm({...riskForm, nombre_proyecto: e.target.value})}
                                required 
                              />
                            </div>
                            <div className="form-group">
                              <label>Solicitante</label>
                              <input type="text" value={userEmail} disabled style={{ background: 'rgba(0,0,0,0.05)', color: 'var(--text-muted)' }} />
                            </div>
                            <div className="form-group">
                              <label>Departamento</label>
                              <select 
                                className="form-group" 
                                style={{ width: '100%', padding: '12px', background: '#ffffff', border: '1px solid var(--glass-border)', borderRadius: '10px', color: 'var(--text-main)' }}
                                value={riskForm.departamento}
                                onChange={e => setRiskForm({...riskForm, departamento: e.target.value})}
                              >
                                <option>Operaciones de Ciberseguridad</option>
                                <option>Arquitectura TI</option>
                                <option>Desarrollo</option>
                                <option>Infraestructura</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Detalles del Riesgo */}
                        <div className="glass-card form-section">
                          <div className="section-title">
                            <AlertCircle size={20} color="var(--warning)" />
                            <h3>Detalles del Riesgo</h3>
                          </div>
                          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                            <div className="form-group">
                              <label>Tipo de Riesgo</label>
                              <select 
                                style={{ width: '100%', padding: '12px', background: '#ffffff', border: '1px solid var(--glass-border)', borderRadius: '10px', color: 'var(--text-main)' }}
                                value={riskForm.tipo_riesgo}
                                onChange={e => setRiskForm({...riskForm, tipo_riesgo: e.target.value})}
                              >
                                <option>Infraestructura</option>
                                <option>Privacidad de Datos</option>
                                <option>Cumplimiento</option>
                                <option>Riesgo de Proveedores</option>
                              </select>
                            </div>
                            <div className="form-group">
                              <label>Evaluación de Severidad</label>
                              <div className="severity-selector">
                                {['Bajo', 'Medio', 'Alto', 'Crítico'].map(s => (
                                  <div 
                                    key={s}
                                    className={`severity-option ${s.toLowerCase()} ${riskForm.severidad === s ? 'active' : ''}`}
                                    onClick={() => setRiskForm({...riskForm, severidad: s})}
                                  >
                                    {s}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="form-group">
                            <label>Descripción</label>
                            <textarea 
                              placeholder="Proporcione una descripción detallada del riesgo identificado..." 
                              rows={4}
                              value={riskForm.descripcion}
                              onChange={e => setRiskForm({...riskForm, descripcion: e.target.value})}
                              required
                            />
                          </div>
                        </div>

                        {/* Evaluación de Impacto */}
                        <div className="glass-card form-section">
                          <div className="section-title">
                            <BarChart3 size={20} color="var(--accent)" />
                            <h3>Evaluación de Impacto</h3>
                          </div>
                          <div className="form-grid">
                            <div className="form-group">
                              <label>Sistemas Afectados</label>
                              <div className="systems-grid">
                                {[
                                  'Base de Datos Bancaria Principal',
                                  'API del Portal del Cliente',
                                  'Sistema Interno de Gestión',
                                  'Pasarela de Pagos'
                                ].map(sys => (
                                  <div 
                                    key={sys}
                                    className={`system-checkbox ${riskForm.sistemas_afectados.includes(sys) ? 'active' : ''}`}
                                    onClick={() => {
                                      const current = riskForm.sistemas_afectados;
                                      const next = current.includes(sys) ? current.filter(item => item !== sys) : [...current, sys];
                                      setRiskForm({...riskForm, sistemas_afectados: next});
                                    }}
                                  >
                                    <Database size={16} />
                                    <span>{sys}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="form-group">
                              <label>Impacto Financiero Potencial (USD)</label>
                              <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '16px', top: '12px', color: 'var(--text-muted)' }}>$</span>
                                <input 
                                  type="number" 
                                  placeholder="0.00" 
                                  style={{ paddingLeft: '30px' }}
                                  value={riskForm.impacto_financiero}
                                  onChange={e => setRiskForm({...riskForm, impacto_financiero: e.target.value})}
                                />
                              </div>
                              {riskForm.impacto_financiero > 50000 && (
                                <div className="form-hint" style={{ marginTop: '10px' }}>
                                  <Shield size={14} /> Las solicitudes con impacto superior a $50k se escalan automáticamente a la Junta de Cumplimiento.
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '40px' }}>
                          <button type="button" className="btn glass-card" onClick={() => setShowRiskForm(false)}>
                            Cancelar
                          </button>
                          <button type="submit" className="btn btn-primary" disabled={guardandoRiesgo}>
                            <Zap size={18} /> {guardandoRiesgo ? 'Enviando...' : 'Enviar Solicitud'}
                          </button>
                        </div>
                      </form>

                      <div className="help-box">
                        <div>
                          <h3>¿Necesitas ayuda para definir un riesgo?</h3>
                          <p style={{ color: 'var(--text-muted)', marginTop: '10px' }}>Nuestro equipo de cumplimiento está disponible para consultas 1 a 1.</p>
                        </div>
                        <button className="btn glass-card">Hablar con un Analista</button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* ============ MODALES (CREAR/EDITAR SERVICIO) ============ */}
      <AnimatePresence>
        {showModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)}>
            <motion.div className="modal-content glass-card" initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Nuevo Servicio</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
              </div>
              <form onSubmit={handleCrearServicio}>
                <div className="form-group">
                  <label>Nombre del Servicio</label>
                  <input type="text" placeholder="Ej: Servidor de Correo v3.0" value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} required autoFocus />
                </div>
                <div className="form-group">
                  <label>Descripción</label>
                  <textarea placeholder="Describe el servicio..." value={nuevaDescripcion} onChange={(e) => setNuevaDescripcion(e.target.value)} rows={3} />
                </div>
                <button type="submit" className="btn btn-primary btn-full" disabled={creando}>
                  <Plus size={18} /> {creando ? 'Creando...' : 'Crear Servicio'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEditModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowEditModal(false)}>
            <motion.div className="modal-content glass-card" initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Editar Servicio</h2>
                <button className="modal-close" onClick={() => setShowEditModal(false)}><X size={20} /></button>
              </div>
              <form onSubmit={handleEditarServicio}>
                <div className="form-group">
                  <label>Nombre del Servicio</label>
                  <input type="text" value={editNombre} onChange={(e) => setEditNombre(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Descripción</label>
                  <textarea value={editDescripcion} onChange={(e) => setEditDescripcion(e.target.value)} rows={3} />
                </div>
                <button type="submit" className="btn btn-primary btn-full" disabled={editando}>
                  <Pencil size={18} /> {editando ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {obsModalCaso && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setObsModalCaso(null)}>
            <motion.div className="modal-content glass-card" initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Observaciones</h2>
                <button className="modal-close" onClick={() => setObsModalCaso(null)}><X size={20} /></button>
              </div>
              <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>{obsModalCaso.descripcion}</p>
              <textarea placeholder="Notas..." value={obsTexto} onChange={(e) => setObsTexto(e.target.value)} rows={4} style={{ width: '100%', padding: '10px', borderRadius: '10px', background: '#ffffff', color: 'var(--text-main)', border: '1px solid var(--glass-border)' }} />
              <button className="btn btn-primary btn-full" style={{ marginTop: '20px' }} onClick={handleGuardarObs}>
                Guardar Observación
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );

}

export default App;
