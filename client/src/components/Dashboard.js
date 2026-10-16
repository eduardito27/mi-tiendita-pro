import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();
    const [busqueda, setBusqueda] = useState('');
    const [mostrarModal, setMostrarModal] = useState(false);
    
    // Modales de detalle
    const [mostrarModalStock, setMostrarModalStock] = useState(false);
    const [mostrarModalBajoStock, setMostrarModalBajoStock] = useState(false);

    // Permisos del celular
    const [mostrarPermisos, setMostrarPermisos] = useState(false);

    // Lista de productos desde la base de datos
    const [productos, setProductos] = useState([]);

    // Campos para registrar nuevo producto
    const [nuevoNombre, setNuevoNombre] = useState('');
    const [nuevoPrecio, setNuevoPrecio] = useState('');
    const [nuevoStock, setNuevoStock] = useState('');
    const [nuevaImagen, setNuevaImagen] = useState('');

    // Cargar productos de la Base de Datos al abrir el Dashboard
    useEffect(() => {
        const permisosOtorgados = localStorage.getItem('permisos_movil');
        if (!permisosOtorgados) {
            setMostrarPermisos(true);
        }
        obtenerProductos();
    }, []);

    const obtenerProductos = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/productos');
            const data = await response.json();
            setProductos(data);
        } catch (error) {
            console.error('Error al conectar con la base de datos:', error);
        }
    };

    const handleAceptarPermisos = () => {
        localStorage.setItem('permisos_movil', 'true');
        setMostrarPermisos(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('usuario');
        localStorage.removeItem('permisos_movil');
        navigate('/');
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNuevaImagen(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Guardar producto en la Base de Datos (MySQL)
    const handleAgregarProducto = async (e) => {
        e.preventDefault();
        if (!nuevoNombre || !nuevoPrecio) return;

        const nuevo = {
            nombre: nuevoNombre.toUpperCase(),
            precio: parseFloat(nuevoPrecio) || 0,
            stock: parseInt(nuevoStock, 10) || 1,
            imagen: nuevaImagen || 'https://via.placeholder.com/150'
        };

        try {
            const response = await fetch('http://localhost:5000/api/productos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevo)
            });

            if (response.ok) {
                obtenerProductos(); // Recargar la lista desde la base de datos
                setNuevoNombre('');
                setNuevoPrecio('');
                setNuevoStock('');
                setNuevaImagen('');
                setMostrarModal(false);
            }
        } catch (error) {
            console.error('Error al guardar el producto:', error);
        }
    };

    // Eliminar producto de la Base de Datos (MySQL)
    const handleEliminarProducto = async (id) => {
        if (window.confirm('¿Seguro que deseas eliminar este producto de la base de datos?')) {
            try {
                const response = await fetch(`http://localhost:5000/api/productos/${id}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    obtenerProductos(); // Actualizar la lista
                }
            } catch (error) {
                console.error('Error al eliminar el producto:', error);
            }
        }
    };

    // Cálculos de métricas
    const totalStock = productos.reduce((acc, p) => acc + p.stock, 0);
    const dineroTotal = productos.reduce((acc, p) => acc + (p.precio * p.stock), 0);
    const productosBajoStock = productos.filter((p) => p.stock <= 5);

    const productosFiltrados = productos.filter((prod) =>
        prod.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div style={styles.container}>
            {/* Aviso de Permisos */}
            {mostrarPermisos && (
                <div style={styles.overlay}>
                    <div style={styles.modalPermisos}>
                        <div style={styles.iconoPermiso}>📱</div>
                        <h3 style={styles.modalTitle}>¿Permitir que Mi Tiendita Pro...</h3>
                        <p style={styles.textoPermiso}>
                            Acceda a fotos y archivos en este dispositivo para subir las imágenes de tu inventario?
                        </p>
                        <div style={styles.modalActions}>
                            <button onClick={() => setMostrarPermisos(false)} style={styles.btnSecondary}>
                                No permitir
                            </button>
                            <button onClick={handleAceptarPermisos} style={styles.btnPrimary}>
                                Permitir
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <header style={styles.header}>
                <div style={styles.brand}>
                    <div style={styles.iconBox}>🏪</div>
                    <span style={styles.brandText}>MI TIENDITA</span>
                </div>
                <button onClick={handleLogout} style={styles.btnSalir}>SALIR</button>
            </header>

            {/* MÉTRICAS DE ARRIBA */}
            <div style={styles.metricsGrid}>
                <div style={styles.metricCard}>
                    <span style={styles.metricLabel}>VALOR TOTAL</span>
                    <span style={{ ...styles.metricValue, color: '#10b981' }}>
                        ${dineroTotal.toFixed(2)}
                    </span>
                </div>
                
                <div 
                    style={{ ...styles.metricCard, cursor: 'pointer' }} 
                    onClick={() => setMostrarModalStock(true)}
                >
                    <span style={styles.metricLabel}>TOTAL STOCK</span>
                    <span style={styles.metricValue}>{totalStock} pzas</span>
                </div>

                <div 
                    style={{ ...styles.metricCard, cursor: 'pointer' }} 
                    onClick={() => setMostrarModalBajoStock(true)}
                >
                    <span style={styles.metricLabel}>BAJO STOCK</span>
                    <span style={{ ...styles.metricValue, color: productosBajoStock.length > 0 ? '#ef4444' : '#64748b' }}>
                        {productosBajoStock.length} prod.
                    </span>
                </div>
            </div>

            {/* Barra de Búsqueda */}
            <div style={styles.searchContainer}>
                <input
                    type="text"
                    placeholder="Buscar productos..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    style={styles.searchInput}
                />
                <button style={styles.searchBtn}>🔍</button>
            </div>

            {/* Título de Sección y Botón Agregar */}
            <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>INVENTARIO</h2>
                <button onClick={() => setMostrarModal(true)} style={styles.btnAgregar}>+ AGREGAR</button>
            </div>

            {/* Grid de Productos */}
            <div style={styles.grid}>
                {productosFiltrados.length > 0 ? (
                    productosFiltrados.map((prod) => (
                        <div key={prod.id} style={styles.cardProduct}>
                            <button
                                onClick={() => handleEliminarProducto(prod.id)}
                                style={styles.btnTrash}
                                title="Eliminar producto"
                            >
                                🗑️
                            </button>
                            <div style={styles.imgContainer}>
                                <img src={prod.imagen} alt={prod.nombre} style={styles.imgProduct} />
                            </div>
                            <h3 style={styles.prodName}>{prod.nombre}</h3>
                            <p style={styles.prodPrice}>${Number(prod.precio).toFixed(2)}</p>
                            <div style={styles.stockBadge}>
                                Stock: {prod.stock} {prod.stock <= 5 && <span style={styles.lowStockTag}>⚠️ Bajo</span>}
                            </div>
                        </div>
                    ))
                ) : (
                    <p style={styles.noResults}>No se encontraron productos en la base de datos</p>
                )}
            </div>

            {/* PANTALLA DETALLE: TOTAL STOCK */}
            {mostrarModalStock && (
                <div style={styles.overlay}>
                    <div style={styles.modalDetail}>
                        <h3 style={styles.modalTitle}>Total Stock Completo</h3>
                        <p style={styles.subtextModal}>Unidades registradas: <strong>{totalStock} pzas</strong></p>
                        <div style={styles.listContainer}>
                            {productos.map((item) => (
                                <div key={item.id} style={styles.itemRow}>
                                    <div>
                                        <div style={styles.itemTitle}>{item.nombre}</div>
                                        <div style={styles.itemSub}>Precio: ${Number(item.precio).toFixed(2)}</div>
                                    </div>
                                    <div style={styles.itemStockBadge}>{item.stock} pzas</div>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setMostrarModalStock(false)} style={styles.btnPrimary}>
                            Cerrar
                        </button>
                    </div>
                </div>
            )}

            {/* PANTALLA DETALLE: BAJO STOCK */}
            {mostrarModalBajoStock && (
                <div style={styles.overlay}>
                    <div style={styles.modalDetail}>
                        <h3 style={{ ...styles.modalTitle, color: '#ef4444' }}>Productos con Bajo Stock</h3>
                        <p style={styles.subtextModal}>Productos con 5 piezas o menos:</p>
                        <div style={styles.listContainer}>
                            {productosBajoStock.length > 0 ? (
                                productosBajoStock.map((item) => (
                                    <div key={item.id} style={{ ...styles.itemRow, borderLeft: '4px solid #ef4444' }}>
                                        <div>
                                            <div style={styles.itemTitle}>{item.nombre}</div>
                                            <div style={styles.itemSub}>Precio: ${Number(item.precio).toFixed(2)}</div>
                                        </div>
                                        <div style={{ ...styles.itemStockBadge, backgroundColor: '#fef2f2', color: '#ef4444' }}>
                                            Quedan {item.stock} pzas
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p style={{ textAlign: 'center', color: '#10b981', padding: '12px' }}>
                                    No hay productos con bajo stock.
                                </p>
                            )}
                        </div>
                        <button onClick={() => setMostrarModalBajoStock(false)} style={styles.btnPrimary}>
                            Cerrar
                        </button>
                    </div>
                </div>
            )}

            {/* FORMULARIO AGREGAR PRODUCTO */}
            {mostrarModal && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <h3 style={styles.modalTitle}>Agregar Nuevo Producto</h3>
                        <form onSubmit={handleAgregarProducto} style={styles.form}>
                            <input
                                type="text"
                                placeholder="Nombre del producto"
                                value={nuevoNombre}
                                onChange={(e) => setNuevoNombre(e.target.value)}
                                style={styles.inputModal}
                                required
                            />
                            <input
                                type="number"
                                step="0.01"
                                placeholder="Precio (ej. 18.50)"
                                value={nuevoPrecio}
                                onChange={(e) => setNuevoPrecio(e.target.value)}
                                style={styles.inputModal}
                                required
                            />
                            <input
                                type="number"
                                placeholder="Stock inicial (ej. 10)"
                                value={nuevoStock}
                                onChange={(e) => setNuevoStock(e.target.value)}
                                style={styles.inputModal}
                                required
                            />
                            
                            <div style={styles.fileContainer}>
                                <label style={styles.fileLabel}>🖼️ Foto del producto (Galería):</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    style={styles.inputFile}
                                />
                            </div>

                            {nuevaImagen && (
                                <div style={styles.previewContainer}>
                                    <img src={nuevaImagen} alt="Vista previa" style={styles.previewImg} />
                                </div>
                            )}

                            <div style={styles.modalActions}>
                                <button
                                    type="button"
                                    onClick={() => setMostrarModal(false)}
                                    style={styles.btnSecondary}
                                >
                                    Cancelar
                                </button>
                                <button type="submit" style={styles.btnPrimary}>
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        backgroundColor: '#f0f2f5',
        minHeight: '100vh',
        padding: '16px',
        maxWidth: '480px',
        margin: '0 auto',
        fontFamily: 'sans-serif'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#1e293b',
        padding: '12px 16px',
        borderRadius: '12px',
        marginBottom: '16px'
    },
    brand: { display: 'flex', alignItems: 'center', gap: '8px' },
    iconBox: { fontSize: '20px' },
    brandText: { color: '#fff', fontWeight: 'bold', fontSize: '18px', fontStyle: 'italic' },
    btnSalir: {
        backgroundColor: '#ef4444',
        color: '#fff',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '8px',
        fontWeight: 'bold',
        cursor: 'pointer'
    },
    metricsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '8px',
        marginBottom: '16px'
    },
    metricCard: {
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '10px 6px',
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
    },
    metricLabel: { fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', display: 'block' },
    metricValue: { fontSize: '13px', fontWeight: 'bold', color: '#0f172a', marginTop: '4px', display: 'block' },
    searchContainer: { display: 'flex', gap: '8px', marginBottom: '16px' },
    searchInput: {
        flex: 1,
        padding: '10px 14px',
        borderRadius: '8px',
        border: '1px solid #cbd5e1',
        outline: 'none'
    },
    searchBtn: {
        backgroundColor: '#10b981',
        border: 'none',
        padding: '10px 14px',
        borderRadius: '8px',
        cursor: 'pointer'
    },
    sectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
    },
    sectionTitle: { fontSize: '18px', fontWeight: 'bold', fontStyle: 'italic', color: '#0f172a' },
    btnAgregar: {
        backgroundColor: '#1e293b',
        color: '#fff',
        border: 'none',
        padding: '8px 14px',
        borderRadius: '8px',
        fontWeight: 'bold',
        fontSize: '12px',
        cursor: 'pointer'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px'
    },
    cardProduct: {
        backgroundColor: '#fff',
        borderRadius: '16px',
        padding: '12px',
        textAlign: 'center',
        position: 'relative',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
    },
    btnTrash: {
        position: 'absolute',
        top: '8px',
        right: '8px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '16px'
    },
    imgContainer: {
        height: '90px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '8px'
    },
    imgProduct: { maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' },
    prodName: { fontSize: '12px', fontWeight: 'bold', color: '#334155', margin: '4px 0' },
    prodPrice: { fontSize: '15px', fontWeight: 'bold', color: '#10b981', margin: '2px 0' },
    stockBadge: { fontSize: '11px', color: '#64748b', marginTop: '4px' },
    lowStockTag: { color: '#ef4444', fontWeight: 'bold', fontSize: '10px' },
    noResults: { gridColumn: 'span 2', textAlign: 'center', color: '#64748b', marginTop: '20px', fontSize: '14px' },
    overlay: {
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '20px'
    },
    modal: {
        backgroundColor: '#fff',
        padding: '24px',
        borderRadius: '16px',
        maxWidth: '340px',
        width: '100%',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
    },
    modalDetail: {
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '16px',
        maxWidth: '340px',
        width: '100%',
        maxHeight: '75vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
    },
    modalPermisos: {
        backgroundColor: '#fff',
        padding: '24px',
        borderRadius: '20px',
        maxWidth: '300px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
    },
    iconoPermiso: { fontSize: '36px', marginBottom: '8px' },
    textoPermiso: { fontSize: '13px', color: '#334155', marginBottom: '20px', lineHeight: '1.4' },
    modalTitle: { fontSize: '16px', fontWeight: 'bold', color: '#0f172a', marginBottom: '4px', textAlign: 'center' },
    subtextModal: { fontSize: '12px', color: '#64748b', textAlign: 'center', marginBottom: '14px' },
    listContainer: { overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' },
    itemRow: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: '8px'
    },
    itemTitle: { fontSize: '12px', fontWeight: 'bold', color: '#1e293b' },
    itemSub: { fontSize: '11px', color: '#64748b' },
    itemStockBadge: { fontSize: '11px', fontWeight: 'bold', backgroundColor: '#e2e8f0', padding: '4px 8px', borderRadius: '6px' },
    form: { display: 'flex', flexDirection: 'column', gap: '10px' },
    inputModal: {
        padding: '10px 14px',
        borderRadius: '8px',
        border: '1px solid #cbd5e1',
        fontSize: '14px',
        outline: 'none'
    },
    fileContainer: { display: 'flex', flexDirection: 'column', gap: '4px' },
    fileLabel: { fontSize: '11px', fontWeight: 'bold', color: '#475569' },
    inputFile: { fontSize: '12px', color: '#475569' },
    previewContainer: { display: 'flex', justifyContent: 'center', margin: '4px 0' },
    previewImg: { height: '60px', objectFit: 'contain', borderRadius: '6px', border: '1px solid #cbd5e1' },
    modalActions: { display: 'flex', gap: '10px', marginTop: '10px' },
    btnPrimary: {
        flex: 1,
        backgroundColor: '#10b981',
        color: '#fff',
        border: 'none',
        padding: '10px',
        borderRadius: '8px',
        fontWeight: 'bold',
        cursor: 'pointer'
    },
    btnSecondary: {
        flex: 1,
        backgroundColor: '#64748b',
        color: '#fff',
        border: 'none',
        padding: '10px',
        borderRadius: '8px',
        fontWeight: 'bold',
        cursor: 'pointer'
    }
};

export default Dashboard;