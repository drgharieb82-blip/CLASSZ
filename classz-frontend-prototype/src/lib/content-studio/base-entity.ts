/**
 * CLASSZ Content Studio — Base Entity Metadata
 *
 * Every entity in the Content Studio has a standard metadata envelope.
 * This is the single source of truth for frontend types.
 * Backend mirrors these fields in SQLAlchemy models.
 */

export type ContentStudioEntityType =
  | "subject" | "course" | "chapter" | "lesson" | "concept" | "atomic_concept"
  | "session" | "material" | "video_segment"
  | "question" | "quiz" | "exam" | "homework" | "assignment";

export type EntityStatus = "draft" | "published" | "archived" | "deleted";

export interface OwnershipInfo {
  ownerTeacherId: string;
  ownerTeacherCode: string;
}

export interface AuditActor {
  userId: string;
  publicCode: string;
  name: string;
}

export interface BaseEntityMetadata {
  internalUUID: string;
  publicCode: string;
  title: string;
  status: EntityStatus;

  createdBy: AuditActor;
  createdAt: string;

  updatedBy: AuditActor;
  updatedAt: string;

  publishedBy?: AuditActor;
  publishedAt?: string;

  archivedBy?: AuditActor;
  archivedAt?: string;

  ownership: OwnershipInfo;

  version: number;
  copiedFromEntityCode?: string;

  isOfficial: boolean;
  isCustom: boolean;

  tags: string[];
  notes: string;

  useCount: number;
  isFavorite: boolean;
}

export interface AuditEvent {
  id: string;
  entityType: ContentStudioEntityType;
  entityId: string;
  entityPublicCode: string;
  action: "created" | "updated" | "published" | "unpublished" | "archived" | "deleted" | "copied" | "moved" | "linked" | "unlinked" | "used_in_session" | "used_in_quiz";
  actor: AuditActor;
  createdAt: string;
  details?: string;
}

const DEFAULT_ACTOR: AuditActor = {
  userId: "TCH-26-0001",
  publicCode: "TCH-26-0001",
  name: "Dr. Layla Hassan",
};

const DEFAULT_OWNERSHIP: OwnershipInfo = {
  ownerTeacherId: "TCH-26-0001",
  ownerTeacherCode: "TCH-26-0001",
};

export function createMockMetadata(publicCode: string, title: string): BaseEntityMetadata {
  const now = new Date().toISOString();
  return {
    internalUUID: crypto.randomUUID(),
    publicCode,
    title,
    status: "draft",
    createdBy: DEFAULT_ACTOR,
    createdAt: now,
    updatedBy: DEFAULT_ACTOR,
    updatedAt: now,
    ownership: DEFAULT_OWNERSHIP,
    version: 1,
    isOfficial: false,
    isCustom: true,
    tags: [],
    notes: "",
    useCount: 0,
    isFavorite: false,
  };
}

export function updateMetadata(meta: BaseEntityMetadata, actor?: AuditActor): BaseEntityMetadata {
  return {
    ...meta,
    updatedBy: actor || DEFAULT_ACTOR,
    updatedAt: new Date().toISOString(),
    version: meta.version + 1,
  };
}

export function publishMetadata(meta: BaseEntityMetadata, actor?: AuditActor): BaseEntityMetadata {
  const a = actor || DEFAULT_ACTOR;
  return { ...meta, status: "published", publishedBy: a, publishedAt: new Date().toISOString(), updatedBy: a, updatedAt: new Date().toISOString() };
}

export function archiveMetadata(meta: BaseEntityMetadata, actor?: AuditActor): BaseEntityMetadata {
  const a = actor || DEFAULT_ACTOR;
  return { ...meta, status: "archived", archivedBy: a, archivedAt: new Date().toISOString(), updatedBy: a, updatedAt: new Date().toISOString() };
}

export function copyMetadata(meta: BaseEntityMetadata, newPublicCode: string, actor?: AuditActor): BaseEntityMetadata {
  const a = actor || DEFAULT_ACTOR;
  const now = new Date().toISOString();
  return {
    ...meta,
    internalUUID: crypto.randomUUID(),
    publicCode: newPublicCode,
    status: "draft",
    createdBy: a,
    createdAt: now,
    updatedBy: a,
    updatedAt: now,
    publishedBy: undefined,
    publishedAt: undefined,
    version: 1,
    copiedFromEntityCode: meta.publicCode,
    useCount: 0,
  };
}
