import type { ChangeEvent, ReactNode } from 'react'

export type ServiceFormState = {
  numero: string
  fecha: string
  unidad: string
  piloto: string
  bombero1: string
  bombero2: string
  bombero3: string
  bombero4: string
  paciente: string
  edadAnos: string
  edadMeses: string
  genero: string
  telefono: string
  direccion: string
  motivo: string
  medicamentos: string
  alergias: string
  horaSv: string
  llamada: string
  despacho: string
  arribo: string
  ingreso: string
  fc: string
  fr: string
  pa: string
  spo2: string
  glicemia: string
  temp: string
  observaciones: string
  estadoMental: string[]
  pupilas: string[]
  glasgow: { ocular: string; verbal: string; motora: string }
  cincinnati: { facial: string[]; brazo: string[]; habla: string[] }
  antecedentes: string[]
  otrosAntecedentes: string
  hallazgos: string[]
  tipoEmergencia: string
  viaAdministrativa: string[]
  oxigenoterapia: string[]
  o2Lpm: string
  o2FiO2: string
  tratamiento: string[]
  otrosTratamientos: string
}

export type ServicePart = { id: string; titulo: string; contenido: string }
type UpdateField = <K extends keyof ServiceFormState>(field: K, value: ServiceFormState[K]) => void
type Toggle = (values: string[], value: string) => void

const estadoMentalOptions = ['Consciente', 'Desorientado', 'Inconsciente', 'Convulsivo']
const pupilasOptions = ['Midriasis', 'Miosis', 'Resp. a luz', 'No responde', 'Anisocoria']
const antecedentesOptions = ['Cardiacos', 'Cancer', 'Convulsiones', 'Diabetes', 'E.C.V.', 'Pulmonares', 'H.T.A.', 'Renales', 'VIH/SIDA']
const hallazgosOptions = ['CO - Coloracion', 'DE - Deformidad', 'DO - Dolor', 'E - Edema', 'HB - Herida arma blanca', 'HE - Hemorragia', 'HP - Herida proyectil', 'L - Laceration', 'P/M - Picadura / Mordedura', 'PAR - Paralisis', 'Q - Quemaduras', 'S - Sonda', 'T - Trauma']
const tipoEmergenciaOptions = ['Medica', 'Trauma', 'Gineco-Obstetrica']
const viaAdministrativaOptions = ['Medica', 'Trauma', 'Gineco-Obstetrica']
const oxigenoterapiaOptions = ['Canula binasal', 'Mascarilla simple', 'Mascarilla con reservorio', 'Mascarilla de no reinhale', 'Mascarilla de Venturi', 'Mascarilla nebulizacion', 'Via area avanzada']
const tratamientoOptions = ['Apoyo emocional', 'Aspiracion', 'Curacion', 'Inmovilizacion', 'Vendaje']

function Field({ label, id, children }: { label: string; id?: string; children: ReactNode }) {
  return <div className="campo">{id ? <label htmlFor={id}>{label}</label> : <span className="field-label">{label}</span>}{children}</div>
}

function InputField({ label, id, value, onChange, type = 'text', placeholder, min, max }: { label: string; id: string; value: string; onChange: (event: ChangeEvent<HTMLInputElement>) => void; type?: string; placeholder?: string; min?: string; max?: string }) {
  return <Field label={label} id={id}><input id={id} type={type} min={min} max={max} value={value} onChange={onChange} placeholder={placeholder} /></Field>
}

function Options({ values, selected, onToggle, className = 'checkbox-group' }: { values: string[]; selected: string[]; onToggle: Toggle; className?: string }) {
  return <div className={className}>{values.map((value) => <label key={value} className="option"><input type="checkbox" checked={selected.includes(value)} onChange={() => onToggle(selected, value)} />{value}</label>)}</div>
}

export function ServiceCrewForm({ form, ambulances, update }: { form: ServiceFormState; ambulances: string[]; update: UpdateField }) {
  return <section className="card"><div className="card-titulo">Personal del turno y unidad</div><div className="form-grid">
    <InputField label="Número de registro" id="sv-numero" value={form.numero} onChange={(e) => update('numero', e.target.value)} placeholder="Ej: 1234" />
    <InputField label="Fecha del servicio" id="sv-fecha" type="date" value={form.fecha} onChange={(e) => update('fecha', e.target.value)} />
    <Field label="Unidad despachada" id="sv-unidad"><select id="sv-unidad" value={form.unidad} onChange={(e) => update('unidad', e.target.value)}><option value="">Seleccionar unidad...</option>{ambulances.map((amb) => <option key={amb}>{amb}</option>)}</select></Field>
    <InputField label="Piloto" id="sv-piloto" value={form.piloto} onChange={(e) => update('piloto', e.target.value)} placeholder="Nombre del piloto" />
    <InputField label="Bombero a cargo" id="sv-bombero1" value={form.bombero1} onChange={(e) => update('bombero1', e.target.value)} placeholder="Nombre del bombero a cargo" />
    <InputField label="Bombero asistente" id="sv-bombero2" value={form.bombero2} onChange={(e) => update('bombero2', e.target.value)} placeholder="Nombre del bombero asistente" />
    <InputField label="Bombero asistente 2" id="sv-bombero3" value={form.bombero3} onChange={(e) => update('bombero3', e.target.value)} placeholder="Nombre del bombero asistente 2" />
    <InputField label="Bombero asistente 3" id="sv-bombero4" value={form.bombero4} onChange={(e) => update('bombero4', e.target.value)} placeholder="Nombre del bombero asistente 3" />
  </div></section>
}

export function ServicePatientForm({ form, update }: { form: ServiceFormState; update: UpdateField }) {
  return <section className="card"><div className="card-titulo">Información del paciente</div><div className="form-grid">
    <InputField label="Nombre del paciente" id="sv-paciente" value={form.paciente} onChange={(e) => update('paciente', e.target.value)} placeholder="Nombre completo" />
    <Field label="Edad"><div className="dual-inputs"><input type="number" min="0" max="120" value={form.edadAnos} onChange={(e) => update('edadAnos', e.target.value)} placeholder="Años" /><input type="number" min="0" max="11" value={form.edadMeses} onChange={(e) => update('edadMeses', e.target.value)} placeholder="Meses" /></div><small className="helper-text">Ingrese años, meses o ambos según corresponda.</small></Field>
    <Field label="Género" id="sv-genero"><select id="sv-genero" value={form.genero} onChange={(e) => update('genero', e.target.value)}><option value="">Seleccionar...</option><option>Masculino</option><option>Femenino</option><option>Otro</option></select></Field>
    <InputField label="Teléfono de contacto" id="sv-telefono" value={form.telefono} onChange={(e) => update('telefono', e.target.value)} placeholder="Número telefónico" />
    <div className="campo form-full"><label htmlFor="sv-direccion">Dirección del incidente</label><input id="sv-direccion" value={form.direccion} onChange={(e) => update('direccion', e.target.value)} placeholder="Dirección exacta o referencia" /></div>
    <Field label="Motivo de consulta / diagnóstico"><textarea id="sv-motivo" rows={3} value={form.motivo} onChange={(e) => update('motivo', e.target.value)} placeholder="Describe el motivo de la llamada y situación inicial..." /></Field>
    <Field label="Medicamentos que toma"><textarea id="sv-medicamentos" rows={3} value={form.medicamentos} onChange={(e) => update('medicamentos', e.target.value)} placeholder="Listado de medicamentos que usa el paciente..." /></Field>
    <Field label="Alergias conocidas"><textarea id="sv-alergias" rows={2} value={form.alergias} onChange={(e) => update('alergias', e.target.value)} placeholder="Alergias a medicamentos, alimentos, etc." /></Field>
  </div></section>
}

export function ServiceVitalsForm({ form, update }: { form: ServiceFormState; update: UpdateField }) {
  return <><section className="card"><div className="card-titulo">Signos vitales</div><div className="form-grid-2"><InputField label="Hora de toma" id="sv-hora-sv" type="time" value={form.horaSv} onChange={(e) => update('horaSv', e.target.value)} /></div><div className="vitals-grid">
    <InputField label="Frecuencia cardíaca (lpm)" id="sv-fc" type="number" value={form.fc} onChange={(e) => update('fc', e.target.value)} placeholder="60-100" /><InputField label="Frecuencia resp. (rpm)" id="sv-fr" type="number" value={form.fr} onChange={(e) => update('fr', e.target.value)} placeholder="12-20" /><InputField label="Presión arterial" id="sv-pa" value={form.pa} onChange={(e) => update('pa', e.target.value)} placeholder="120/80" /><InputField label="SpO2 (%)" id="sv-spo2" type="number" value={form.spo2} onChange={(e) => update('spo2', e.target.value)} placeholder="95-100" /><InputField label="Glicemia (mg/dL)" id="sv-glicemia" type="number" value={form.glicemia} onChange={(e) => update('glicemia', e.target.value)} placeholder="70-140" /><InputField label="Temperatura (°C)" id="sv-temp" type="number" value={form.temp} onChange={(e) => update('temp', e.target.value)} placeholder="36.5" />
  </div></section><section className="card"><div className="card-titulo">Observaciones del servicio</div><div className="campo"><textarea id="sv-observaciones" rows={4} value={form.observaciones} onChange={(e) => update('observaciones', e.target.value)} placeholder="Descripción detallada del servicio, procedimientos realizados, destino hospitalario, etc." /></div></section><section className="card"><div className="card-titulo">Tiempos de atención</div><div className="form-grid-2"><InputField label="Hora de llamada" id="sv-llamada" type="time" value={form.llamada} onChange={(e) => update('llamada', e.target.value)} /><InputField label="Hora de despacho" id="sv-despacho" type="time" value={form.despacho} onChange={(e) => update('despacho', e.target.value)} /><InputField label="Hora de arribo al lugar" id="sv-arribo" type="time" value={form.arribo} onChange={(e) => update('arribo', e.target.value)} /><InputField label="Hora de ingreso a estación" id="sv-ingreso" type="time" value={form.ingreso} onChange={(e) => update('ingreso', e.target.value)} /></div></section></>
}

export function ServiceAssessmentForm({ form, update, totalGlasgow, glasgowCategory }: { form: ServiceFormState; update: UpdateField; totalGlasgow: number; glasgowCategory: (total: number) => string }) {
  const toggle = (field: 'estadoMental' | 'pupilas' | 'antecedentes' | 'hallazgos' | 'viaAdministrativa' | 'oxigenoterapia', selected: string[], value: string) => update(field, selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value])
  const setCincinnati = (field: 'facial' | 'brazo' | 'habla', selected: string[], value: string) => update('cincinnati', { ...form.cincinnati, [field]: selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value] })
  const glasgowOptions = { ocular: [[1, 'Ninguno'], [2, 'Al dolor'], [3, 'Verbal'], [4, 'Espontáneo']], verbal: [[1, 'Ninguno'], [2, 'Balbuceo'], [3, 'Palabras'], [4, 'Confuso'], [5, 'Orientado']], motora: [[1, 'No responde'], [2, 'Extensión'], [3, 'Flexión'], [4, 'Retira'], [5, 'Localiza'], [6, 'Obedece']] } as const
  return <>
    <section className="card"><div className="card-titulo">Estado mental y pupilas</div><div className="form-grid-2"><Field label="Estado mental"><Options values={estadoMentalOptions} selected={form.estadoMental} onToggle={(s, v) => toggle('estadoMental', s, v)} /></Field><Field label="Pupilas"><Options values={pupilasOptions} selected={form.pupilas} onToggle={(s, v) => toggle('pupilas', s, v)} /></Field></div></section>
    <section className="card"><div className="card-titulo">Escala de Glasgow</div><div className="glasgow-grid">{(['ocular', 'verbal', 'motora'] as const).map((field) => <div className="glasgow-column" key={field}><h3>{field[0].toUpperCase() + field.slice(1)}</h3>{glasgowOptions[field].map(([value, label]) => <label key={value}><input type="radio" name={`glasgow-${field}`} checked={form.glasgow[field] === String(value)} onChange={() => update('glasgow', { ...form.glasgow, [field]: String(value) })} />{value} - {label}</label>)}</div>)}<div className="glasgow-total-box"><strong>{totalGlasgow || '---'}</strong><span>Total Glasgow</span><small>{glasgowCategory(totalGlasgow)}</small></div></div></section>
    <section className="card"><div className="card-titulo">Test de Cincinnati</div><div className="form-grid-2"><Field label="Asimetría facial"><Options values={['Der.', 'Izq.']} selected={form.cincinnati.facial} onToggle={(s, v) => setCincinnati('facial', s, v)} /></Field><Field label="Descenso del brazo"><Options values={['Der.', 'Izq.']} selected={form.cincinnati.brazo} onToggle={(s, v) => setCincinnati('brazo', s, v)} /></Field><div className="campo form-full"><span className="field-label">Habla anormal</span><Options values={['Si', 'No']} selected={form.cincinnati.habla} onToggle={(s, v) => setCincinnati('habla', s, v)} /></div></div></section>
    <section className="card"><div className="card-titulo">Antecedentes médicos</div><div className="form-grid-2"><Field label="Antecedentes"><Options values={antecedentesOptions} selected={form.antecedentes} onToggle={(s, v) => toggle('antecedentes', s, v)} /></Field><Field label="Otros antecedentes"><textarea id="sv-otros-ant" rows={5} value={form.otrosAntecedentes} onChange={(e) => update('otrosAntecedentes', e.target.value)} placeholder="Otros antecedentes médicos relevantes..." /></Field></div></section>
    <section className="card"><div className="card-titulo">Hallazgos notables por región</div><div className="form-grid-2"><Field label="Lesiones y hallazgos"><Options values={hallazgosOptions} selected={form.hallazgos} className="checkbox-group column-group" onToggle={(s, v) => toggle('hallazgos', s, v)} /></Field><Field label="Tipo de emergencia"><div className="radio-group column-group">{tipoEmergenciaOptions.map((option) => <label key={option} className="option"><input type="radio" name="tipoEmergencia" checked={form.tipoEmergencia === option} onChange={() => update('tipoEmergencia', option)} />{option}</label>)}</div><div className="subsection"><span className="field-label">Vía administrativa</span><Options values={viaAdministrativaOptions} selected={form.viaAdministrativa} className="checkbox-group column-group" onToggle={(s, v) => toggle('viaAdministrativa', s, v)} /></div></Field></div></section>
  </>
}

export function ServiceTreatmentForm({ form, update }: { form: ServiceFormState; update: UpdateField }) {
  const toggle = (field: 'oxigenoterapia' | 'tratamiento', selected: string[], value: string) => update(field, selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value])
  return <><section className="card"><div className="card-titulo">Oxigenoterapia</div><div className="form-grid-2"><Field label="Tipo de oxigenoterapia"><Options values={oxigenoterapiaOptions} selected={form.oxigenoterapia} className="checkbox-group column-group" onToggle={(s, v) => toggle('oxigenoterapia', s, v)} /></Field><div className="form-grid"><InputField label="LPM (litros por minuto)" id="sv-o2-lpm" type="number" value={form.o2Lpm} onChange={(e) => update('o2Lpm', e.target.value)} placeholder="0" /><InputField label="FiO2 (%)" id="sv-o2-fio2" type="number" value={form.o2FiO2} onChange={(e) => update('o2FiO2', e.target.value)} placeholder="0" /></div></div></section><section className="card"><div className="card-titulo">Tratamiento realizado</div><div className="form-grid-2"><Field label="Procedimientos realizados"><Options values={tratamientoOptions} selected={form.tratamiento} className="checkbox-group column-group" onToggle={(s, v) => toggle('tratamiento', s, v)} /></Field><Field label="Otros tratamientos"><textarea id="sv-otros-trat" rows={4} value={form.otrosTratamientos} onChange={(e) => update('otrosTratamientos', e.target.value)} placeholder="Otros procedimientos realizados..." /></Field></div></section></>
}

export function ServiceAdditionalSections({ parts, availableParts, onAdd, onRemove, onChange }: { parts: ServicePart[]; availableParts: string[]; onAdd: (title: string) => void; onRemove: (id: string) => void; onChange: (id: string, content: string) => void }) {
  return <section className="card dashed-card"><div className="card-titulo">Añadir secciones adicionales al informe</div><div className="actions-row wrap">{availableParts.map((part) => <button key={part} type="button" className="btn btn-outline btn-sm" onClick={() => onAdd(part)}>➕ {part}</button>)}</div><div className="parts-list">{parts.map((part) => <div key={part.id} className="part-card"><button type="button" className="part-remove" onClick={() => onRemove(part.id)}>✕ Quitar</button><div className="card-titulo inner-title">{part.titulo}</div><div className="campo"><label htmlFor={`part-${part.id}`}>Contenido</label><textarea id={`part-${part.id}`} rows={4} value={part.contenido} onChange={(e) => onChange(part.id, e.target.value)} placeholder={`${part.titulo}...`} /></div></div>)}</div></section>
}
