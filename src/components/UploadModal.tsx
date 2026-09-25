import React, { useState, useMemo } from 'react';
import { X, Upload, FileText, CheckCircle2, ShieldCheck, Database, Layers } from 'lucide-react';
import { StorageNode } from '../types/node';
import { UploadOptions } from '../types/object';
import { selectPlacementNodes } from '../services/replicationService';
import { formatBytes } from '../services/cryptoService';
import { ProgressBar } from './ProgressBar';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: StorageNode[];
  onUpload: (options: UploadOptions) => Promise<any>;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  nodes,
  onUpload,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [presetName, setPresetName] = useState<string>('demo-file.pdf');
  const [replicationFactor, setReplicationFactor] = useState<number>(3);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStage, setUploadStage] = useState<string>('');

  // Sample presets for 1-click test
  const presets = [
    {
      name: 'demo-file.pdf',
      size: 482912,
      type: 'application/pdf',
      content: 'VAULT_DISTRIBUTED_OBJECT_STORAGE_OFFICIAL_TEST_SPECIFICATION_DEMO_PDF',
    },
    {
      name: 'large_dataset.parquet',
      size: 25682912,
      type: 'application/octet-stream',
      content: 'VAULT_DISTRIBUTED_COLUMNAR_PARQUET_DATASET_TRANSACTION_RECORDS_V1',
    },
    {
      name: 'customer_export_encrypted.tar',
      size: 12582912,
      type: 'application/x-tar',
      content: 'VAULT_ENCRYPTED_TAR_ARCHIVE_CUSTOMER_DATABASE_BACKUP_BLOB_2026',
    },
  ];

  // Calculate target placement nodes dynamically
  const targetNodes = useMemo(() => {
    return selectPlacementNodes(nodes, replicationFactor);
  }, [nodes, replicationFactor]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSelectPreset = (pName: string) => {
    setPresetName(pName);
    setSelectedFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setUploadProgress(15);
    setUploadStage('Hashing file content (SHA-256)...');

    try {
      await new Promise(r => setTimeout(r, 400));
      setUploadProgress(45);
      setUploadStage(`Distributing replicas to ${targetNodes.map(n => n.name).join(', ')}...`);

      await new Promise(r => setTimeout(r, 500));
      setUploadProgress(85);
      setUploadStage('Committing metadata and consensus quorum...');

      if (selectedFile) {
        await onUpload({
          file: selectedFile,
          replicationFactor,
        });
      } else {
        const preset = presets.find(p => p.name === presetName) || presets[0];
        await onUpload({
          file: {
            name: preset.name,
            size: preset.size,
            type: preset.type,
            content: preset.content,
          },
          replicationFactor,
        });
      }

      setUploadProgress(100);
      setUploadStage('Replication quorum settled successfully!');
      await new Promise(r => setTimeout(r, 350));
      onClose();
    } catch (err) {
      console.error(err);
      setIsUploading(false);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setUploadStage('');
      setSelectedFile(null);
    }
  };

  const activeFileSize = selectedFile
    ? selectedFile.size
    : (presets.find(p => p.name === presetName)?.size || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800/80 flex items-center justify-center text-cyan-400">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Ingest Object into Vault</h3>
              <p className="text-xs text-slate-400">Upload and configure multi-node replication</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-md hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Quick Presets for Hackathon Demo */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              1-Click Demo File Presets
            </label>
            <div className="grid grid-cols-3 gap-2">
              {presets.map(p => {
                const isSelected = !selectedFile && presetName === p.name;
                return (
                  <button
                    type="button"
                    key={p.name}
                    onClick={() => handleSelectPreset(p.name)}
                    disabled={isUploading}
                    className={`p-2.5 text-left rounded-lg border text-xs transition-all ${
                      isSelected
                        ? 'bg-cyan-950/60 border-cyan-500/80 text-cyan-200 shadow-sm'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:border-slate-600'
                    }`}
                  >
                    <div className="font-mono font-medium truncate">{p.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{formatBytes(p.size)}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Or custom file upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Or Choose Local File
            </label>
            <label
              className={`flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                selectedFile
                  ? 'border-cyan-500/70 bg-cyan-950/20'
                  : 'border-slate-700 hover:border-slate-600 bg-slate-800/40'
              }`}
            >
              <div className="flex flex-col items-center justify-center text-center">
                <FileText className={`w-6 h-6 mb-1 ${selectedFile ? 'text-cyan-400' : 'text-slate-400'}`} />
                {selectedFile ? (
                  <p className="text-xs font-medium text-cyan-200 font-mono">
                    {selectedFile.name} ({formatBytes(selectedFile.size)})
                  </p>
                ) : (
                  <>
                    <p className="text-xs text-slate-300">
                      <span className="font-semibold text-cyan-400">Click to browse</span> or drag and drop
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">PDF, JSON, BIN, ZIP, TXT, etc.</p>
                  </>
                )}
              </div>
              <input
                type="file"
                className="hidden"
                disabled={isUploading}
                onChange={handleFileChange}
              />
            </label>
          </div>

          {/* Replication Factor Selector: [ 2 ] [ 3 ] [ 4 ] */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Replication Factor (Durability Quorum)
              </label>
              <span className="text-[11px] text-cyan-400 font-medium">
                {replicationFactor} distinct copies
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[2, 3, 4].map(factor => {
                const isSelected = replicationFactor === factor;
                return (
                  <button
                    type="button"
                    key={factor}
                    onClick={() => setReplicationFactor(factor)}
                    disabled={isUploading}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-900/40'
                        : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Factor {factor}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Real-Time Replica Placement Preview */}
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-medium text-slate-400 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                Target Storage Nodes:
              </span>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Balanced Placement
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {targetNodes.map(node => (
                <div
                  key={node.id}
                  className="px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700 text-xs text-slate-200 flex items-center gap-1.5 font-mono"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>{node.name}</span>
                </div>
              ))}
              {targetNodes.length < replicationFactor && (
                <div className="px-2 py-1 rounded bg-rose-950/60 border border-rose-800 text-[11px] text-rose-300">
                  Insufficient healthy nodes ({targetNodes.length}/{replicationFactor})
                </div>
              )}
            </div>
          </div>

          {/* Upload Progress Bar if active */}
          {isUploading && (
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">{uploadStage}</span>
                <span className="font-mono text-cyan-400">{uploadProgress}%</span>
              </div>
              <ProgressBar value={uploadProgress} color="cyan" size="md" />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || targetNodes.length === 0}
              className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 rounded-lg shadow-md shadow-cyan-950 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isUploading ? 'Replicating...' : 'Commit & Replicate'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
