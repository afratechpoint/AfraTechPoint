# 🚀 Vercel Deployment Guide - Afra Tech Point Ecommerce

এই গাইডে সম্পূর্ণ স্টেপ-বাই-স্টেপ দেখানো হয়েছে কিভাবে আপনার **Afra Tech Point** প্রোজেক্টটি গিটহাবে পুশ করে Vercel-এ লাইভ করবেন।

---

## 📌 ধাপ ১: গিটহাবে পুশ করা (Push to GitHub)

আমরা অলরেডি আপনার লোকাল প্রোজেক্টে Git ইনিশিয়ালাইজ করে সব ফাইল ক্লিন ও সিকিউরভাবে প্রথম কমিট (Commit) এর জন্য রেডি করে রেখেছি।

### কমান্ডগুলো চালান:

১. প্রথমে আপনার [GitHub](https://github.com/new) অ্যাকাউন্টে গিয়ে একটি **New Repository** তৈরি করুন (নাম দিতে পারেন: `afra-tech-point-ecommerce`)। রিপোজিটরিটি **Private** রাখা সবচেয়ে নিরাপদ।
২. আপনার টার্মিনালে নিচের কমান্ডগুলো রান করুন (আপনার গিটহাবের রিপো লিংক দিয়ে প্রতিস্থাপন করুন):

```bash
# রিমোট রিপোজিটরি যুক্ত করুন (YOUR_USERNAME এবং REPO_NAME পরিবর্তন করুন)
git remote add origin https://github.com/YOUR_USERNAME/afra-tech-point-ecommerce.git

# মেইন ব্রাঞ্চ পুশ করুন
git push -u origin main
```

*(যদি Windows Git পাথ না পায়, আপনি GitHub Desktop অ্যাপ দিয়েও এই ফোল্ডারটি ওপেন করে Publish repository করতে পারেন)*

---

## 📌 ধাপ ২: Vercel-এ ইমপোর্ট করা (Import Project to Vercel)

১. [vercel.com](https://vercel.com) এ লগইন করুন।
২. **Add New...** > **Project** এ ক্লিক করুন।
৩. গিটহাব থেকে আপনার রিপোজিটরিটি (`afra-tech-point-ecommerce`) সিলেক্ট করে **Import** এ ক্লিক করুন।
৪. **Framework Preset**: `Next.js` (অটোমেটিক ডিটেক্ট হবে)।
৫. **Root Directory**: `./` (ডিফল্ট থাকবে)।

---

## 📌 ধাপ ৩: Environment Variables যোগ করা (সবচেয়ে গুরুত্বপূর্ণ ধাপ)

Vercel ড্যাশবোর্ডে **"Environment Variables"** সেকশনে নিচের ভেরিয়েবলগুলো আপনার `.env.local` ফাইল থেকে কপি করে পেস্ট করুন:

| Variable Name | Description / Example |
| :--- | :--- |
| `NEXT_PUBLIC_SHOP_URL` | আপনার Vercel ডোমেইন (যেমন: `https://your-domain.vercel.app`) |
| `NEXT_PUBLIC_BASE_URL` | আপনার Vercel ডোমেইন (যেমন: `https://your-domain.vercel.app`) |
| `NEXT_PUBLIC_USE_FIREBASE` | `true` |
| `NEXT_PUBLIC_ADMIN_EMAILS` | `afratechpoint@gmail.com` |
| `ADMIN_EMAIL` | `afratechpoint@gmail.com` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | আপনার ফায়ারবেস API Key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `your-project.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | আপনার ফায়ারবেস Project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`| `your-project.firebasestorage.app` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | আপনার Sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | আপনার Firebase App ID |
| `NEXT_PUBLIC_FIREBASE_VAPID_KEY` | Firebase Cloud Messaging VAPID Key |
| `FIREBASE_PROJECT_ID` | Firebase Admin Project ID |
| `FIREBASE_CLIENT_EMAIL` | Firebase Admin Service Account Client Email |
| `FIREBASE_PRIVATE_KEY` | Firebase Admin Private Key (সম্পূর্ণ `-----BEGIN PRIVATE KEY----- ... -----END PRIVATE KEY-----` সহ) |
| `FIREBASE_DATABASE_URL` | Realtime Database URL (যদি ব্যবহার করেন) |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `465` |
| `SMTP_SECURE` | `true` |
| `SMTP_USER` | আপনার জিমেইল অ্যাড্রেস |
| `SMTP_PASS` | আপনার ১৬ অক্ষরের Google App Password |
| `SMTP_FROM` | `Afra Tech Point <afratechpoint@gmail.com>` |
| `IMGBB_API_KEY` | আপনার ImgBB API Key |
| `STEADFAST_API_KEY` | Steadfast Courier API Key (যদি থাকে) |
| `STEADFAST_SECRET_KEY` | Steadfast Secret Key (যদি থাকে) |

> 💡 **টিপস**: `FIREBASE_PRIVATE_KEY` কপি করার সময় কোটেশন মার্ক (`"`) বা এস্কেপ ক্যারেক্টার সমস্যা তৈরি করে না, কারণ আমাদের কোডে স্বয়ংক্রিয়ভাবে `\n` এবং কোটেশন ক্লিন করার ব্যবস্থা অলরেডি যুক্ত আছে।

---

## 📌 ধাপ ৪: Firebase Authorized Domains সেটআপ (Authentication সচল রাখতে)

Deploy কমপ্লিট হওয়ার পর আপনার Vercel ডোমেইনটি ফায়ারবেসে অথরাইজ করতে হবে:

১. [Firebase Console](https://console.firebase.google.com) এ যান।
২. আপনার প্রোজেক্ট সিলেক্ট করুন > **Authentication** > **Settings** ট্যাবে যান।
৩. **Authorized domains** সেকশনে যান।
৪. **Add domain** এ ক্লিক করে আপনার Vercel ডোমেইনটি পেস্ট করুন (যেমন: `your-project.vercel.app` এবং কাস্টম ডোমেইন থাকলে সেটিও যোগ করুন)।

---

## 📌 ধাপ ৫: Deploy এ ক্লিক করুন

সব ভেরিয়েবল দেওয়া শেষ হলে **Deploy** বাটনে ক্লিক করুন। ২-৩ মিনিটের মধ্যে আপনার সাইট লাইভ হয়ে যাবে! 🎉
