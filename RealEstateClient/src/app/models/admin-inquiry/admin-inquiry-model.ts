export interface AdminInquiryCreateModel {
  userId?: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export interface AdminInquiryModel {
  inquiryId: number;
  userId?: number;
  userName: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  createdAt: Date;
  status: string;
}
