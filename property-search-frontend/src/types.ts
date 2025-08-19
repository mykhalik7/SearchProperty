export type Space = {
  id?: number;
  propertyId?: number;
  type: 'bedroom' | 'kitchen' | 'bathroom' | 'living room';
  size: number;
  description?: string;
}
export type Property = {
  id?: number;
  address: string;
  type: 'house' | 'apartment' | 'condo';
  price: number;
  description?: string;
  spaces?: Space[];
}
