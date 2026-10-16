import React from 'react';

const AvisoPrivacidad = ({ onClose, onAccept }) => {
    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <h2 style={styles.title}>Aviso de Privacidad y Consentimiento</h2>
                <div style={styles.content}>
                    <p><strong>Mi Tiendita Pro</strong> respeta la privacidad y protección de sus datos personales conforme a la ley aplicable.</p>
                    <p>Los datos recopilados (Nombre y Correo Electrónico) serán utilizados exclusivamente para:</p>
                    <ul>
                        <li>Gestión de acceso e inicio de sesión en la aplicación móvil.</li>
                        <li>Control interno de usuarios del sistema de inventario.</li>
                        <li>Notificaciones del sistema relativas al stock o seguridad.</li>
                    </ul>
                    <p>Al hacer clic en "Aceptar", otorga su consentimiento para el tratamiento de sus datos personales conforme a los términos presentados.</p>
                </div>
                <div style={styles.actions}>
                    <button onClick={onClose} style={styles.btnSecondary}>Cancelar</button>
                    <button onClick={onAccept} style={styles.btnPrimary}>Aceptar y Continuar</button>
                </div>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '20px'
    },
    modal: {
        backgroundColor: '#23272f', color: '#fff',
        padding: '24px', borderRadius: '16px',
        maxWidth: '400px', width: '100%',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
    },
    title: { textAlign: 'center', fontSize: '18px', marginBottom: '16px', fontWeight: 'bold' },
    content: { fontSize: '13px', lineHeight: '1.5', color: '#ccc', maxHeight: '250px', overflowY: 'auto' },
    actions: { display: 'flex', justifyContent: 'space-between', marginTop: '20px', gap: '10px' },
    btnPrimary: { flex: 1, backgroundColor: '#00d285', border: 'none', padding: '10px', borderRadius: '8px', color: '#000', fontWeight: 'bold', cursor: 'pointer' },
    btnSecondary: { flex: 1, backgroundColor: '#3f444e', border: 'none', padding: '10px', borderRadius: '8px', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }
};

export default AvisoPrivacidad;