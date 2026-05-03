export interface PropertyInquiryCreateModel {
  productId: number;
  userId: number;
  ownerId: number;
  name: string;
  phone: string;
  email: string;
  message: string;
}

export interface PropertyInquiryModel {
  inquiryId: number;
  productId: number;
  productTitle: string;
  userId: number;
  userName: string;
  ownerId: number;
  ownerName: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  createdAt: Date;
  status: string;
}
