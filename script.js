document.addEventListener('DOMContentLoaded', function() {

    // 1. Obtener referencias a los elementos HTML
    const inputCorte1 = document.getElementById('corte1');
    const inputCorte2 = document.getElementById('corte2');
    const calcularBoton = document.getElementById('calcularBtn');
    const resultadoDiv = document.getElementById('resultado');
    const errorCorte1 = document.getElementById('error-corte1');
    const errorCorte2 = document.getElementById('error-corte2');
    const limpiarBoton = document.getElementById('limpiarBtn');
    
    let errorTimeout;

    // Función para mostrar un mensaje de error temporal
    const mostrarErrorTemporal = (elemento, mensaje) => {
        clearTimeout(errorTimeout);
        elemento.textContent = mensaje;
        errorTimeout = setTimeout(() => {
            elemento.textContent = '';
        }, 2000);
    };

    // Filtro de entrada de teclado
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

    // Lógica del botón de Calcular
    calcularBoton.addEventListener('click', function() {
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
        mostrarResultado(notaNecesaria);
    });

    // Funcionalidad del botón Limpiar
    limpiarBoton.addEventListener('click', function() {
        inputCorte1.value = '';
        inputCorte2.value = '';
        resultadoDiv.innerHTML = '';
        resultadoDiv.style.backgroundColor = 'transparent';
        resultadoDiv.style.border = 'none';
        errorCorte1.textContent = '';
        errorCorte2.textContent = '';
        inputCorte1.focus();
    });

    // Funciones para mostrar resultado y error de cálculo
    function mostrarResultado(nota) {
        resultadoDiv.style.background = 'rgba(40, 167, 69, 0.2)';
        resultadoDiv.style.border = '1px solid rgba(40, 167, 69, 0.5)';
        resultadoDiv.style.color = '#fff';
        const notaRedondeada = nota.toFixed(2);
        if (nota > 5.0) {
            resultadoDiv.innerHTML = `Necesitas sacar <b>${notaRedondeada}</b>.<br>Lamentablemente, ya no es posible alcanzar el 3.0. 😞`;
        } else if (nota <= 0) {
            resultadoDiv.innerHTML = `Necesitas sacar <b>0.0</b> o menos.<br>¡Felicitaciones, ya aprobaste la materia! 🎉`;
        } else {
            resultadoDiv.innerHTML = `Para obtener una nota final de <b>3.0</b>, necesitas sacar un <b>${notaRedondeada}</b> en el último corte.`;
        }
    }
    function mostrarError(mensaje) {
        resultadoDiv.style.background = 'rgba(220, 53, 69, 0.2)';
        resultadoDiv.style.border = '1px solid rgba(220, 53, 69, 0.5)';
        resultadoDiv.style.color = '#ffcdd2';
        resultadoDiv.innerHTML = mensaje;
    }
});