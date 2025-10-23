// Using legacy API to avoid deprecation warnings on SDK 54 until full migration to new File/Directory API
import * as FileSystem from 'expo-file-system/legacy';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import type { Account, Transaction, Budget, Goal, RecurringPayment, Category } from '../types';

interface AccountsExportPayload {
    version: 1;
    type: 'accounts';
    exportedAt: string; // ISO string
    accounts: Account[];
}

interface FullBackupPayload {
    version: 1;
    type: 'full-backup';
    exportedAt: string;
    data: {
        transactions: Transaction[];
        categories: Category[];
        budgets: Budget[];
        goals: Goal[];
        recurringPayments: RecurringPayment[];
        accounts: Account[];
    };
}

export interface BackupInfo {
    fileName: string;
    fileUri: string;
    date: string; // ISO string
    size: number; // bytes
}

const EXPORT_PREFIX = 'kontto-accounts';
const BACKUP_PREFIX = 'kontto-backup';
const BACKUPS_DIR = 'backups/';

export const exportAccountsToFile = async (accounts: Account[]) => {
    const payload: AccountsExportPayload = {
        version: 1,
        type: 'accounts',
        exportedAt: new Date().toISOString(),
        accounts,
    };

    const fileName = `${EXPORT_PREFIX}-${new Date().toISOString().replace(/[:T]/g, '-').slice(0, 19)}.json`;
    const baseDir = (FileSystem as any).documentDirectory || (FileSystem as any).cacheDirectory || '';
    const fileUri = `${baseDir}${fileName}`;

    await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(payload, null, 2));

    // Try to open the native share dialog so the user can save/send the file
    try {
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
            await Sharing.shareAsync(fileUri, { dialogTitle: 'Exportar cuentas' });
        }
    } catch (e) {
        // If sharing is not available (e.g., web), we just return the file path
    }

    return { fileUri, fileName };
};

export const pickAndImportAccounts = async (): Promise<{ accounts: Account[]; fileName?: string } | null> => {
    // Pick a JSON file
    const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        multiple: false,
        copyToCacheDirectory: true,
    });

    if (result.canceled) return null;

    const file = result.assets?.[0];
    if (!file?.uri) return null;

    // On iOS, the picked file may need to be read via the uri directly. On Android it can also be a content:// uri, which FileSystem can handle.
    const contents = await FileSystem.readAsStringAsync(file.uri);

    let parsed: any;
    try {
        parsed = JSON.parse(contents);
    } catch {
        throw new Error('El archivo seleccionado no es un JSON válido.');
    }

    // Basic schema validation
    if (!parsed || parsed.type !== 'accounts' || !Array.isArray(parsed.accounts)) {
        throw new Error('El archivo no tiene el formato esperado de cuentas.');
    }

    // Optional: ensure minimal fields exist in each account
    const validAccounts = (parsed.accounts as Account[]).filter((a) => a && typeof a.id === 'string' && typeof a.title === 'string');

    return { accounts: validAccounts, fileName: file.name };
};

// ========== LOCAL BACKUPS ==========

const getBackupsDirectory = async () => {
    const baseDir = (FileSystem as any).documentDirectory || (FileSystem as any).cacheDirectory || '';
    const backupsDir = `${baseDir}${BACKUPS_DIR}`;
    
    // Ensure directory exists
    const dirInfo = await FileSystem.getInfoAsync(backupsDir);
    if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(backupsDir, { intermediates: true });
    }
    
    return backupsDir;
};

export const createLocalBackup = async (data: {
    transactions: Transaction[];
    categories: Category[];
    budgets: Budget[];
    goals: Goal[];
    recurringPayments: RecurringPayment[];
    accounts: Account[];
}): Promise<BackupInfo> => {
    const backupsDir = await getBackupsDirectory();
    const now = new Date();
    const fileName = `${BACKUP_PREFIX}-${now.toISOString().replace(/[:T]/g, '-').slice(0, 19)}.json`;
    const fileUri = `${backupsDir}${fileName}`;

    const payload: FullBackupPayload = {
        version: 1,
        type: 'full-backup',
        exportedAt: now.toISOString(),
        data,
    };

    const content = JSON.stringify(payload, null, 2);
    await FileSystem.writeAsStringAsync(fileUri, content);

    const fileInfo = await FileSystem.getInfoAsync(fileUri);

    return {
        fileName,
        fileUri,
        date: now.toISOString(),
        size: (fileInfo as any).size || content.length,
    };
};

export const listLocalBackups = async (): Promise<BackupInfo[]> => {
    const backupsDir = await getBackupsDirectory();
    
    try {
        const files = await FileSystem.readDirectoryAsync(backupsDir);
        const backupFiles = files.filter(f => f.startsWith(BACKUP_PREFIX) && f.endsWith('.json'));
        
        const backups: BackupInfo[] = [];
        for (const fileName of backupFiles) {
            const fileUri = `${backupsDir}${fileName}`;
            const fileInfo = await FileSystem.getInfoAsync(fileUri);
            
            if (fileInfo.exists) {
                // Extract date from filename: kontto-backup-2025-10-22-14-30-45.json
                const dateMatch = fileName.match(/(\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2})/);
                const dateStr = dateMatch ? dateMatch[1].replace(/-/g, ':').replace(/(\d{2}):(\d{2}):(\d{2})$/, 'T$1:$2:$3') : '';
                
                backups.push({
                    fileName,
                    fileUri,
                    date: dateStr ? `${dateStr.slice(0, 10)}T${dateStr.slice(11)}Z` : (fileInfo as any).modificationTime?.toString() || new Date().toISOString(),
                    size: (fileInfo as any).size || 0,
                });
            }
        }
        
        // Sort by date descending (newest first)
        return backups.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (e) {
        // Directory might not exist or be empty
        return [];
    }
};

export const restoreLocalBackup = async (fileUri: string): Promise<FullBackupPayload['data']> => {
    const contents = await FileSystem.readAsStringAsync(fileUri);
    
    let parsed: any;
    try {
        parsed = JSON.parse(contents);
    } catch {
        throw new Error('El archivo de respaldo no es un JSON válido.');
    }
    
    if (!parsed || parsed.type !== 'full-backup' || !parsed.data) {
        throw new Error('El archivo no tiene el formato esperado de respaldo completo.');
    }
    
    return parsed.data;
};

export const deleteLocalBackup = async (fileUri: string): Promise<void> => {
    await FileSystem.deleteAsync(fileUri, { idempotent: true });
};

export const shareLocalBackup = async (fileUri: string): Promise<void> => {
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
        await Sharing.shareAsync(fileUri, { dialogTitle: 'Compartir respaldo' });
    } else {
        throw new Error('No se puede compartir archivos en esta plataforma.');
    }
};
