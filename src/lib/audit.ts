import connectToDatabase from './mongodb';
import AuditLog from '@/models/AuditLog';
import ActivityLog from '@/models/ActivityLog';

export interface AuditPayload {
  action: string;
  entityType: string;
  entityId?: string;
  performedBy: string;
  performerName: string;
  performerRole: string;
  details?: Record<string, unknown>;
}

export interface ActivityPayload {
  user: string;
  userName: string;
  userRole: string;
  action: string;
  description: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

export async function createAuditLog(payload: AuditPayload) {
  try {
    await connectToDatabase();
    await AuditLog.create(payload);
  } catch (error) {
    console.error('Audit log creation failed:', error);
  }
}

export async function createActivityLog(payload: ActivityPayload) {
  try {
    await connectToDatabase();
    await ActivityLog.create(payload);
  } catch (error) {
    console.error('Activity log creation failed:', error);
  }
}

