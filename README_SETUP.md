# How to Use This Template (Afra Tech Point)

This is a fully-functional modern e-commerce template built with Next.js, Firebase, and ImageKit.

## Local Setup (Step-by-Step)

### 1. Install Dependencies
Run the following command in the root folder:
```bash
npm install
```

### 2. Configure Environment Variables
- Copy `.env.example` to a new file named `.env.local`.
- Fill in your Firebase configuration from the Firebase Console.
- Fill in your ImageKit public/private keys.
- Set `NEXT_PUBLIC_USE_FIREBASE=true` if you want to use the cloud database.

### 3. Initialize Firebase Collections
You will need to create the following collections in your Firestore:
- `products`
- `config` (Create a document named `main` here)
- `orders`
- `users`
- `notifications`

### 4. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see your shop.

## Admin Access
To become an admin, registry first, and then either:
- Manually change your role in Firestore to `admin`.
- Or list your email in your `.env.local`'s `ADMIN_EMAIL` variable.

## Key Features Included:
- **Server-Side Rendering (SSR)** for fast LCP.
- **ImageKit Integration** for dynamic image resizing.
- **Admin Panel** for product and inventory management.
- **Vercel Optimized** build configuration.
