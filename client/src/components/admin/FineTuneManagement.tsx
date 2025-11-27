// client/src/components/admin/FineTuneManagement.tsx
import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { useToast } from '../ToastProvider';
import { TrainingDataSource } from '../../types';
import { apiService } from '../../services/apiService';
import { DownloadIcon } from '../Icons';

interface FineTuneManagementProps {
    language: 'vi' | 'en';
}

const translations = {
    vi: {
        title: 'Tạo Dữ liệu Fine-tune',
        instructionsTitle: 'Hướng dẫn chuyển đổi từ Excel',
        instructions: [
            '1. Chuẩn bị file Excel (.xlsx hoặc .xls).',
            '2. Dòng đầu tiên là tiêu đề (sẽ được bỏ qua).',
            '3. Cột đầu tiên (cột A) sẽ được dùng làm câu hỏi (Prompt).',
            '4. Cột thứ hai (cột B) sẽ được dùng làm câu trả lời (Completion).',
            '5. Tải file lên và hệ thống sẽ tạo ra một file .jsonl để bạn tải về.'
        ],
        uploadArea: 'Kéo và thả file Excel vào đây, hoặc nhấp để chọn file',
        processing: 'Đang xử lý...',
        downloadButton: 'Tải file .jsonl',
        previewTitle: 'Xem trước dữ liệu đã chuyển đổi (3 dòng đầu)',
        noData: 'Chưa có dữ liệu để xem trước.',
        errors: {
            invalidFileType: 'Loại file không hợp lệ. Vui lòng tải lên file .xlsx hoặc .xls.',
            noData: 'File Excel không có dữ liệu (cần ít nhất 1 dòng dữ liệu).',
            missingColumns: 'File Excel cần có ít nhất 2 cột.',
            processingError: 'Đã xảy ra lỗi khi xử lý file.',
        },
        processSuccess: 'Xử lý file thành công! Sẵn sàng để tải về.',
        trainedConversations: 'Các đoạn hội thoại đã huấn luyện',
        aiAgent: 'AI Agent',
        qaPairs: 'Cặp Q&A',
        lastExported: 'Ngày xuất gần nhất',
        actions: 'Hành động',
        downloadJsonl: 'Tải xuống JSONL',
        noTrainedData: 'Chưa có dữ liệu Hỏi-Đáp nào được huấn luyện.',
        loadingTrainedData: 'Đang tải dữ liệu đã huấn luyện...',
        exporting: 'Đang xuất...',
        exportSuccess: 'Xuất file thành công!',
        exportError: 'Xuất file thất bại: {message}',
        notYetExported: 'Chưa xuất',
    },
    en: {
        title: 'Fine-tune Data Generator',
        instructionsTitle: 'Excel Converter Instructions',
        instructions: [
            '1. Prepare an Excel file (.xlsx or .xls).',
            '2. The first row is the header (it will be ignored).',
            '3. The first column (Column A) will be used as the prompt (Question).',
            '4. The second column (Column B) will be used as the completion (Answer).',
            '5. Upload the file, and the system will generate a .jsonl file for you to download.'
        ],
        uploadArea: 'Drag and drop an Excel file here, or click to select a file',
        processing: 'Processing...',
        downloadButton: 'Download .jsonl file',
        previewTitle: 'Converted Data Preview (First 3 lines)',
        noData: 'No data to preview yet.',
        errors: {
            invalidFileType: 'Invalid file type. Please upload an .xlsx or .xls file.',
            noData: 'The Excel file contains no data (at least 1 data row is required).',
            missingColumns: 'The Excel file must have at least 2 columns.',
            processingError: 'An error occurred while processing the file.',
        },
        processSuccess: 'File processed successfully! Ready for download.',
        trainedConversations: 'Trained Conversation Snippets',
        aiAgent: 'AI Agent',
        qaPairs: 'Q&A Pairs',
        lastExported: 'Last Exported',
        actions: 'Actions',
        downloadJsonl: 'Download JSONL',
        noTrainedData: 'No Q&A data has been trained yet.',
        loadingTrainedData: 'Loading trained data...',
        exporting: 'Exporting...',
        exportSuccess: 'File exported successfully!',
        exportError: 'Failed to export file: {message}',
        notYetExported: 'Not yet exported',
    }
};

export const FineTuneManagement: React.FC<FineTuneManagementProps> = ({ language }) => {
    const t = translations[language];
    const { showToast } = useToast();

    // State for Excel converter
    const [jsonlData, setJsonlData] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);

    // State for trained data list
    const [trainedData, setTrainedData] = useState<TrainingDataSource[]>([]);
    const [isLoadingTrainedData, setIsLoadingTrainedData] = useState(true);
    const [exportingAiId, setExportingAiId] = useState<number | string | null>(null);

    const fetchTrainedData = async () => {
        setIsLoadingTrainedData(true);
        try {
            const data = await apiService.getAllQaTrainingData();
            setTrainedData(data);
        } catch (error) {
            showToast((error as Error).message, 'error');
        } finally {
            setIsLoadingTrainedData(false);
        }
    };

    useEffect(() => {
        fetchTrainedData();
    }, []);

    const groupedData = useMemo(() => {
        return trainedData.reduce((acc: Record<string, { aiName: string; sources: TrainingDataSource[]; lastExported: string | null }>, item) => {
            const key = String(item.aiConfigId);
            if (!acc[key]) {
                acc[key] = {
                    aiName: item.aiName || `AI ID ${key}`,
                    sources: [],
                    lastExported: null,
                };
            }
            acc[key].sources.push(item);
            if (item.lastExportedAt) {
                const currentExportDate = new Date(item.lastExportedAt);
                if (!acc[key].lastExported || currentExportDate > new Date(acc[key].lastExported!)) {
                    acc[key].lastExported = item.lastExportedAt;
                }
            }
            return acc;
        }, {});
    }, [trainedData]);


    const handleExport = async (aiConfigId: number | string) => {
        setExportingAiId(aiConfigId);
        try {
            const dataToExport = groupedData[String(aiConfigId)]?.sources;
            if (!dataToExport || dataToExport.length === 0) {
                throw new Error('No data to export for this AI.');
            }
            await apiService.exportQaDataForFinetune(dataToExport);
            showToast(t.exportSuccess, 'success');
            await fetchTrainedData(); // Refresh data to show new export date
        } catch (error) {
            showToast(t.exportError.replace('{message}', (error as Error).message), 'error');
        } finally {
            setExportingAiId(null);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const processFile = (file: File) => {
        setJsonlData(null);
        setFileName(file.name.split('.')[0]);
        setIsProcessing(true);

        const validTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
        if (!validTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
            showToast(t.errors.invalidFileType, 'error');
            setIsProcessing(false);
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const binaryStr = event.target?.result;
                const workbook = XLSX.read(binaryStr, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const data: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                if (data.length < 2) {
                    showToast(t.errors.noData, 'error');
                    throw new Error('No data');
                }

                if (!data[0] || data[0].length < 2) {
                    showToast(t.errors.missingColumns, 'error');
                    throw new Error('Missing columns');
                }

                const jsonlLines: string[] = [];
                for (let i = 1; i < data.length; i++) {
                    const row = data[i];
                    const question = row[0];
                    const answer = row[1];

                    if (question && answer) {
                        const line = {
                            messages: [
                                { role: 'user', content: String(question) },
                                { role: 'assistant', content: String(answer) },
                            ]
                        };
                        jsonlLines.push(JSON.stringify(line));
                    }
                }
                
                setJsonlData(jsonlLines.join('\n'));
                showToast(t.processSuccess);
            } catch (err) {
                if ((err as Error).message !== 'No data' && (err as Error).message !== 'Missing columns') {
                    showToast(t.errors.processingError, 'error');
                }
            } finally {
                setIsProcessing(false);
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleDownload = () => {
        if (!jsonlData) return;
        const blob = new Blob([jsonlData], { type: 'application/jsonl' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}_finetune.jsonl`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">{t.title}</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-background-panel shadow-md rounded-lg p-6 space-y-4">
                    <h2 className="text-xl font-semibold">{t.instructionsTitle}</h2>
                    <ul className="list-disc list-inside space-y-1 text-text-light">
                        {t.instructions.map((inst, index) => <li key={index}>{inst}</li>)}
                    </ul>
                    <div
                        className="mt-6 border-2 border-dashed border-border-color rounded-lg p-10 text-center cursor-pointer hover:border-primary"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById('file-upload')?.click()}
                    >
                        <input id="file-upload" type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileChange} />
                        <p className="text-text-light">{isProcessing ? t.processing : t.uploadArea}</p>
                    </div>
                </div>

                <div className="bg-background-panel shadow-md rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">{t.previewTitle}</h2>
                    <div className="bg-background-light p-4 rounded-md h-64 overflow-auto font-mono text-sm text-text-main">
                        {jsonlData ? (
                            <pre><code>{jsonlData.split('\n').slice(0, 3).join('\n')}</code></pre>
                        ) : (
                            <p className="text-text-light">{t.noData}</p>
                        )}
                    </div>
                    <button
                        onClick={handleDownload}
                        disabled={!jsonlData || isProcessing}
                        className="mt-6 w-full px-5 py-3 text-sm font-medium text-text-on-primary bg-primary rounded-md hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {t.downloadButton}
                    </button>
                </div>
            </div>

            <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6">{t.trainedConversations}</h2>
                <div className="bg-background-panel shadow-md rounded-lg overflow-hidden">
                    {isLoadingTrainedData ? (
                        <p className="p-6 text-center text-text-light">{t.loadingTrainedData}</p>
                    ) : Object.keys(groupedData).length === 0 ? (
                        <p className="p-6 text-center text-text-light">{t.noTrainedData}</p>
                    ) : (
                        <table className="min-w-full divide-y divide-border-color">
                            <thead className="bg-background-light">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase">{t.aiAgent}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase">{t.qaPairs}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase">{t.lastExported}</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-text-light uppercase">{t.actions}</th>
                                </tr>
                            </thead>
                            <tbody className="bg-background-panel divide-y divide-border-color">
                                {Object.entries(groupedData).map(([aiId, data]) => (
                                    <tr key={aiId}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-main">{data.aiName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-main">{data.sources.length}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">
                                            {data.lastExported ? new Date(data.lastExported).toLocaleString(language) : t.notYetExported}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleExport(aiId)}
                                                disabled={exportingAiId === aiId}
                                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-text-on-primary bg-primary hover:bg-primary-hover disabled:opacity-50"
                                            >
                                                {exportingAiId === aiId ? (
                                                    <>
                                                        <span className="w-4 h-4 border-2 border-dashed rounded-full animate-spin border-white mr-2"></span>
                                                        {t.exporting}
                                                    </>
                                                ) : (
                                                    <>
                                                        <DownloadIcon className="w-4 h-4 mr-2" />
                                                        {t.downloadJsonl}
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};