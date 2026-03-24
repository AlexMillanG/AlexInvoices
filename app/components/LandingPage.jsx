import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const LandingPage = ({ navigation, scannedCodes, setScannedCodes }) => {
    const [selectedRfc, setSelectedRfc] = useState('HIOL710917HJ8');
    const [manualCode, setManualCode] = useState('');

    const sendDataToServer = async () => {
        if (scannedCodes.length === 0) {
            Alert.alert('Error', 'No hay códigos para enviar.');
            return;
        }

        try {
            const response = await fetch('http://192.168.0.21:3000/data', {

                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    codes: scannedCodes,
                    rfc: selectedRfc
                }),
            });

            const result = await response.json();
            Alert.alert('Éxito', 'Códigos enviados correctamente.');
        } catch (error) {
            console.log(error)
            Alert.alert('Error', 'Hubo un problema al enviar los códigos.');
        }
    };

    const addManualCode = () => {
        const code = manualCode.trim();
        if (!code) return;
        if (scannedCodes.includes(code)) {
            Alert.alert('Duplicado', 'Este código ya ha sido ingresado.');
        } else {
            setScannedCodes([...scannedCodes, code]);
            setManualCode('');
        }
    };

    const deleteCode = (index) => {
        const newCodes = scannedCodes.filter((_, i) => i !== index);
        setScannedCodes(newCodes);
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Escáner de Códigos</Text>
            </View>

            <View style={styles.cta}>
                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => navigation.navigate('Scanner')}
                >
                    <Text style={styles.primaryButtonText}>COMENZAR A ESCANEAR</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.rfcSelector}>
                <Text style={styles.sectionTitle}>Seleccionar RFC:</Text>
                <Picker
                    selectedValue={selectedRfc}
                    style={styles.picker}
                    onValueChange={(itemValue) => setSelectedRfc(itemValue)}
                >
                    <Picker.Item label="HIOL710917HJ8" value="HIOL710917HJ8" />
                    <Picker.Item label="HIOF7311042X4" value="HIOF7311042X4" />
                </Picker>
            </View>

            <View style={styles.manualInputContainer}>
                <Text style={styles.sectionTitle}>Ingresar código manualmente:</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Escribe el código"
                    value={manualCode}
                    onChangeText={setManualCode}
                    keyboardType="numeric"

                />
                <TouchableOpacity style={styles.addButton} onPress={addManualCode}>
                    <Text style={styles.addButtonText}>Agregar Código</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.history}>
                <Text style={styles.sectionTitle}>Códigos Escaneados</Text>
                {scannedCodes.length === 0 ? (
                    <Text style={styles.emptyText}>No hay códigos escaneados</Text>
                ) : (
                    scannedCodes.map((code, index) => (
                        <View key={index} style={styles.codeItem}>
                            <Text style={styles.codeText}>{code}</Text>
                            <TouchableOpacity
                                onPress={() => deleteCode(index)}
                                style={styles.deleteButton}
                            >
                                <Text style={styles.deleteButtonText}>Eliminar</Text>
                            </TouchableOpacity>
                        </View>
                    ))
                )}
            </View>

            {scannedCodes.length > 0 && (
                <TouchableOpacity style={styles.sendButton} onPress={sendDataToServer}>
                    <Text style={styles.sendButtonText}>Enviar Códigos xd xd</Text>
                </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.resetButton} onPress={()=>{
                setScannedCodes([])
            }}>
                <Text style={styles.sendButtonText}>Eliminar lista de códigos</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};
//setScannedCodes([]);
const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#ffffff',
        paddingBottom: 20,
    },
    header: {
        alignItems: 'center',
        padding: 25,
        paddingTop: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    cta: {
        paddingHorizontal: 25,
        marginBottom: 30,
    },
    primaryButton: {
        backgroundColor: '#3498db',
        paddingVertical: 16,
        borderRadius: 10,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    history: {
        paddingHorizontal: 25,
        marginTop: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 10,
    },
    emptyText: {
        fontSize: 16,
        color: '#7f8c8d',
        textAlign: 'center',
    },
    codeItem: {
        backgroundColor: '#ecf0f1',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    codeText: {
        fontSize: 14,
        color: '#2c3e50',
    },
    deleteButton: {
        backgroundColor: '#e74c3c',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
    },
    deleteButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    sendButton: {
        backgroundColor: '#27ae60',
        paddingVertical: 16,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 25,
        marginTop: 20,
    },
    sendButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    resetButton:{
        backgroundColor: 'red',
        paddingVertical: 16,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 25,
        marginTop: 20,
    },
    rfcSelector: {
        paddingHorizontal: 25,
        marginTop: 10,
    },
    picker: {
        height: 50,
        width: '100%',
        backgroundColor: '#ecf0f1',
        borderRadius: 5,
        marginBottom: 10,
    },
    manualInputContainer: {
        paddingHorizontal: 25,
        marginTop: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#bdc3c7',
        borderRadius: 5,
        paddingHorizontal: 10,
        height: 45,
        backgroundColor: '#fff',
        marginBottom: 10,
    },
    addButton: {
        backgroundColor: '#8e44ad',
        paddingVertical: 12,
        borderRadius: 5,
        alignItems: 'center',
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
});

export default LandingPage;
