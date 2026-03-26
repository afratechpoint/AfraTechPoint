# Vercel Deployment Guide

This folder contains a version of your project that is ready to be hosted on Vercel.

## 1. Prerequisites
- A Vercel account ([vercel.com](https://vercel.com)).
- A Firebase project with Firestore enabled.

## 2. Deployment Steps
1.  **Initialize Git**: If not already done, initialize a git repository in this folder.
    ```bash
    git init
    git add .
    git commit -m "Initial Vercel deployment"
    ```
2.  **Push to GitHub/GitLab**: Create a new repository on your preferred platform and push this code.
3.  **Import to Vercel**:
    - Go to your Vercel Dashboard.
    - Click "Add New" -> "Project".
    - Import your new repository.

## 3. Environment Variables (CRITICAL)
You **MUST** add the following environment variables in the Vercel Project Settings:

| Key | Value |
| :--- | :--- |
| `NEXT_PUBLIC_USE_FIREBASE` | `true` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | (Your Firebase API Key) |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | (Your Firebase Auth Domain) |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | (Your Firebase Project ID) |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | (Your Firebase Storage Bucket) |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | (Your Firebase Sender ID) |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | (Your Firebase App ID) |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `465` |
| `SMTP_USER` | (Your Email) |
| `SMTP_PASS` | (Your App Password) |
| `ADMIN_EMAIL` | (Your Admin Email) |

## 4. Why Use Firebase?
Vercel does not support local files (JSON) for saving data because its filesystem is temporary. By setting `NEXT_PUBLIC_USE_FIREBASE=true`, the app will automatically use your Firestore database for settings, products, and orders.

---
Build with precision by Antigravity
