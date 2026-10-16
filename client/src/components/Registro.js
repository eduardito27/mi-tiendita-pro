import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AvisoPrivacidad from './AvisoPrivacidad';

const Registro = () => {
    const [nombre, setNombre] = useState('');
    const [correo, setCorreo] = useState('');
    const [password, setPassword] = useState('');
    const [aceptoAviso, setAceptoAviso] = useState(false);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const navigate = useNavigate();

    const handleRegistro = async (e) => {
        e.preventDefault();
        if (!aceptoAviso) {
            setMensaje('Debe aceptar el Aviso de Privacidad');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/registro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, correo, password, aceptoAviso })
            });

            const data = await response.json();
            if (response.ok) {
                alert('Registro exitoso. Ya puedes iniciar sesión.');
                navigate('/');
            } else {
                setMensaje(data.mensaje);
            }
        } catch (error) {
            setMensaje('Error de conexión con el servidor');
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>REGISTRARSE</h1>
                {mensaje && <p style={styles.error}>{mensaje}</p>}
                <form onSubmit={handleRegistro} style={styles.form}>
                    <input
                        type="text"
                        placeholder="Nombre completo"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        style={styles.input}
                        required
                    />
                    <input
                        type="email"
                        placeholder="Correo electrónico"
                        value={correo}
                        onChange={(e) => setCorreo(e.target.value)}
                        style={styles.input}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={styles.input}
                        required
                    />

                    <div style={styles.checkboxContainer}>
                        <input
                            type="checkbox"
                            checked={aceptoAviso}
                            onChange={(e) => setAceptoAviso(e.target.checked)}
                            id="avisoCheck"
                        />
                        <label htmlFor="avisoCheck" style={styles.checkboxLabel}>
                            Acepto el <span style={styles.linkSpan} onClick={() => setMostrarModal(true)}>Aviso de Privacidad</span>
                        </label>
                    </div>

                    <button type="submit" style={styles.btn}>CREAR CUENTA</button>
                </form>
                <p style={styles.link} onClick={() => navigate('/')}>¿YA TIENES CUENTA? INICIA SESIÓN</p>
            </div>

            {mostrarModal && (
                <AvisoPrivacidad
                    onClose={() => setMostrarModal(false)}
                    onAccept={() => {
                        setAceptoAviso(true);
                        setMostrarModal(false);
                    }}
                />
            )}
        </div>
    );
};

const styles = {
    container: {
        backgroundColor: '#bcbec0', display: 'flex', justifyContent: 'center',
        alignItems: 'center', height: '100vh', padding: '16px'
    },
    card: {
        backgroundColor: '#23272f', width: '100%', maxWidth: '320px',
        borderRadius: '24px', padding: '32px 24px', textAlign: 'center',
        boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
    },
    title: { color: '#ffffff', fontStyle: 'italic', fontSize: '20px', fontWeight: 'bold', marginBottom: '24px' },
    form: { display: 'flex', flexDirection: 'column', gap: '14px' },
    input: {
        backgroundColor: '#e9ecef', border: 'none', padding: '12px 16px',
        borderRadius: '10px', fontSize: '14px', color: '#333'
    },
    btn: {
        backgroundColor: '#00d285', border: 'none', padding: '12px',
        borderRadius: '10px', color: '#000', fontWeight: 'bold',
        cursor: 'pointer', marginTop: '10px', fontSize: '14px'
    },
    checkboxContainer: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#ccc', textAlign: 'left' },
    checkboxLabel: { cursor: 'pointer' },
    linkSpan: { color: '#00d285', textDecoration: 'underline', cursor: 'pointer' },
    link: { color: '#a0a5ac', fontSize: '11px', marginTop: '18px', cursor: 'pointer', fontWeight: 'bold' },
    error: { color: '#ff6b6b', fontSize: '12px', marginBottom: '10px' }
};

export default Registro;