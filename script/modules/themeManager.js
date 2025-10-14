// =============================
// MÓDULO: themeManager.js
// =============================
// Controla el modo claro (celestial) y oscuro (diabólico)
// Guarda la preferencia del usuario en localStorage

export function initTheme() {
  const body = document.body;
  const themeToggle = document.getElementById("themeToggle");

  // Cargar el tema guardado
  const savedTheme = localStorage.getItem("theme") || "light";
  applyTheme(savedTheme);

  themeToggle.addEventListener("click", () => {
    const currentTheme = body.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(currentTheme);
    localStorage.setItem("theme", currentTheme);
  });
}

function applyTheme(theme) {
  const body = document.body;
  const themeToggle = document.getElementById("themeToggle");

  if (theme === "dark") {
    body.setAttribute("data-theme", "dark");
    themeToggle.textContent = "😈 Modo Diabólico";
  } else {
    body.setAttribute("data-theme", "light");
    themeToggle.textContent = "😇 Modo Celestial";
  }
}
