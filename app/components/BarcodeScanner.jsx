import { Camera, useCameraPermissions, CameraView } from 'expo-camera';
import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Alert, TouchableOpacity } from 'react-native';

export default function BarcodeScanner({ navigation, setScannedCodes }) {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);

    useEffect(() => {
        requestPermission();
    }, []);

    const handleBarCodeScanned = ({ type, data }) => {
        setScanned(true);
        Alert.alert(
            `Código ${type} Escaneado`,
            `Datos: ${data}`,
            [
                {
                    text: 'Cancelar',
                    onPress: () => setScanned(false),
                    style: 'cancel'
                },
                {
                    text: 'Guardar',
                    onPress: () => {
                        setScannedCodes(prev => [...prev, data]);
                        setScanned(false);
                    }
                },
            ]
        );
    };

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.permissionText}>Se necesitan permisos de cámara</Text>
                <Button title="Solicitar permiso" onPress={requestPermission} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CameraView
                style={styles.camera}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ['qr', 'pdf417', 'ean13', 'ean8', 'upc_a', 'upc_e'],
                }}
            >
                <View style={styles.overlay}>
                    <View style={styles.border} />
                </View>
                <TouchableOpacity
                    style={styles.exitButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.exitButtonText}>Volver</Text>
                </TouchableOpacity>
            </CameraView>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    camera: {
        flex: 1,
    },
    permissionText: {
        fontSize: 16,
        color: '#2c3e50',
        marginBottom: 20,
    },
    exitButton: {
        position: 'absolute',
        bottom: 30,
        alignSelf: 'center',
        backgroundColor: '#3498db',
        padding: 15,
        borderRadius: 10,
    },
    exitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    border: {
        width: 250,
        height: 250,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 10,
    },
});