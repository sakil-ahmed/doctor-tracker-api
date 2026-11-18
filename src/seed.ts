import mongoose from 'mongoose';
import { connectDB } from './config/db';
import { Doctor, Patient, User } from './models';
import type { PatientGender } from './models';

const SPECIALIZATIONS = [
  'Cardiology',
  'Dermatology',
  'Neurology',
  'Orthopedics',
  'Pediatrics',
  'Oncology',
  'Psychiatry',
  'Radiology',
  'Gastroenterology',
  'Endocrinology',
  'Pulmonology',
  'Nephrology',
  'Ophthalmology',
  'ENT',
  'General Medicine',
] as const;

const HOSPITALS = [
  'City General Hospital',
  'Sunrise Medical Center',
  'Green Valley Clinic',
  'Metro Health Institute',
  'Lakeside Hospital',
  'Central Care Hospital',
  'Riverfront Medical',
  'Hilltop Community Hospital',
] as const;

const CONDITIONS = [
  'Hypertension',
  'Type 2 Diabetes',
  'Asthma',
  'Migraine',
  'Arthritis',
  'Anxiety Disorder',
  'Chronic Back Pain',
  'Allergic Rhinitis',
  'Hypothyroidism',
  'Coronary Artery Disease',
  'GERD',
  'Anemia',
  'Pneumonia',
  'Skin Allergy',
  'Urinary Tract Infection',
  'Depression',
  'Osteoporosis',
  'Bronchitis',
  'Sinusitis',
  'Obesity',
] as const;

const FIRST_NAMES = [
  'James',
  'Mary',
  'John',
  'Patricia',
  'Robert',
  'Jennifer',
  'Michael',
  'Linda',
  'William',
  'Elizabeth',
  'David',
  'Barbara',
  'Richard',
  'Susan',
  'Joseph',
  'Jessica',
  'Thomas',
  'Sarah',
  'Charles',
  'Karen',
  'Aisha',
  'Omar',
  'Fatima',
  'Hassan',
  'Nadia',
  'Rahul',
  'Priya',
  'Chen',
  'Yuki',
  'Sofia',
] as const;

const LAST_NAMES = [
  'Smith',
  'Johnson',
  'Williams',
  'Brown',
  'Jones',
  'Garcia',
  'Miller',
  'Davis',
  'Rodriguez',
  'Martinez',
  'Hernandez',
  'Lopez',
  'Gonzalez',
  'Wilson',
  'Anderson',
  'Thomas',
  'Taylor',
  'Moore',
  'Jackson',
  'Martin',
  'Khan',
  'Patel',
  'Ahmed',
  'Ali',
  'Singh',
  'Wang',
  'Kim',
  'Nguyen',
  'Silva',
  'Costa',
] as const;

const GENDERS: PatientGender[] = ['male', 'female', 'other'];

const SIX_MONTHS_MS = 6 * 30 * 24 * 60 * 60 * 1000;

const pick = <T>(items: readonly T[]): T =>
  items[Math.floor(Math.random() * items.length)] as T;

const randomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const randomPhone = (): string =>
  `+1${String(randomInt(2000000000, 9999999999))}`;

const randomCreatedAtWithinLastSixMonths = (): Date => {
  const now = Date.now();
  const past = now - SIX_MONTHS_MS;
  return new Date(past + Math.random() * (now - past));
};

const randomPersonName = (): string => `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;

const seed = async (): Promise<void> => {
  await connectDB();

  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Doctor.deleteMany({}),
    Patient.deleteMany({}),
  ]);

  console.log('Creating admin user...');
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'Admin@123',
    role: 'admin',
  });

  console.log('Creating 30 doctors...');
  const doctorDocs = Array.from({ length: 30 }, (_, index) => {
    const name = randomPersonName();
    return {
      name,
      specialization: pick(SPECIALIZATIONS),
      hospital: pick(HOSPITALS),
      phone: randomPhone(),
      email: `doctor${index + 1}@example.com`,
      createdAt: randomCreatedAtWithinLastSixMonths(),
    };
  });

  const doctors = await Doctor.insertMany(doctorDocs);
  const doctorIds = doctors.map((doctor) => doctor._id);

  console.log('Creating 300 patients...');
  const patientDocs = Array.from({ length: 300 }, (_, index) => ({
    name: randomPersonName(),
    age: randomInt(1, 90),
    gender: pick(GENDERS),
    phone: randomPhone(),
    email: `patient${index + 1}@example.com`,
    condition: pick(CONDITIONS),
    doctor: pick(doctorIds),
    createdAt: randomCreatedAtWithinLastSixMonths(),
  }));

  await Patient.insertMany(patientDocs);

  console.log('Seed completed successfully:');
  console.log(`  Admin: ${admin.email}`);
  console.log(`  Doctors: ${doctors.length}`);
  console.log(`  Patients: ${patientDocs.length}`);

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch(async (error) => {
  console.error('Seed failed:', error);
  await mongoose.connection.close().catch(() => undefined);
  process.exit(1);
});
