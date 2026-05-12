import { z } from "zod";

const UserRoleEnum = z.enum(["LANDLORD", "TENANT"]);
const LeaseStatusEnum = z.enum(["ACTIVE", "PENDING", "TERMINATION_REQUESTED", "EXPIRED", "TERMINATED"]);
const PaymentStatusEnum = z.enum(["UPCOMING", "COMPLETED", "FAILED", "OVERDUE"]);

export const userSchema = z.object({
    id: z.string().cuid().optional(),
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().regex(/^\+?[\d\s-()]{7,20}$/, "Invalid phone number format").nullable().optional(),
    avatarUrl: z.string().url().nullable().optional(),
    walletAddress: z.string().nullable().optional(),
    role: UserRoleEnum.default("TENANT"),
    preferredCoin: z.string().nullable().optional(),
    landlordBuildingId: z.string().nullable().optional(),
    landlordId: z.string().nullable().optional(),
});

export const tenantSchema = userSchema;
export type Tenant = z.infer<typeof tenantSchema>;

export const frontendRegistrationSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    role: UserRoleEnum.default("TENANT"),
    code: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.role === "TENANT" && (!data.code || data.code.trim().length === 0)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Invite code is required for tenants",
            path: ["code"],
        });
    }
});

export const baseRegistrationSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    role: UserRoleEnum.default("TENANT"),
    code: z.string().optional(),
    walletAddress: z.string().min(32).max(44),
    signature: z.array(z.number()),
    message: z.string(),
});

export const registrationSchema = baseRegistrationSchema;
export const landlordRegistrationSchema = baseRegistrationSchema.omit({ code: true });

export const buildingSchema = z.object({
    id: z.string().cuid().optional(),
    name: z.string().min(1, "Building name is required"),
    address: z.string().min(1, "Street address is required"),
    city: z.string().min(1, "City is required"),
    province: z.string().min(1, "Province is required"),
    postalCode: z.string().min(1, "Postal code is required"),
    landlordId: z.string().cuid().optional()
});

export const unitSchema = z.object({
    id: z.string().cuid().optional(),
    buildingId: z.string().cuid("Building ID is required"),
    unitNumber: z.string().min(1, "Unit number is required"),
    bedrooms: z.number().int().min(0, "Bedrooms must be non-negative"),
    bathrooms: z.number().int().min(0, "Bathrooms must be non-negative"),
    squareFeet: z.number().int().nullable().optional(),
    rentAmount: z.number().positive("Rent must be positive"),
    occupied: z.boolean().default(false),
});

export const leaseSchema = z.object({
    id: z.string().cuid().optional(),
    tenantId: z.string().cuid("Tenant ID is required"),
    unitId: z.string().cuid("Unit ID is required"),
    monthlyRent: z.number().positive("Monthly rent must be positive"),
    depositAmount: z.number().nullable().optional(),
    stablecoin: z.string().default("USDC"),
    startDate: z.string().or(z.date()),
    endDate: z.string().or(z.date()),
    status: LeaseStatusEnum.default("PENDING"),
    autoPayEnabled: z.boolean().default(false),
    recurringApproved: z.boolean().default(false),
    leaseDocumentUrl: z.string().min(1).nullable().optional(),
    leaseNftMint: z.string().nullable().optional(),
});

export const paymentSchema = z.object({
    id: z.string().cuid().optional(),
    leaseId: z.string().cuid("Lease ID is required"),
    buildingId: z.string().cuid("Building ID is required"),
    amount: z.number().positive("Amount must be positive"),
    stablecoin: z.string().default("USDC"),
    dueDate: z.string().or(z.date()),
    status: PaymentStatusEnum.default("UPCOMING"),
    transactionHash: z.string().nullable().optional(),
    nftReceiptMint: z.string().nullable().optional(),
    failureReason: z.string().nullable().optional(),
    recurringApproved: z.boolean().default(false),
});
