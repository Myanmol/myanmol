/**
 * Google Drive REST API utilities for FinLedger Pro
 */

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  webViewLink?: string;
  webContentLink?: string;
  createdTime?: string;
  modifiedTime?: string;
}

const FOLDER_NAME = 'FinLedger Accounting';

/**
 * Searches for or creates a dedicated root folder in Google Drive for this app's files.
 */
export async function getOrCreateFinLedgerFolder(token: string): Promise<string> {
  const query = encodeURIComponent(`name = '${FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`);
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`;

  const response = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to search Google Drive folders: ${errorText}`);
  }

  const data = await response.json();
  if (data.files && data.files.length > 0) {
    return data.files[0].id;
  }

  // Create folder
  const createUrl = 'https://www.googleapis.com/drive/v3/files';
  const createResponse = await fetch(createUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
    }),
  });

  if (!createResponse.ok) {
    const errorText = await createResponse.text();
    throw new Error(`Failed to create Google Drive folder: ${errorText}`);
  }

  const createdData = await createResponse.json();
  return createdData.id;
}

/**
 * Uploads a file (PDF, Excel, JSON backup) to Google Drive using multipart upload.
 */
export async function uploadFileToDrive(
  token: string,
  fileName: string,
  mimeType: string,
  contentBlob: Blob,
  folderId?: string
): Promise<GoogleDriveFile> {
  const metadata: any = {
    name: fileName,
    mimeType: mimeType,
  };

  if (folderId) {
    metadata.parents = [folderId];
  }

  const form = new FormData();
  form.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json; charset=UTF-8' })
  );
  form.append('file', contentBlob);

  const uploadUrl =
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,webContentLink,size,createdTime,modifiedTime';

  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to upload to Google Drive: ${err}`);
  }

  return await response.json();
}

/**
 * Lists files in the FinLedger Accounting folder.
 */
export async function listDriveFiles(
  token: string,
  folderId: string
): Promise<GoogleDriveFile[]> {
  const query = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,size,webViewLink,webContentLink,createdTime,modifiedTime)&orderBy=modifiedTime desc`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to list files from Google Drive: ${err}`);
  }

  const data = await response.json();
  return data.files || [];
}

/**
 * Deletes a file from Google Drive.
 */
export async function deleteDriveFile(token: string, fileId: string): Promise<void> {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok && response.status !== 204) {
    const err = await response.text();
    throw new Error(`Failed to delete Google Drive file: ${err}`);
  }
}

/**
 * Reads binary or text content of a file from Google Drive (e.g. for backup restoration).
 */
export async function readDriveFileText(token: string, fileId: string): Promise<string> {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to read file from Google Drive: ${err}`);
  }

  return await response.text();
}
