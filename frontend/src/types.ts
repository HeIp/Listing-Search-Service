export interface Listing {
  id: string;
  source: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  latitude: number;
  longitude: number;
  listedDate: string;
  status: string;
  description: string;
  relevanceScore: number;
}

export interface SearchResponse {
  content: Listing[];
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}
