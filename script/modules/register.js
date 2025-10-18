/**
 * =======================================
 *  REGISTER MODULE - Proyecto Final L. Álvarez
 * =======================================
 * 
 * Funcionalidad:
 *  - Crea nuevos usuarios a partir del formulario de registro
 *  - Valida campos, contraseñas y duplicados
 *  - Guarda los datos en localStorage o login.json (si existe backend)
 *  - Redirige al login tras el registro exitoso
 * 
 * Dependencias:
 *   AppStorage (script/core/storage.js)
 */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  const msg = document.getElementById("registerMsg");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";
    msg.style.color = "#ff4d4d";

    const name = form.name.value.trim();
    const username = form.username.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value.trim();
    const confirm = form.confirm.value.trim();

    // === Validaciones ===
    if (!name || !username || !email || !password || !confirm) {
      msg.textContent = "Todos los campos son obligatorios.";
      return;
    }

    if (password.length < 6) {
      msg.textContent = "La contraseña debe tener al menos 6 caracteres.";
      return;
    }

    if (password !== confirm) {
      msg.textContent = "Las contraseñas no coinciden.";
      return;
    }

    // === Leer usuarios existentes ===
    let users = [];

    try {
      // Primero intentamos cargar desde login.json (si existe)
      const res = await fetch("../data/login.json");
      if (res.ok) {
        users = await res.json();
      } else {
        // Si no se puede leer, usar localStorage como fallback
        users = AppStorage.getUsers() || [];
      }
    } catch {
      users = AppStorage.getUsers() || [];
    }

    // === Validar duplicados ===
    const exists = users.some(
      (u) => u.username === username || u.email === email
    );
    if (exists) {
      msg.textContent = "El usuario o correo ya están registrados.";
      return;
    }

    // === Crear nuevo usuario ===
    const newUser = {
      id: Date.now(),
      name,
      username,
      email,
      password,
      role: "user",
    };

    users.push(newUser);

    // Guardar en localStorage
    AppStorage.setUsers(users);

    msg.style.color = "green";
    msg.textContent = "Usuario registrado correctamente. Redirigiendo...";

    setTimeout(() => {
      window.location.href = "../index.html";
    }, 1500);
  });
});
