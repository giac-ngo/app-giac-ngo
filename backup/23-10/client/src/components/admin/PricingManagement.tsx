// client/src/components/admin/PricingManagement.tsx
import React, { useState, useEffect } from 'react';
import { PricingPlan } from '../../types';
import { apiService } from '../../services/apiService';
import { useToast } from '../ToastProvider';

interface PricingManagementProps {
    language: 'vi' | 'en';
}

const translations = {
    vi: {
        title: 'Quản lý Bảng giá',
        loading: 'Đang tải...',
        newPlan: 'Tạo Gói Mới',
        editPlan: 'Chỉnh sửa Gói',
        planName: 'Tên Gói',
        price: 'Giá hiển thị (VD: 30 Coins, Miễn phí)',
        coinCost: 'Chi phí (Coins)',
        duration: 'Thời hạn (ngày)',
        durationPlaceholder: 'Để trống cho không giới hạn',
        features: 'Tính năng (mỗi dòng một tính năng)',
        isActive: 'Kích hoạt',
        save: 'Lưu',
        saving: 'Đang lưu...',
        cancel: 'Hủy',
        delete: 'Xóa',
        confirmDelete: 'Bạn có chắc muốn xóa gói này?',
        errorFetch: 'Không thể tải danh sách gói.',
        errorSave: 'Lưu thất bại.',
        errorDelete: 'Xóa thất bại.',
        saveSuccess: 'Đã lưu bảng giá thành công!',
    },
    en: {
        title: 'Pricing Management',
        loading: 'Loading...',
        newPlan: 'Create New Plan',
        editPlan: 'Edit Plan',
        planName: 'Plan Name',
        price: 'Display Price (e.g., 30 Coins, Free)',
        coinCost: 'Cost (Coins)',
        duration: 'Duration (days)',
        durationPlaceholder: 'Leave blank for unlimited',
        features: 'Features (one per line)',
        isActive: 'Active',
        save: 'Save',
        saving: 'Saving...',
        cancel: 'Cancel',
        delete: 'Delete',
        confirmDelete: 'Are you sure you want to delete this plan?',
        errorFetch: 'Could not load plans.',
        errorSave: 'Save failed.',
        errorDelete: 'Delete failed.',
        saveSuccess: 'Pricing plan saved successfully!',
    }
}

const PricingManagement: React.FC<PricingManagementProps> = ({ language }) => {
    const t = translations[language];
    const [plans, setPlans] = useState<PricingPlan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Partial<PricingPlan> | null>(null);
    const { showToast } = useToast();

    const fetchPlans = async () => {
        setIsLoading(true);
        try {
            const data = await apiService.getPricingPlans();
            setPlans(data);
        } catch (error) {
            showToast(t.errorFetch, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const handleEdit = (plan: PricingPlan) => setEditingPlan({ ...plan });
    const handleNew = () => setEditingPlan({ id: 'new', planName: '', price: '', coinCost: 0, durationDays: 30, features: [], isActive: true });
    const handleCancel = () => setEditingPlan(null);

    const handleSave = async () => {
        if (!editingPlan) return;
        setIsSaving(true);
        try {
            const planToSave = {
                ...editingPlan,
                coinCost: Number(editingPlan.coinCost || 0),
                durationDays: editingPlan.durationDays ? Number(editingPlan.durationDays) : null,
            };

            if (editingPlan.id === 'new') {
                const { id, ...newPlan } = planToSave;
                // FIX: The type assertion was causing a conflict. Changed to a safer cast that matches the function signature.
                await apiService.createPricingPlan(newPlan as Parameters<typeof apiService.createPricingPlan>[0]);
            } else {
                await apiService.updatePricingPlan(planToSave as PricingPlan);
            }
            showToast(t.saveSuccess);
            setEditingPlan(null);
            await fetchPlans();
        } catch (error: any) {
            showToast(error.message || t.errorSave, 'error');
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleDelete = async (id: number | string) => {
        if (window.confirm(t.confirmDelete)) {
            try {
                await apiService.deletePricingPlan(id);
                await fetchPlans();
            } catch (error) {
                showToast(t.errorDelete, 'error');
            }
        }
    };

    const handleFormChange = (field: keyof PricingPlan, value: any) => {
        if (editingPlan) {
            setEditingPlan({ 
                ...editingPlan, 
                [field]: field === 'features' ? value.split('\n') : value 
            });
        }
    };

    const renderPlanForm = () => {
        if (!editingPlan) return null;
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                <div className="bg-background-panel rounded-lg shadow-xl w-full max-w-md p-6 space-y-4">
                    <h2 className="text-xl font-bold">{editingPlan.id === 'new' ? t.newPlan : t.editPlan}</h2>
                    <div><label className="block text-sm font-medium">{t.planName}</label><input type="text" value={editingPlan.planName || ''} onChange={e => handleFormChange('planName', e.target.value)} className="mt-1 w-full p-2 border rounded" /></div>
                    <div><label className="block text-sm font-medium">{t.price}</label><input type="text" value={editingPlan.price || ''} onChange={e => handleFormChange('price', e.target.value)} className="mt-1 w-full p-2 border rounded" /></div>
                    <div><label className="block text-sm font-medium">{t.coinCost}</label><input type="number" value={editingPlan.coinCost || 0} onChange={e => handleFormChange('coinCost', e.target.value)} className="mt-1 w-full p-2 border rounded" /></div>
                    <div><label className="block text-sm font-medium">{t.duration}</label><input type="number" value={editingPlan.durationDays ?? ''} onChange={e => handleFormChange('durationDays', e.target.value)} placeholder={t.durationPlaceholder} className="mt-1 w-full p-2 border rounded" /></div>
                    <div><label className="block text-sm font-medium">{t.features}</label><textarea value={editingPlan.features?.join('\n') || ''} onChange={e => handleFormChange('features', e.target.value)} rows={4} className="mt-1 w-full p-2 border rounded"></textarea></div>
                    <div className="flex items-center"><input type="checkbox" checked={editingPlan.isActive || false} onChange={e => handleFormChange('isActive', e.target.checked)} id="isActiveCheckbox" className="h-4 w-4 rounded" /><label htmlFor="isActiveCheckbox" className="ml-2 text-sm">{t.isActive}</label></div>
                    <div className="flex justify-end space-x-3">
                        <button onClick={handleCancel} className="px-4 py-2 bg-gray-200 rounded">{t.cancel}</button>
                        <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-primary text-text-on-primary rounded disabled:opacity-50">{isSaving ? t.saving : t.save}</button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-8">
            {renderPlanForm()}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">{t.title}</h1>
                <button onClick={handleNew} className="px-4 py-2 bg-primary text-text-on-primary rounded-md hover:bg-primary-hover">{t.newPlan}</button>
            </div>
            {isLoading ? <p>{t.loading}</p> : (
                 <div className="bg-background-panel shadow-md rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-border-color">
                        <thead className="bg-background-light">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase">{t.planName}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase">{t.price}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase">{t.coinCost}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase">{t.duration}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase">{t.isActive}</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-text-light uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-background-panel divide-y divide-border-color">
                            {plans.map(plan => (
                                <tr key={plan.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{plan.planName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{plan.price}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{plan.coinCost}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{plan.durationDays}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${plan.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{plan.isActive ? 'Yes' : 'No'}</span></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                        <button onClick={() => handleEdit(plan)} className="text-primary hover:text-primary-hover">Edit</button>
                                        <button onClick={() => handleDelete(plan.id)} className="text-accent-red hover:text-accent-red-hover">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default PricingManagement;