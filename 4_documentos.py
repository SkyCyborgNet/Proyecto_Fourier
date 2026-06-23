import numpy as np
import json
from scipy.fft import fft, fftfreq, fftshift

# Cargar los datos de las señales
try:
    datos_npz = np.load('señales_generadas.npz')
    t = datos_npz['t']
    pulso_rect = datos_npz['pulso_rect']
    escalon = datos_npz['escalon']
    senoidal = datos_npz['senoidal']
    pulso_variante = datos_npz['pulso_variante']
    senoidal_amort = datos_npz['senoidal_amort']
    print("✅ Datos cargados desde 'señales_generadas.npz'")
except FileNotFoundError:
    print("⚠️ No se encontró 'señales_generadas.npz' - Generando datos de respaldo...")
    # Datos de respaldo (usando la lógica del script 1_senales.py)
    FS = 1000
    T = 1.0
    N = int(FS * T)
    t = np.linspace(0, T, N, endpoint=False)
    pulso_rect = np.where((t >= 0.4) & (t <= 0.6), 1.0, 0.0)
    escalon = np.where(t >= 0.3, 1.0, 0.0)
    senoidal = np.sin(2 * np.pi * 5 * t)
    pulso_variante = np.where((t >= 0.625) & (t <= 0.775), 1.5, 0.0)
    senoidal_amort = np.exp(-2 * t) * np.sin(2 * np.pi * 8 * t)

# Función para calcular la FFT (simplificada para el JSON)
def calcular_fft_simple(senal, t):
    N = len(senal)
    dt = t[1] - t[0]
    freq = fftfreq(N, dt)
    fft_result = fft(senal) / N
    fft_shift = fftshift(fft_result)
    freq_shift = fftshift(freq)
    magnitud = np.abs(fft_shift)
    fase = np.angle(fft_shift)
    return freq_shift.tolist(), magnitud.tolist(), fase.tolist()

# Crear el diccionario de datos en el formato que espera la página web
datos_web = {
    "senales": {
        "pulso": {
            "nombre": "Pulso Rectangular",
            "tipo": "Pulso Rectangular",
            "tiempo": {
                "x": t.tolist(),
                "y": pulso_rect.tolist()
            },
            "frecuencia": {
                "x": calcular_fft_simple(pulso_rect, t)[0],
                "magnitud": calcular_fft_simple(pulso_rect, t)[1],
                "fase": calcular_fft_simple(pulso_rect, t)[2]
            },
            "estadisticas": {
                "energia": float(np.sum(pulso_rect**2) * (t[1] - t[0])),
                "potencia": float(np.mean(pulso_rect**2)),
                "maximo": float(np.max(pulso_rect)),
                "minimo": float(np.min(pulso_rect))
            }
        },
        "escalon": {
            "nombre": "Escalón",
            "tipo": "Escalón",
            "tiempo": {
                "x": t.tolist(),
                "y": escalon.tolist()
            },
            "frecuencia": {
                "x": calcular_fft_simple(escalon, t)[0],
                "magnitud": calcular_fft_simple(escalon, t)[1],
                "fase": calcular_fft_simple(escalon, t)[2]
            },
            "estadisticas": {
                "energia": float(np.sum(escalon**2) * (t[1] - t[0])),
                "potencia": float(np.mean(escalon**2)),
                "maximo": float(np.max(escalon)),
                "minimo": float(np.min(escalon))
            }
        },
        "senoidal": {
            "nombre": "Senoidal",
            "tipo": "Senoidal",
            "tiempo": {
                "x": t.tolist(),
                "y": senoidal.tolist()
            },
            "frecuencia": {
                "x": calcular_fft_simple(senoidal, t)[0],
                "magnitud": calcular_fft_simple(senoidal, t)[1],
                "fase": calcular_fft_simple(senoidal, t)[2]
            },
            "estadisticas": {
                "energia": float(np.sum(senoidal**2) * (t[1] - t[0])),
                "potencia": float(np.mean(senoidal**2)),
                "maximo": float(np.max(senoidal)),
                "minimo": float(np.min(senoidal))
            }
        },
        "pulso-var": {
            "nombre": "Pulso Variante",
            "tipo": "Pulso Variante",
            "tiempo": {
                "x": t.tolist(),
                "y": pulso_variante.tolist()
            },
            "frecuencia": {
                "x": calcular_fft_simple(pulso_variante, t)[0],
                "magnitud": calcular_fft_simple(pulso_variante, t)[1],
                "fase": calcular_fft_simple(pulso_variante, t)[2]
            },
            "estadisticas": {
                "energia": float(np.sum(pulso_variante**2) * (t[1] - t[0])),
                "potencia": float(np.mean(pulso_variante**2)),
                "maximo": float(np.max(pulso_variante)),
                "minimo": float(np.min(pulso_variante))
            }
        },
        "amort": {
            "nombre": "Senoidal Amortiguada",
            "tipo": "Senoidal Amortiguada",
            "tiempo": {
                "x": t.tolist(),
                "y": senoidal_amort.tolist()
            },
            "frecuencia": {
                "x": calcular_fft_simple(senoidal_amort, t)[0],
                "magnitud": calcular_fft_simple(senoidal_amort, t)[1],
                "fase": calcular_fft_simple(senoidal_amort, t)[2]
            },
            "estadisticas": {
                "energia": float(np.sum(senoidal_amort**2) * (t[1] - t[0])),
                "potencia": float(np.mean(senoidal_amort**2)),
                "maximo": float(np.max(senoidal_amort)),
                "minimo": float(np.min(senoidal_amort))
            }
        }
    }
}

# Guardar como JSON para la página web (en la carpeta datos)
with open('datos_señales.json', 'w', encoding='utf-8') as f:
    json.dump(datos_web, f, indent=2, ensure_ascii=False)

# También guardar una versión en docs/ para compatibilidad
with open('documentacion_señales.json', 'w', encoding='utf-8') as f:
    json.dump(datos_web, f, indent=2, ensure_ascii=False)

print("✅ Archivo datos_señales.json generado exitosamente con la estructura para la web.")