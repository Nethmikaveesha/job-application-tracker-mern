import AuditLog from '../models/AuditLog.js';

function getIp(req) {
  return req?.ip || (req?.headers?.['x-forwarded-for'] || '').toString();
}

function getUserAgent(req) {
  return req?.get?.('user-agent') || '';
}

/**
 * Record an admin action into AuditLog (best-effort; never throws to the caller).
 */
export async function recordAudit({
  req,
  adminId,
  action,
  entityType,
  entityId,
  changes = {},
}) {
  try {
    if (!adminId) return;
    await AuditLog.create({
      admin: adminId,
      action,
      entityType,
      entityId,
      changes,
      ip: getIp(req),
      userAgent: getUserAgent(req),
    });
  } catch (err) {
    // Audit logging failures should never break the main request.
    // eslint-disable-next-line no-console
    console.error('AuditLog write failed:', err);
  }
}

