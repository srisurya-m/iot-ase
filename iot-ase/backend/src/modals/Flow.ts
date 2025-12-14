import mongoose, { Document, Schema } from "mongoose";

interface IFlow extends Document {
  _id: mongoose.Types.ObjectId; // required
  flow_duration: number;
  total_fwd_packets: number;
  total_bwd_packets: number;
  total_length_fwd_packets: number;
  total_length_bwd_packets: number;
  flow_bytes_s: number;
  flow_packets_s: number;
  protocol: "TCP" | "UDP" | "ICMP";
  label: "benign" | "DDoS" | "DoS" | "Probe" | "Exploit";
  createdAt: Date;
  updatedAt: Date;
}

const schema = new mongoose.Schema<IFlow>(
  {
    _id: {
      type: Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId(),
      required: true,
    },
    flow_duration: { type: Number, required: true },
    total_fwd_packets: { type: Number, required: true },
    total_bwd_packets: { type: Number, required: true },
    total_length_fwd_packets: { type: Number, required: true },
    total_length_bwd_packets: { type: Number, required: true },
    flow_bytes_s: { type: Number, required: true },
    flow_packets_s: { type: Number, required: true },
    protocol: {
      type: String,
      enum: ["TCP", "UDP", "ICMP"],
      required: true,
    },
    label: {
      type: String,
      enum: ["benign", "DDoS", "DoS", "Probe", "Exploit"],
      required: true,
    },
  },
  { timestamps: true }
);

export const Flow = mongoose.model<IFlow>("Flow", schema);
