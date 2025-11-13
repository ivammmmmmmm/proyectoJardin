    // Limpieza rápida al cargar la página: eliminar modal backdrops residuales
    document.addEventListener('DOMContentLoaded', function() {
      // Eliminar cualquier backdrop que haya quedado por errores en otras páginas
      document.querySelectorAll('.modal-backdrop, .offcanvas-backdrop').forEach(el => el.remove());
      // Quitar clase que bloquea el scroll y la interacción
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';

      // Asegurar que los inputs del formulario estén habilitados
      document.querySelectorAll('form input, form select, form textarea, form button').forEach(el => {
        if (el.hasAttribute('disabled')) el.removeAttribute('disabled');
      });

      // Poner foco en el primer campo para mejorar la experiencia
      const first = document.querySelector('form input, form select, form textarea');
      if (first) first.focus();
    });
