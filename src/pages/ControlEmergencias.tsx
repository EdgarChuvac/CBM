import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { ServiceAdditionalSections, ServiceAssessmentForm, ServiceCrewForm, ServicePatientForm, ServiceTreatmentForm, ServiceVitalsForm } from '../components/ServiceForms'

type TabId = 'inventario' | 'botiquines' | 'historial' | 'servicios' | 'bodega'

type InventoryItem = {
  id: string
  nombre: string
  categoria: string
  cantidad: number
  unidad: string
  caducidad: string
  lote: string
  minimo: number
  obs: string
  createdAt: string
}

type BodegaItem = {
  id: string
  nombre: string
  categoria: string
  descripcion: string
  cantidad: number
  fechaIngreso: string
  obs: string
  createdAt: string
}

type HistorialItem = {
  id: string
  unidad: string
  fecha: string
  tipo: string
  km: number
  gasolina: number
  piloto: string
  notas: string
}

type BotiquinItem = {
  nombre: string
  cantidad: number
  unidad: string
  caducidad: string
}

type ServicePart = {
  id: string
  titulo: string
  contenido: string
}

type ServiceFormState = {
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
  glasgow: {
    ocular: string
    verbal: string
    motora: string
  }
  cincinnati: {
    facial: string[]
    brazo: string[]
    habla: string[]
  }
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

type ServiceRecord = ServiceFormState & {
  id: string
  edad: string
  timestamp: string
  totalGlasgow: number
  categoriaGlasgow: string
  partes: ServicePart[]
}

type Notice = {
  kind: 'success' | 'error'
  message: string
}

type ServiceTableItem = ServiceRecord

const STORAGE_KEYS = {
  inventory: 'cbmd_inventario',
  ambulances: 'cbmd_ambulancias',
  botiquines: 'cbmd_botiquines',
  historial: 'cbmd_historial',
  servicios: 'cbmd_servicios',
  bodega: 'cbmd_bodega',
} as const

const defaultAmbulances = ['Unidad 01', 'Unidad 02', 'Unidad 03']

const inventoryCategories = [
  'Medicamentos',
  'Soluciones IV',
  'Material quirúrgico',
  'Inmovilización',
  'Vía aérea',
  'Diagnóstico',
  'Otro',
]

const inventoryUnits = ['unidades', 'frascos', 'cajas', 'ampollas', 'bolsas', 'rollos', 'paquetes']

const ambulanceEventTypes = [
  'Salida a servicio',
  'Retorno',
  'Mantenimiento preventivo',
  'Taller / Reparación',
  'Reabastecimiento de gasolina',
  'Revisión técnica',
  'Otro',
]

const bodegaCategories = [
  'Medicamentos',
  'Material médico',
  'Equipos',
  'Suministros generales',
  'Uniformes',
  'Combustible',
  'Repuestos',
  'Otros',
]

const estadoMentalOptions = ['Consciente', 'Desorientado', 'Inconsciente', 'Convulsivo']
const pupilasOptions = ['Midriasis', 'Miosis', 'Resp. a luz', 'No responde', 'Anisocoria']
const antecedentesOptions = ['Cardiacos', 'Cancer', 'Convulsiones', 'Diabetes', 'E.C.V.', 'Pulmonares', 'H.T.A.', 'Renales', 'VIH/SIDA']
const hallazgosOptions = ['CO - Coloracion', 'DE - Deformidad', 'DO - Dolor', 'E - Edema', 'HB - Herida arma blanca', 'HE - Hemorragia', 'HP - Herida proyectil', 'L - Laceration', 'P/M - Picadura / Mordedura', 'PAR - Paralisis', 'Q - Quemaduras', 'S - Sonda', 'T - Trauma']
const tipoEmergenciaOptions = ['Medica', 'Trauma', 'Gineco-Obstetrica']
const viaAdministrativaOptions = ['Medica', 'Trauma', 'Gineco-Obstetrica']
const oxigenoterapiaOptions = ['Canula binasal', 'Mascarilla simple', 'Mascarilla con reservorio', 'Mascarilla de no reinhale', 'Mascarilla de Venturi', 'Mascarilla nebulizacion', 'Via area avanzada']
const tratamientoOptions = ['Apoyo emocional', 'Aspiracion', 'Curacion', 'Inmovilizacion', 'Vendaje']
const serviceParts = ['Atención complementaria', 'Traslado hospitalario', 'Uso de medicamentos en escena', 'Testigos / Familiares', 'Nota adicional']

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function useLocalStorageState<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return fallback
    return safeParse<T>(window.localStorage.getItem(key), fallback)
  })

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue] as const
}

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function todayDate() {
  const now = new Date()
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

function nowTime() {
  const now = new Date()
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`
}

function nowDateTimeLocal() {
  return `${todayDate()}T${nowTime()}`
}

function formatDate(input: string) {
  if (!input) return '-'
  const date = new Date(`${input}T00:00:00`)
  return date.toLocaleDateString('es-GT', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatDateTime(input: string) {
  if (!input) return '-'
  const date = new Date(input)
  return `${date.toLocaleDateString('es-GT', { day: '2-digit', month: '2-digit', year: 'numeric' })} ${date.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' })}`
}

function daysUntil(dateValue: string) {
  if (!dateValue) return 9999
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(`${dateValue}T00:00:00`)
  return Math.round((target.getTime() - today.getTime()) / 86400000)
}

function csvEscape(value: string | number | undefined | null) {
  return String(value ?? '').replace(/"/g, '""')
}

function downloadCsv(filename: string, rows: string[][]) {
  const csv = ['\uFEFF' + rows.map((row) => row.map((cell) => `"${csvEscape(cell)}"`).join(',')).join('\n')].join('')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function badgeClass(kind: 'green' | 'yellow' | 'red' | 'blue' | 'gray') {
  return `badge badge-${kind}`
}

function toggleValue(list: string[], value: string) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

function isNonEmpty(value: string) {
  return value.trim() !== ''
}

function ageText(anos: string, meses: string) {
  const years = Number.parseInt(anos || '0', 10)
  const months = Number.parseInt(meses || '0', 10)
  if (!years && !months) return ''
  if (years && months) return `${years} año${years === 1 ? '' : 's'} ${months} mes${months === 1 ? '' : 'es'}`
  if (years) return `${years} año${years === 1 ? '' : 's'}`
  return `${months} mes${months === 1 ? '' : 'es'}`
}

function totalGlasgow(form: Pick<ServiceFormState, 'glasgow'>) {
  const ocular = Number(form.glasgow.ocular || 0)
  const verbal = Number(form.glasgow.verbal || 0)
  const motora = Number(form.glasgow.motora || 0)
  return ocular + verbal + motora
}

function glasgowCategory(total: number) {
  if (total >= 13 && total <= 15) return 'LEVE'
  if (total >= 9 && total <= 12) return 'MODERADA'
  if (total >= 3 && total <= 8) return 'SEVERA'
  return '---'
}

function createDefaultServiceForm(): ServiceFormState {
  return {
    numero: '',
    fecha: todayDate(),
    unidad: '',
    piloto: '',
    bombero1: '',
    bombero2: '',
    bombero3: '',
    bombero4: '',
    paciente: '',
    edadAnos: '',
    edadMeses: '',
    genero: '',
    telefono: '',
    direccion: '',
    motivo: '',
    medicamentos: '',
    alergias: '',
    horaSv: nowTime(),
    llamada: '',
    despacho: '',
    arribo: '',
    ingreso: '',
    fc: '',
    fr: '',
    pa: '',
    spo2: '',
    glicemia: '',
    temp: '',
    observaciones: '',
    estadoMental: [],
    pupilas: [],
    glasgow: { ocular: '', verbal: '', motora: '' },
    cincinnati: { facial: [], brazo: [], habla: [] },
    antecedentes: [],
    otrosAntecedentes: '',
    hallazgos: [],
    tipoEmergencia: '',
    viaAdministrativa: [],
    oxigenoterapia: [],
    o2Lpm: '',
    o2FiO2: '',
    tratamiento: [],
    otrosTratamientos: '',
  }
}

function createInventoryForm() {
  return {
    nombre: '',
    categoria: '',
    cantidad: '',
    unidad: 'unidades',
    caducidad: '',
    lote: '',
    minimo: '',
    obs: '',
  }
}

function createBodegaForm() {
  return {
    nombre: '',
    categoria: '',
    descripcion: '',
    cantidad: '',
    fechaIngreso: todayDate(),
    obs: '',
  }
}

function createHistoryForm() {
  return {
    unidad: '',
    fecha: nowDateTimeLocal(),
    tipo: ambulanceEventTypes[0],
    km: '',
    gasolina: '',
    piloto: '',
    notas: '',
  }
}

function createInventoryItem(form: ReturnType<typeof createInventoryForm>): InventoryItem {
  return {
    id: uid(),
    nombre: form.nombre.trim(),
    categoria: form.categoria.trim(),
    cantidad: Number(form.cantidad || 0),
    unidad: form.unidad,
    caducidad: form.caducidad,
    lote: form.lote.trim(),
    minimo: Number(form.minimo || 0),
    obs: form.obs.trim(),
    createdAt: new Date().toISOString(),
  }
}

function createBodegaItem(form: ReturnType<typeof createBodegaForm>): BodegaItem {
  return {
    id: uid(),
    nombre: form.nombre.trim(),
    categoria: form.categoria.trim(),
    descripcion: form.descripcion.trim(),
    cantidad: Number(form.cantidad || 0),
    fechaIngreso: form.fechaIngreso,
    obs: form.obs.trim(),
    createdAt: new Date().toISOString(),
  }
}

function createHistoryItem(form: ReturnType<typeof createHistoryForm>): HistorialItem {
  return {
    id: uid(),
    unidad: form.unidad.trim(),
    fecha: form.fecha,
    tipo: form.tipo,
    km: Number(form.km || 0),
    gasolina: Number(form.gasolina || 0),
    piloto: form.piloto.trim(),
    notas: form.notas.trim(),
  }
}

function buildServiceRecord(form: ServiceFormState, partes: ServicePart[]): ServiceRecord {
  const total = totalGlasgow({ glasgow: form.glasgow })
  return {
    ...form,
    id: uid(),
    edad: ageText(form.edadAnos, form.edadMeses),
    timestamp: new Date().toISOString(),
    totalGlasgow: total,
    categoriaGlasgow: glasgowCategory(total),
    partes,
  }
}

function buildServicePrintHtml(service: ServiceTableItem) {
  const sections = [
    ['N° Servicio', service.numero],
    ['Fecha', formatDate(service.fecha)],
    ['Unidad', service.unidad || '-'],
    ['Piloto', service.piloto || '-'],
    ['Bombero a cargo', service.bombero1 || '-'],
    ['Bombero asistente', service.bombero2 || '-'],
    ['Paciente', service.paciente || '-'],
    ['Edad', service.edad || '-'],
    ['Género', service.genero || '-'],
    ['Teléfono', service.telefono || '-'],
    ['Dirección', service.direccion || '-'],
    ['Motivo', service.motivo || '-'],
    ['Hora llamada', service.llamada || '-'],
    ['Hora despacho', service.despacho || '-'],
    ['Hora arribo', service.arribo || '-'],
    ['Hora ingreso', service.ingreso || '-'],
    ['Estado mental', service.estadoMental.join(', ') || '-'],
    ['Pupilas', service.pupilas.join(', ') || '-'],
    ['Antecedentes', service.antecedentes.join(', ') || '-'],
    ['Hallazgos', service.hallazgos.join(', ') || '-'],
    ['Tipo emergencia', service.tipoEmergencia || '-'],
    ['Vía administrativa', service.viaAdministrativa.join(', ') || '-'],
    ['Oxigenoterapia', service.oxigenoterapia.join(', ') || '-'],
    ['Tratamiento', service.tratamiento.join(', ') || '-'],
    ['Observaciones', service.observaciones || '-'],
  ]

  const rows = sections
    .map(([label, value]) => `<div class="print-field"><strong>${label}</strong><span>${String(value).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span></div>`)
    .join('')

  const parts = service.partes
    .map(
      (part) => `
        <section class="print-part">
          <h3>${part.titulo}</h3>
          <p>${part.contenido ? part.contenido.replace(/</g, '&lt;').replace(/>/g, '&gt;') : '-'}</p>
        </section>
      `,
    )
    .join('')

  return `<!doctype html>
  <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Servicio ${service.numero}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 24px; color: #102847; }
        h1, h2, h3, p { margin: 0; }
        .print-shell { border: 1px solid #dfe7ef; border-radius: 16px; padding: 20px; }
        .print-head { display: flex; justify-content: space-between; gap: 16px; align-items: center; margin-bottom: 18px; padding-bottom: 14px; border-bottom: 2px solid #17375e; }
        .print-head h1 { font-size: 20px; }
        .print-head p { font-size: 12px; color: #5d6d7e; margin-top: 4px; }
        .print-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
        .print-field { border: 1px solid #e7edf3; border-radius: 10px; padding: 10px 12px; background: #fbfdff; }
        .print-field strong { display: block; font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: #5d6d7e; margin-bottom: 4px; }
        .print-field span { font-size: 13px; font-weight: 600; }
        .print-part { margin-top: 14px; border: 1px solid #dfe7ef; border-radius: 10px; padding: 12px; background: #f8fbff; }
        .print-part h3 { font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #17375e; margin-bottom: 8px; }
        .print-part p { white-space: pre-wrap; line-height: 1.5; }
        @media print { body { padding: 0; } .print-shell { border: none; border-radius: 0; } }
      </style>
    </head>
    <body>
      <div class="print-shell">
        <header class="print-head">
          <div>
            <h1>Bomberos municipales de ciudad vieja</h1>
            <p>Control de Emergencias - Servicio ${service.numero}</p>
          </div>
          <div>
            <strong>${formatDate(service.fecha)}</strong>
          </div>
        </header>
        <div class="print-grid">${rows}</div>
        ${parts}
      </div>
      <script>window.onload = function(){ window.print(); };</script>
    </body>
  </html>`
}

function DashboardSection({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="page-section">
      <h1 className="page-title">{title}</h1>
      {subtitle && <p className="page-subtitle">{subtitle}</p>}
      {children}
    </section>
  )
}

export default function ControlEmergencias() {
  const [activeTab, setActiveTab] = useState<TabId>('inventario')
  const [inventory, setInventory] = useLocalStorageState<InventoryItem[]>(STORAGE_KEYS.inventory, [])
  const [ambulances, setAmbulances] = useLocalStorageState<string[]>(STORAGE_KEYS.ambulances, defaultAmbulances)
  const [botiquines, setBotiquines] = useLocalStorageState<Record<string, BotiquinItem[]>>(STORAGE_KEYS.botiquines, {})
  const [historial, setHistorial] = useLocalStorageState<HistorialItem[]>(STORAGE_KEYS.historial, [])
  const [servicios, setServicios] = useLocalStorageState<ServiceRecord[]>(STORAGE_KEYS.servicios, [])
  const [bodega, setBodega] = useLocalStorageState<BodegaItem[]>(STORAGE_KEYS.bodega, [])

  const [inventoryForm, setInventoryForm] = useState(createInventoryForm)
  const [historyForm, setHistoryForm] = useState(createHistoryForm)
  const [bodegaForm, setBodegaForm] = useState(createBodegaForm)
  const [serviceForm, setServiceForm] = useState<ServiceFormState>(createDefaultServiceForm)
  const [servicePartsState, setServicePartsState] = useState<ServicePart[]>([])

  const [inventorySearch, setInventorySearch] = useState('')
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState('')
  const [historySearch, setHistorySearch] = useState('')
  const [historyUnitFilter, setHistoryUnitFilter] = useState('')
  const [serviceSearch, setServiceSearch] = useState('')
  const [bodegaSearch, setBodegaSearch] = useState('')
  const [bodegaCategoryFilter, setBodegaCategoryFilter] = useState('')
  const [newAmbulanceName, setNewAmbulanceName] = useState('')
  const [activeAmbulanceIndex, setActiveAmbulanceIndex] = useState(0)
  const [notice, setNotice] = useState<Notice | null>(null)
  const [selectedService, setSelectedService] = useState<ServiceTableItem | null>(null)

  useEffect(() => {
    if (ambulances.length === 0) {
      setAmbulances(defaultAmbulances)
    }
  }, [ambulances, setAmbulances])

  useEffect(() => {
    if (activeAmbulanceIndex >= ambulances.length) {
      setActiveAmbulanceIndex(0)
    }
  }, [activeAmbulanceIndex, ambulances.length])

  useEffect(() => {
    if (!ambulances.length) return
    const current = ambulances[activeAmbulanceIndex] || ambulances[0]
    if (!current) return
    setBotiquines((prev) => (prev[current] ? prev : { ...prev, [current]: [] }))
  }, [activeAmbulanceIndex, ambulances, setBotiquines])

  useEffect(() => {
    if (!notice) return
    const timeout = window.setTimeout(() => setNotice(null), 3200)
    return () => window.clearTimeout(timeout)
  }, [notice])

  const currentAmbulance = ambulances[activeAmbulanceIndex] || ambulances[0] || ''
  const currentBotiquin = botiquines[currentAmbulance] || []

  const inventoryFiltered = useMemo(() => {
    return inventory
      .filter((item) => {
        const search = inventorySearch.trim().toLowerCase()
        const matchesSearch = !search || [item.nombre, item.categoria, item.lote, item.obs].join(' ').toLowerCase().includes(search)
        const matchesCategory = !inventoryCategoryFilter || item.categoria === inventoryCategoryFilter
        return matchesSearch && matchesCategory
      })
      .sort((a, b) => daysUntil(a.caducidad) - daysUntil(b.caducidad))
  }, [inventory, inventorySearch, inventoryCategoryFilter])

  const inventoryStats = useMemo(() => {
    const total = inventory.length
    const totalUnits = inventory.reduce((sum, item) => sum + Number(item.cantidad || 0), 0)
    const expired = inventory.filter((item) => daysUntil(item.caducidad) < 0).length
    const soon = inventory.filter((item) => {
      const remaining = daysUntil(item.caducidad)
      return remaining >= 0 && remaining <= 30
    }).length
    const low = inventory.filter((item) => item.minimo > 0 && item.cantidad > 0 && item.cantidad <= item.minimo).length
    return { total, totalUnits, expired, soon, low }
  }, [inventory])

  const historyFiltered = useMemo(() => {
    return historial
      .filter((item) => {
        const search = historySearch.trim().toLowerCase()
        const matchesSearch = !search || [item.unidad, item.tipo, item.piloto, item.notas].join(' ').toLowerCase().includes(search)
        const matchesUnit = !historyUnitFilter || item.unidad === historyUnitFilter
        return matchesSearch && matchesUnit
      })
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
  }, [historial, historySearch, historyUnitFilter])

  const serviceFiltered = useMemo(() => {
    return servicios
      .filter((item) => {
        const search = serviceSearch.trim().toLowerCase()
        return !search || [item.numero, item.fecha, item.paciente, item.piloto, item.unidad].join(' ').toLowerCase().includes(search)
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [servicios, serviceSearch])

  const bodegaFiltered = useMemo(() => {
    return bodega
      .filter((item) => {
        const search = bodegaSearch.trim().toLowerCase()
        const matchesSearch = !search || [item.nombre, item.descripcion, item.categoria, item.obs].join(' ').toLowerCase().includes(search)
        const matchesCategory = !bodegaCategoryFilter || item.categoria === bodegaCategoryFilter
        return matchesSearch && matchesCategory
      })
      .sort((a, b) => new Date(b.fechaIngreso).getTime() - new Date(a.fechaIngreso).getTime())
  }, [bodega, bodegaSearch, bodegaCategoryFilter])

  const bodegaStats = useMemo(() => {
    const total = bodega.length
    const totalUnits = bodega.reduce((sum, item) => sum + Number(item.cantidad || 0), 0)
    const categories = new Set(bodega.map((item) => item.categoria).filter(Boolean))
    return { total, totalUnits, categories: categories.size }
  }, [bodega])

  const selectedGlasgow = totalGlasgow({ glasgow: serviceForm.glasgow })
  const showLegacyServiceMarkup = false

  const openNotice = (kind: Notice['kind'], message: string) => setNotice({ kind, message })

  const updateServiceField = <K extends keyof ServiceFormState>(field: K, value: ServiceFormState[K]) => {
    setServiceForm((prev) => ({ ...prev, [field]: value }))
  }

  const resetServiceForm = () => {
    setServiceForm(createDefaultServiceForm())
    setServicePartsState([])
  }

  const handleGenerateServiceNumber = () => {
    const date = todayDate().replace(/-/g, '')
    const next = String(servicios.length + 1).padStart(4, '0')
    setServiceForm((prev) => ({ ...prev, numero: `SV-${date}-${next}`, fecha: todayDate(), horaSv: nowTime() }))
  }

  const handleAddInventory = () => {
    if (!isNonEmpty(inventoryForm.nombre)) return openNotice('error', 'Ingresa el nombre del medicamento o suministro.')
    if (!isNonEmpty(inventoryForm.categoria)) return openNotice('error', 'Selecciona una categoría.')

    const next = createInventoryItem(inventoryForm)
    setInventory((prev) => [...prev, next])
    setInventoryForm(createInventoryForm())
    openNotice('success', 'Item agregado al inventario.')
  }

  const handleAdjustInventory = (id: string, delta: number) => {
    setInventory((prev) => prev.map((item) => (item.id === id ? { ...item, cantidad: Math.max(0, item.cantidad + delta) } : item)))
  }

  const handleDeleteInventory = (id: string) => {
    if (!window.confirm('¿Eliminar este item del inventario?')) return
    setInventory((prev) => prev.filter((item) => item.id !== id))
  }

  const handleClearInventory = () => setInventoryForm(createInventoryForm())

  const handleAddAmbulance = () => {
    const name = newAmbulanceName.trim()
    if (!name) return openNotice('error', 'Ingresa el nombre de la unidad.')
    if (ambulances.includes(name)) return openNotice('error', 'Esa unidad ya existe.')
    setAmbulances((prev) => [...prev, name])
    setBotiquines((prev) => ({ ...prev, [name]: [] }))
    setNewAmbulanceName('')
    openNotice('success', 'Unidad agregada.')
  }

  const handleRemoveAmbulance = () => {
    if (ambulances.length <= 1) return openNotice('error', 'Debe existir al menos una unidad.')
    const name = ambulances[activeAmbulanceIndex]
    if (!window.confirm(`¿Eliminar la unidad "${name}" y su botiquín?`)) return
    setAmbulances((prev) => prev.filter((_, index) => index !== activeAmbulanceIndex))
    setBotiquines((prev) => {
      const next = { ...prev }
      delete next[name]
      return next
    })
    setActiveAmbulanceIndex(0)
  }

  const handleAddBotiquinItem = () => {
    const nombre = prompt('Nombre del item del botiquín')?.trim()
    if (!nombre) return
    const cantidad = Number(window.prompt('Cantidad', '0') || '0')
    const unidad = window.prompt('Unidad', 'unidades') || 'unidades'
    const caducidad = window.prompt('Caducidad (YYYY-MM-DD)', '') || ''

    const item: BotiquinItem = { nombre, cantidad: Number.isFinite(cantidad) ? Math.max(0, cantidad) : 0, unidad, caducidad }
    setBotiquines((prev) => ({
      ...prev,
      [currentAmbulance]: [...(prev[currentAmbulance] || []), item],
    }))
  }

  const handleAdjustBotiquin = (index: number, delta: number) => {
    setBotiquines((prev) => ({
      ...prev,
      [currentAmbulance]: (prev[currentAmbulance] || []).map((item, currentIndex) =>
        currentIndex === index ? { ...item, cantidad: Math.max(0, item.cantidad + delta) } : item,
      ),
    }))
  }

  const handleDeleteBotiquin = (index: number) => {
    if (!window.confirm('¿Eliminar este item del botiquín?')) return
    setBotiquines((prev) => ({
      ...prev,
      [currentAmbulance]: (prev[currentAmbulance] || []).filter((_, currentIndex) => currentIndex !== index),
    }))
  }

  const handleAddHistory = () => {
    if (!isNonEmpty(historyForm.unidad)) return openNotice('error', 'Selecciona una unidad.')
    if (!isNonEmpty(historyForm.fecha)) return openNotice('error', 'Ingresa la fecha y hora.')
    const next = createHistoryItem(historyForm)
    setHistorial((prev) => [...prev, next])
    setHistoryForm(createHistoryForm())
    openNotice('success', 'Registro de historial guardado.')
  }

  const handleDeleteHistory = (id: string) => {
    if (!window.confirm('¿Eliminar este registro?')) return
    setHistorial((prev) => prev.filter((item) => item.id !== id))
  }

  const handleClearHistory = () => setHistoryForm(createHistoryForm())

  const handleAddBodega = () => {
    if (!isNonEmpty(bodegaForm.nombre)) return openNotice('error', 'Ingresa el nombre del producto.')
    if (!isNonEmpty(bodegaForm.categoria)) return openNotice('error', 'Selecciona una categoría.')
    const next = createBodegaItem(bodegaForm)
    setBodega((prev) => [...prev, next])
    setBodegaForm(createBodegaForm())
    openNotice('success', 'Producto registrado en bodega.')
  }

  const handleDeleteBodega = (id: string) => {
    if (!window.confirm('¿Eliminar este producto de bodega?')) return
    setBodega((prev) => prev.filter((item) => item.id !== id))
  }

  const handleSaveService = () => {
    if (!isNonEmpty(serviceForm.numero)) return openNotice('error', 'Ingresa el número de servicio.')
    if (!isNonEmpty(serviceForm.paciente)) return openNotice('error', 'Ingresa el nombre del paciente.')
    if (!isNonEmpty(serviceForm.fecha)) return openNotice('error', 'Selecciona la fecha.')

    const next = buildServiceRecord(serviceForm, servicePartsState)
    setServicios((prev) => [...prev, next])
    resetServiceForm()
    setSelectedService(next)
    openNotice('success', 'Servicio guardado correctamente.')
  }

  const handleAddServicePart = (title: string) => {
    setServicePartsState((prev) => [...prev, { id: uid(), titulo: title, contenido: '' }])
  }

  const handleRemoveServicePart = (id: string) => {
    setServicePartsState((prev) => prev.filter((part) => part.id !== id))
  }

  const handleOpenService = (service: ServiceTableItem) => {
    setSelectedService(service)
  }

  const handleDeleteService = (id: string) => {
    if (!window.confirm('¿Eliminar este servicio del registro?')) return
    setServicios((prev) => prev.filter((item) => item.id !== id))
    if (selectedService?.id === id) setSelectedService(null)
  }

  const handleExportCsv = (type: 'inventario' | 'historial' | 'servicios') => {
    if (type === 'inventario') {
      downloadCsv('inventario_bodega.csv', [
        ['Nombre', 'Categoría', 'Cantidad', 'Unidad', 'Caducidad', 'Lote/Proveedor', 'Stock mín.', 'Observaciones'],
        ...inventory.map((item) => [item.nombre, item.categoria, String(item.cantidad), item.unidad, item.caducidad, item.lote, String(item.minimo), item.obs]),
      ])
    }

    if (type === 'historial') {
      downloadCsv('historial_ambulancias.csv', [
        ['Fecha', 'Unidad', 'Tipo', 'Km', 'Gasolina', 'Piloto', 'Notas'],
        ...historial
          .slice()
          .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
          .map((item) => [formatDateTime(item.fecha), item.unidad, item.tipo, String(item.km), String(item.gasolina), item.piloto, item.notas]),
      ])
    }

    if (type === 'servicios') {
      downloadCsv('registro_servicios.csv', [
        ['N° Servicio', 'Fecha', 'Paciente', 'Edad', 'Género', 'Unidad', 'Piloto', 'Bombero a cargo', 'Bombero asistente', 'Motivo', 'Dirección', 'FC', 'FR', 'P/A', 'SpO2', 'Glicemia', 'Temp', 'Observaciones'],
        ...servicios.map((item) => [
          item.numero,
          item.fecha,
          item.paciente,
          item.edad,
          item.genero,
          item.unidad,
          item.piloto,
          item.bombero1,
          item.bombero2,
          item.motivo,
          item.direccion,
          item.fc,
          item.fr,
          item.pa,
          item.spo2,
          item.glicemia,
          item.temp,
          item.observaciones,
        ]),
      ])
    }
  }

  const handlePrintService = (service: ServiceTableItem | null) => {
    const target = service || selectedService
    if (!target) return openNotice('error', 'No hay servicio seleccionado para imprimir.')
    const win = window.open('', '_blank', 'width=1024,height=768')
    if (!win) return openNotice('error', 'El navegador bloqueó la ventana de impresión.')
    win.document.open()
    win.document.write(buildServicePrintHtml(target))
    win.document.close()
  }

  const serviceValidation = useMemo(() => {
    const errors: string[] = []
    if (!isNonEmpty(serviceForm.estadoMental.join(''))) errors.push('Estado mental')
    if (!isNonEmpty(serviceForm.glasgow.ocular + serviceForm.glasgow.verbal + serviceForm.glasgow.motora)) errors.push('Glasgow')
    if (serviceForm.cincinnati.facial.length === 0 && serviceForm.cincinnati.brazo.length === 0 && serviceForm.cincinnati.habla.length === 0) errors.push('Cincinnati')
    if (serviceForm.antecedentes.length === 0) errors.push('Antecedentes')
    if (serviceForm.oxigenoterapia.length === 0) errors.push('Oxigenoterapia')
    if (serviceForm.tratamiento.length === 0) errors.push('Tratamiento')
    return errors
  }, [serviceForm])

  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: 'inventario', label: 'Inventario Bodega', icon: '💊' },
    { id: 'botiquines', label: 'Botiquines Ambulancias', icon: '🚑' },
    { id: 'historial', label: 'Historial Ambulancias', icon: '📋' },
    { id: 'servicios', label: 'Registro de Servicios', icon: '🏥' },
    { id: 'bodega', label: 'Bodega', icon: '📦' },
  ]

  return (
    <div className="dashboard-shell">
      <header className="topbar dashboard-topbar">
        <div className="brand-wrap">
          <div className="brand-mark">B</div>
          <div className="brand-copy">
            <span className="brand-name">Bomberos municipales de ciudad vieja</span>
            <span className="brand-subtitle">Control de Emergencias</span>
          </div>
        </div>

        <nav className="tabs" aria-label="Secciones principales">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`tab ${activeTab === tab.id ? 'activo' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-texto">{tab.label}</span>
            </button>
          ))}
        </nav>
      </header>

      <main className="dashboard-content">
        {notice && <div className={`notice notice-${notice.kind}`}>{notice.message}</div>}

        {activeTab === 'inventario' && (
          <DashboardSection title="Inventario de Bodega" subtitle="Control de medicamentos y suministros en tiempo real">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-valor">{inventoryStats.total}</div>
                <div className="stat-label">Tipos de items</div>
              </div>
              <div className="stat-card stat-accent-green">
                <div className="stat-valor">{inventoryStats.totalUnits}</div>
                <div className="stat-label">Unidades totales</div>
              </div>
              <div className="stat-card stat-accent-red">
                <div className="stat-valor">{inventoryStats.expired}</div>
                <div className="stat-label">Vencidos</div>
              </div>
              <div className="stat-card stat-accent-yellow">
                <div className="stat-valor">{inventoryStats.soon}</div>
                <div className="stat-label">Próximos a vencer</div>
              </div>
              <div className="stat-card stat-accent-orange">
                <div className="stat-valor">{inventoryStats.low}</div>
                <div className="stat-label">Stock bajo</div>
              </div>
            </div>

            <section className="card">
              <div className="card-titulo">Agregar medicamento / suministro</div>
              <div className="form-grid">
                <div className="campo">
                  <label htmlFor="inv-nombre">Nombre del medicamento</label>
                  <input id="inv-nombre" value={inventoryForm.nombre} onChange={(e) => setInventoryForm((prev) => ({ ...prev, nombre: e.target.value }))} placeholder="Ej: Solución salina 0.9%" />
                </div>
                <div className="campo">
                  <label htmlFor="inv-categoria">Categoría</label>
                  <select id="inv-categoria" value={inventoryForm.categoria} onChange={(e) => setInventoryForm((prev) => ({ ...prev, categoria: e.target.value }))}>
                    <option value="">Seleccionar...</option>
                    {inventoryCategories.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div className="campo">
                  <label htmlFor="inv-cantidad">Cantidad</label>
                  <input id="inv-cantidad" type="number" min="0" value={inventoryForm.cantidad} onChange={(e) => setInventoryForm((prev) => ({ ...prev, cantidad: e.target.value }))} />
                </div>
                <div className="campo">
                  <label htmlFor="inv-unidad">Unidad</label>
                  <select id="inv-unidad" value={inventoryForm.unidad} onChange={(e) => setInventoryForm((prev) => ({ ...prev, unidad: e.target.value }))}>
                    {inventoryUnits.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div className="campo">
                  <label htmlFor="inv-caducidad">Fecha de caducidad</label>
                  <input id="inv-caducidad" type="date" value={inventoryForm.caducidad} onChange={(e) => setInventoryForm((prev) => ({ ...prev, caducidad: e.target.value }))} />
                </div>
                <div className="campo">
                  <label htmlFor="inv-lote">Proveedor / Lote</label>
                  <input id="inv-lote" value={inventoryForm.lote} onChange={(e) => setInventoryForm((prev) => ({ ...prev, lote: e.target.value }))} placeholder="Opcional" />
                </div>
                <div className="campo">
                  <label htmlFor="inv-minimo">Stock mínimo</label>
                  <input id="inv-minimo" type="number" min="0" value={inventoryForm.minimo} onChange={(e) => setInventoryForm((prev) => ({ ...prev, minimo: e.target.value }))} />
                </div>
                <div className="campo">
                  <label htmlFor="inv-obs">Observaciones</label>
                  <input id="inv-obs" value={inventoryForm.obs} onChange={(e) => setInventoryForm((prev) => ({ ...prev, obs: e.target.value }))} placeholder="Opcional" />
                </div>
              </div>
              <div className="actions-row">
                <button type="button" className="btn btn-primary" onClick={handleAddInventory}>
                  ➕ Agregar
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleClearInventory}>
                  ✖ Limpiar
                </button>
              </div>
            </section>

            <section className="card">
              <div className="card-titulo card-titulo-row">
                <span>Inventario actual</span>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => handleExportCsv('inventario')}>
                  ⬇ Exportar CSV
                </button>
              </div>
              <div className="toolbar">
                <input type="text" value={inventorySearch} onChange={(e) => setInventorySearch(e.target.value)} placeholder="🔍 Buscar medicamento..." />
                <select value={inventoryCategoryFilter} onChange={(e) => setInventoryCategoryFilter(e.target.value)}>
                  <option value="">Todas las categorías</option>
                  {inventoryCategories.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Categoría</th>
                      <th>Cantidad</th>
                      <th>Caducidad</th>
                      <th>Estado</th>
                      <th>Lote</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryFiltered.length ? (
                      inventoryFiltered.map((item) => {
                        const remaining = daysUntil(item.caducidad)
                        return (
                          <tr key={item.id}>
                            <td>
                              <strong>{item.nombre}</strong>
                              {item.obs && <><br /><small className="muted">{item.obs}</small></>}
                            </td>
                            <td>{item.categoria ? <span className={badgeClass('gray')}>{item.categoria}</span> : '-'}</td>
                            <td className="center-cell">
                              <button type="button" className="mini-btn danger-soft" onClick={() => handleAdjustInventory(item.id, -1)}>
                                −
                              </button>
                              <strong className="quantity-value">{item.cantidad}</strong>
                              <small className="muted">{item.unidad}</small>
                              <button type="button" className="mini-btn success-soft" onClick={() => handleAdjustInventory(item.id, 1)}>
                                +
                              </button>
                            </td>
                            <td>{item.caducidad ? formatDate(item.caducidad) : <span className="muted">No indicada</span>}</td>
                            <td>
                              {remaining < 0 ? <span className={badgeClass('red')}>Vencido</span> : null}
                              {remaining >= 0 && remaining <= 30 ? <span className={badgeClass('red')}>Vence en {remaining} días</span> : null}
                              {remaining > 30 && remaining <= 90 ? <span className={badgeClass('yellow')}>Próximo a vencer</span> : null}
                              {remaining > 90 ? <span className={badgeClass('green')}>Vigente</span> : null}
                              {' '}
                              {item.minimo > 0 && item.cantidad > 0 && item.cantidad <= item.minimo ? <span className={badgeClass('yellow')}>Stock bajo</span> : item.cantidad <= 0 ? <span className={badgeClass('red')}>Sin stock</span> : <span className={badgeClass('green')}>OK</span>}
                            </td>
                            <td>{item.lote || '-'}</td>
                            <td>
                              <button type="button" className="btn btn-outline btn-sm danger-text" onClick={() => handleDeleteInventory(item.id)}>
                                🗑
                              </button>
                            </td>
                          </tr>
                        )
                      })
                    ) : (
                      <tr>
                        <td colSpan={7}>
                          <div className="empty-state">No hay medicamentos registrados.</div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </DashboardSection>
        )}

        {activeTab === 'botiquines' && (
          <DashboardSection title="Botiquines de ambulancias" subtitle="Inventario por unidad vehicular">
            <section className="card">
              <div className="card-titulo">Gestión de unidades</div>
              <div className="unit-row">
                <div className="campo grow">
                  <label htmlFor="nueva-amb">Nombre / Número de unidad</label>
                  <input id="nueva-amb" value={newAmbulanceName} onChange={(e) => setNewAmbulanceName(e.target.value)} placeholder="Ej: Unidad 01 - B-304" />
                </div>
                <button type="button" className="btn btn-secondary" onClick={handleAddAmbulance}>
                  ➕ Agregar unidad
                </button>
                <button type="button" className="btn btn-outline" onClick={handleRemoveAmbulance}>
                  🗑 Eliminar unidad
                </button>
              </div>
            </section>

            <section className="card">
              <div className="card-titulo">Unidades disponibles</div>
              <div className="ambulance-tabs">
                {ambulances.map((amb, index) => (
                  <button key={amb} type="button" className={`amb-tab ${index === activeAmbulanceIndex ? 'activo' : ''}`} onClick={() => setActiveAmbulanceIndex(index)}>
                    {amb}
                  </button>
                ))}
                <button type="button" className="btn btn-outline btn-sm" onClick={handleAddBotiquinItem}>
                  ➕ Agregar item
                </button>
              </div>

              <div className="card nested-card">
                <div className="card-titulo">Botiquín: {currentAmbulance}</div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Cantidad</th>
                        <th>Caducidad</th>
                        <th>Estado</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentBotiquin.length ? (
                        currentBotiquin.map((item, index) => (
                          <tr key={`${item.nombre}-${index}`}>
                            <td>{item.nombre}</td>
                            <td>
                              <button type="button" className="mini-btn danger-soft" onClick={() => handleAdjustBotiquin(index, -1)}>
                                −
                              </button>{' '}
                              {item.cantidad} {item.unidad}{' '}
                              <button type="button" className="mini-btn success-soft" onClick={() => handleAdjustBotiquin(index, 1)}>
                                +
                              </button>
                            </td>
                            <td>{item.caducidad ? formatDate(item.caducidad) : '-'}</td>
                            <td>{item.caducidad ? <span className={daysUntil(item.caducidad) < 0 ? badgeClass('red') : daysUntil(item.caducidad) <= 30 ? badgeClass('yellow') : badgeClass('green')}>{daysUntil(item.caducidad) < 0 ? 'Vencido' : daysUntil(item.caducidad) <= 30 ? 'Próximo a vencer' : 'Vigente'}</span> : <span className={badgeClass('gray')}>Sin fecha</span>}</td>
                            <td>
                              <button type="button" className="btn btn-outline btn-sm danger-text" onClick={() => handleDeleteBotiquin(index)}>
                                🗑
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5}>
                            <div className="empty-state">Botiquín vacío</div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </DashboardSection>
        )}

        {activeTab === 'historial' && (
          <DashboardSection title="Historial de ambulancias" subtitle="Registro de salidas, kilometraje, combustible y mantenimiento">
            <section className="card">
              <div className="card-titulo">Registrar salida / evento</div>
              <div className="form-grid">
                <div className="campo">
                  <label htmlFor="hist-unidad">Unidad</label>
                  <select id="hist-unidad" value={historyForm.unidad} onChange={(e) => setHistoryForm((prev) => ({ ...prev, unidad: e.target.value }))}>
                    <option value="">Seleccionar unidad...</option>
                    {ambulances.map((amb) => (
                      <option key={amb}>{amb}</option>
                    ))}
                  </select>
                </div>
                <div className="campo">
                  <label htmlFor="hist-fecha">Fecha y hora</label>
                  <input id="hist-fecha" type="datetime-local" value={historyForm.fecha} onChange={(e) => setHistoryForm((prev) => ({ ...prev, fecha: e.target.value }))} />
                </div>
                <div className="campo">
                  <label htmlFor="hist-tipo">Tipo de evento</label>
                  <select id="hist-tipo" value={historyForm.tipo} onChange={(e) => setHistoryForm((prev) => ({ ...prev, tipo: e.target.value }))}>
                    {ambulanceEventTypes.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div className="campo">
                  <label htmlFor="hist-km">Kilometraje actual (km)</label>
                  <input id="hist-km" type="number" value={historyForm.km} onChange={(e) => setHistoryForm((prev) => ({ ...prev, km: e.target.value }))} placeholder="0" />
                </div>
                <div className="campo">
                  <label htmlFor="hist-gasolina">Combustible</label>
                  <input id="hist-gasolina" type="number" step="0.1" value={historyForm.gasolina} onChange={(e) => setHistoryForm((prev) => ({ ...prev, gasolina: e.target.value }))} placeholder="0" />
                </div>
                <div className="campo">
                  <label htmlFor="hist-piloto">Conductor / Piloto</label>
                  <input id="hist-piloto" value={historyForm.piloto} onChange={(e) => setHistoryForm((prev) => ({ ...prev, piloto: e.target.value }))} placeholder="Nombre del piloto" />
                </div>
                <div className="campo form-full">
                  <label htmlFor="hist-notas">Anotaciones / observaciones</label>
                  <textarea id="hist-notas" rows={3} value={historyForm.notas} onChange={(e) => setHistoryForm((prev) => ({ ...prev, notas: e.target.value }))} placeholder="Describe el evento, reparaciones realizadas, observaciones..." />
                </div>
              </div>
              <div className="actions-row">
                <button type="button" className="btn btn-primary" onClick={handleAddHistory}>
                  💾 Guardar registro
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleClearHistory}>
                  ✖ Limpiar
                </button>
              </div>
            </section>

            <section className="card">
              <div className="card-titulo card-titulo-row">
                <span>Historial de registros</span>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => handleExportCsv('historial')}>
                  ⬇ Exportar CSV
                </button>
              </div>
              <div className="toolbar">
                <input type="text" value={historySearch} onChange={(e) => setHistorySearch(e.target.value)} placeholder="🔍 Buscar..." />
                <select value={historyUnitFilter} onChange={(e) => setHistoryUnitFilter(e.target.value)}>
                  <option value="">Todas las unidades</option>
                  {ambulances.map((amb) => (
                    <option key={amb}>{amb}</option>
                  ))}
                </select>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Fecha / Hora</th>
                      <th>Unidad</th>
                      <th>Tipo</th>
                      <th>Km</th>
                      <th>Combustible</th>
                      <th>Piloto</th>
                      <th>Notas</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyFiltered.length ? (
                      historyFiltered.map((item) => (
                        <tr key={item.id}>
                          <td>{formatDateTime(item.fecha)}</td>
                          <td>
                            <strong>{item.unidad}</strong>
                          </td>
                          <td>
                            <span className={item.tipo === 'Taller / Reparación' ? badgeClass('red') : item.tipo === 'Salida a servicio' ? badgeClass('green') : item.tipo === 'Reabastecimiento de gasolina' ? badgeClass('blue') : item.tipo === 'Retorno' ? badgeClass('gray') : badgeClass('yellow')}>
                              {item.tipo}
                            </span>
                          </td>
                          <td>{item.km ? `${item.km.toLocaleString()} km` : '-'}</td>
                          <td>{item.gasolina ? `${item.gasolina} gal` : '-'}</td>
                          <td>{item.piloto || '-'}</td>
                          <td className="ellipsis-cell" title={item.notas}>
                            {item.notas || '-'}
                          </td>
                          <td>
                            <button type="button" className="btn btn-outline btn-sm danger-text" onClick={() => handleDeleteHistory(item.id)}>
                              🗑
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8}>
                          <div className="empty-state">No hay registros de historial.</div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </DashboardSection>
        )}

        {activeTab === 'servicios' && (
          <div className="service-form-layout">
          <DashboardSection title="Registro de servicios" subtitle="Formulario completo por turno y servicio">
            <ServiceCrewForm form={serviceForm} ambulances={ambulances} update={updateServiceField} />
            <ServicePatientForm form={serviceForm} update={updateServiceField} />
            <ServiceVitalsForm form={serviceForm} update={updateServiceField} />
            <ServiceAssessmentForm form={serviceForm} update={updateServiceField} totalGlasgow={selectedGlasgow} glasgowCategory={glasgowCategory} />
            <ServiceTreatmentForm form={serviceForm} update={updateServiceField} />
            <ServiceAdditionalSections
              parts={servicePartsState}
              availableParts={serviceParts}
              onAdd={handleAddServicePart}
              onRemove={handleRemoveServicePart}
              onChange={(id, contenido) => setServicePartsState((prev) => prev.map((part) => (part.id === id ? { ...part, contenido } : part)))}
            />
            <div className="actions-row wrap">
              <button type="button" className="btn btn-success" onClick={handleSaveService}>💾 Guardar servicio completo</button>
              <button type="button" className="btn btn-outline" onClick={resetServiceForm}>✖ Limpiar formulario</button>
              <button type="button" className="btn btn-outline" onClick={() => handlePrintService(null)}>🖨 Imprimir en PDF</button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleGenerateServiceNumber}>🔢 Generar N° auto</button>
            </div>
            <div className="status-row">{serviceValidation.length ? <span className={badgeClass('yellow')}>Pendiente: {serviceValidation.join(', ')}</span> : <span className={badgeClass('green')}>Formulario listo para guardar</span>}</div>
            {showLegacyServiceMarkup && <>
            <section className="card">
              <div className="card-titulo">Personal del turno y unidad</div>
              <div className="form-grid">
                <div className="campo">
                  <label htmlFor="sv-numero">Número de registro</label>
                  <input id="sv-numero" value={serviceForm.numero} onChange={(e) => updateServiceField('numero', e.target.value)} placeholder="Ej: 1234" />
                </div>
                <div className="campo">
                  <label htmlFor="sv-fecha">Fecha del servicio</label>
                  <input id="sv-fecha" type="date" value={serviceForm.fecha} onChange={(e) => updateServiceField('fecha', e.target.value)} />
                </div>
                <div className="campo">
                  <label htmlFor="sv-unidad">Unidad despachada</label>
                  <select id="sv-unidad" value={serviceForm.unidad} onChange={(e) => updateServiceField('unidad', e.target.value)}>
                    <option value="">Seleccionar unidad...</option>
                    {ambulances.map((amb) => (
                      <option key={amb}>{amb}</option>
                    ))}
                  </select>
                </div>
                <div className="campo">
                  <label htmlFor="sv-piloto">Piloto</label>
                  <input id="sv-piloto" value={serviceForm.piloto} onChange={(e) => updateServiceField('piloto', e.target.value)} placeholder="Nombre del piloto" />
                </div>
                <div className="campo">
                  <label htmlFor="sv-bombero1">Bombero a cargo</label>
                  <input id="sv-bombero1" value={serviceForm.bombero1} onChange={(e) => updateServiceField('bombero1', e.target.value)} placeholder="Nombre del bombero a cargo" />
                </div>
                <div className="campo">
                  <label htmlFor="sv-bombero2">Bombero asistente</label>
                  <input id="sv-bombero2" value={serviceForm.bombero2} onChange={(e) => updateServiceField('bombero2', e.target.value)} placeholder="Nombre del bombero asistente" />
                </div>
                <div className="campo">
                  <label htmlFor="sv-bombero3">Bombero asistente 2</label>
                  <input id="sv-bombero3" value={serviceForm.bombero3} onChange={(e) => updateServiceField('bombero3', e.target.value)} placeholder="Nombre del bombero asistente 2" />
                </div>
                <div className="campo">
                  <label htmlFor="sv-bombero4">Bombero asistente 3</label>
                  <input id="sv-bombero4" value={serviceForm.bombero4} onChange={(e) => updateServiceField('bombero4', e.target.value)} placeholder="Nombre del bombero asistente 3" />
                </div>
              </div>
            </section>

            <section className="card">
              <div className="card-titulo">Información del paciente</div>
              <div className="form-grid">
                <div className="campo">
                  <label htmlFor="sv-paciente">Nombre del paciente</label>
                  <input id="sv-paciente" value={serviceForm.paciente} onChange={(e) => updateServiceField('paciente', e.target.value)} placeholder="Nombre completo" />
                </div>
                <div className="campo">
                  <label>Edad</label>
                  <div className="dual-inputs">
                    <input type="number" min="0" max="120" value={serviceForm.edadAnos} onChange={(e) => updateServiceField('edadAnos', e.target.value)} placeholder="Años" />
                    <input type="number" min="0" max="11" value={serviceForm.edadMeses} onChange={(e) => updateServiceField('edadMeses', e.target.value)} placeholder="Meses" />
                  </div>
                  <small className="helper-text">Ingrese años, meses o ambos según corresponda.</small>
                </div>
                <div className="campo">
                  <label htmlFor="sv-genero">Género</label>
                  <select id="sv-genero" value={serviceForm.genero} onChange={(e) => updateServiceField('genero', e.target.value)}>
                    <option value="">Seleccionar...</option>
                    <option>Masculino</option>
                    <option>Femenino</option>
                    <option>Otro</option>
                  </select>
                </div>
                <div className="campo">
                  <label htmlFor="sv-telefono">Teléfono de contacto</label>
                  <input id="sv-telefono" value={serviceForm.telefono} onChange={(e) => updateServiceField('telefono', e.target.value)} placeholder="Número telefónico" />
                </div>
                <div className="campo form-full">
                  <label htmlFor="sv-direccion">Dirección del incidente</label>
                  <input id="sv-direccion" value={serviceForm.direccion} onChange={(e) => updateServiceField('direccion', e.target.value)} placeholder="Dirección exacta o referencia" />
                </div>
                <div className="campo">
                  <label htmlFor="sv-motivo">Motivo de consulta / diagnóstico</label>
                  <textarea id="sv-motivo" rows={3} value={serviceForm.motivo} onChange={(e) => updateServiceField('motivo', e.target.value)} placeholder="Describe el motivo de la llamada y situación inicial..." />
                </div>
                <div className="campo">
                  <label htmlFor="sv-medicamentos">Medicamentos que toma</label>
                  <textarea id="sv-medicamentos" rows={3} value={serviceForm.medicamentos} onChange={(e) => updateServiceField('medicamentos', e.target.value)} placeholder="Listado de medicamentos que usa el paciente..." />
                </div>
                <div className="campo">
                  <label htmlFor="sv-alergias">Alergias conocidas</label>
                  <textarea id="sv-alergias" rows={2} value={serviceForm.alergias} onChange={(e) => updateServiceField('alergias', e.target.value)} placeholder="Alergias a medicamentos, alimentos, etc." />
                </div>
              </div>
            </section>

            <section className="card">
              <div className="card-titulo">Signos vitales</div>
              <div className="form-grid-2">
                <div className="campo">
                  <label htmlFor="sv-hora-sv">Hora de toma</label>
                  <input id="sv-hora-sv" type="time" value={serviceForm.horaSv} onChange={(e) => updateServiceField('horaSv', e.target.value)} />
                </div>
              </div>
              <div className="vitals-grid">
                <div className="campo"><label htmlFor="sv-fc">Frecuencia cardíaca (lpm)</label><input id="sv-fc" type="number" value={serviceForm.fc} onChange={(e) => updateServiceField('fc', e.target.value)} placeholder="60-100" /></div>
                <div className="campo"><label htmlFor="sv-fr">Frecuencia resp. (rpm)</label><input id="sv-fr" type="number" value={serviceForm.fr} onChange={(e) => updateServiceField('fr', e.target.value)} placeholder="12-20" /></div>
                <div className="campo"><label htmlFor="sv-pa">Presión arterial</label><input id="sv-pa" value={serviceForm.pa} onChange={(e) => updateServiceField('pa', e.target.value)} placeholder="120/80" /></div>
                <div className="campo"><label htmlFor="sv-spo2">SpO2 (%)</label><input id="sv-spo2" type="number" min="0" max="100" value={serviceForm.spo2} onChange={(e) => updateServiceField('spo2', e.target.value)} placeholder="95-100" /></div>
                <div className="campo"><label htmlFor="sv-glicemia">Glicemia (mg/dL)</label><input id="sv-glicemia" type="number" value={serviceForm.glicemia} onChange={(e) => updateServiceField('glicemia', e.target.value)} placeholder="70-140" /></div>
                <div className="campo"><label htmlFor="sv-temp">Temperatura (°C)</label><input id="sv-temp" type="number" step="0.1" value={serviceForm.temp} onChange={(e) => updateServiceField('temp', e.target.value)} placeholder="36.5" /></div>
              </div>
            </section>

            <section className="card">
              <div className="card-titulo">Tiempos de atención</div>
              <div className="form-grid-2">
                <div className="campo"><label htmlFor="sv-llamada">Hora de llamada</label><input id="sv-llamada" type="time" value={serviceForm.llamada} onChange={(e) => updateServiceField('llamada', e.target.value)} /></div>
                <div className="campo"><label htmlFor="sv-despacho">Hora de despacho</label><input id="sv-despacho" type="time" value={serviceForm.despacho} onChange={(e) => updateServiceField('despacho', e.target.value)} /></div>
                <div className="campo"><label htmlFor="sv-arribo">Hora de arribo al lugar</label><input id="sv-arribo" type="time" value={serviceForm.arribo} onChange={(e) => updateServiceField('arribo', e.target.value)} /></div>
                <div className="campo"><label htmlFor="sv-ingreso">Hora de ingreso a estación</label><input id="sv-ingreso" type="time" value={serviceForm.ingreso} onChange={(e) => updateServiceField('ingreso', e.target.value)} /></div>
              </div>
            </section>

            <section className="card">
              <div className="card-titulo">Estado mental y pupilas</div>
              <div className="form-grid-2">
                <div className="campo">
                  <span className="field-label">Estado mental</span>
                  <div className="checkbox-group">
                    {estadoMentalOptions.map((option) => (
                      <label key={option} className="option">
                        <input type="checkbox" checked={serviceForm.estadoMental.includes(option)} onChange={() => updateServiceField('estadoMental', toggleValue(serviceForm.estadoMental, option))} />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="campo">
                  <span className="field-label">Pupilas</span>
                  <div className="checkbox-group">
                    {pupilasOptions.map((option) => (
                      <label key={option} className="option">
                        <input type="checkbox" checked={serviceForm.pupilas.includes(option)} onChange={() => updateServiceField('pupilas', toggleValue(serviceForm.pupilas, option))} />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="card">
              <div className="card-titulo">Escala de Glasgow</div>
              <div className="glasgow-grid">
                <div className="glasgow-column">
                  <h3>Ocular</h3>
                  {[
                    [1, 'Ninguno'],
                    [2, 'Al dolor'],
                    [3, 'Verbal'],
                    [4, 'Espontáneo'],
                  ].map(([value, label]) => (
                    <label key={value as number}>
                      <input type="radio" name="glasgow-ocular" checked={serviceForm.glasgow.ocular === String(value)} onChange={() => updateServiceField('glasgow', { ...serviceForm.glasgow, ocular: String(value) })} />
                      {value} - {label}
                    </label>
                  ))}
                </div>
                <div className="glasgow-column">
                  <h3>Verbal</h3>
                  {[
                    [1, 'Ninguno'],
                    [2, 'Balbuceo'],
                    [3, 'Palabras'],
                    [4, 'Confuso'],
                    [5, 'Orientado'],
                  ].map(([value, label]) => (
                    <label key={value as number}>
                      <input type="radio" name="glasgow-verbal" checked={serviceForm.glasgow.verbal === String(value)} onChange={() => updateServiceField('glasgow', { ...serviceForm.glasgow, verbal: String(value) })} />
                      {value} - {label}
                    </label>
                  ))}
                </div>
                <div className="glasgow-column">
                  <h3>Motora</h3>
                  {[
                    [1, 'No responde'],
                    [2, 'Extensión'],
                    [3, 'Flexión'],
                    [4, 'Retira'],
                    [5, 'Localiza'],
                    [6, 'Obedece'],
                  ].map(([value, label]) => (
                    <label key={value as number}>
                      <input type="radio" name="glasgow-motora" checked={serviceForm.glasgow.motora === String(value)} onChange={() => updateServiceField('glasgow', { ...serviceForm.glasgow, motora: String(value) })} />
                      {value} - {label}
                    </label>
                  ))}
                </div>
                <div className="glasgow-total-box">
                  <strong>{selectedGlasgow || '---'}</strong>
                  <span>Total Glasgow</span>
                  <small>{glasgowCategory(selectedGlasgow)}</small>
                </div>
              </div>
            </section>

            <section className="card">
              <div className="card-titulo">Test de Cincinnati</div>
              <div className="form-grid-2">
                <div className="campo">
                  <span className="field-label">Asimetría facial</span>
                  <div className="checkbox-group">
                    {['Der.', 'Izq.'].map((item) => (
                      <label key={item} className="option">
                        <input type="checkbox" checked={serviceForm.cincinnati.facial.includes(item)} onChange={() => updateServiceField('cincinnati', { ...serviceForm.cincinnati, facial: toggleValue(serviceForm.cincinnati.facial, item) })} />
                        {item}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="campo">
                  <span className="field-label">Descenso del brazo</span>
                  <div className="checkbox-group">
                    {['Der.', 'Izq.'].map((item) => (
                      <label key={item} className="option">
                        <input type="checkbox" checked={serviceForm.cincinnati.brazo.includes(item)} onChange={() => updateServiceField('cincinnati', { ...serviceForm.cincinnati, brazo: toggleValue(serviceForm.cincinnati.brazo, item) })} />
                        {item}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="campo form-full">
                  <span className="field-label">Habla anormal</span>
                  <div className="checkbox-group">
                    {['Si', 'No'].map((item) => (
                      <label key={item} className="option">
                        <input type="checkbox" checked={serviceForm.cincinnati.habla.includes(item)} onChange={() => updateServiceField('cincinnati', { ...serviceForm.cincinnati, habla: toggleValue(serviceForm.cincinnati.habla, item) })} />
                        {item}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="card">
              <div className="card-titulo">Antecedentes médicos</div>
              <div className="form-grid-2">
                <div className="campo">
                  <span className="field-label">Antecedentes</span>
                  <div className="checkbox-group">
                    {antecedentesOptions.map((option) => (
                      <label key={option} className="option">
                        <input type="checkbox" checked={serviceForm.antecedentes.includes(option)} onChange={() => updateServiceField('antecedentes', toggleValue(serviceForm.antecedentes, option))} />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="campo">
                  <label htmlFor="sv-otros-ant">Otros antecedentes</label>
                  <textarea id="sv-otros-ant" rows={5} value={serviceForm.otrosAntecedentes} onChange={(e) => updateServiceField('otrosAntecedentes', e.target.value)} placeholder="Otros antecedentes médicos relevantes..." />
                </div>
              </div>
            </section>

            <section className="card">
              <div className="card-titulo">Hallazgos notables por región</div>
              <div className="form-grid-2">
                <div className="campo">
                  <span className="field-label">Lesiones y hallazgos</span>
                  <div className="checkbox-group column-group">
                    {hallazgosOptions.map((option) => (
                      <label key={option} className="option">
                        <input type="checkbox" checked={serviceForm.hallazgos.includes(option)} onChange={() => updateServiceField('hallazgos', toggleValue(serviceForm.hallazgos, option))} />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="campo">
                  <span className="field-label">Tipo de emergencia</span>
                  <div className="radio-group column-group">
                    {tipoEmergenciaOptions.map((option) => (
                      <label key={option} className="option">
                        <input type="radio" name="tipoEmergencia" checked={serviceForm.tipoEmergencia === option} onChange={() => updateServiceField('tipoEmergencia', option)} />
                        {option}
                      </label>
                    ))}
                  </div>
                  <div className="subsection">
                    <span className="field-label">Vía administrativa</span>
                    <div className="checkbox-group column-group">
                      {viaAdministrativaOptions.map((option) => (
                        <label key={option} className="option">
                          <input type="checkbox" checked={serviceForm.viaAdministrativa.includes(option)} onChange={() => updateServiceField('viaAdministrativa', toggleValue(serviceForm.viaAdministrativa, option))} />
                          {option}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="card">
              <div className="card-titulo">Oxigenoterapia</div>
              <div className="form-grid-2">
                <div className="campo">
                  <span className="field-label">Tipo de oxigenoterapia</span>
                  <div className="checkbox-group column-group">
                    {oxigenoterapiaOptions.map((option) => (
                      <label key={option} className="option">
                        <input type="checkbox" checked={serviceForm.oxigenoterapia.includes(option)} onChange={() => updateServiceField('oxigenoterapia', toggleValue(serviceForm.oxigenoterapia, option))} />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="form-grid">
                  <div className="campo">
                    <label htmlFor="sv-o2-lpm">LPM (litros por minuto)</label>
                    <input id="sv-o2-lpm" type="number" min="0" value={serviceForm.o2Lpm} onChange={(e) => updateServiceField('o2Lpm', e.target.value)} placeholder="0" />
                  </div>
                  <div className="campo">
                    <label htmlFor="sv-o2-fio2">FiO2 (%)</label>
                    <input id="sv-o2-fio2" type="number" min="0" max="100" value={serviceForm.o2FiO2} onChange={(e) => updateServiceField('o2FiO2', e.target.value)} placeholder="0" />
                  </div>
                </div>
              </div>
            </section>

            <section className="card">
              <div className="card-titulo">Tratamiento realizado</div>
              <div className="form-grid-2">
                <div className="campo">
                  <span className="field-label">Procedimientos realizados</span>
                  <div className="checkbox-group column-group">
                    {tratamientoOptions.map((option) => (
                      <label key={option} className="option">
                        <input type="checkbox" checked={serviceForm.tratamiento.includes(option)} onChange={() => updateServiceField('tratamiento', toggleValue(serviceForm.tratamiento, option))} />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="campo">
                  <label htmlFor="sv-otros-trat">Otros tratamientos</label>
                  <textarea id="sv-otros-trat" rows={4} value={serviceForm.otrosTratamientos} onChange={(e) => updateServiceField('otrosTratamientos', e.target.value)} placeholder="Otros procedimientos realizados..." />
                </div>
              </div>
            </section>

            <section className="card dashed-card">
              <div className="card-titulo">Añadir secciones adicionales al informe</div>
              <div className="actions-row wrap">
                {serviceParts.map((part) => (
                  <button key={part} type="button" className="btn btn-outline btn-sm" onClick={() => handleAddServicePart(part)}>
                    ➕ {part}
                  </button>
                ))}
              </div>
              <div className="parts-list">
                {servicePartsState.map((part) => (
                  <div key={part.id} className="part-card">
                    <button type="button" className="part-remove" onClick={() => handleRemoveServicePart(part.id)}>
                      ✕ Quitar
                    </button>
                    <div className="card-titulo inner-title">{part.titulo}</div>
                    <div className="campo">
                      <label>Contenido</label>
                      <textarea rows={4} value={part.contenido} onChange={(e) => setServicePartsState((prev) => prev.map((current) => (current.id === part.id ? { ...current, contenido: e.target.value } : current)))} placeholder={`${part.titulo}...`} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="actions-row wrap">
              <button type="button" className="btn btn-success" onClick={handleSaveService}>
                💾 Guardar servicio completo
              </button>
              <button type="button" className="btn btn-outline" onClick={resetServiceForm}>
                ✖ Limpiar formulario
              </button>
              <button type="button" className="btn btn-outline" onClick={() => handlePrintService(null)}>
                🖨 Imprimir en PDF
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleGenerateServiceNumber}>
                🔢 Generar N° auto
              </button>
            </div>

            <div className="status-row">{serviceValidation.length ? <span className={badgeClass('yellow')}>Pendiente: {serviceValidation.join(', ')}</span> : <span className={badgeClass('green')}>Formulario listo para guardar</span>}</div>
            </>}

            <section className="card">
              <div className="card-titulo card-titulo-row">
                <span>Servicios registrados</span>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => handleExportCsv('servicios')}>
                  ⬇ Exportar CSV
                </button>
              </div>
              <div className="toolbar">
                <input value={serviceSearch} onChange={(e) => setServiceSearch(e.target.value)} placeholder="🔍 Buscar por paciente, piloto, fecha..." />
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>N° Servicio</th>
                      <th>Fecha</th>
                      <th>Paciente</th>
                      <th>Edad</th>
                      <th>Unidad</th>
                      <th>Piloto</th>
                      <th>Bombero a cargo</th>
                      <th>Motivo</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceFiltered.length ? (
                      serviceFiltered.map((service) => (
                        <tr key={service.id}>
                          <td>
                            <strong>{service.numero}</strong>
                          </td>
                          <td>{formatDate(service.fecha)}</td>
                          <td>{service.paciente}</td>
                          <td>{service.edad || '-'}</td>
                          <td>{service.unidad || '-'}</td>
                          <td>{service.piloto || '-'}</td>
                          <td>{service.bombero1 || '-'}</td>
                          <td className="ellipsis-cell" title={service.motivo}>
                            {service.motivo || '-'}
                          </td>
                          <td>
                            <div className="inline-actions">
                              <button type="button" className="btn btn-primary btn-sm" onClick={() => handleOpenService(service)}>
                                👁 Ver
                              </button>
                              <button type="button" className="btn btn-outline btn-sm danger-text" onClick={() => handleDeleteService(service.id)}>
                                🗑
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={9}>
                          <div className="empty-state">No hay servicios registrados.</div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </DashboardSection>
          </div>
        )}

        {activeTab === 'bodega' && (
          <DashboardSection title="Bodega" subtitle="Gestión centralizada de depósito y almacén">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-valor">{bodegaStats.total}</div>
                <div className="stat-label">Productos diferentes</div>
              </div>
              <div className="stat-card stat-accent-green">
                <div className="stat-valor">{bodegaStats.totalUnits}</div>
                <div className="stat-label">Unidades totales</div>
              </div>
              <div className="stat-card stat-accent-blue">
                <div className="stat-valor">{bodegaStats.categories}</div>
                <div className="stat-label">Categorías</div>
              </div>
            </div>

            <section className="card">
              <div className="card-titulo">Registrar nuevo producto</div>
              <div className="form-grid">
                <div className="campo">
                  <label htmlFor="bod-nombre">Nombre del producto</label>
                  <input id="bod-nombre" value={bodegaForm.nombre} onChange={(e) => setBodegaForm((prev) => ({ ...prev, nombre: e.target.value }))} placeholder="Nombre del producto" />
                </div>
                <div className="campo">
                  <label htmlFor="bod-categoria">Categoría</label>
                  <select id="bod-categoria" value={bodegaForm.categoria} onChange={(e) => setBodegaForm((prev) => ({ ...prev, categoria: e.target.value }))}>
                    <option value="">Seleccionar categoría...</option>
                    {bodegaCategories.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div className="campo form-full">
                  <label htmlFor="bod-descripcion">Descripción del producto</label>
                  <textarea id="bod-descripcion" rows={2} value={bodegaForm.descripcion} onChange={(e) => setBodegaForm((prev) => ({ ...prev, descripcion: e.target.value }))} placeholder="Describe el producto, especificaciones, marca, etc." />
                </div>
                <div className="campo">
                  <label htmlFor="bod-cantidad">Cantidad (unidades)</label>
                  <input id="bod-cantidad" type="number" min="0" value={bodegaForm.cantidad} onChange={(e) => setBodegaForm((prev) => ({ ...prev, cantidad: e.target.value }))} placeholder="0" />
                </div>
                <div className="campo">
                  <label htmlFor="bod-fecha">Fecha de ingreso</label>
                  <input id="bod-fecha" type="date" value={bodegaForm.fechaIngreso} onChange={(e) => setBodegaForm((prev) => ({ ...prev, fechaIngreso: e.target.value }))} />
                </div>
                <div className="campo">
                  <label htmlFor="bod-obs">Observaciones</label>
                  <input id="bod-obs" value={bodegaForm.obs} onChange={(e) => setBodegaForm((prev) => ({ ...prev, obs: e.target.value }))} placeholder="Notas adicionales (opcional)" />
                </div>
              </div>
              <div className="actions-row">
                <button type="button" className="btn btn-primary" onClick={handleAddBodega}>
                  💾 Guardar producto
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setBodegaForm(createBodegaForm())}>
                  ✖ Limpiar
                </button>
              </div>
            </section>

            <section className="card">
              <div className="card-titulo">Buscar productos</div>
              <div className="toolbar">
                <input value={bodegaSearch} onChange={(e) => setBodegaSearch(e.target.value)} placeholder="🔍 Buscar por nombre, descripción o categoría..." />
                <select value={bodegaCategoryFilter} onChange={(e) => setBodegaCategoryFilter(e.target.value)}>
                  <option value="">Todas las categorías</option>
                  {bodegaCategories.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </div>
            </section>

            <section className="card">
              <div className="card-titulo">Productos registrados</div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Categoría</th>
                      <th>Descripción</th>
                      <th>Cantidad</th>
                      <th>Fecha de ingreso</th>
                      <th>Observaciones</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bodegaFiltered.length ? (
                      bodegaFiltered.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <strong>{item.nombre}</strong>
                          </td>
                          <td>
                            <span className={badgeClass('gray')}>{item.categoria}</span>
                          </td>
                          <td>{item.descripcion || '-'}</td>
                          <td className="center-cell">{item.cantidad}</td>
                          <td>{formatDate(item.fechaIngreso)}</td>
                          <td>{item.obs || '-'}</td>
                          <td>
                            <button type="button" className="btn btn-outline btn-sm danger-text" onClick={() => handleDeleteBodega(item.id)}>
                              🗑
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7}>
                          <div className="empty-state">No hay productos registrados en bodega.</div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </DashboardSection>
        )}
      </main>

      {selectedService && (
        <div className="modal-overlay abierto" role="presentation" onClick={() => setSelectedService(null)}>
          <div className="modal" role="dialog" aria-modal="true" aria-label="Detalle del servicio" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span>Detalle del servicio</span>
              <button type="button" className="close-btn" onClick={() => setSelectedService(null)}>
                ✕
              </button>
            </div>
            <div className="service-detail">
              <div className="service-meta-grid">
                <div><strong>N° Servicio</strong><span>{selectedService.numero}</span></div>
                <div><strong>Fecha</strong><span>{formatDate(selectedService.fecha)}</span></div>
                <div><strong>Unidad</strong><span>{selectedService.unidad || '-'}</span></div>
                <div><strong>Piloto</strong><span>{selectedService.piloto || '-'}</span></div>
                <div><strong>Bombero a cargo</strong><span>{selectedService.bombero1 || '-'}</span></div>
                <div><strong>Bombero asistente</strong><span>{selectedService.bombero2 || '-'}</span></div>
              </div>
              <div className="service-block">
                <strong>Paciente</strong>
                <span>{selectedService.paciente}</span>
              </div>
              <div className="service-block">
                <strong>Dirección</strong>
                <span>{selectedService.direccion || '-'}</span>
              </div>
              <div className="service-block">
                <strong>Motivo</strong>
                <span>{selectedService.motivo || '-'}</span>
              </div>
              <div className="service-columns">
                <div>
                  <strong>Estado mental</strong>
                  <span>{selectedService.estadoMental.join(', ') || '-'}</span>
                </div>
                <div>
                  <strong>Pupilas</strong>
                  <span>{selectedService.pupilas.join(', ') || '-'}</span>
                </div>
                <div>
                  <strong>Glasgow</strong>
                  <span>{selectedService.totalGlasgow} ({selectedService.categoriaGlasgow})</span>
                </div>
                <div>
                  <strong>Oxigenoterapia</strong>
                  <span>{selectedService.oxigenoterapia.join(', ') || '-'}</span>
                </div>
              </div>
              <div className="service-block">
                <strong>Observaciones</strong>
                <span>{selectedService.observaciones || '-'}</span>
              </div>
              {selectedService.partes.map((part) => (
                <div key={part.id} className="service-extra">
                  <strong>{part.titulo}</strong>
                  <span>{part.contenido || '-'}</span>
                </div>
              ))}
            </div>
            <div className="actions-row">
              <button type="button" className="btn btn-outline" onClick={() => handlePrintService(selectedService)}>
                🖨 Imprimir
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setSelectedService(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
