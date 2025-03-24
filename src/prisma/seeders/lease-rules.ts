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
]; 