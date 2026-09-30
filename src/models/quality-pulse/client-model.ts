export interface QualityPulseClient {
  clientKey: string;
  clientName: string;
  registeredBy: string;
  createdAt: Date;
  isPublished: boolean;
  publishedBy?: string;
  publishedAt?: Date;
  /** Soft delete: absent means the client is active. */
  deletedAt?: Date;
  deletedBy?: string;
}

export class QualityPulseClientModel {
  static create(clientKey: string, clientName: string, registeredBy: string): QualityPulseClient {
    return {
      clientKey,
      clientName,
      registeredBy,
      createdAt: new Date(),
      isPublished: false,
    };
  }
}
