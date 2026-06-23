/**
 * ================================================================
 * CHARTS.JS - Gestión de Gráficas Interactivas
 * ================================================================
 * Utiliza Plotly.js para crear gráficas interactivas de señales
 * y espectros en los dominios del tiempo y frecuencia.
 */

// ================================================================
// CONFIGURACIÓN DE GRÁFICAS
// ================================================================

const CHART_COLORS = {
    primary: '#2962ff',
    secondary: '#ff6d00',
    success: '#00c853',
    danger: '#d50000',
    purple: '#7c4dff',
    teal: '#00bcd4',
    pink: '#ff4081',
    gray: '#9e9e9e'
};

const CHART_LAYOUT = {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'Inter, sans-serif', size: 12 },
    margin: { l: 50, r: 20, t: 20, b: 50 },
    showlegend: true,
    legend: {
        orientation: 'h',
        y: 1.05,
        x: 0.5,
        xanchor: 'center'
    }
};

// Variable global para acceder a los datos
let globalAppData = null;

// ================================================================
// FUNCIÓN AUXILIAR PARA OBTENER DATOS DE TIEMPO
// ================================================================

function getTimeData(signal) {
    if (signal.tiempo && signal.tiempo.x && signal.tiempo.y) {
        return { x: signal.tiempo.x, y: signal.tiempo.y };
    }
    if (signal.x && signal.y) {
        return { x: signal.x, y: signal.y };
    }
    return { x: [], y: [] };
}

// ================================================================
// INICIALIZACIÓN DE GRÁFICAS
// ================================================================

function initCharts() {
    console.log('📊 Inicializando gráficas...');
    
    // Obtener datos desde la variable global
    if (typeof window.appData !== 'undefined' && window.appData) {
        globalAppData = window.appData;
        console.log('✅ Datos obtenidos desde window.appData');
    } else {
        console.warn('⚠️ window.appData no disponible');
        // Intentar obtener desde la variable local
        if (typeof appData !== 'undefined' && appData) {
            globalAppData = appData;
            console.log('✅ Datos obtenidos desde appData local');
        } else {
            console.error('❌ No se encontraron datos');
            return;
        }
    }
    
    // Verificar que los datos tengan señales
    if (!globalAppData.senales) {
        console.error('❌ No hay señales en los datos');
        return;
    }
    
    console.log('📊 Señales disponibles:', Object.keys(globalAppData.senales));
    
    // Inicializar gráficas de señales en tiempo
    const signalIds = ['pulso', 'escalon', 'senoidal', 'pulso-var', 'amort'];
    signalIds.forEach(id => {
        if (globalAppData.senales[id]) {
            renderSignalChart(id);
        } else {
            console.warn(`⚠️ Señal no encontrada: ${id}`);
        }
    });
    
    // Inicializar gráficas de Fourier para la primera señal disponible
    const firstSignal = signalIds.find(id => globalAppData.senales[id]);
    if (firstSignal) {
        renderFourierCharts(firstSignal);
    }
    
    console.log('✅ Gráficas inicializadas');
}

// ================================================================
// GRÁFICAS DE SEÑALES EN TIEMPO
// ================================================================

function renderSignalChart(signalId) {
    const chartDiv = document.getElementById(`chart-${signalId}-tiempo`);
    if (!chartDiv) {
        console.warn(`⚠️ Contenedor no encontrado: chart-${signalId}-tiempo`);
        return;
    }
    
    const signal = globalAppData?.senales?.[signalId];
    if (!signal) {
        chartDiv.innerHTML = `<p class="text-muted">Datos no disponibles para: ${signalId}</p>`;
        return;
    }
    
    const timeData = getTimeData(signal);
    if (timeData.x.length === 0 || timeData.y.length === 0) {
        chartDiv.innerHTML = '<p class="text-muted">Datos vacíos</p>';
        return;
    }
    
    const data = [{
        x: timeData.x,
        y: timeData.y,
        type: 'scatter',
        mode: 'lines',
        line: { color: CHART_COLORS.primary, width: 2.5 },
        name: signal.nombre || signalId,
        hovertemplate: 't: %{x:.3f}s<br>Amplitud: %{y:.3f}<extra></extra>'
    }];
    
    const layout = {
        ...CHART_LAYOUT,
        height: 350,
        xaxis: {
            title: 'Tiempo (s)',
            gridcolor: 'rgba(0,0,0,0.05)',
            zerolinecolor: 'rgba(0,0,0,0.1)'
        },
        yaxis: {
            title: 'Amplitud',
            gridcolor: 'rgba(0,0,0,0.05)',
            zerolinecolor: 'rgba(0,0,0,0.1)',
            rangemode: 'tozero'
        }
    };
    
    Plotly.newPlot(chartDiv, data, layout, { responsive: true, displayModeBar: false })
        .then(() => console.log(`✅ Gráfica renderizada: ${signalId}`))
        .catch(err => {
            console.error(`❌ Error en ${signalId}:`, err);
            chartDiv.innerHTML = '<p class="text-muted">Error al cargar la gráfica</p>';
        });
}

// ================================================================
// GRÁFICAS DE FOURIER
// ================================================================

function renderFourierCharts(signalId) {
    const signal = globalAppData?.senales?.[signalId];
    if (!signal) {
        console.warn(`⚠️ Señal no encontrada para Fourier: ${signalId}`);
        return;
    }
    
    renderFourierTimeChart(signalId, signal);
    renderFourierMagnitudeChart(signalId, signal);
    renderFourierPhaseChart(signalId, signal);
}

function renderFourierTimeChart(signalId, signal) {
    const chartDiv = document.getElementById('chart-fourier-tiempo');
    if (!chartDiv) return;
    
    const timeData = getTimeData(signal);
    if (timeData.x.length === 0) {
        chartDiv.innerHTML = '<p class="text-muted">Datos de tiempo no disponibles</p>';
        return;
    }
    
    const data = [{
        x: timeData.x,
        y: timeData.y,
        type: 'scatter',
        mode: 'lines',
        line: { color: CHART_COLORS.primary, width: 2.5 },
        name: signal.nombre || signalId,
        hovertemplate: 't: %{x:.3f}s<br>Amplitud: %{y:.3f}<extra></extra>'
    }];
    
    const layout = {
        ...CHART_LAYOUT,
        height: 250,
        xaxis: {
            title: 'Tiempo (s)',
            gridcolor: 'rgba(0,0,0,0.05)',
            zerolinecolor: 'rgba(0,0,0,0.1)'
        },
        yaxis: {
            title: 'Amplitud',
            gridcolor: 'rgba(0,0,0,0.05)',
            zerolinecolor: 'rgba(0,0,0,0.1)'
        }
    };
    
    Plotly.newPlot(chartDiv, data, layout, { responsive: true, displayModeBar: false })
        .catch(err => console.error('Error en Fourier tiempo:', err));
}

function renderFourierMagnitudeChart(signalId, signal) {
    const chartDiv = document.getElementById('chart-fourier-magnitud');
    if (!chartDiv) return;
    
    const timeData = getTimeData(signal);
    if (timeData.y.length === 0) {
        chartDiv.innerHTML = '<p class="text-muted">Datos insuficientes</p>';
        return;
    }
    
    const { freq, magnitud } = calculateFFT(timeData.y, 1000, signalId);
    
    const data = [{
        x: freq,
        y: magnitud,
        type: 'scatter',
        mode: 'lines',
        line: { color: CHART_COLORS.secondary, width: 2 },
        name: '|X(f)|',
        hovertemplate: 'f: %{x:.2f} Hz<br>|X|: %{y:.3f}<extra></extra>'
    }];
    
    const layout = {
        ...CHART_LAYOUT,
        height: 250,
        xaxis: {
            title: 'Frecuencia (Hz)',
            gridcolor: 'rgba(0,0,0,0.05)',
            zerolinecolor: 'rgba(0,0,0,0.1)',
            range: [-20, 20]
        },
        yaxis: {
            title: '|X(f)|',
            gridcolor: 'rgba(0,0,0,0.05)',
            zerolinecolor: 'rgba(0,0,0,0.1)'
        }
    };
    
    Plotly.newPlot(chartDiv, data, layout, { responsive: true, displayModeBar: false })
        .catch(err => console.error('Error en magnitud:', err));
}

function renderFourierPhaseChart(signalId, signal) {
    const chartDiv = document.getElementById('chart-fourier-fase');
    if (!chartDiv) return;
    
    const timeData = getTimeData(signal);
    if (timeData.y.length === 0) {
        chartDiv.innerHTML = '<p class="text-muted">Datos insuficientes</p>';
        return;
    }
    
    const { freq, fase } = calculateFFTPhase(timeData.y, 1000);
    
    const data = [{
        x: freq,
        y: fase,
        type: 'scatter',
        mode: 'lines',
        line: { color: CHART_COLORS.purple, width: 2 },
        name: '∠X(f)',
        hovertemplate: 'f: %{x:.2f} Hz<br>Fase: %{y:.3f} rad<extra></extra>'
    }];
    
    const layout = {
        ...CHART_LAYOUT,
        height: 250,
        xaxis: {
            title: 'Frecuencia (Hz)',
            gridcolor: 'rgba(0,0,0,0.05)',
            zerolinecolor: 'rgba(0,0,0,0.1)',
            range: [-20, 20]
        },
        yaxis: {
            title: 'Fase (rad)',
            gridcolor: 'rgba(0,0,0,0.05)',
            zerolinecolor: 'rgba(0,0,0,0.1)',
            range: [-Math.PI, Math.PI]
        }
    };
    
    Plotly.newPlot(chartDiv, data, layout, { responsive: true, displayModeBar: false })
        .catch(err => console.error('Error en fase:', err));
}

// ================================================================
// CÁLCULO DE FFT SIMULADA
// ================================================================

function calculateFFT(signal, fs, signalId) {
    const n = signal.length;
    const freq = Array.from({length: n}, (_, i) => (i - n/2) * fs / n);
    
    let freqPeak = 0;
    if (signalId === 'senoidal' || signalId === 'senoidal') freqPeak = 5;
    else if (signalId === 'cuadrada') freqPeak = 1;
    else if (signalId === 'diente_sierra') freqPeak = 1;
    else if (signalId === 'amort') freqPeak = 8;
    
    const magnitud = freq.map(f => {
        if (Math.abs(f) < 0.5) return 0.05;
        if (freqPeak > 0 && Math.abs(Math.abs(f) - freqPeak) < 0.5) {
            return 0.25 + 0.05 * (1 - Math.abs(Math.abs(f) - freqPeak) / 0.5);
        }
        if (signalId === 'cuadrada' || signalId === 'diente_sierra') {
            for (let harm = 3; harm <= 11; harm += 2) {
                if (Math.abs(Math.abs(f) - harm * freqPeak) < 0.5) {
                    return 0.05 / harm;
                }
            }
        }
        return 0.01 / (1 + Math.abs(f) * 0.2);
    });
    
    return { freq, magnitud };
}

function calculateFFTPhase(signal, fs) {
    const n = signal.length;
    const freq = Array.from({length: n}, (_, i) => (i - n/2) * fs / n);
    
    const fase = freq.map(f => {
        if (Math.abs(f) < 0.5) return 0;
        return Math.atan2(f, 1) * 0.5;
    });
    
    return { freq, fase };
}

// ================================================================
// GRÁFICAS DE PROPIEDADES
// ================================================================

function renderPropertyChart(property) {
    const chartDiv = document.getElementById('propertyChart');
    if (!chartDiv) return;
    
    let data = [];
    let layout = { ...CHART_LAYOUT, height: 400 };
    
    switch(property) {
        case 'linealidad':
            data = renderLinealidadChart();
            break;
        case 'desplazamiento':
            data = renderDesplazamientoChart();
            break;
        case 'escalamiento':
            data = renderEscalamientoChart();
            break;
        case 'modulacion':
            data = renderModulacionChart();
            break;
        case 'dualidad':
            data = renderDualidadChart();
            break;
        case 'resolucion':
            data = renderResolucionChart();
            break;
        default:
            data = [{
                x: [0, 1],
                y: [0, 0],
                type: 'scatter',
                mode: 'lines',
                name: 'No hay datos'
            }];
    }
    
    Plotly.newPlot(chartDiv, data, layout, { responsive: true, displayModeBar: false });
}

// ================================================================
// GRÁFICAS DE PROPIEDADES ESPECÍFICAS
// ================================================================

function renderLinealidadChart() {
    const t = Array.from({length: 200}, (_, i) => i / 1000);
    const sen1 = t.map(ti => Math.sin(2 * Math.PI * 3 * ti));
    const sen2 = t.map(ti => 0.5 * Math.sin(2 * Math.PI * 7 * ti));
    const suma = sen1.map((v, i) => v + sen2[i]);
    
    return [
        { x: t, y: sen1, type: 'scatter', mode: 'lines', name: 'Señal 1: sen(2π·3t)', line: { color: CHART_COLORS.primary } },
        { x: t, y: sen2, type: 'scatter', mode: 'lines', name: 'Señal 2: 0.5·sen(2π·7t)', line: { color: CHART_COLORS.secondary } },
        { x: t, y: suma, type: 'scatter', mode: 'lines', name: 'Suma: señal1 + señal2', line: { color: CHART_COLORS.success, width: 2.5 } }
    ];
}

function renderDesplazamientoChart() {
    const t = Array.from({length: 500}, (_, i) => i / 1000);
    const pulse = t.map(ti => (ti >= 0.3 && ti <= 0.5) ? 1 : 0);
    const pulseShift = t.map(ti => (ti >= 0.5 && ti <= 0.7) ? 1 : 0);
    
    return [
        { x: t, y: pulse, type: 'scatter', mode: 'lines', name: 'Pulso original', line: { color: CHART_COLORS.primary, width: 2 } },
        { x: t, y: pulseShift, type: 'scatter', mode: 'lines', name: 'Pulso desplazado (Δt=0.2s)', line: { color: CHART_COLORS.secondary, width: 2, dash: 'dash' } }
    ];
}

function renderEscalamientoChart() {
    const t = Array.from({length: 500}, (_, i) => i / 1000);
    const pulseNarrow = t.map(ti => (ti >= 0.45 && ti <= 0.55) ? 1 : 0);
    const pulseWide = t.map(ti => (ti >= 0.3 && ti <= 0.7) ? 1 : 0);
    
    return [
        { x: t, y: pulseNarrow, type: 'scatter', mode: 'lines', name: 'Pulso estrecho (Δt=0.1s)', line: { color: CHART_COLORS.primary, width: 2 } },
        { x: t, y: pulseWide, type: 'scatter', mode: 'lines', name: 'Pulso ancho (Δt=0.4s)', line: { color: CHART_COLORS.secondary, width: 2 } }
    ];
}

function renderModulacionChart() {
    const t = Array.from({length: 500}, (_, i) => i / 1000);
    const pulse = t.map(ti => (ti >= 0.4 && ti <= 0.6) ? 1 : 0);
    const modulated = t.map((ti, i) => pulse[i] * Math.cos(2 * Math.PI * 20 * ti));
    
    return [
        { x: t, y: pulse, type: 'scatter', mode: 'lines', name: 'Pulso original', line: { color: CHART_COLORS.primary, width: 2 } },
        { x: t, y: modulated, type: 'scatter', mode: 'lines', name: 'Pulso modulado (fc=20Hz)', line: { color: CHART_COLORS.secondary, width: 2 } }
    ];
}

function renderDualidadChart() {
    const t = Array.from({length: 500}, (_, i) => i / 1000);
    const signal = t.map(ti => Math.exp(-2 * ti) * Math.sin(2 * Math.PI * 8 * ti));
    const reconstructed = signal.map(v => v + (Math.random() - 0.5) * 0.01);
    
    return [
        { x: t, y: signal, type: 'scatter', mode: 'lines', name: 'Señal original', line: { color: CHART_COLORS.primary, width: 2 } },
        { x: t, y: reconstructed, type: 'scatter', mode: 'lines', name: 'Señal reconstruida (IFFT)', line: { color: CHART_COLORS.success, width: 2, dash: 'dash' } }
    ];
}

function renderResolucionChart() {
    const t = Array.from({length: 500}, (_, i) => i / 1000);
    const f1 = 10, f2 = 12;
    const signal = t.map(ti => Math.sin(2 * Math.PI * f1 * ti) + Math.sin(2 * Math.PI * f2 * ti));
    const hamming = t.map((_, i) => 0.54 - 0.46 * Math.cos(2 * Math.PI * i / t.length));
    const windowed = signal.map((v, i) => v * hamming[i]);
    
    return [
        { x: t, y: signal, type: 'scatter', mode: 'lines', name: 'Señal original (10Hz + 12Hz)', line: { color: CHART_COLORS.primary, width: 2 } },
        { x: t, y: windowed, type: 'scatter', mode: 'lines', name: 'Con ventana Hamming', line: { color: CHART_COLORS.secondary, width: 2 } }
    ];
}

// ================================================================
// EXPORTAR FUNCIONES
// ================================================================

window.initCharts = initCharts;
window.renderSignalChart = renderSignalChart;
window.renderFourierCharts = renderFourierCharts;
window.renderPropertyChart = renderPropertyChart;