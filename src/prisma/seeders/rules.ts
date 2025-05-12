import { RuleCategory } from '@prisma/client';


export const leaseRules = [
  {
    title: 'No Smoking Policy',
    description: 'Smoking is strictly prohibited inside the unit and within 25 feet of any building entrance. This includes e-cigarettes and vaping devices.',
    category: RuleCategory.SMOKING,
    isActive: true,
  },
  {
    title: 'Pet Policy',
    description: 'Pets are allowed with prior written approval and additional pet deposit. Maximum of 2 pets per unit. Breed restrictions apply. Monthly pet rent of $25 per pet.',
    category: RuleCategory.PETS,
    isActive: true,
  },
  {
    title: 'Quiet Hours',
    description: 'Quiet hours are from 10:00 PM to 7:00 AM. Excessive noise that disturbs other residents is prohibited at all times.',
    category: RuleCategory.NOISE,
    isActive: true,
  },
  {
    title: 'Guest Policy',
    description: 'Guests staying longer than 7 consecutive days require written approval. No guest may stay more than 14 days in any 6-month period without being added to the lease.',
    category: RuleCategory.GUESTS,
    isActive: true,
  },
  {
    title: 'Parking Rules',
    description: 'Each unit is assigned one parking space. Additional vehicles must be parked in designated visitor areas. No inoperable vehicles or vehicle repairs permitted.',
    category: RuleCategory.PARKING,
    isActive: true,
  },
];