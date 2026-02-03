import { Schema, model, models } from 'mongoose';

export interface IServiceLine {
  serviceLineId: number;
  make: string;
  model: string;
  year: number;
  type?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const ServiceLineSchema = new Schema<IServiceLine>(
  {
    serviceLineId: {
      type: Number,
      required: true,
      unique: true,
    },
    make: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const ServiceLine = models.ServiceLine || model<IServiceLine>('ServiceLine', ServiceLineSchema);

export default ServiceLine;
