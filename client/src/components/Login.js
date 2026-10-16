import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [correo, setCorreo] = useState('');
    const [password, setPassword] = useState('');
    const [mensaje, setMensaje] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo, password })
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('usuario', JSON.stringify(data.usuario));
                navigate('/dashboard');
            } else {
                setMensaje(data.mensaje);
            }
        } catch (error) {
            setMensaje('Error al conectar con el servidor');
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>MI TIENDITA PRO</h1>
                {mensaje && <p style={styles.error}>{mensaje}</p>}
                <form onSubmit={handleLogin} style={styles.form}>
                    <input
                        type="text"
                        placeholder="eduardo / correo"
                        value={correo}
                        onChange={(e) => setCorreo(e.target.value)}
                        style={styles.input}
                        required
                    />
                    <input
                        type="password"
                        placeholder="•••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={styles.input}
                        required
                    />
                    <button type="submit" style={styles.btn}>LOGIN</button>
                </form>
                <p style={styles.link} onClick={() => navigate('/registro')}>CREAR CUENTA</p>
            </div>
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
    link: { color: '#a0a5ac', fontSize: '11px', marginTop: '18px', cursor: 'pointer', fontWeight: 'bold' },
    error: { color: '#ff6b6b', fontSize: '12px', marginBottom: '10px' }
};

export default Login;