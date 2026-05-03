# 🏠 Real Estate Frontend

A modern real estate platform built with **Angular 21** and **PrimeNG**, allowing users to browse, filter, and book properties for sale, rent, or vacation.

---

## ✨ Features

- 🔍 **Property Search & Filtering** — Filter by city, type, price, rooms, and more
- 🏡 **Property Listings** — Browse properties for Sale, Rent, or Vacation
- 🛒 **Cart & Checkout** — Add properties to cart and complete bookings
- 📦 **Order History** — View and track all past orders with status timeline
- ❤️ **Favorites** — Save and manage favorite properties
- 👤 **User Profile** — Update personal details, manage listings, and change password
- 🏗️ **Add / Edit Properties** — Owners can publish and manage their own listings
- 💬 **Property Inquiries** — Send and receive inquiries about properties
- 🤖 **Chatbot** — Built-in assistant for user support
- 🛡️ **Admin Dashboard** — Full system management for admins
- 📝 **Blog** — Real estate tips and articles

---

## 🛠️ Tech Stack

| Technology | Version |
|---|---|
| Angular | 21.1 |
| PrimeNG | 21.1 |
| PrimeFlex | 4.0 |
| PrimeIcons | 7.0 |
| Chart.js | 4.5 |
| TypeScript | 5.9 |
| RxJS | 7.8 |
| Vitest | 4.0 |

---

## 🚀 Getting Started

### Prerequisites

- Node.js `>= 18`
- npm `>= 11`
- Angular CLI `>= 21`

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd Real-Estate-Frontend

# Install dependencies
npm install
```

### Running the App

```bash
ng serve
```

Navigate to `http://localhost:4200/` — the app reloads automatically on file changes.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── component/
│   │   ├── home-component/          # Landing page
│   │   ├── product-list-component/  # Property listings
│   │   ├── product-details-component/ # Single property view
│   │   ├── product-filter-component/  # Search & filters
│   │   ├── product-card-component/    # Property card UI
│   │   ├── cart-component/          # Shopping cart
│   │   ├── checkout-component/      # Checkout flow
│   │   ├── order-success-component/ # Order confirmation
│   │   ├── user-profile-component/  # User dashboard
│   │   ├── add-product-component/   # Add new listing
│   │   ├── edit-product-component/  # Edit listing
│   │   ├── favorites-component/     # Saved properties
│   │   ├── admin-dashboard-component/ # Admin panel
│   │   ├── chatbot-component/       # AI assistant
│   │   ├── blog-component/          # Blog & articles
│   │   ├── about-component/         # About page
│   │   ├── contact-component/       # Contact page
│   │   ├── auth/                    # Login & Register
│   │   ├── header-component/        # Navigation bar
│   │   ├── footer-component/        # Footer
│   │   ├── cart-sidebar/            # Slide-in cart
│   │   └── favorites-sidebar/       # Slide-in favorites
│   ├── models/                      # TypeScript interfaces & DTOs
│   ├── services/                    # API services
│   ├── guards/                      # Route guards
│   ├── config/                      # App configuration
│   └── utils/                       # Utility functions
└── styles.scss                      # Global styles
```

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `ng serve` | Start development server |
| `ng build` | Build for production |
| `ng test` | Run unit tests with Vitest |
| `ng build --watch` | Build and watch for changes |

---

## 🔐 Authentication

The app uses token-based authentication. Users can:
- Register / Login
- Update profile details
- Change password securely

Admin users have access to the full admin dashboard.

---

## 🌐 Backend

This frontend connects to a .NET backend API running at `https://localhost:44305`.  
Make sure the backend server is running before starting the frontend.
