import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type PatientGender = 'male' | 'female' | 'other';

export interface IPatient {
  name: string;
  age: number;
  gender: PatientGender;
  phone: string;
  email: string;
  condition: string;
  doctor: Types.ObjectId;
  createdAt: Date;
}

export interface IPatientDocument extends IPatient, Document {}

interface IPatientModel extends Model<IPatientDocument> {}

const patientSchema = new Schema<IPatientDocument, IPatientModel>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [0, 'Age cannot be negative'],
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: [true, 'Gender is required'],
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
    },
    condition: {
      type: String,
      required: [true, 'Condition is required'],
      trim: true,
    },
    doctor: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor is required'],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Full-text search on patient identity fields
patientSchema.index({ name: 'text', email: 'text' });

// Default list sort + date-range filters
patientSchema.index({ createdAt: -1 });

// Filter + sort patterns used by /api/patients
patientSchema.index({ condition: 1, createdAt: -1 });

// Nested doctor patient list: /api/doctors/:id/patients
patientSchema.index({ doctor: 1, createdAt: -1 });

// Combined doctor + condition filter
patientSchema.index({ doctor: 1, condition: 1, createdAt: -1 });

export const Patient = mongoose.model<IPatientDocument, IPatientModel>(
  'Patient',
  patientSchema
);
