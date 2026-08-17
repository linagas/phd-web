export interface QualityPulseClient {
  clientKey: string;
  clientName: string;
  registeredBy: string;
  createdAt: Date;
}

export class QualityPulseClientModel {
  static create(clientKey: string, clientName: string, registeredBy: string): QualityPulseClient {
    return {
      clientKey,
      clientName,
      registeredBy,
      createdAt: new Date(),
    };
  }
}
