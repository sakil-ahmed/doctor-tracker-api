import { Doctor, Patient } from '../models';
import type { DashboardRange } from '../validators/dashboard.validator';

type DateRange = {
  from: Date;
  to: Date;
};

type TimeBucket = 'day' | 'week' | 'month';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const getRangeConfig = (
  range: DashboardRange
): { dateRange: DateRange; bucket: TimeBucket } => {
  const to = new Date();
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 180;
  const from = new Date(to.getTime() - days * MS_PER_DAY);
  const bucket: TimeBucket =
    range === '7d' ? 'day' : range === '30d' ? 'week' : 'month';

  return { dateRange: { from, to }, bucket };
};

const createdAtMatch = (dateRange: DateRange) => ({
  createdAt: { $gte: dateRange.from, $lte: dateRange.to },
});

const dateTruncUnit = (bucket: TimeBucket): 'day' | 'week' | 'month' => bucket;

export const getDashboardStats = async (range: DashboardRange) => {
  const { dateRange, bucket } = getRangeConfig(range);
  const patientMatch = createdAtMatch(dateRange);
  const monthStart = new Date(dateRange.to.getFullYear(), dateRange.to.getMonth(), 1);

  const [
    totalDoctors,
    totalPatients,
    newThisMonth,
    patientsPerDoctor,
    patientsOverTime,
    patientsByCondition,
    doctorsBySpecialization,
  ] = await Promise.all([
    Doctor.countDocuments(),
    Patient.countDocuments(),
    Patient.countDocuments({
      createdAt: { $gte: monthStart, $lte: dateRange.to },
    }),
    Patient.aggregate([
      { $match: patientMatch },
      {
        $group: {
          _id: '$doctor',
          patientCount: { $sum: 1 },
        },
      },
      { $sort: { patientCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'doctors',
          localField: '_id',
          foreignField: '_id',
          as: 'doctor',
        },
      },
      { $unwind: { path: '$doctor', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          doctorId: '$_id',
          patientCount: 1,
          name: '$doctor.name',
          specialization: '$doctor.specialization',
          hospital: '$doctor.hospital',
        },
      },
    ]),
    Patient.aggregate([
      { $match: patientMatch },
      {
        $group: {
          _id: {
            $dateTrunc: {
              date: '$createdAt',
              unit: dateTruncUnit(bucket),
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          period: '$_id',
          count: 1,
        },
      },
    ]),
    Patient.aggregate([
      { $match: patientMatch },
      {
        $group: {
          _id: '$condition',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      {
        $project: {
          _id: 0,
          condition: '$_id',
          count: 1,
        },
      },
    ]),
    Doctor.aggregate([
      {
        $group: {
          _id: '$specialization',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      {
        $project: {
          _id: 0,
          specialization: '$_id',
          count: 1,
        },
      },
    ]),
  ]);

  const avgPatientsPerDoctor =
    totalDoctors > 0
      ? Math.round((totalPatients / totalDoctors) * 10) / 10
      : 0;

  return {
    range,
    from: dateRange.from,
    to: dateRange.to,
    totalDoctors,
    totalPatients,
    avgPatientsPerDoctor,
    newThisMonth,
    patientsPerDoctor,
    patientsOverTime,
    patientsByCondition,
    doctorsBySpecialization,
  };
};
