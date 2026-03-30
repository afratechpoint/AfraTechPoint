import { verifyAdmin } from '@/lib/auth-server';
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink, readdir, stat, mkdir } from 'fs/promises';
import path from 'path';
import { storage } from '@/lib/storage';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const IMGBB_API_KEY = process.env.IMGBB_API_KEY;

// Ensure uploads directory exists (local only)
async function ensureDir() {
  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
  } catch {}
}

async function uploadToImgBB(file: File) {
  if (!IMGBB_API_KEY) return null;
  
  const formData = new FormData();
  formData.append('image', file);
  
  try {
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (data.success) {
      return {
        url: data.data.url,
        name: data.data.image.filename,
        size: data.data.size,
        deleteUrl: data.data.delete_url,
        id: data.data.id,
      };
    }
  } catch (err) {
    console.error('[ImgBB] Upload Error:', err);
  }
  return null;
}

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

// POST: Upload one or more files
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
      let finalUrl = '';
      let finalName = '';
      let finalSize = file.size;
      let finalDeleteUrl = '';
      let finalImgbbId = '';

      // 1. Try ImgBB if Key exists
      const imgbb = await uploadToImgBB(file);
      if (imgbb) {
        finalUrl = imgbb.url;
        finalName = imgbb.name;
        finalSize = imgbb.size;
        finalDeleteUrl = imgbb.deleteUrl;
        finalImgbbId = imgbb.id;
      } else {
        // 2. Try Local Filesystem (Dev/VPS)
        try {
          await ensureDir();
          const ext = path.extname(file.name);
          const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9-_]/g, '_');
          const uniqueName = `${Date.now()}_${baseName}${ext}`;
          const filePath = path.join(UPLOAD_DIR, uniqueName);
          
          const bytes = await file.arrayBuffer();
          await writeFile(filePath, Buffer.from(bytes));
          
          finalUrl = `/uploads/${uniqueName}`;
          finalName = uniqueName;
        } catch (fsErr) {
          console.error('[Upload API] Local FS Write Failed:', fsErr);
          if (!IMGBB_API_KEY) {
             return NextResponse.json({ 
               error: 'Upload failed. Please provide IMGBB_API_KEY for hosted environments.',
               reason: 'Read-only filesystem detected.' 
             }, { status: 500 });
          }
        }
      }

      if (finalUrl) {
        const mediaData = {
          name: finalName,
          url: finalUrl,
          size: finalSize,
          deleteUrl: finalDeleteUrl,
          imgbbId: finalImgbbId,
          uploadedAt: new Date().toISOString()
        };
        // 3. Sync to Resilient Cloud Storage
        await storage.saveMedia(mediaData);
        uploaded.push({ name: finalName, url: finalUrl });
      }
    }

    return NextResponse.json({ success: true, files: uploaded });
  } catch (error) {
    console.error('Master Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

// DELETE: Remove from storage sync
export async function DELETE(request: NextRequest) {
  try {
    const adminToken = await verifyAdmin(request);
    if (!adminToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { filename } = await request.json();
    if (!filename) return NextResponse.json({ error: 'No filename provided' }, { status: 400 });

    // 0. Find the media item to get the deleteUrl and imgbbId
    const mediaList = await storage.getMedia();
    const mediaItem = mediaList.find((m: any) => m.name === filename);

    // 1. Trigger ImgBB Deletion (Programmatic ID-based)
    if (mediaItem?.imgbbId) {
      console.log(`[ImgBB] Remote deletion for ID: ${mediaItem.imgbbId}`);
      try {
         // Attempt official but unofficial-ish ID-based delete API
         await fetch(`https://api.imgbb.com/1/delete?key=${IMGBB_API_KEY}&id=${mediaItem.imgbbId}`, {
           method: 'POST'
         }).catch(() => {});
      } catch (e) {}
    }

    // 2. Secondary Deletion attempt via deleteUrl (Legacy)
    if (mediaItem?.deleteUrl) {
      try {
        await fetch(mediaItem.deleteUrl, { method: 'GET' }).catch(() => {});
      } catch (e) {}
    }

    // 3. Local Delete (Best effort)
    try {
      const filePath = path.join(UPLOAD_DIR, path.basename(filename));
      await unlink(filePath);
    } catch {}

    // 4. Cloud/Sync Delete
    await storage.deleteMedia(filename);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}
