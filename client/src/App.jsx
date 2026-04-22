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
  Download
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

  useEffect(() => {
    fetchServicios();
    fetchStats();
  }, []);

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

  return (
    <div className="dashboard-container">

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

      {/* ============ MODAL CREAR SERVICIO ============ */}
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
                  <textarea placeholder="Describe brevemente el servicio a validar..." value={nuevaDescripcion} onChange={(e) => setNuevaDescripcion(e.target.value)} rows={3} />
                </div>
                <p className="form-hint">Se crearán automáticamente 4 casos de prueba: Conectividad, Seguridad, Rendimiento y Funcionalidad.</p>
                <button type="submit" className="btn btn-primary btn-full" disabled={creando}>
                  <Plus size={18} /> {creando ? 'Creando...' : 'Crear Servicio'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============ MODAL EDITAR SERVICIO ============ */}
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
                  <input type="text" value={editNombre} onChange={(e) => setEditNombre(e.target.value)} required autoFocus />
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

      {/* ============ MODAL OBSERVACIONES ============ */}
      <AnimatePresence>
        {obsModalCaso && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setObsModalCaso(null)}>
            <motion.div className="modal-content glass-card" initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Observaciones</h2>
                <button className="modal-close" onClick={() => setObsModalCaso(null)}><X size={20} /></button>
              </div>
              <p style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '0.9rem' }}>{obsModalCaso.descripcion}</p>
              <div className="form-group">
                <label>Notas / Comentarios</label>
                <textarea placeholder="Ej: Falló por timeout en puerto 443..." value={obsTexto} onChange={(e) => setObsTexto(e.target.value)} rows={4} />
              </div>
              <button className="btn btn-primary btn-full" onClick={handleGuardarObs}>
                <MessageSquare size={18} /> Guardar Observación
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============ VISTAS PRINCIPALES ============ */}
      <AnimatePresence mode="wait">
        {!servicioSeleccionado ? (
          <motion.div key="dashboard" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <header className="header">
              <div className="title-section">
                <h1>Validación de Servicios</h1>
                <p>Gestión de calidad y despliegue de infraestructura TI</p>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div className="search-box glass-card" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center' }}>
                  <Search size={18} style={{ marginRight: '10px', color: 'var(--text-muted)' }} />
                  <input type="text" placeholder="Buscar servicio..." style={{ background: 'none', border: 'none', color: 'white', outline: 'none', width: '160px' }} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                  <Plus size={18} /> Nuevo Servicio
                </button>
              </div>
            </header>

            {/* ======= ESTADÍSTICAS ======= */}
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
          <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
              <button className="btn btn-primary" onClick={() => { setServicioSeleccionado(null); fetchServicios(); fetchStats(); }}>
                <ArrowLeft size={18} /> Volver al Dashboard
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

                  {p.fecha_validacion && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Clock size={12} /> {new Date(p.fecha_validacion).toLocaleString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
