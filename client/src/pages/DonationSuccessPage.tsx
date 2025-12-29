// client/src/pages/DonationSuccessPage.tsx
import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { User } from '../types';
import { CheckIcon, HeartIcon } from '../components/Icons';

interface DonationSuccessPageProps {
    onUserUpdate: (updatedData: Partial<User>) => void;
}

export function DonationSuccessPage({ onUserUpdate }: DonationSuccessPageProps) {
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Đang xác minh giao dịch...');
    const [updatedUser, setUpdatedUser] = useState<User | null>(null);

    useEffect(() => {
        if (!sessionId) {
            setStatus('error');
            setMessage('Không tìm thấy thông tin phiên giao dịch.');
            return;
        }

        const verifyPayment = async () => {
            try {
                const user = await apiService.verifyCheckoutSession(sessionId);
                onUserUpdate(user);
                setUpdatedUser(user);
                setStatus('success');
                setMessage('Cúng dường thành công! Xin tri ân công đức của bạn.');
            } catch (error: any) {
                console.error("Verification failed:", error);
                setStatus('error');
                setMessage(error.message || 'Xác minh giao dịch thất bại. Vui lòng liên hệ hỗ trợ nếu tiền đã bị trừ.');
            }
        };

        verifyPayment();
    }, [sessionId, onUserUpdate]);

    return (
        <div className="min-h-screen bg-background-main flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center border border-border-color">
                {status === 'loading' && (
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                        <h2 className="text-xl font-bold text-text-main mb-2">Đang xử lý...</h2>
                        <p className="text-text-light">{message}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center animate-fade-in-right">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                            <CheckIcon className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-primary mb-2">Hoàn tất Cúng dường</h2>
                        <p className="text-text-main mb-6">{message}</p>
                        
                        {updatedUser && (
                            <div className="bg-background-light rounded-lg p-4 mb-6 w-full">
                                <p className="text-sm text-text-light mb-1">Số dư Merit hiện tại</p>
                                <p className="text-3xl font-bold text-primary">{updatedUser.merits?.toLocaleString()}</p>
                            </div>
                        )}

                        <div className="space-y-3 w-full">
                            <Link to="/giac-ngo/chat" className="block w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover transition-colors">
                                Quay lại Không gian Thực hành
                            </Link>
                            <Link to="/" className="block w-full py-3 bg-white border border-border-color text-text-main rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                                Về Trang chủ
                            </Link>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                            <HeartIcon className="w-10 h-10 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-red-600 mb-2">Giao dịch Thất bại</h2>
                        <p className="text-text-main mb-6">{message}</p>
                        <Link to="/donation" className="block w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover transition-colors">
                            Thử lại
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}