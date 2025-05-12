import type { RuleCategory } from '@prisma/client';


export const leaseRules = [
  {
    title: 'Política de No Fumar',
    description: 'Se prohíbe estrictamente fumar dentro de la unidad y a 25 pies de cualquier entrada del edificio. Esto incluye cigarrillos electrónicos y dispositivos de vapeo.',
    category: 'SMOKING' as RuleCategory,
    isActive: true,
  },
  {
    title: 'Política de Mascotas',
    description: 'Se permiten mascotas con aprobación por escrito previa y un depósito adicional para mascotas. Máximo de 2 mascotas por unidad. Se aplican restricciones de raza. Alquiler mensual de $25 por mascota.',
    category: 'PETS' as RuleCategory,
    isActive: true,
  },
  {
    title: 'Horas de Silencio',
    description: 'Las horas de silencio son de 10:00 PM a 7:00 AM. Se prohíbe el ruido excesivo que moleste a otros residentes en todo momento.',
    category: 'NOISE' as RuleCategory,
    isActive: true,
  },
  {
    title: 'Política de Huéspedes',
    description: 'Los huéspedes que se queden más de 7 días consecutivos requieren aprobación por escrito. Ningún huésped puede quedarse más de 14 días en un período de 6 meses sin ser agregado al contrato de arrendamiento.',
    category: 'GUESTS' as RuleCategory,
    isActive: true,
  },
  {
    title: 'Reglas de Estacionamiento',
    description: 'A cada unidad se le asigna un espacio de estacionamiento. Los vehículos adicionales deben estacionarse en áreas designadas para visitantes. No se permiten vehículos inoperables ni reparaciones de vehículos.',
    category: 'PARKING' as RuleCategory,
    isActive: true,
  },
  // Reglas comerciales
  {
    title: 'Horarios de Operación',
    description: 'El local solo podrá operar dentro del horario autorizado: de 8:00 AM a 9:00 PM. Cualquier actividad fuera de este horario requiere aprobación previa por escrito.',
    category: 'BUSINESS_HOURS' as RuleCategory,
    isActive: true,
  },
  {
    title: 'Publicidad y Señalización',
    description: 'Toda publicidad, letreros o señalización exterior deben contar con la aprobación previa de la administración y cumplir con las normativas locales.',
    category: 'SIGNAGE' as RuleCategory,
    isActive: true,
  },
  {
    title: 'Uso de Áreas Comunes',
    description: 'Las áreas comunes deben mantenerse libres de obstrucciones y no pueden ser utilizadas para almacenamiento o actividades comerciales sin autorización.',
    category: 'COMMON_AREAS' as RuleCategory,
    isActive: true,
  },
  {
    title: 'Manejo de Residuos',
    description: 'Los residuos deben ser depositados en los contenedores designados y separados según el tipo. Está prohibido dejar basura fuera de los horarios establecidos para recolección.',
    category: 'WASTE_MANAGEMENT' as RuleCategory,
    isActive: true,
  },
  {
    title: 'Seguridad y Alarmas',
    description: 'El arrendatario es responsable de mantener cerradas las puertas y ventanas fuera del horario de operación y de activar los sistemas de alarma si existen.',
    category: 'SECURITY' as RuleCategory,
    isActive: true,
  },
  {
    title: 'Entregas y Carga/Descarga',
    description: 'Las entregas y actividades de carga/descarga deben realizarse únicamente en los horarios y áreas designadas por la administración.',
    category: 'DELIVERIES' as RuleCategory,
    isActive: true,
  },
  {
    title: 'Mantenimiento del Local',
    description: 'El arrendatario debe mantener el local en condiciones óptimas de limpieza y funcionamiento, notificando cualquier daño a la administración de inmediato.',
    category: 'MAINTENANCE' as RuleCategory,
    isActive: true,
  },
  {
    title: 'Control de Plagas',
    description: 'El arrendatario debe implementar medidas de control de plagas y reportar cualquier infestación a la administración.',
    category: 'PEST_CONTROL' as RuleCategory,
    isActive: true,
  },
  {
    title: 'Acceso de Personal y Visitantes',
    description: 'El acceso de personal y visitantes debe ser registrado y autorizado por el arrendatario. No se permite el acceso fuera del horario de operación sin autorización.',
    category: 'STAFF_ACCESS' as RuleCategory,
    isActive: true,
  },
]; 