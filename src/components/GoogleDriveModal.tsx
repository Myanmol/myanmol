import React, { useState, useEffect } from 'react';
import {
  X,
  HardDrive,
  Cloud,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Trash2,
  RefreshCw,
  Upload,
  Download,
  FileText,
  FileSpreadsheet,
  FileCode,
  LogOut,
  FolderOpen,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  logoutGoogle,
  getAccessToken,
} from '../utils/firebaseAuth';
import {
  getOrCreateFinLedgerFolder,
  listDriveFiles,
  deleteDriveFile,
  uploadFileToDrive,
  readDriveFileText,
  GoogleDriveFile,
} from '../utils/googleDrive';
import {
  getAllPartiesSummaryPDFBlob,
} from '../utils/pdfExport';
import {
  getAllPartiesSummaryExcelBlob,
} from '../utils/excelExport';
import { CompanyProfile, Party, SaleBill, PurchaseBill, Receipt, Payment, Expense } from '../types';
import { AppStateData } from '../utils/storage';
import { calculateAllPartyBalancesAsOfDate } from '../utils/ledger';
import { formatDate } from '../utils/formatters';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentState: AppStateData;
  onRestoreState: (state: AppStateData) => void;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  currentState,
  onRestoreState,
}) => {
  if (!isOpen) return null;

  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [folderId, setFolderId] = useState<string | null>(null);
  const [driveFiles, setDriveFiles] = useState<GoogleDriveFile[]>([]);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // File to delete confirmation state (MANDATORY REQUIREMENT: Confirmation for destructive operations)
  const [fileToDelete, setFileToDelete] = useState<GoogleDriveFile | null>(null);

  const showStatus = (text: string, isError = false) => {
    setStatusMessage({ text, isError });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (authedUser, accessToken) => {
        setUser(authedUser);
        setToken(accessToken);
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // When token is available, load or create FinLedger folder and fetch files
  useEffect(() => {
    if (token) {
      loadDriveFolderAndFiles(token);
    }
  }, [token]);

  const loadDriveFolderAndFiles = async (authToken: string) => {
    setIsLoadingFiles(true);
    try {
      const fId = await getOrCreateFinLedgerFolder(authToken);
      setFolderId(fId);
      const files = await listDriveFiles(authToken, fId);
      setDriveFiles(files);
    } catch (err: any) {
      console.error('Failed to load Google Drive folder/files:', err);
      showStatus(err.message || 'Failed to load Google Drive files', true);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        showStatus('Signed in to Google Drive successfully!');
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      showStatus('Sign in failed: ' + (err.message || 'Unknown error'), true);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logoutGoogle();
    setUser(null);
    setToken(null);
    setDriveFiles([]);
    setFolderId(null);
    showStatus('Signed out from Google Drive');
  };

  // Backup state to Google Drive
  const handleBackupToDrive = async () => {
    if (!token || !folderId) return;
    setActionInProgress('backup');
    try {
      const jsonContent = JSON.stringify(currentState, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const fileName = `finledger_backup_${currentState.balanceAsOfDate}_${Date.now().toString().slice(-4)}.json`;

      await uploadFileToDrive(token, fileName, 'application/json', blob, folderId);
      showStatus('Database backup saved to Google Drive!');
      await loadDriveFolderAndFiles(token);
    } catch (err: any) {
      console.error('Backup error:', err);
      showStatus('Failed to backup: ' + err.message, true);
    } finally {
      setActionInProgress(null);
    }
  };

  // Upload Balance Sheet PDF to Drive
  const handleUploadBalanceSheetPDF = async () => {
    if (!token || !folderId) return;
    setActionInProgress('pdf');
    try {
      const summaries = calculateAllPartyBalancesAsOfDate(
        currentState.parties,
        currentState.sales,
        currentState.receipts,
        currentState.purchases,
        currentState.payments,
        currentState.balanceAsOfDate
      );
      const { blob, fileName } = getAllPartiesSummaryPDFBlob(
        currentState.company,
        summaries,
        currentState.balanceAsOfDate
      );

      await uploadFileToDrive(token, fileName, 'application/pdf', blob, folderId);
      showStatus('Balance Sheet PDF saved to Google Drive!');
      await loadDriveFolderAndFiles(token);
    } catch (err: any) {
      console.error('PDF upload error:', err);
      showStatus('Failed to upload PDF: ' + err.message, true);
    } finally {
      setActionInProgress(null);
    }
  };

  // Upload Balance Sheet Excel to Drive
  const handleUploadBalanceSheetExcel = async () => {
    if (!token || !folderId) return;
    setActionInProgress('excel');
    try {
      const summaries = calculateAllPartyBalancesAsOfDate(
        currentState.parties,
        currentState.sales,
        currentState.receipts,
        currentState.purchases,
        currentState.payments,
        currentState.balanceAsOfDate
      );
      const { blob, fileName } = getAllPartiesSummaryExcelBlob(
        currentState.company,
        summaries,
        currentState.balanceAsOfDate
      );

      await uploadFileToDrive(
        token,
        fileName,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        blob,
        folderId
      );
      showStatus('Balance Sheet Excel saved to Google Drive!');
      await loadDriveFolderAndFiles(token);
    } catch (err: any) {
      console.error('Excel upload error:', err);
      showStatus('Failed to upload Excel: ' + err.message, true);
    } finally {
      setActionInProgress(null);
    }
  };

  // Restore state from selected Drive backup file
  const handleRestoreFromDriveFile = async (file: GoogleDriveFile) => {
    if (!token) return;
    const confirmed = window.confirm(
      `Restore accounting database from Google Drive backup "${file.name}"? This will update your current local entries.`
    );
    if (!confirmed) return;

    setActionInProgress(`restore-${file.id}`);
    try {
      const text = await readDriveFileText(token, file.id);
      const parsed = JSON.parse(text);
      if (parsed.parties && parsed.sales) {
        onRestoreState(parsed);
        showStatus(`Database restored from "${file.name}"!`);
        onClose();
      } else {
        showStatus('File is not a valid FinLedger backup', true);
      }
    } catch (err: any) {
      console.error('Restore error:', err);
      showStatus('Restore failed: ' + err.message, true);
    } finally {
      setActionInProgress(null);
    }
  };

  // Confirm and Execute Delete (MANDATORY REQUIREMENT)
  const confirmDeleteFile = async () => {
    if (!token || !fileToDelete) return;
    const targetFile = fileToDelete;
    setFileToDelete(null);

    try {
      await deleteDriveFile(token, targetFile.id);
      showStatus(`Deleted "${targetFile.name}" from Google Drive`);
      setDriveFiles((prev) => prev.filter((f) => f.id !== targetFile.id));
    } catch (err: any) {
      console.error('Delete error:', err);
      showStatus('Failed to delete file: ' + err.message, true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white">
              <HardDrive className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Google Drive Integration</h3>
              <p className="text-xs text-slate-400">
                Cloud statements, spreadsheets & automatic accounting backups
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
          {/* Status Alert Banner */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-semibold animate-in fade-in ${
                statusMessage.isError
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}
            >
              {statusMessage.isError ? (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              ) : (
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* User Sign-In Section */}
          {!user ? (
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 mx-auto flex items-center justify-center text-indigo-600">
                <Cloud className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">Connect Your Google Drive</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Connect to save your party ledger statements, export Excel workbooks, and backup your accounting transactions directly to your Google Drive account with your permission.
                </p>
              </div>

              {/* Official Google Sign-in Button Style */}
              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  className="inline-flex items-center gap-3 px-5 py-2.5 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-300 rounded-xl shadow-xs transition-all hover:shadow-sm disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>
                  <span>{isLoggingIn ? 'Connecting...' : 'Sign in with Google'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Connected Account Header */
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Google User'}
                    className="w-9 h-9 rounded-full border border-slate-300"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm">
                    {(user.displayName || user.email || 'G').charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <span>{user.displayName || 'Connected Google Account'}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.2 rounded-full">
                      Connected
                    </span>
                  </div>
                  <div className="text-slate-500 text-[11px] truncate max-w-[200px] sm:max-w-xs">
                    {user.email}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => token && loadDriveFolderAndFiles(token)}
                  disabled={isLoadingFiles}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors"
                  title="Refresh Files"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={handleLogout}
                  className="px-2 py-1 rounded-lg border border-slate-300 text-slate-600 hover:text-rose-600 hover:border-rose-300 text-[11px] font-semibold transition-colors flex items-center gap-1"
                >
                  <LogOut className="w-3 h-3" />
                  <span className="hidden xs:inline">Sign Out</span>
                </button>
              </div>
            </div>
          )}

          {/* Quick Google Drive Action Buttons (Only when connected) */}
          {user && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-xs">
                  Save to Google Drive
                </span>
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
                  <span>Folder: <strong>FinLedger Accounting</strong></span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={handleBackupToDrive}
                  disabled={actionInProgress !== null}
                  className="p-2.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-semibold text-xs flex flex-col items-center justify-center gap-1 transition-colors text-center disabled:opacity-50"
                >
                  <Upload className="w-4 h-4 text-indigo-600" />
                  <span>Backup Database</span>
                  <span className="text-[10px] text-indigo-600/80 font-normal">Full JSON snapshot</span>
                </button>

                <button
                  type="button"
                  onClick={handleUploadBalanceSheetPDF}
                  disabled={actionInProgress !== null}
                  className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold text-xs flex flex-col items-center justify-center gap-1 transition-colors text-center disabled:opacity-50"
                >
                  <FileText className="w-4 h-4 text-rose-600" />
                  <span>Save Balance Sheet</span>
                  <span className="text-[10px] text-slate-500 font-normal">PDF format</span>
                </button>

                <button
                  type="button"
                  onClick={handleUploadBalanceSheetExcel}
                  disabled={actionInProgress !== null}
                  className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold text-xs flex flex-col items-center justify-center gap-1 transition-colors text-center disabled:opacity-50"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Save Balance Sheet</span>
                  <span className="text-[10px] text-slate-500 font-normal">Excel (.xlsx)</span>
                </button>
              </div>
            </div>
          )}

          {/* Files Stored in Google Drive */}
          {user && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-xs">
                  Files in Google Drive ({driveFiles.length})
                </span>
                <span className="text-[11px] text-slate-500">
                  {isLoadingFiles ? 'Loading...' : 'Cloud Storage'}
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-60 overflow-y-auto">
                {driveFiles.map((file) => {
                  const isPdf = file.mimeType.includes('pdf');
                  const isExcel =
                    file.mimeType.includes('sheet') ||
                    file.mimeType.includes('excel') ||
                    file.name.endsWith('.xlsx');
                  const isJson = file.mimeType.includes('json') || file.name.endsWith('.json');

                  return (
                    <div
                      key={file.id}
                      className="p-3 hover:bg-slate-50 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                          {isPdf ? (
                            <FileText className="w-4 h-4 text-rose-600" />
                          ) : isExcel ? (
                            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                          ) : isJson ? (
                            <FileCode className="w-4 h-4 text-indigo-600" />
                          ) : (
                            <HardDrive className="w-4 h-4 text-slate-500" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-slate-900 truncate">
                            {file.name}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                            {file.createdTime && (
                              <span>{new Date(file.createdTime).toLocaleDateString()}</span>
                            )}
                            {file.size && (
                              <span>· {Math.round(parseInt(file.size, 10) / 1024)} KB</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Open in Google Drive */}
                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Open in Google Drive"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}

                        {/* Restore if JSON backup */}
                        {isJson && (
                          <button
                            type="button"
                            onClick={() => handleRestoreFromDriveFile(file)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                            title="Restore Database from this Backup"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Delete with explicit confirmation dialog */}
                        <button
                          type="button"
                          onClick={() => setFileToDelete(file)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete from Google Drive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {driveFiles.length === 0 && !isLoadingFiles && (
                  <div className="p-6 text-center text-slate-400">
                    <Cloud className="w-6 h-6 mx-auto text-slate-300 mb-1" />
                    <div>No files in FinLedger folder yet</div>
                    <p className="text-[11px]">Save a statement or backup above to see it here</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Explicit User Confirmation Modal for Destructive Operations (MANDATORY REQUIREMENT) */}
      {fileToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h4 className="font-bold text-slate-900 text-sm">Delete File from Google Drive?</h4>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to permanently delete <strong className="text-slate-800">"{fileToDelete.name}"</strong> from your Google Drive? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setFileToDelete(null)}
                className="flex-1 py-2 border border-slate-300 hover:bg-slate-100 rounded-xl font-semibold text-slate-700 text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteFile}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-md shadow-rose-600/20 transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
