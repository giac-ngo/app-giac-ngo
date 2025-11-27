// client/src/components/admin/CommentManagement.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Comment as CommentType } from '../../types';
import { apiService } from '../../services/apiService';
import { useToast } from '../ToastProvider';

const translations = {
    vi: {
        title: 'Quản lý Bình luận',
        loading: 'Đang tải bình luận...',
        noComments: 'Không có bình luận nào khớp với bộ lọc.',
        filterByStatus: 'Lọc theo trạng thái',
        filterByType: 'Lọc theo loại',
        all: 'Tất cả',
        pending: 'Chờ duyệt',
        approved: 'Đã duyệt',
        rejected: 'Đã từ chối',
        user: 'Người dùng',
        source: 'Nguồn',
        comment: 'Bình luận',
        submittedOn: 'Ngày gửi',
        status: 'Trạng thái',
        actions: 'Hành động',
        approve: 'Duyệt',
        reject: 'Từ chối',
        delete: 'Xóa',
        approveSuccess: 'Bình luận đã được duyệt.',
        rejectSuccess: 'Bình luận đã bị từ chối.',
        deleteSuccess: 'Bình luận đã được xóa.',
        actionError: 'Thao tác thất bại: {message}',
        viewSource: 'Xem nguồn',
        commentTypeDocument: 'Tài liệu Thư viện',
    },
    en: {
        title: 'Comment Management',
        loading: 'Loading comments...',
        noComments: 'No comments match the filters.',
        filterByStatus: 'Filter by status',
        filterByType: 'Filter by type',
        all: 'All',
        pending: 'Pending',
        approved: 'Approved',
        rejected: 'Rejected',
        user: 'User',
        source: 'Source',
        comment: 'Comment',
        submittedOn: 'Submitted On',
        status: 'Status',
        actions: 'Actions',
        approve: 'Approve',
        reject: 'Reject',
        delete: 'Delete',
        approveSuccess: 'Comment approved.',
        rejectSuccess: 'Comment rejected.',
        deleteSuccess: 'Comment deleted.',
        actionError: 'Action failed: {message}',
        viewSource: 'View Source',
        commentTypeDocument: 'Library Document',
    }
};

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';
type TypeFilter = 'all' | 'document'; // Extend this as new types are added

export const CommentManagement: React.FC<{ language: 'vi' | 'en' }> = ({ language }) => {
    const t = translations[language];
    const { showToast } = useToast();

    const [comments, setComments] = useState<CommentType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
    const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

    const fetchComments = useCallback(async () => {
        setIsLoading(true);
        try {
            const filters: { status?: string, type?: string } = {};
            if (statusFilter !== 'all') filters.status = statusFilter;
            if (typeFilter !== 'all') filters.type = typeFilter;
            
            const data = await apiService.getComments(filters);
            setComments(data || []);
        } catch (error: any) {
            showToast(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [statusFilter, typeFilter, showToast]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const handleUpdateStatus = async (commentId: number, status: 'approved' | 'rejected') => {
        try {
            const updatedComment = await apiService.updateCommentStatus(commentId, status);
            setComments(prev => prev.map(c => c.id === commentId ? { ...c, ...updatedComment } : c));
            showToast(status === 'approved' ? t.approveSuccess : t.rejectSuccess, 'success');
        } catch (error: any) {
            showToast(t.actionError.replace('{message}', error.message), 'error');
        }
    };

    const handleDelete = async (commentId: number) => {
        if (window.confirm('Are you sure you want to delete this comment permanently?')) {
            try {
                await apiService.deleteComment(commentId);
                setComments(prev => prev.filter(c => c.id !== commentId));
                showToast(t.deleteSuccess, 'success');
            } catch (error: any) {
                showToast(t.actionError.replace('{message}', error.message), 'error');
            }
        }
    };
    
    const getStatusBadge = (status: 'pending' | 'approved' | 'rejected') => {
        switch (status) {
            case 'pending': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">{t.pending}</span>;
            case 'approved': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">{t.approved}</span>;
            case 'rejected': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">{t.rejected}</span>;
            default: return null;
        }
    };

    const getSourceLink = (comment: CommentType) => {
        switch (comment.commentType) {
            case 'document':
                return `#/library/${comment.sourceId}`; // Use hash routing for admin panel links
            default:
                return '#';
        }
    };
    
    const getCommentTypeLabel = (type: string) => {
        switch (type) {
            case 'document': return t.commentTypeDocument;
            default: return type;
        }
    }

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">{t.title}</h1>

            <div className="flex space-x-4 mb-4">
                <div>
                    <label htmlFor="status-filter" className="block text-sm font-medium text-text-light">{t.filterByStatus}</label>
                    <select id="status-filter" value={statusFilter} onChange={e => setStatusFilter(e.target.value as StatusFilter)} className="mt-1 block w-full p-2 border border-border-color rounded-md focus:ring-primary focus:border-primary">
                        <option value="pending">{t.pending}</option>
                        <option value="approved">{t.approved}</option>
                        <option value="rejected">{t.rejected}</option>
                        <option value="all">{t.all}</option>
                    </select>
                </div>
                 <div>
                    <label htmlFor="type-filter" className="block text-sm font-medium text-text-light">{t.filterByType}</label>
                    <select id="type-filter" value={typeFilter} onChange={e => setTypeFilter(e.target.value as TypeFilter)} className="mt-1 block w-full p-2 border border-border-color rounded-md focus:ring-primary focus:border-primary">
                        <option value="all">{t.all}</option>
                        <option value="document">{t.commentTypeDocument}</option>
                        {/* Add other types here as they are implemented */}
                    </select>
                </div>
            </div>

            <div className="bg-background-panel shadow-md rounded-lg overflow-hidden">
                 <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border-color">
                        <thead className="bg-background-light">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">{t.user}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">{t.comment}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">{t.source}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">{t.submittedOn}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">{t.status}</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-text-light uppercase tracking-wider">{t.actions}</th>
                            </tr>
                        </thead>
                         <tbody className="bg-background-panel divide-y divide-border-color">
                             {isLoading ? (
                                <tr><td colSpan={6} className="text-center py-4">{t.loading}</td></tr>
                            ) : comments.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-4">{t.noComments}</td></tr>
                            ) : (
                                comments.map(comment => (
                                    <tr key={comment.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-main">{comment.userName || 'N/A'}</td>
                                        <td className="px-6 py-4 text-sm text-text-light max-w-sm"><p className="line-clamp-3" title={comment.content}>{comment.content}</p></td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">
                                            <a href={getSourceLink(comment)} title={comment.sourceTitle} target="_blank" rel="noopener noreferrer" className="hover:underline text-primary truncate block max-w-xs">
                                                {comment.sourceTitle || `(${getCommentTypeLabel(comment.commentType)} ID: ${comment.sourceId})`}
                                            </a>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">{new Date(comment.createdAt).toLocaleString(language)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{getStatusBadge(comment.status)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            {comment.status !== 'approved' && <button onClick={() => handleUpdateStatus(comment.id, 'approved')} className="text-green-600 hover:text-green-900">{t.approve}</button>}
                                            {comment.status !== 'rejected' && <button onClick={() => handleUpdateStatus(comment.id, 'rejected')} className="text-yellow-600 hover:text-yellow-900">{t.reject}</button>}
                                            <button onClick={() => handleDelete(comment.id)} className="text-red-600 hover:text-red-900">{t.delete}</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                         </tbody>
                    </table>
                 </div>
            </div>
        </div>
    );
};
