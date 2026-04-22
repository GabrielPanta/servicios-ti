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
  Pencil
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

  useEffect(() => {
    fetchServicios();
  }, []);

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
      // Refrescar detalle y lista
      fetchDetalleServicio(servicioSeleccionado.id);
      fetchServicios();
    } catch (error) {
      console.error('Error saving validation:', error);
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
    } catch (error) {
      console.error('Error creating service:', error);
    } finally {
      setCreando(false);
    }
  };

  const handleEliminarServicio = async () => {
    if (!window.confirm(`¿Estás seguro de eliminar "${servicioSeleccionado.nombre}"? Se borrarán todas sus pruebas y validaciones.`)) return;
    try {
      await axios.delete(`${API_BASE}/servicios/${servicioSeleccionado.id}`);
      setServicioSeleccionado(null);
      fetchServicios();
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
    } catch (error) {
      console.error('Error editing service:', error);
    } finally {
      setEditando(false);
    }
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
      {/* ============ MODAL CREAR SERVICIO ============ */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className="modal-content glass-card"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>Nuevo Servicio</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleCrearServicio}>
                <div className="form-group">
                  <label>Nombre del Servicio</label>
                  <input
                    type="text"
                    placeholder="Ej: Servidor de Correo v3.0"
                    value={nuevoNombre}
                    onChange={(e) => setNuevoNombre(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label>Descripción</label>
                  <textarea
                    placeholder="Describe brevemente el servicio a validar..."
                    value={nuevaDescripcion}
                    onChange={(e) => setNuevaDescripcion(e.target.value)}
                    rows={3}
                  />
                </div>
                <p className="form-hint">
                  Se crearán automáticamente 4 casos de prueba: Conectividad, Seguridad, Rendimiento y Funcionalidad.
                </p>
                <button type="submit" className="btn btn-primary btn-full" disabled={creando}>
                  <Plus size={18} /> {creando ? 'Creando...' : 'Crear Servicio'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============ VISTAS PRINCIPALES ============ */}
      <AnimatePresence mode="wait">
        {!servicioSeleccionado ? (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <header className="header">
              <div className="title-section">
                <h1>Validación de Servicios</h1>
                <p>Gestión de calidad y despliegue de infraestructura TI</p>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div className="search-box glass-card" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center' }}>
                  <Search size={18} style={{ marginRight: '10px', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    placeholder="Buscar servicio..." 
                    style={{ background: 'none', border: 'none', color: 'white', outline: 'none', width: '160px' }}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                  <Plus size={18} /> Nuevo Servicio
                </button>
              </div>
            </header>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '100px' }}>Cargando servicios...</div>
            ) : (
              <div className="grid">
                {filteredServicios.map((s) => (
                  <div 
                    key={s.id} 
                    className="glass-card service-card"
                    onClick={() => fetchDetalleServicio(s.id)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                      <div className="glass-card" style={{ padding: '10px', borderRadius: '12px' }}>
                        <Server size={24} color="var(--primary)" />
                      </div>
                      {getStatusBadge(s.estado)}
                    </div>
                    <h3>{s.nombre}</h3>
                    <p>{s.descripcion}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Creado: {new Date(s.fecha_creacion).toLocaleDateString()}
                      </span>
                      <ChevronRight size={18} color="var(--primary)" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
              <button className="btn btn-primary" onClick={() => { setServicioSeleccionado(null); fetchServicios(); }}>
                <ArrowLeft size={18} /> Volver al Dashboard
              </button>
              <div style={{ display: 'flex', gap: '10px' }}>
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
                  <div style={{ flex: 1, minWidth: '300px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      {p.categoria === 'Seguridad' && <Shield size={16} color="var(--danger)" />}
                      {p.categoria === 'Rendimiento' && <Zap size={16} color="var(--warning)" />}
                      {p.categoria === 'Conectividad' && <Server size={16} color="var(--primary)" />}
                      {p.categoria === 'Funcionalidad' && <ClipboardCheck size={16} color="var(--accent)" />}
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>{p.categoria}</span>
                    </div>
                    <h4 style={{ fontSize: '1.1rem' }}>{p.descripcion}</h4>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      className={`btn ${p.resultado === 'Pasó' ? 'btn-primary' : 'glass-card'}`}
                      onClick={() => handleValidar(p.id, 'Pasó', '')}
                      style={{ background: p.resultado === 'Pasó' ? 'var(--success)' : '' }}
                    >
                      <CheckCircle2 size={16} /> Pasó
                    </button>
                    <button 
                      className={`btn ${p.resultado === 'Falló' ? 'btn-primary' : 'glass-card'}`}
                      onClick={() => handleValidar(p.id, 'Falló', '')}
                      style={{ background: p.resultado === 'Falló' ? 'var(--danger)' : '' }}
                    >
                      <AlertCircle size={16} /> Falló
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

      {/* ============ MODAL EDITAR SERVICIO ============ */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              className="modal-content glass-card"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>Editar Servicio</h2>
                <button className="modal-close" onClick={() => setShowEditModal(false)}>
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleEditarServicio}>
                <div className="form-group">
                  <label>Nombre del Servicio</label>
                  <input
                    type="text"
                    value={editNombre}
                    onChange={(e) => setEditNombre(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label>Descripción</label>
                  <textarea
                    value={editDescripcion}
                    onChange={(e) => setEditDescripcion(e.target.value)}
                    rows={3}
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-full" disabled={editando}>
                  <Pencil size={18} /> {editando ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
