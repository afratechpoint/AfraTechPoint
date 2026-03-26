import { NextResponse } from 'next/server';
import { writeFile, unlink, readdir, stat } from 'fs/promises';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

// Ensure uploads directory exists
async function ensureDir() {
  const { mkdir } = await import('fs/promises');
  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
  } catch {}
}

// GET: List all uploaded files
export async function GET() {
  try {
    await ensureDir();
    const files = await readdir(UPLOAD_DIR);
    const fileDetails = await Promise.all(
      files
        .filter((f) => /\.(png|jpg|jpeg|gif|webp|svg|ico)$/i.test(f))
        .map(async (filename) => {
          const filePath = path.join(UPLOAD_DIR, filename);
          const info = await stat(filePath);
          return {
            name: filename,
            url: `/uploads/${filename}`,
            size: info.size,
            uploadedAt: info.mtime.toISOString(),
          };
        })
    );
    // Sort by most recent first
    fileDetails.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    return NextResponse.json(fileDetails);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to list files' }, { status: 500 });
  }
}

// POST: Upload one or more files
export async function POST(request: Request) {
  try {
    await ensureDir();
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const uploaded: { name: string; url: string }[] = [];

    for (const file of files) {
      // Sanitize filename and make unique with timestamp prefix
      const ext = path.extname(file.name);
      const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9-_]/g, '_');
      const uniqueName = `${Date.now()}_${baseName}${ext}`;
      const filePath = path.join(UPLOAD_DIR, uniqueName);

      const bytes = await file.arrayBuffer();
      await writeFile(filePath, Buffer.from(bytes));
      uploaded.push({ name: uniqueName, url: `/uploads/${uniqueName}` });
    }

    return NextResponse.json({ success: true, files: uploaded });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

// DELETE: Remove a file by filename
export async function DELETE(request: Request) {
  try {
    const { filename } = await request.json();
    if (!filename) {
      return NextResponse.json({ error: 'No filename provided' }, { status: 400 });
    }

    // Security: strip any path traversal attempts
    const safeName = path.basename(filename);
    const filePath = path.join(UPLOAD_DIR, safeName);
    await unlink(filePath);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}
