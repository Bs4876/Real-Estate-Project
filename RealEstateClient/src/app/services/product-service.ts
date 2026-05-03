import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductSummaryDTOModel, ProductCreateDTOModel, ProductUpdateDTOModel } from '../models/product/product-model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'https://localhost:44305/api/product';
  private serverUrl = 'https://localhost:44305';

  constructor(private http: HttpClient) {}

  getProducts(
    categoryIds: number[], 
    city: string | null, 
    minPrice: number | null, 
    maxPrice: number | null, 
    rooms: number | null, 
    beds: number | null, 
    position: number, 
    skip: number
  ): Observable<any> {
    let params = new HttpParams()
      .set('position', position.toString())
      .set('skip', skip.toString());

    if (categoryIds && categoryIds.length > 0) {
      categoryIds.forEach(id => {
        params = params.append('categoryIds', id.toString());
      });
    }
    if (city) params = params.set('city', city);
    if (minPrice) params = params.set('minPrice', minPrice.toString());
    if (maxPrice) params = params.set('maxPrice', maxPrice.toString());
    if (rooms) params = params.set('rooms', rooms.toString());
    if (beds) params = params.set('beds', beds.toString());

    return this.http.get<any>(this.apiUrl, { params });
  }

  getProductById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  checkAvailability(productId: number, startDate: Date, endDate: Date): Observable<boolean> {
    let params = new HttpParams()
      .set('productId', productId.toString())
      .set('start', startDate.toISOString())
      .set('end', endDate.toISOString());
    
    return this.http.get<boolean>(`${this.apiUrl}/check-availability`, { params });
  }

  createProduct(product: ProductCreateDTOModel): Observable<any> {
    return this.http.post<any>(this.apiUrl, product);
  }

  uploadImage(formData: FormData): Observable<string> {
    return this.http.post('https://localhost:44305/api/productimage/upload', formData, { responseType: 'text' });
  }

  addProductImage(imageData: any): Observable<any> {
    return this.http.post('https://localhost:44305/api/productimage', imageData);
  }

  deleteProductImage(imageId: number): Observable<any> {
    return this.http.delete(`https://localhost:44305/api/productimage/${imageId}`);
  }

getFullImageUrl(imageUrl: string): string {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http')) return imageUrl;
    return this.serverUrl + imageUrl;
  }

  updateProduct(id: number, productData: ProductUpdateDTOModel): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, productData);
  }

  getProductsByOwnerId(ownerId: number): Observable<ProductSummaryDTOModel[]> {
    console.log('ProductService: Fetching products for owner:', ownerId);
    const url = `${this.apiUrl}/owner/${ownerId}`;
    console.log('ProductService: Request URL:', url);
    return this.http.get<ProductSummaryDTOModel[]>(url);
  }

  searchProducts(query: string): Observable<ProductSummaryDTOModel[]> {
    const params = new HttpParams().set('query', query);
    return this.http.get<ProductSummaryDTOModel[]>(`${this.apiUrl}/search`, { params });
  }

  getFeaturedProducts(count: number = 5): Observable<ProductSummaryDTOModel[]> {
    const params = new HttpParams().set('count', count.toString());
    return this.http.get<ProductSummaryDTOModel[]>(`${this.apiUrl}/featured`, { params });
  }
}