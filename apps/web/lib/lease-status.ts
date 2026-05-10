import { LeaseStatus } from "@prisma/client";
import type { Lease } from "@prisma/client";

export function getEffectiveLeaseStatus(
  status: LeaseStatus,
  endDate: Date
): LeaseStatus {
  const now = new Date();

  const expirationThreshold = new Date(endDate);
  expirationThreshold.setHours(23, 59, 59, 999);

  if ((status === "ACTIVE" || status === "TERMINATION_REQUESTED") && now > expirationThreshold) {
    return "EXPIRED";
  }
  return status;
}

export function withEffectiveStatus<T extends Pick<Lease, "status" | "endDate">>(
  lease: T
): T & { effectiveStatus: LeaseStatus } {
  return {
    ...lease,
    effectiveStatus: getEffectiveLeaseStatus(lease.status, new Date(lease.endDate)),
  };
}
