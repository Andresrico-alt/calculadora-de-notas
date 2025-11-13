document.addEventListener('DOMContentLoaded', function() {

    // 1. Obtener referencias a los elementos HTML
    const body = document.body;
    const inputCorte1 = document.getElementById('corte1');
    const inputCorte2 = document.getElementById('corte2');
    const calcularBoton = document.getElementById('calcularBtn');
    const limpiarBoton = document.getElementById('limpiarBtn');
    const resultadoDiv = document.getElementById('resultado');
    const errorCorte1 = document.getElementById('error-corte1');
    const errorCorte2 = document.getElementById('error-corte2');
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const historyList = document.getElementById('historyList');
    
    let errorTimeout;

    // =================================================
    // MODO OSCURO / CLARO
    // =================================================
    const toggleTheme = () => {
        if (body.classList.contains('dark-mode')) {
            body.classList.replace('dark-mode', 'light-mode');
            themeToggleBtn.innerHTML = '🌙 Cambiar a Modo Oscuro';
        } else {
            body.classList.replace('light-mode', 'dark-mode');
            themeToggleBtn.innerHTML = '☀️ Cambiar a Modo Claro';
        }
    };
    themeToggleBtn.addEventListener('click', toggleTheme);
    // Establecer el tema inicial
    themeToggleBtn.innerHTML = body.classList.contains('dark-mode') ? '☀️ Cambiar a Modo Claro' : '🌙 Cambiar a Modo Oscuro';

    // =================================================
    // LÓGICA DE VALIDACIÓN Y CÁLCULO
    // =================================================

    const mostrarErrorTemporal = (elemento, mensaje) => {
        clearTimeout(errorTimeout);
        elemento.textContent = mensaje;
        
        const inputGroup = elemento.parentElement;
        inputGroup.classList.add('error-shake');

        errorTimeout = setTimeout(() => {
            elemento.textContent = '';
            inputGroup.classList.remove('error-shake');
        }, 2000);
    };

    const filtrarCaracteres = (event) => {
        const teclaPresionada = event.key;
        const valorActual = event.target.value;
        const elementoError = event.target.id === 'corte1' ? errorCorte1 : errorCorte2;

        elementoError.textContent = '';
        clearTimeout(errorTimeout);

        const teclasPermitidas = [
            'Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'
        ];

        if (teclasPermitidas.includes(teclaPresionada)) {
            return;
        }

        if (teclaPresionada === '.' && valorActual.includes('.')) {
            event.preventDefault();
            mostrarErrorTemporal(elementoError, 'Solo se permite un punto decimal.');
            return;
        }

        if (!/^[0-9.]$/.test(teclaPresionada)) {
            event.preventDefault();
            mostrarErrorTemporal(elementoError, 'Solo se permiten números y un punto.');
        }
    };

    inputCorte1.addEventListener('keydown', filtrarCaracteres);
    inputCorte2.addEventListener('keydown', filtrarCaracteres);

    calcularBoton.addEventListener('click', function() {
        errorCorte1.textContent = '';
        errorCorte2.textContent = '';

        if (inputCorte1.value === '') inputCorte1.value = '0.0';
        if (inputCorte2.value === '') inputCorte2.value = '0.0';

        const nota1 = parseFloat(inputCorte1.value);
        const nota2 = parseFloat(inputCorte2.value);
        
        if (isNaN(nota1) || isNaN(nota2)) {
            mostrarError("Por favor, ingresa solo números válidos.");
            return;
        }
        
        if (nota1 < 0 || nota1 > 5 || nota2 < 0 || nota2 > 5) {
            mostrarError("Las calificaciones deben estar entre 0.0 y 5.0.");
            return;
        }

        const notaNecesaria = (3.0 - (nota1 * 0.33) - (nota2 * 0.33)) / 0.34;
        mostrarResultado(nota1, nota2, notaNecesaria);
        
        // Activar animación de partículas y salto
        createParticles(calcularBoton);
        addJumpAnimation(calcularBoton);
    });

    limpiarBoton.addEventListener('click', function() {
        inputCorte1.value = '';
        inputCorte2.value = '';
        resultadoDiv.innerHTML = '';
        
        limpiarEstados();
        
        errorCorte1.textContent = '';
        errorCorte2.textContent = '';
        inputCorte1.focus();

        // Activar animación de partículas y salto
        createParticles(limpiarBoton);
        addJumpAnimation(limpiarBoton);
    });

    // Función helper para limpiar clases de estado
    function limpiarEstados() {
        resultadoDiv.classList.remove(
            'visible', 
            'estado-aprobado', 
            'estado-reprobado', 
            'estado-pendiente', 
            'estado-error'
        );
    }

    // Función para mostrar resultado y añadir al historial
    function mostrarResultado(nota1, nota2, nota) {
        limpiarEstados(); 
        
        const notaRedondeada = nota.toFixed(2);
        const promedioActual = ((nota1 * 0.33) + (nota2 * 0.33)).toFixed(2);
        let mensaje = '';
        let estadoClass = '';
        let scoreClass = '';
        let notaFinalTexto = '';

        if (nota > 5.0) {
            mensaje = `Necesitas sacar <span class="score-color-critico"><b>${notaRedondeada}</b></span>.<br>Lamentablemente, ya no es posible alcanzar el 3.0.`;
            estadoClass = 'estado-reprobado';
            scoreClass = 'score-color-critico';
            notaFinalTexto = 'Reprobado';
        } else if (nota <= 0) {
            mensaje = `Necesitas sacar <span class="score-color-aprobado"><b>0.0</b></span> o menos.<br>¡Felicitaciones, ya aprobaste la materia!`;
            estadoClass = 'estado-aprobado';
            scoreClass = 'score-color-aprobado';
            notaFinalTexto = 'Aprobado';
        } else {
            mensaje = `Para obtener una nota final de <b>3.0</b>, necesitas sacar un <span class="score-color-pendiente"><b>${notaRedondeada}</b></span> en el último corte.`;
            estadoClass = 'estado-pendiente';
            scoreClass = 'score-color-pendiente';
            notaFinalTexto = notaRedondeada;
        }
        
        resultadoDiv.innerHTML = mensaje;
        
        // Añadir al historial
        addToHistory(nota1, nota2, promedioActual, notaFinalTexto, scoreClass);

        setTimeout(() => {
            resultadoDiv.classList.add('visible', estadoClass);
        }, 10);
    }
    
    function mostrarError(mensaje) {
        limpiarEstados();
        
        resultadoDiv.innerHTML = mensaje;
        
        setTimeout(() => {
            resultadoDiv.classList.add('visible', 'estado-error');
        }, 10);
    }

    // =================================================
    // HISTORIAL
    // =================================================
    function addToHistory(n1, n2, promedio, notaNecesaria, scoreClass) {
        const placeholder = historyList.querySelector('.history-placeholder');
        if (placeholder) {
            historyList.removeChild(placeholder);
        }

        const date = new Date().toLocaleTimeString();
        const listItem = document.createElement('li');
        
        let displayNota = '';
        if (notaNecesaria === 'Aprobado') {
            displayNota = `<span class="score-color-aprobado">¡Aprobaste!</span>`;
        } else if (notaNecesaria === 'Reprobado') {
            displayNota = `<span class="score-color-critico">Imposible pasar</span>`;
        } else {
            displayNota = `<span class="${scoreClass}">Necesitas: ${notaNecesaria}</span>`;
        }

        listItem.innerHTML = `
            [${date}] Notas: ${n1.toFixed(1)} y ${n2.toFixed(1)} &mdash; ${displayNota}
        `;
        
        historyList.prepend(listItem);

        if (historyList.children.length > 5) {
            historyList.removeChild(historyList.lastChild);
        }
    }


    // =================================================
    // ANIMACIÓN DE PARTÍCULAS (ESTRELLAS)
    // =================================================
    function createParticles(button) {
        const numParticles = 10;
        const rect = button.getBoundingClientRect();
        
        for (let i = 0; i < numParticles; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle-star');
            
            particle.style.left = `${rect.width / 2}px`;
            particle.style.top = `${rect.height / 2}px`;

            const angle = Math.random() * 2 * Math.PI;
            const distance = Math.random() * 60 + 30; 
            
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            
            particle.style.setProperty('--x', `${x}px`);
            particle.style.setProperty('--y', `${y}px`);
            
            particle.style.animation = `fly-out ${Math.random() * 0.8 + 0.5}s forwards`;
            
            button.appendChild(particle);
            
            setTimeout(() => {
                particle.remove();
            }, 1500);
        }
    }

    // =================================================
    // ANIMACIÓN DE SALTO DE BOTONES
    // =================================================
    function addJumpAnimation(button) {
        button.classList.remove('button-jump'); // Asegura que la animación se reinicie
        void button.offsetWidth; // Truco para forzar el reflow y reiniciar la animación
        button.classList.add('button-jump');
    }

});