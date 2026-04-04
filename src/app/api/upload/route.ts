import { verifyAdmin } from '@/lib/auth-server';
import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import path from 'path';

// ImageKit configuration
const IMAGEKIT_PUBLIC_KEY  = "public_q6EAh8AgOv6qeEBIe6xLUlWF2XI=";
const IMAGEKIT_PRIVATE_KEY = "private_/bOCaYv2iR0Z83fl32njT2mo+B4=";
const IMAGEKIT_ENDPOINT    = "https://ik.imagekit.io/afratechpoint";

// Helper for ImageKit Authorization Header (Basic Auth)
const getImageKitAuthHeader = () => {
  return 'Basic ' + Buffer.from(IMAGEKIT_PRIVATE_KEY + ':').toString('base64');
};

export async function GET(request: NextRequest) {
  try {
    const adminToken = await verifyAdmin(request);
    if (!adminToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const sync = searchParams.get('sync') === 'true';

    if (sync) {
      await storage.syncMediaWithImageKit({
        publicKey: IMAGEKIT_PUBLIC_KEY,
        privateKey: IMAGEKIT_PRIVATE_KEY,
        endpoint: IMAGEKIT_ENDPOINT
      });
    }

    const media = await storage.getMedia();
    return NextResponse.json(media || []);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to list files' }, { status: 500 });
  }
}

// POST: Upload one or more files to ImageKit.io
export async function POST(request: NextRequest) {
  try {
    const adminToken = await verifyAdmin(request);
    if (!adminToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const uploaded: { name: string; url: string }[] = [];

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Prepare ImageKit Upload Request
      const ikFormData = new FormData();
      ikFormData.append('file', new Blob([buffer]));
      ikFormData.append('fileName', file.name);
      ikFormData.append('useUniqueFileName', 'true');
      ikFormData.append('folder', '/products');

      const ikResponse = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
        method: 'POST',
        headers: {
          'Authorization': getImageKitAuthHeader(),
        },
        body: ikFormData,
      });

      const ikData = await ikResponse.json();

      if (!ikResponse.ok) {
        console.error('[ImageKit Error]', ikData);
        throw new Error(ikData.message || 'ImageKit upload failed');
      }

      const finalUrl = ikData.url;
      const finalName = ikData.name;
      const fileId = ikData.fileId; // Important for deletion

      const mediaData = {
        name: finalName,
        url: finalUrl,
        size: file.size,
        deleteUrl: fileId, // Store ImageKit fileId here for later deletion
        imgbbId: '',       // Blank for ImageKit
        uploadedAt: new Date().toISOString()
      };
      
      await storage.saveMedia(mediaData);
      uploaded.push({ name: finalName, url: finalUrl });
    }

    return NextResponse.json({ success: true, files: uploaded });
  } catch (error: any) {
    console.error('Master Upload error:', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}

// DELETE: Remove from ImageKit & sync
export async function DELETE(request: NextRequest) {
  try {
    const adminToken = await verifyAdmin(request);
    if (!adminToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { filename } = await request.json();
    if (!filename) return NextResponse.json({ error: 'No filename provided' }, { status: 400 });

    const mediaList = await storage.getMedia();
    const mediaItem = mediaList.find((m: any) => m.name === filename);

    if (mediaItem) {
      // 1. If it's an ImageKit file (deleteUrl is fileId)
      if (mediaItem.deleteUrl && !mediaItem.deleteUrl.startsWith('media/')) {
        try {
          await fetch(`https://api.imagekit.io/v1/files/${mediaItem.deleteUrl}`, {
            method: 'DELETE',
            headers: {
              'Authorization': getImageKitAuthHeader(),
            },
          });
        } catch (e) {
          console.warn(`[ImageKit] Deletion failed for ${mediaItem.deleteUrl}`, e);
        }
      }

      // 2. Legacy: ImgBB Deletion
      if (mediaItem.imgbbId && process.env.IMGBB_API_KEY) {
        try {
          await fetch(`https://api.imgbb.com/1/delete?key=${process.env.IMGBB_API_KEY}&id=${mediaItem.imgbbId}`, { method: 'POST' }).catch(() => {});
        } catch (e) {}
      }
    }

    // Cloud/Sync Delete (removes from Firestore/RTDB)
    await storage.deleteMedia(filename);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Master Delete error:', error);
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}
