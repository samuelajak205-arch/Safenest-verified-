import { GoogleDriveItem } from '../types';

/**
 * Google Drive REST API helper for SafeNest
 * Scopes used: https://www.googleapis.com/auth/drive.file
 */

const SAFENEST_FOLDER_NAME = 'SafeNest Rentals & Document Vault';

export async function findOrCreateSafeNestFolder(accessToken: string): Promise<string> {
  try {
    // 1. Search for existing folder
    const query = encodeURIComponent(
      `name = '${SAFENEST_FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`
    );
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id, name)`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!searchRes.ok) {
      const err = await searchRes.text();
      console.warn('Drive search folder warning:', err);
      throw new Error(`Google Drive API error: ${searchRes.status}`);
    }

    const data = await searchRes.json();
    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }

    // 2. Create folder if not found
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: SAFENEST_FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder',
      }),
    });

    if (!createRes.ok) {
      throw new Error('Failed to create SafeNest Google Drive folder');
    }

    const newFolder = await createRes.json();
    return newFolder.id;
  } catch (error) {
    console.error('Error in findOrCreateSafeNestFolder:', error);
    throw error;
  }
}

export async function listSafeNestFiles(accessToken: string): Promise<GoogleDriveItem[]> {
  try {
    const folderId = await findOrCreateSafeNestFolder(accessToken);
    const query = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id, name, mimeType, webViewLink, size, createdTime, iconLink)&orderBy=createdTime desc`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!res.ok) {
      throw new Error('Failed to list files from Google Drive');
    }

    const data = await res.json();
    return (data.files || []).map((f: any) => ({
      id: f.id,
      name: f.name,
      mimeType: f.mimeType,
      webViewLink: f.webViewLink,
      size: f.size ? `${(parseInt(f.size, 10) / 1024).toFixed(1)} KB` : undefined,
      createdTime: f.createdTime,
      iconLink: f.iconLink,
    }));
  } catch (error) {
    console.error('Error listing SafeNest files:', error);
    throw error;
  }
}

export async function uploadFileToDrive(
  accessToken: string,
  fileName: string,
  mimeType: string,
  content: Blob | string,
  description?: string
): Promise<GoogleDriveItem> {
  try {
    const folderId = await findOrCreateSafeNestFolder(accessToken);

    const metadata = {
      name: fileName,
      description: description || 'Uploaded via SafeNest Uganda Property Platform',
      parents: [folderId],
    };

    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const blobContent = typeof content === 'string' ? new Blob([content], { type: mimeType }) : content;
    const metadataPart = `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(
      metadata
    )}\r\n`;

    const reader = new FileReader();
    const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(blobContent);
    });

    const mediaHeader = `Content-Type: ${mimeType}\r\nContent-Transfer-Encoding: base64\r\n\r\n`;
    const uint8Array = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < uint8Array.byteLength; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    const base64Data = btoa(binary);

    const multipartRequestBody =
      metadataPart +
      delimiter +
      mediaHeader +
      base64Data +
      closeDelimiter;

    const res = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,size,createdTime',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartRequestBody,
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error('Drive upload error:', errText);
      throw new Error(`Upload failed: ${res.statusText}`);
    }

    const uploaded = await res.json();
    return {
      id: uploaded.id,
      name: uploaded.name,
      mimeType: uploaded.mimeType,
      webViewLink: uploaded.webViewLink,
      size: uploaded.size ? `${(parseInt(uploaded.size, 10) / 1024).toFixed(1)} KB` : undefined,
      createdTime: uploaded.createdTime,
    };
  } catch (error) {
    console.error('Error uploading file to Drive:', error);
    throw error;
  }
}

/**
 * Delete a file from Drive. Per instructions, callers MUST show a confirmation dialog first.
 */
export async function deleteDriveFile(accessToken: string, fileId: string): Promise<boolean> {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return res.ok;
}

export const DEFAULT_DRIVE_MOCK_FILES: GoogleDriveItem[] = [
  {
    id: 'drive_doc_001',
    name: 'SafeNest_Standard_Residential_Tenancy_Agreement_2026.pdf',
    mimeType: 'application/pdf',
    webViewLink: 'https://drive.google.com',
    size: '342 KB',
    createdTime: '2026-03-01T10:00:00Z',
  },
  {
    id: 'drive_doc_002',
    name: 'Uganda_Land_Act_Compliance_Checklist_Tenants.pdf',
    mimeType: 'application/pdf',
    webViewLink: 'https://drive.google.com',
    size: '185 KB',
    createdTime: '2026-03-04T12:30:00Z',
  },
  {
    id: 'drive_doc_003',
    name: 'Move_In_Inspection_Inventory_Form_Blank.docx',
    mimeType: 'application/vnd.google-apps.document',
    webViewLink: 'https://drive.google.com',
    size: '94 KB',
    createdTime: '2026-03-05T08:15:00Z',
  },
  {
    id: 'drive_doc_004',
    name: 'SafeNest_Landlord_KYC_Verification_Guide.pdf',
    mimeType: 'application/pdf',
    webViewLink: 'https://drive.google.com',
    size: '512 KB',
    createdTime: '2026-03-08T15:45:00Z',
  },
];

// Aliases for seamless component imports
export const getOrCreateSafeNestFolder = findOrCreateSafeNestFolder;
export const listFilesInSafeNestFolder = listSafeNestFiles;
export const deleteFileFromDrive = deleteDriveFile;

