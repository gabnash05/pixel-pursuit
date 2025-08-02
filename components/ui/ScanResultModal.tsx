import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

export default function ScanResultModal({
    visible,
    pointsEarned,
    onClose,
}: {
    visible: boolean;
    pointsEarned: number;
    onClose: () => void;
}) {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View className="flex-1 items-center justify-center bg-black bg-opacity-70 p-6">
                <View className="bg-white rounded-xl p-6 w-full max-w-sm">
                    <View className="items-center mb-4">
                        <View className="bg-green-100 p-4 rounded-full mb-3">
                            <FontAwesome name="check" size={36} color={Colors.secondary} />
                        </View>
                        <Text className="text-xl font-bold text-gray-900">QR Code Scanned!</Text>
                    </View>

                    <View className="bg-indigo-50 p-4 rounded-lg mb-6">
                        <Text className="text-center text-gray-600 mb-1">You earned</Text>
                        <Text className="text-center text-4xl font-bold text-indigo-600">
                            +{pointsEarned} pts
                        </Text>
                    </View>

                    <TouchableOpacity
                        className="bg-indigo-600 p-4 rounded-lg"
                        onPress={onClose}
                    >
                        <Text className="text-white text-center font-medium">Continue Scanning</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}