import { Routes } from '@angular/router';
import { AuthComponent } from './component/auth/auth';
import { HomeComponent } from './component/home-component/home-component';
import { AboutComponent } from './component/about-component/about-component';
import { ProductListComponent } from './component/product-list-component/product-list-component';
import { ProductDetailsComponent } from './component/product-details-component/product-details-component';
import { AddProductComponent } from './component/add-product-component/add-product-component';
import { EditProductComponent } from './component/edit-product-component/edit-product-component';
import { UserProfileComponent } from './component/user-profile-component/user-profile-component';
import { AdminDashboardComponent } from './component/admin-dashboard-component/admin-dashboard-component';
import { CartComponent } from './component/cart-component/cart-component';
import { CheckoutComponent } from './component/checkout-component/checkout-component';
import { OrderSuccessComponent } from './component/order-success-component/order-success-component';
import { ContactComponent } from './component/contact-component/contact-component';
import { BlogComponent } from './component/blog-component/blog-component';
import { FavoritesComponent } from './component/favorites-component/favorites-component';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'blog', component: BlogComponent },
  { path: 'products', component: ProductListComponent },
  { path: 'auth', component: AuthComponent },
  { path: 'cart', component: CartComponent },
  { path: 'favorites', component: FavoritesComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'order-success', component: OrderSuccessComponent },
  { path: 'add-product', component: AddProductComponent },
  { path: 'edit-product/:id', component: EditProductComponent },
  { path: 'product-details/:id', component: ProductDetailsComponent },
  { path: 'profile', component: UserProfileComponent },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [adminGuard] },
  { path: '**', redirectTo: '' } 
];