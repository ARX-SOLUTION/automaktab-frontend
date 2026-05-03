export interface AuditLog {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: string;
  entityId: string;
  userId: string | null;
  changes: Record<string, unknown> | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    role: string;
    branchId: string | null;
  };
}

export interface AuditLogsResponse {
  data: AuditLog[];
  total: number;
  page: number;
  limit: number;
}
