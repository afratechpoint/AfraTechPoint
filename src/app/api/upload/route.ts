import { verifyAdmin } from '@/lib/auth-server';
import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import { adminStorage } from '@/lib/firebase/admin';
import path from 'path';

// GET: List all media via storage sync
export async function GET(request: NextRequest) {
  try {
    const adminToken = await verifyAdmin(request);
    if (!adminToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const media = await storage.getMedia();
    return NextResponse.json(media || []);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to list files' }, { status: 500 });
  }
}

// POST: Upload one or more files to Firebase Storage
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

    if (!adminStorage) {
      return NextResponse.json({ error: 'Firebase Storage is not initialized on the server.' }, { status: 500 });
    }

    const bucket = adminStorage.bucket();
    const uploaded: { name: string; url: string }[] = [];

    for (const file of files) {
      const ext = path.extname(file.name);
      const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9-_]/g, '_');
      const uniqueName = `media/${Date.now()}_${baseName}${ext}`;
      
      const fileRef = bucket.file(uniqueName);
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      await fileRef.save(buffer, {
        metadata: { contentType: file.type }
      });
      
      // Make it public so it can be viewed by anyone
      try {
        await fileRef.makePublic();
      } catch (e) {
        console.warn("[Firebase Storage] Couldn't make object explicitly public. It might be handled by bucket-level IAM policies.");
      }
      
      // Formulate standard Firebase Storage HTTPS URL 
      const finalUrl = `https://storage.googleapis.com/${bucket.name}/${uniqueName}`;
      
      const mediaData = {
        name: uniqueName,
        url: finalUrl,
        size: file.size,
        deleteUrl: uniqueName, // Store path so we can delete it easily later
        imgbbId: '', // Blank for Firebase files
        uploadedAt: new Date().toISOString()
      };
      
      await storage.saveMedia(mediaData);
      uploaded.push({ name: uniqueName, url: finalUrl });
    }

    return NextResponse.json({ success: true, files: uploaded });
  } catch (error) {
    console.error('Master Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

// DELETE: Remove from Firebase Storage & sync
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

    if (mediaItem && adminStorage) {
      const bucket = adminStorage.bucket();
      
      // Legacy Delete attempts for any old ImgBB files
      if (mediaItem.imgbbId && process.env.IMGBB_API_KEY) {
        try {
          await fetch(`https://api.imgbb.com/1/delete?key=${process.env.IMGBB_API_KEY}&id=${mediaItem.imgbbId}`, { method: 'POST' }).catch(() => {});
        } catch (e) {}
      }
      
      // Delete from Firebase Storage if path (deleteUrl) exists
      if (mediaItem.deleteUrl && mediaItem.deleteUrl.startsWith('media/')) {
         try {
           await bucket.file(mediaItem.deleteUrl).delete();
         } catch (e) {
           console.warn(`Failed to delete ${mediaItem.deleteUrl} from Firebase Storage.`, e);
         }
      }
    }

    // Cloud/Sync Delete
    await storage.deleteMedia(filename);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Master Delete error:', error);
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}
