/*********************
 * Utilidades simples
 *********************/
const $ = (sel) => document.querySelector(sel);
const print = (msg) => { const el = document.getElementById('out'); el.textContent = String(msg); };
const showState = (entries) => {
  const box = document.getElementById('estado');
  box.innerHTML = '';
  for (const [k, v] of entries) {
    const wrap = document.createElement('div');
    wrap.className = 'card';
    wrap.style.padding = '.75rem 1rem';
    wrap.innerHTML = `<div class="muted" style="font-size:.8rem">${k}</div><div style="font-weight:700;">${v}</div>`;
    box.appendChild(wrap);
  }
};

/*********************
 * Clases del modelo
 *********************/

// --- RNA ---
class RNA {
  #provincia;
  constructor(provincia) { this.#provincia = provincia; }
  get provincia() { return this.#provincia; }
  info() { return `RNA – Provincia: ${this.#provincia}`; }
}

// --- Título ---
class Titulo {
  constructor(propietario, rna) { this.prop = propietario; this.rna = rna; }
  info() { return `Título a nombre de ${this.prop} · ${this.rna?.info() ?? 'RNA N/D'}`; }
}

// --- Rueda ---
class Rueda {
  constructor(marca, rodaje) { this.marca = marca; this.rodaje = rodaje; }
  info() { return `Rueda ${this.marca} (${this.rodaje})`; }
}

// --- Motor ---
class Motor {
  constructor(tipo, caballos, descripcion = '') { this.tipo = tipo; this.caballos = caballos; this.descripcion = descripcion; }
  info() { return `${this.tipo} · ${this.caballos} CV${this.descripcion ? ' – ' + this.descripcion : ''}`; }
}

// --- Remolque ---
class Remolque { constructor(longitud) { this.longitud = longitud; } info() { return `Remolque ${this.longitud} m`; } }

// --- Frigorífico ---
class Frigorifico { constructor(temperatura = -18) { this.temperatura = temperatura; } info() { return `Frigorífico ${this.temperatura}°C`; } }

// --- Vehiculo base ---
class Vehiculo {
  #velocidad = 0;
  #marca; #modelo; #anio;
  constructor({ marca, modelo, anio, titulo } = {}) {
    this.#marca = marca; this.#modelo = modelo; this.#anio = anio; this.titulo = titulo ?? null;
    this.ruedas = [];
  }
  get velocidad() { return this.#velocidad; }
  get marca() { return this.#marca; }
  get modelo() { return this.#modelo; }
  get anio() { return this.#anio; }
  acelerar(delta = 10) { this.#velocidad = Math.max(0, this.#velocidad + Number(delta)); return this.#velocidad; }
  frenar(delta = 10) { this.#velocidad = Math.max(0, this.#velocidad - Number(delta)); return this.#velocidad; }
  agregarRueda(rueda) { if (!(rueda instanceof Rueda)) throw new TypeError('Se espera Rueda'); this.ruedas.push(rueda); }
  info() { return `${this.constructor.name} ${this.#marca} ${this.#modelo} (${this.#anio}) · ${this.ruedas.length} ruedas · ${this.titulo ? this.titulo.info() : 'Sin título'}`; }
  compararVelocidad(otro) {
    if (!(otro instanceof Vehiculo)) throw new TypeError('Comparar con Vehiculo');
    if (this.#velocidad === otro.#velocidad) return 'Ambos van a la misma velocidad.';
    const ganador = this.#velocidad > otro.#velocidad ? this : otro;
    return `${ganador.constructor.name} más rápido: ${ganador.#velocidad} km/h`;
  }
}

// --- Auto ---
class Auto extends Vehiculo {
  constructor({ cantPuertas = 4, ...base } = {}) { super(base); this.cantPuertas = cantPuertas; }
  info() { return `${super.info()} · ${this.cantPuertas} puertas`; }
}

// --- Camion ---
class Camion extends Vehiculo {
  constructor({ capacidadCarga = 0, motor, frigorifico = null, remolque = null, ...base } = {}) {
    super(base);
    this.capacidadCarga = capacidadCarga;
    this.motor = motor instanceof Motor ? motor : null;
    this.frigorifico = frigorifico;
    this.remolque = remolque;
  }
  cargar(peso) { if (peso <= this.capacidadCarga) return `Cargado ${peso} kg`; return `Excede capacidad (${peso} > ${this.capacidadCarga})`; }
  info() {
    const base = super.info();
    const extras = [
      `capacidad ${this.capacidadCarga} kg`,
      this.motor ? `motor ${this.motor.info()}` : 'motor N/D',
      this.frigorifico ? this.frigorifico.info() : null,
      this.remolque ? this.remolque.info() : null,
    ].filter(Boolean).join(' · ');
    return `${base} · ${extras}`;
  }
}

// --- Concesionario ---
class Concesionario {
  constructor(nombre) { this.nombre = nombre; this.vehiculos = []; }
  agregarVehiculo(v) { if (!(v instanceof Vehiculo)) throw new TypeError('Se espera Vehiculo'); this.vehiculos.push(v); }
  listar() { return this.vehiculos.map(v => v.info()); }
  info() { return `Concesionario ${this.nombre} – ${this.vehiculos.length} vehículos`; }
}

// --- Fabrica ---
class Fabrica {
  #nombre;
  constructor(nombre) { this.#nombre = nombre; }
  get nombre() { return this.#nombre; }
  construyeAuto({ marca, modelo, anio, cantPuertas = 4, titulo }) {
    const a = new Auto({ marca, modelo, anio, cantPuertas, titulo });
    for (let i = 0; i < 4; i++) a.agregarRueda(new Rueda('Michelin', 'All-Season'));
    return a;
  }
  construyeCamion({ marca, modelo, anio, capacidadCarga, motor, frigorifico = null, remolque = null, titulo }) {
    const c = new Camion({ marca, modelo, anio, capacidadCarga, motor, frigorifico, remolque, titulo });
    for (let i = 0; i < 6; i++) c.agregarRueda(new Rueda('Bridgestone', 'Heavy-Duty'));
    return c;
  }
  info() { return `Fábrica ${this.#nombre}`; }
}

/*********************
 * Demo interactiva
 *********************/
const state = { concesionario: null, auto: null, camion: null };

function crearDemo() {
  const rna = new RNA('Mendoza');
  const tituloAuto = new Titulo('Ivo Barbato', rna);
  const tituloCamion = new Titulo('Transporte Andino S.A.', rna);

  const fabrica = new Fabrica('Andes Motors');
  const auto = fabrica.construyeAuto({ marca: 'Toyota', modelo: 'Corolla', anio: 2020, cantPuertas: 4, titulo: tituloAuto });
  const camion = fabrica.construyeCamion({
    marca: 'Scania', modelo: 'R500', anio: 2022, capacidadCarga: 18000,
    motor: new Motor('V8 Diesel', 500, 'Euro 6'), frigorifico: new Frigorifico(-20), remolque: new Remolque(12), titulo: tituloCamion,
  });

  const dealer = new Concesionario('Ruta 40');
  dealer.agregarVehiculo(auto);
  dealer.agregarVehiculo(camion);

  state.concesionario = dealer; state.auto = auto; state.camion = camion;

  console.log({ rna, tituloAuto, tituloCamion, fabrica, auto, camion, dealer });
  print([dealer.info(), '', ...dealer.listar()].join('\n'));
  showState([
    ['Concesionario', dealer.nombre],
    ['Vehículos', dealer.vehiculos.length],
    ['Auto – vel', auto.velocidad + ' km/h'],
    ['Camión – vel', camion.velocidad + ' km/h'],
  ]);
}

// Eventos de los botones
$('#btnDemo').addEventListener('click', crearDemo);
$('#btnAcelerar').addEventListener('click', () => {
  if (!state.auto) return print('Primero crea la demo.');
  state.auto.acelerar(35);
  showState([
    ['Concesionario', state.concesionario.nombre],
    ['Vehículos', state.concesionario.vehiculos.length],
    ['Auto – vel', state.auto.velocidad + ' km/h'],
    ['Camión – vel', state.camion.velocidad + ' km/h'],
  ]);
  print(`Auto ahora a ${state.auto.velocidad} km/h`);
});
$('#btnFrenar').addEventListener('click', () => {
  if (!state.camion) return print('Primero crea la demo.');
  state.camion.frenar(10);
  showState([
    ['Concesionario', state.concesionario.nombre],
    ['Vehículos', state.concesionario.vehiculos.length],
    ['Auto – vel', state.auto.velocidad + ' km/h'],
    ['Camión – vel', state.camion.velocidad + ' km/h'],
  ]);
  print(`Camión ahora a ${state.camion.velocidad} km/h`);
});
$('#btnComparar').addEventListener('click', () => {
  if (!state.auto || !state.camion) return print('Primero crea la demo.');
  print(state.auto.compararVelocidad(state.camion));
});
