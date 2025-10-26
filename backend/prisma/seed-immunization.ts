import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const philippineImmunizationSchedule = [
  // Birth
  { vaccineName: 'BCG', vaccineType: 'BCG', recommendedAge: 'Birth', ageInDays: 0, doseNumber: 1, description: 'Bacillus Calmette-Guérin vaccine against tuberculosis' },
  { vaccineName: 'Hepatitis B', vaccineType: 'Hepatitis B', recommendedAge: 'Birth', ageInDays: 0, doseNumber: 1, description: 'First dose of Hepatitis B vaccine' },
  
  // 6 weeks
  { vaccineName: 'DPT', vaccineType: 'DPT', recommendedAge: '6 weeks', ageInDays: 42, doseNumber: 1, description: 'Diphtheria, Pertussis, Tetanus vaccine - 1st dose' },
  { vaccineName: 'OPV', vaccineType: 'OPV', recommendedAge: '6 weeks', ageInDays: 42, doseNumber: 1, description: 'Oral Polio Vaccine - 1st dose' },
  { vaccineName: 'Hepatitis B', vaccineType: 'Hepatitis B', recommendedAge: '6 weeks', ageInDays: 42, doseNumber: 2, description: 'Second dose of Hepatitis B vaccine' },
  { vaccineName: 'Hib', vaccineType: 'Hib', recommendedAge: '6 weeks', ageInDays: 42, doseNumber: 1, description: 'Haemophilus influenzae type b vaccine - 1st dose' },
  { vaccineName: 'PCV', vaccineType: 'PCV', recommendedAge: '6 weeks', ageInDays: 42, doseNumber: 1, description: 'Pneumococcal Conjugate Vaccine - 1st dose' },
  
  // 10 weeks
  { vaccineName: 'DPT', vaccineType: 'DPT', recommendedAge: '10 weeks', ageInDays: 70, doseNumber: 2, description: 'Diphtheria, Pertussis, Tetanus vaccine - 2nd dose' },
  { vaccineName: 'OPV', vaccineType: 'OPV', recommendedAge: '10 weeks', ageInDays: 70, doseNumber: 2, description: 'Oral Polio Vaccine - 2nd dose' },
  { vaccineName: 'Hib', vaccineType: 'Hib', recommendedAge: '10 weeks', ageInDays: 70, doseNumber: 2, description: 'Haemophilus influenzae type b vaccine - 2nd dose' },
  { vaccineName: 'PCV', vaccineType: 'PCV', recommendedAge: '10 weeks', ageInDays: 70, doseNumber: 2, description: 'Pneumococcal Conjugate Vaccine - 2nd dose' },
  
  // 14 weeks
  { vaccineName: 'DPT', vaccineType: 'DPT', recommendedAge: '14 weeks', ageInDays: 98, doseNumber: 3, description: 'Diphtheria, Pertussis, Tetanus vaccine - 3rd dose' },
  { vaccineName: 'OPV', vaccineType: 'OPV', recommendedAge: '14 weeks', ageInDays: 98, doseNumber: 3, description: 'Oral Polio Vaccine - 3rd dose' },
  { vaccineName: 'Hepatitis B', vaccineType: 'Hepatitis B', recommendedAge: '14 weeks', ageInDays: 98, doseNumber: 3, description: 'Third dose of Hepatitis B vaccine' },
  { vaccineName: 'Hib', vaccineType: 'Hib', recommendedAge: '14 weeks', ageInDays: 98, doseNumber: 3, description: 'Haemophilus influenzae type b vaccine - 3rd dose' },
  { vaccineName: 'PCV', vaccineType: 'PCV', recommendedAge: '14 weeks', ageInDays: 98, doseNumber: 3, description: 'Pneumococcal Conjugate Vaccine - 3rd dose' },
  
  // 9 months
  { vaccineName: 'Measles', vaccineType: 'Measles', recommendedAge: '9 months', ageInDays: 270, doseNumber: 1, description: 'Measles vaccine - 1st dose' },
  
  // 12 months
  { vaccineName: 'MMR', vaccineType: 'MMR', recommendedAge: '12 months', ageInDays: 365, doseNumber: 1, description: 'Measles, Mumps, Rubella vaccine - 1st dose' },
  { vaccineName: 'PCV', vaccineType: 'PCV', recommendedAge: '12 months', ageInDays: 365, doseNumber: 4, description: 'Pneumococcal Conjugate Vaccine - booster dose' },
];

async function seedImmunizationSchedule() {
  console.log('Seeding immunization schedule...');
  
  for (const schedule of philippineImmunizationSchedule) {
    await prisma.immunizationSchedule.upsert({
      where: {
        vaccineName_doseNumber_ageInDays: {
          vaccineName: schedule.vaccineName,
          doseNumber: schedule.doseNumber,
          ageInDays: schedule.ageInDays
        }
      },
      update: {},
      create: schedule
    });
  }
  
  console.log('Immunization schedule seeded successfully!');
}

if (require.main === module) {
  seedImmunizationSchedule()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export { seedImmunizationSchedule };