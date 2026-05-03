import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ProductModel } from '../models/product/product-model';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private readonly STORAGE_KEY = 'favorites';
  private favoritesSubject = new BehaviorSubject<ProductModel[]>(this.loadFavorites());
  public favorites$ = this.favoritesSubject.asObservable();
  private favoritesVisibleSubject = new BehaviorSubject<boolean>(false);
  private lastShowTime = 0;

  constructor() {}

  private loadFavorites(): ProductModel[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  private saveFavorites(favorites: ProductModel[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(favorites));
    this.favoritesSubject.next(favorites);
  }

  addToFavorites(product: ProductModel): boolean {
    const favorites = this.loadFavorites();
    if (favorites.find(p => p.productId === product.productId)) {
      return false; // כבר קיים
    }
    favorites.push(product);
    this.saveFavorites(favorites);
    return true; // נוסף בהצלחה
  }

  removeFromFavorites(productId: number): void {
    const favorites = this.loadFavorites().filter(p => p.productId !== productId);
    this.saveFavorites(favorites);
  }

  isFavorite(productId: number): boolean {
    return this.loadFavorites().some(p => p.productId === productId);
  }

  getFavorites(): ProductModel[] {
    return this.loadFavorites();
  }

  getFavoritesCount(): number {
    return this.loadFavorites().length;
  }

  clearFavorites(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.favoritesSubject.next([]);
  }

  updateRating(productId: number, rating: number): void {
    const favorites = this.loadFavorites();
    const product = favorites.find(p => p.productId === productId);
    if (product) {
      product.rating = rating;
      this.saveFavorites(favorites);
    }
  }

  getFavoritesVisible() {
    return this.favoritesVisibleSubject.asObservable();
  }

  showFavorites() {
    const now = Date.now();
    if (now - this.lastShowTime < 1000) return;
    this.lastShowTime = now;
    this.favoritesVisibleSubject.next(true);
  }

  hideFavorites() {
    this.favoritesVisibleSubject.next(false);
  }
}
