// /src/admin/components/AccesoPuerta/AccesoPuerta.jsx
// Usuarios de la puerta: entran al panel con nombre y contraseña y solo ven la pantalla de puerta
// (buscar, marcar ingreso y cobrar). No ven lo recaudado ni el resto del panel.
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/adminApi.js';
import styles from './AccesoPuerta.module.css';

const AccesoPuerta = () => {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState(null);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open || users) return;
    adminApi.listPuerta().then((d) => setUsers(d.users)).catch((e) => setMsg(e.message));
  }, [open, users]);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg('');
    try {
      const { creado } = await adminApi.savePuerta(name, password);
      setMsg(creado ? `Listo: ${name.trim()} ya puede entrar en icobatista.com/admin con su nombre y esa contraseña.` : `Contraseña actualizada para ${name.trim()}.`);
      setName('');
      setPassword('');
      setUsers((await adminApi.listPuerta()).users);
    } catch (err) {
      setMsg(err.message);
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (u) => {
    if (u.active && !window.confirm(`¿Quitarle el acceso a ${u.name}? Se le cierra la sesión al instante.`)) return;
    try {
      await adminApi.setPuertaActive(u.id, !u.active);
      setUsers((await adminApi.listPuerta()).users);
    } catch (err) {
      setMsg(err.message);
    }
  };

  return (
    <section className={styles.wrap}>
      <button type="button" className={styles.toggle} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        {open ? '− ' : '+ '}Personal de puerta
      </button>
      {open && (
        <div className={styles.body}>
          <p className={styles.help}>
            Entran en <strong>icobatista.com/admin</strong> con su nombre como usuario. Solo pueden buscar entradas, marcar ingresos
            y cobrar en la puerta (efectivo o transferencia, al precio de puerta). No ven lo recaudado.{' '}
            <Link to="/admin/puerta">Ver su pantalla</Link>
          </p>
          {users?.length > 0 && (
            <ul className={styles.list}>
              {users.map((u) => (
                <li key={u.id}>
                  <span>
                    <strong>{u.name}</strong> · {u.active ? 'con acceso' : 'sin acceso'}
                  </span>
                  <button type="button" onClick={() => toggle(u)} className={u.active ? styles.off : styles.on}>
                    {u.active ? 'Quitar acceso' : 'Devolver acceso'}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <form onSubmit={save} className={styles.form}>
            <input placeholder="Nombre y apellido (será su usuario)" value={name} onChange={(e) => setName(e.target.value)} required minLength={3} autoComplete="off" />
            <input
              type="password"
              placeholder="Contraseña (mínimo 8)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
            <button disabled={busy}>{busy ? 'Guardando…' : 'Crear usuario / cambiar contraseña'}</button>
          </form>
          {msg && <p role="status" className={styles.help}>{msg}</p>}
        </div>
      )}
    </section>
  );
};

export default AccesoPuerta;
