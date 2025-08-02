import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useAuth } from '../../contexts/AuthContext';
import { FontAwesome } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import * as Haptics from 'expo-haptics';

import PointsDisplay from '../../components/ui/PointsDisplay';
import ScanResultModal from '../../components/ui/ScanResultModal';

export default function ScanScreen() {
    const { token } = useAuth();
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [cameraType, setCameraType] = useState<CameraType>('back');
    const [torchEnabled, setTorchEnabled] = useState(false);
    const [points, setPoints] = useState(0);
    const [lastScanPoints, setLastScanPoints] = useState(0);
    const [showResultModal, setShowResultModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const fetchPoints = async () => {
            try {
                // TODO: Replace with actual API call
                const response = await fetch('YOUR_API_URL/user/points', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                if (response.ok) {
                    setPoints(data.points);
                }
            } catch (error) {
                console.error('Failed to fetch points', error);
            }
        };

        if (token) {
            fetchPoints();
        }
    }, [token]);

    if (!permission) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-900">
                <Text className="text-white">No access to camera</Text>
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50 p-6">
                <Text className="text-lg text-center mb-4">
                    We need your permission to access the camera for QR scanning
                </Text>
                <TouchableOpacity
                    className="bg-indigo-600 px-6 py-3 rounded-lg"
                    onPress={requestPermission}
                >
                    <Text className="text-white font-medium">Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleBarCodeScanned = async ({ data }: { data: string }) => {
        if (scanned) return;
        setScanned(true);
        setIsProcessing(true);
        
        try {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            // TODO: Replace with actual API call to process the scanned QR code
            const response = await fetch('YOUR_API_URL/scan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ qrCode: data }),
            });

            const result = await response.json();

            if (response.ok) {
                setPoints(prev => prev + result.pointsEarned);
                setLastScanPoints(result.pointsEarned);
                setShowResultModal(true);
                
                // Reset scanning after 2 seconds
                setTimeout(() => {
                setScanned(false);
                }, 2000);
            } else {
                Alert.alert('Scan Failed', result.message || 'Could not process QR code');
                setScanned(false);
            }
        } catch (error) {
            console.error('Scan error:', error);
            Alert.alert('Error', 'Failed to process QR code');
            setScanned(false);
        } finally {
            setIsProcessing(false);
        }
    };

    const toggleCameraType = () => {
        setCameraType(current => (current === 'back' ? 'front' : 'back'));
    };

    const toggleTorch = () => {
        setTorchEnabled(current => !current);
    };

    return (
        <View className="flex-1 bg-black">
            <PointsDisplay points={points} />

            <View className="flex-1">
                <CameraView
                    className="absolute top-0 bottom-0 left-0 right-0"
                    facing={cameraType}
                    onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                    barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                    enableTorch={torchEnabled}
                />

                {/* Scanner Frame */}
                <View className="absolute inset-0 items-center justify-center">
                    <View className="w-64 h-64 border-4 border-indigo-400 rounded-lg relative">
                        <View className="absolute -top-1 -left-1 w-12 h-12 border-l-4 border-t-4 border-indigo-400" />
                        <View className="absolute -top-1 -right-1 w-12 h-12 border-r-4 border-t-4 border-indigo-400" />
                        <View className="absolute -bottom-1 -left-1 w-12 h-12 border-l-4 border-b-4 border-indigo-400" />
                        <View className="absolute -bottom-1 -right-1 w-12 h-12 border-r-4 border-b-4 border-indigo-400" />
                    </View>
                </View>

                {/* Camera Controls */}
                <View className="absolute bottom-10 left-0 right-0 flex-row justify-center space-x-12 gap-8">
                    <TouchableOpacity
                        className="bg-gray-800 bg-opacity-70 min-w-20 min-h-20 items-center justify-center rounded-3xl p-5"
                        onPress={toggleCameraType}
                    >
                        <FontAwesome name="refresh" size={24} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="bg-gray-800 bg-opacity-70 min-w-20 min-h-20 items-center justify-center rounded-3xl p-5"
                        onPress={toggleTorch}
                    >
                        <FontAwesome
                            name="flash"
                            size={24}
                            color={torchEnabled ? Colors.primary : 'white'}
                        />
                    </TouchableOpacity>
                </View>

                {/* Processing Overlay */}
                {isProcessing && (
                    <View className="absolute inset-0 items-center justify-center bg-black bg-opacity-50">
                        <View className="bg-white p-6 rounded-lg">
                            <Text className="text-lg font-medium">Processing QR Code...</Text>
                        </View>
                    </View>
                )}
            </View>

            <ScanResultModal
                visible={showResultModal}
                pointsEarned={lastScanPoints}
                onClose={() => setShowResultModal(false)}
            />
        </View>
    );
}