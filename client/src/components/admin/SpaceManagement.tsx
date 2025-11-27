// client/src/components/admin/SpaceManagement.tsx
import React, { useState, useEffect, useRef,  useCallback } from 'react';
import { Space, User, SpaceType } from '../../types';
import { apiService } from '../../services/apiService';
import { useToast } from '../ToastProvider';
import { PlusIcon, PencilIcon, TrashIcon } from '../Icons';

const translations = {
    vi: {
        title: 'Quản lý Không gian',
        newSpace: 'Không gian Mới',
        loading: 'Đang tải...',
        selectOrCreate: 'Chọn một không gian để xem chi tiết hoặc tạo mới.',
        save: 'Lưu',
        saving: 'Đang lưu...',
        delete: 'Xóa',
        cancel: 'Hủy',
        confirmDeleteTitle: 'Xác nhận xóa',
        confirmDeleteBody: 'Bạn có chắc muốn xóa "{name}" không?',
        saveSuccess: 'Lưu không gian thành công!',
        saveError: 'Lưu thất bại: {message}',
        deleteSuccess: 'Xóa không gian thành công!',
        deleteError: 'Xóa thất bại: {message}',
        errorImageRequired: 'Vui lòng cung cấp ảnh bìa cho không gian.',
        // Form Fields
        name: 'Tên Không gian (VI)',
        nameEn: 'Tên Không gian (EN)',
        slug: 'Slug (URL)',
        description: 'Mô tả (VI)',
        descriptionEn: 'Mô tả (EN)',
        event: 'Sự kiện (VI)',
        eventEn: 'Sự kiện (EN)',
        imageUrl: 'URL Ảnh bìa',
        changeImage: 'Đổi ảnh',
        location: 'Địa điểm (VI)',
        locationEn: 'Địa điểm (EN)',
        members: 'Thành viên',
        views: 'Lượt xem',
        likes: 'Lượt thích',
        rating: 'Đánh giá',
        tags: 'Thẻ (VI, phân cách bằng dấu phẩy)',
        tagsEn: 'Thẻ (EN, phân cách bằng dấu phẩy)',
        type: 'Loại hình & Màu sắc',
        status: 'Trạng thái (VI)',
        statusEn: 'Trạng thái (EN)',
        rank: 'Thứ hạng',
        owner: 'Sở hữu',
        selectPlaceholder: '-- Chọn loại --',
        noSpace: '-- Không có --',
        // Type Manager Modal
        manageTypesTitle: 'Quản lý Loại hình Không gian',
        typeName: 'Tên (VI)',
        typeNameEn: 'Tên (EN)',
        icon: 'Icon',
        addNewType: 'Thêm Loại hình mới',
        update: 'Cập nhật',
    },
    en: {
        title: 'Spaces Management',
        newSpace: 'New Space',
        loading: 'Loading...',
        selectOrCreate: 'Select a space to see details or create a new one.',
        save: 'Save',
        saving: 'Saving...',
        delete: 'Delete',
        cancel: 'Cancel',
        confirmDeleteTitle: 'Confirm Deletion',
        confirmDeleteBody: 'Are you sure you want to delete "{name}"?',
        saveSuccess: 'Space saved successfully!',
        saveError: 'Save failed: {message}',
        deleteSuccess: 'Space deleted successfully!',
        deleteError: 'Delete failed: {message}',
        errorImageRequired: 'Please provide a cover image for the space.',
        // Form Fields
        name: 'Space Name (VI)',
        nameEn: 'Space Name (EN)',
        slug: 'Slug (URL)',
        description: 'Description (VI)',
        descriptionEn: 'Description (EN)',
        event: 'Event (VI)',
        eventEn: 'Event (EN)',
        imageUrl: 'Cover Image URL',
        changeImage: 'Change Image',
        location: 'Location (VI)',
        locationEn: 'Location (EN)',
        members: 'Members',
        views: 'Views',
        likes: 'Likes',
        rating: 'Rating',
        tags: 'Tags (VI, comma-separated)',
        tagsEn: 'Tags (EN, comma-separated)',
        type: 'Type & Color',
        status: 'Status (VI)',
        statusEn: 'Status (EN)',
        rank: 'Rank',
        owner: 'Owner',
        selectPlaceholder: '-- Select type --',
        noSpace: '-- None --',
        // Type Manager Modal
        manageTypesTitle: 'Manage Space Types',
        typeName: 'Name (VI)',
        typeNameEn: 'Name (EN)',
        icon: 'Icon',
        addNewType: 'Add New Type',
        update: 'Update',
    }
}

const SpaceTypeManagerModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
    language: 'vi' | 'en';
}> = ({ isOpen, onClose, onUpdate, language }) => {
    const t = translations[language];
    const { showToast } = useToast();
    const [types, setTypes] = useState<SpaceType[]>([]);
    const [editingType, setEditingType] = useState<Partial<SpaceType> | null>(null);

    useEffect(() => {
        if (isOpen) {
            apiService.getSpaceTypes().then(setTypes);
        }
    }, [isOpen]);

    const handleSave = async (typeToSave: Partial<SpaceType>) => {
        if (!typeToSave.name) return;
        try {
            if ('id' in typeToSave) {
                await apiService.updateSpaceType(typeToSave.id as number, typeToSave);
            } else {
                await apiService.createSpaceType(typeToSave);
            }
            setEditingType(null);
            onUpdate();
            apiService.getSpaceTypes().then(setTypes);
        } catch (e: any) {
            showToast(e.message, 'error');
        }
    };
    
    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure? This action cannot be undone.')) {
            try {
                await apiService.deleteSpaceType(id);
                onUpdate();
                apiService.getSpaceTypes().then(setTypes);
            } catch (e: any) {
                showToast(e.message, 'error');
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-background-panel rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold p-4 border-b">{t.manageTypesTitle}</h2>
                <div className="p-4 overflow-y-auto space-y-2">
                    {types.map(type => (
                        <div key={type.id} className="p-2 bg-background-light rounded-md flex items-center gap-2">
                            <span className="text-xl">{type.icon}</span>
                            <span className="font-medium flex-grow">{type.name} / {type.nameEn}</span>
                            <button onClick={() => setEditingType(type)} className="p-1"><PencilIcon className="w-4 h-4 text-text-light"/></button>
                            <button onClick={() => handleDelete(type.id)} className="p-1"><TrashIcon className="w-4 h-4 text-accent-red"/></button>
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t space-y-2">
                    <h3 className="font-semibold">{editingType?.id ? t.update : t.addNewType}</h3>
                    <div className="flex items-center gap-2">
                        <input type="text" value={editingType?.icon || ''} onChange={e => setEditingType(prev => ({...prev, icon: e.target.value}))} placeholder={t.icon} className="p-2 border rounded-md w-16 text-center" />
                        <input type="text" value={editingType?.name || ''} onChange={e => setEditingType(prev => ({...prev, name: e.target.value}))} placeholder={t.typeName} className="p-2 border rounded-md flex-grow" />
                        <input type="text" value={editingType?.nameEn || ''} onChange={e => setEditingType(prev => ({...prev, nameEn: e.target.value}))} placeholder={t.typeNameEn} className="p-2 border rounded-md flex-grow" />
                        <button onClick={() => handleSave(editingType || {})} className="px-4 py-2 bg-primary text-white rounded-md">{editingType?.id ? t.update : t.addNewType}</button>
                        {editingType && <button onClick={() => setEditingType(null)} className="px-4 py-2 bg-gray-200 rounded-md">{t.cancel}</button>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const SpaceManagement: React.FC<{ language: 'vi' | 'en', user: User }> = ({ language, user }) => {
    const t = translations[language];
    const { showToast } = useToast();
    const [spaces, setSpaces] = useState<Space[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [spaceTypes, setSpaceTypes] = useState<SpaceType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSpace, setSelectedSpace] = useState<Partial<Space> | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isTypeManagerOpen, setIsTypeManagerOpen] = useState(false);

    const imageInputRef = useRef<HTMLInputElement>(null);

    const isSuperAdmin = user.permissions?.includes('roles');

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [spaceData, userData, typeData] = await Promise.all([
                apiService.getSpaces(),
                isSuperAdmin ? apiService.getAllUsers(1, 999, '') : Promise.resolve([user]),
                apiService.getSpaceTypes()
            ]);
            setSpaces(spaceData || []);
            setAllUsers(userData || []);
            setSpaceTypes(typeData || []);
        } catch (error) {
            showToast('Failed to load initial data.', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [isSuperAdmin, user, showToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSelectSpace = (space: Space) => {
        setSelectedSpace({
            ...space,
            tags: Array.isArray(space.tags) ? space.tags : [],
            tagsEn: Array.isArray(space.tagsEn) ? space.tagsEn : []
        });
        setImageFile(null);
    };

    const handleNewSpace = () => {
        setSelectedSpace({
            id: 'new',
            name: '',
            slug: '',
            rank: 0,
            tags: [],
            tagsEn: [],
            imageUrl: '',
            userId: isSuperAdmin ? null : user.id as number,
        });
        setImageFile(null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        if (!selectedSpace) return;
        const { name, value, type } = e.target;
        let processedValue: any = value;
        if (type === 'number') {
             processedValue = value === '' ? 0 : Number(value);
        }
         if (name === 'userId' && value === '') {
            processedValue = null;
        }
        setSelectedSpace(prev => prev ? { ...prev, [name]: processedValue } : null);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedSpace(prev => prev ? { ...prev, imageUrl: reader.result as string } : null);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSave = async () => {
        if (!selectedSpace) return;
        if (!imageFile && !selectedSpace.imageUrl) {
            showToast(t.errorImageRequired, 'error');
            return;
        }

        setIsSaving(true);
        try {
            let finalPayload = { ...selectedSpace };

            // Logic for creating a new space is split to handle getting an ID first
            if (selectedSpace.id === 'new') {
                const { id: tempId, imageUrl: tempImgUrl, ...createPayload } = finalPayload;
                const newSpace = await apiService.createSpace(createPayload);
                finalPayload.id = newSpace.id;

                if (imageFile) {
                    const formData = new FormData();
                    formData.append('context', 'Spaces');
                    formData.append('spaceId', String(newSpace.id));
                    formData.append('file', imageFile);
                    const res = await apiService.uploadFiles(formData);
                    if (res.filePaths && res.filePaths[0]) {
                        finalPayload.imageUrl = res.filePaths[0];
                        await apiService.updateSpace({ id: newSpace.id as number, spaceData: { imageUrl: finalPayload.imageUrl } });
                    }
                }
                const fullNewSpace = { ...newSpace, imageUrl: finalPayload.imageUrl };
                setSpaces(prev => [fullNewSpace, ...prev.filter(s => s.id !== 'new')]);
                setSelectedSpace(fullNewSpace);

            } else { // Logic for updating an existing space
                if (imageFile) {
                    const formData = new FormData();
                    formData.append('context', 'Spaces');
                    formData.append('spaceId', String(selectedSpace.id));
                    formData.append('file', imageFile);
                    const res = await apiService.uploadFiles(formData);
                    if (res.filePaths && res.filePaths[0]) {
                        finalPayload.imageUrl = res.filePaths[0];
                    }
                }
                const updatedSpace = await apiService.updateSpace({ id: selectedSpace.id as number, spaceData: finalPayload });
                setSpaces(prev => prev.map(s => s.id === updatedSpace.id ? updatedSpace : s));
                setSelectedSpace(updatedSpace);
            }

            showToast(t.saveSuccess, 'success');
            setImageFile(null);
        } catch (error: any) {
            showToast(t.saveError.replace('{message}', error.message), 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedSpace || typeof selectedSpace.id !== 'number') return;
        if (window.confirm(t.confirmDeleteBody.replace('{name}', selectedSpace.name || ''))) {
            try {
                await apiService.deleteSpace(selectedSpace.id);
                setSpaces(prev => prev.filter(s => s.id !== selectedSpace.id));
                setSelectedSpace(null);
                showToast(t.deleteSuccess, 'success');
            } catch (error: any) {
                showToast(t.deleteError.replace('{message}', error.message), 'error');
            }
        }
    };

    const renderForm = () => {
        if (!selectedSpace) {
            return <div className="flex items-center justify-center h-full text-text-light">{t.selectOrCreate}</div>;
        }
        return (
            <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div><label className="block text-sm font-medium">{t.name}</label><input type="text" name="name" value={selectedSpace.name || ''} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md" /></div>
                    <div><label className="block text-sm font-medium">{t.nameEn}</label><input type="text" name="nameEn" value={selectedSpace.nameEn || ''} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md" /></div>
                    <div><label className="block text-sm font-medium">{t.slug}</label><input type="text" name="slug" value={selectedSpace.slug || ''} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md" /></div>
                    <div className="lg:col-span-3"><label className="block text-sm font-medium">{t.description}</label><textarea name="description" value={selectedSpace.description || ''} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md" rows={3}></textarea></div>
                    <div className="lg:col-span-3"><label className="block text-sm font-medium">{t.descriptionEn}</label><textarea name="descriptionEn" value={selectedSpace.descriptionEn || ''} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md" rows={3}></textarea></div>
                    <div className="lg:col-span-3"><label className="block text-sm font-medium">{t.event}</label><textarea name="event" value={selectedSpace.event || ''} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md" rows={3}></textarea></div>
                    <div className="lg:col-span-3"><label className="block text-sm font-medium">{t.eventEn}</label><textarea name="eventEn" value={selectedSpace.eventEn || ''} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md" rows={3}></textarea></div>
                    
                    <div className="lg:col-span-1 flex flex-col">
                        <label className="block text-sm font-medium mb-1">{t.imageUrl}</label>
                        <div className="w-full h-32 rounded-md border bg-gray-100 mb-2 flex items-center justify-center overflow-hidden">
                            {selectedSpace.imageUrl && <img src={selectedSpace.imageUrl} alt="Cover Preview" className="w-full h-full object-cover" />}
                        </div>
                        <input type="file" ref={imageInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                        <button type="button" onClick={() => imageInputRef.current?.click()} className="px-4 py-2 text-sm border rounded-md w-full">{t.changeImage}</button>
                    </div>

                    <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium">{t.location}</label><input type="text" name="locationText" value={selectedSpace.locationText || ''} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md" /></div>
                        <div><label className="block text-sm font-medium">{t.locationEn}</label><input type="text" name="locationTextEn" value={selectedSpace.locationTextEn || ''} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md" /></div>
                        <div><label className="block text-sm font-medium">{t.members}</label><input type="number" name="membersCount" value={selectedSpace.membersCount ?? ''} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md" /></div>
                        <div><label className="block text-sm font-medium">{t.rating}</label><input type="number" name="rating" step="0.1" value={selectedSpace.rating ?? ''} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md" /></div>
                        <div><label className="block text-sm font-medium">{t.status}</label><input type="text" name="status" value={selectedSpace.status || ''} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md" /></div>
                        <div><label className="block text-sm font-medium">{t.statusEn}</label><input type="text" name="statusEn" value={selectedSpace.statusEn || ''} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md" /></div>
                    </div>

                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                         <div>
                            <label className="block text-sm font-medium">{t.type}</label>
                            <div className="flex items-center gap-1 mt-1">
                                <select name="typeId" value={selectedSpace.typeId || ''} onChange={handleInputChange} className="flex-grow p-2 border rounded-md">
                                    <option value="">{t.selectPlaceholder}</option>
                                    {spaceTypes.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}
                                </select>
                                <button onClick={() => setIsTypeManagerOpen(true)} className="p-2 rounded-md hover:bg-gray-200"><PencilIcon className="w-4 h-4 text-text-light"/></button>
                                <input type="color" name="spaceColor" value={selectedSpace.spaceColor || '#ffffff'} onChange={handleInputChange} className="h-9 p-0.5" />
                            </div>
                        </div>
                        <div><label className="block text-sm font-medium">{t.rank}</label><input type="number" name="rank" value={selectedSpace.rank ?? ''} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md" /></div>
                        <div>
                             <label className="block text-sm font-medium">{t.owner}</label>
                            <select name="userId" value={selectedSpace.userId ?? ''} onChange={handleInputChange} disabled={!isSuperAdmin} className="mt-1 w-full p-2 border rounded-md disabled:bg-gray-100">
                                <option value="">{t.noSpace}</option>
                                {allUsers.map(u => <option key={u.id as number} value={u.id as number}>{u.name}</option>)}
                            </select>
                        </div>
                    </div>
                     <div className="lg:col-span-3"><label className="block text-sm font-medium">{t.tags}</label><input type="text" value={(selectedSpace.tags || []).join(', ')} onChange={e => setSelectedSpace(prev => prev ? {...prev, tags: e.target.value.split(',').map(t=>t.trim())} : null)} className="mt-1 w-full p-2 border rounded-md" /></div>
                     <div className="lg:col-span-3"><label className="block text-sm font-medium">{t.tagsEn}</label><input type="text" value={(selectedSpace.tagsEn || []).join(', ')} onChange={e => setSelectedSpace(prev => prev ? {...prev, tagsEn: e.target.value.split(',').map(t=>t.trim())} : null)} className="mt-1 w-full p-2 border rounded-md" /></div>
                </div>
                <div className="flex justify-end space-x-2 p-4 border-t">
                    {selectedSpace.id !== 'new' && <button onClick={handleDelete} className="px-4 py-2 bg-accent-red text-white rounded-md">{t.delete}</button>}
                    <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-primary text-white rounded-md">{isSaving ? t.saving : t.save}</button>
                </div>
            </div>
        );
    };

    return (
        <div className="flex h-full">
            <aside className="w-80 border-r flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-lg font-bold">{t.title}</h2>
                    <button onClick={handleNewSpace}><PlusIcon className="w-6 h-6"/></button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {isLoading ? <p className="p-4">{t.loading}</p> : spaces.map(space => (
                        <button key={space.id} onClick={() => handleSelectSpace(space)} className={`w-full text-left p-3 border-b flex items-center gap-3 ${selectedSpace?.id === space.id ? 'bg-primary-light' : 'hover:bg-gray-100'}`}>
                            <img src={space.imageUrl} alt={space.name} className="w-12 h-12 rounded-md object-cover"/>
                            <div>
                                <p className="font-semibold truncate">{space.name}</p>
                                <p className="text-sm text-gray-500">{space.spaceTypeName}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </aside>
            <main className="flex-1 overflow-y-auto">
                {renderForm()}
            </main>
            <SpaceTypeManagerModal isOpen={isTypeManagerOpen} onClose={() => setIsTypeManagerOpen(false)} onUpdate={fetchData} language={language} />
        </div>
    );
};