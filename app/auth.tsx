import React, { useState } from 'react';
import { Alert, StyleSheet, View, AppState, TextInput, TouchableOpacity, Text, ActivityIndicator, Modal, ScrollView } from 'react-native';
import { supabase } from '../lib/supabase';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
AppState.addEventListener('change', (state) => {
    if (state === 'active') {
        supabase.auth.startAutoRefresh();
    } else {
        supabase.auth.stopAutoRefresh();
    }
});

export default function Auth() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);

    async function signInWithEmail() {
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) Alert.alert(error.message);
        setLoading(false);
    }

    async function signUpWithEmail() {
        if (!termsAccepted) {
            Alert.alert('Terms Required', 'Please accept the Terms and Conditions to create an account.');
            return;
        }
        setLoading(true);
        const {
            data: { session },
            error,
        } = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if (error) Alert.alert(error.message);
        if (!session) Alert.alert('Please check your inbox for email verification!');
        setLoading(false);
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.header}>
                <Ionicons name="fitness" size={60} color="#4F46E5" />
                <Text style={styles.title}>Mambo Fitness</Text>
                <Text style={styles.subtitle}>{isLogin ? 'Welcome back' : 'Create an account'}</Text>
            </View>

            <View style={styles.form}>
                <View style={styles.inputContainer}>
                    <Ionicons name="mail-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        onChangeText={(text) => setEmail(text)}
                        value={email}
                        placeholder="email@address.com"
                        placeholderTextColor="#9CA3AF"
                        autoCapitalize="none"
                    />
                </View>
                <View style={styles.inputContainer}>
                    <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        onChangeText={(text) => setPassword(text)}
                        value={password}
                        secureTextEntry={true}
                        placeholder="Password"
                        placeholderTextColor="#9CA3AF"
                        autoCapitalize="none"
                    />
                </View>

                {!isLogin && (
                    <View style={styles.termsContainer}>
                        <TouchableOpacity
                            style={styles.checkbox}
                            onPress={() => setTermsAccepted(!termsAccepted)}
                        >
                            <Ionicons
                                name={termsAccepted ? "checkbox" : "square-outline"}
                                size={24}
                                color={termsAccepted ? "#4F46E5" : "#6B7280"}
                            />
                        </TouchableOpacity>
                        <View style={styles.termsTextContainer}>
                            <Text style={styles.termsText}>I accept the </Text>
                            <TouchableOpacity onPress={() => setShowTermsModal(true)}>
                                <Text style={styles.termsLink}>Terms and Conditions</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={isLogin ? signInWithEmail : signUpWithEmail}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>{isLogin ? 'Sign In' : 'Sign Up'}</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.switchButton}>
                    <Text style={styles.switchText}>
                        {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                    </Text>
                </TouchableOpacity>
            </View>


            <Modal
                animationType="slide"
                transparent={true}
                visible={showTermsModal}
                onRequestClose={() => setShowTermsModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Terms and Conditions</Text>
                            <TouchableOpacity onPress={() => setShowTermsModal(false)}>
                                <Ionicons name="close" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalBody}>
                            <Text style={styles.modalText}>
                                1. Acceptance of Terms{'\n'}
                                By accessing and using Mambo Fitness, you accept and agree to be bound by the terms and provision of this agreement.{'\n\n'}
                                2. Health Disclaimer{'\n'}
                                This app offers health and fitness information and is designed for educational and entertainment purposes only. You should consult your physician or general practitioner before beginning a new fitness program.{'\n\n'}
                                3. User Accounts{'\n'}
                                You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.{'\n\n'}
                                4. Privacy Policy{'\n'}
                                Your use of the app is also governed by our Privacy Policy. Please review our Privacy Policy for information on how we collect and use your data.{'\n\n'}
                                5. Modifications{'\n'}
                                We reserve the right to modify these terms at any time. Please check these terms periodically for changes.
                            </Text>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111827', // Dark background
        padding: 20,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#F9FAFB',
        marginTop: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#9CA3AF',
        marginTop: 5,
    },
    form: {
        width: '100%',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1F2937',
        borderRadius: 12,
        marginBottom: 16,
        paddingHorizontal: 12,
        height: 50,
        borderWidth: 1,
        borderColor: '#374151',
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        color: '#F9FAFB',
        fontSize: 16,
    },
    button: {
        backgroundColor: '#4F46E5',
        borderRadius: 12,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    switchButton: {
        marginTop: 20,
        alignItems: 'center',
    },
    switchText: {
        color: '#6366F1',
        fontSize: 14,
    },

    termsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    checkbox: {
        marginRight: 10,
    },
    termsTextContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    termsText: {
        color: '#9CA3AF',
        fontSize: 14,
    },
    termsLink: {
        color: '#4F46E5',
        fontSize: 14,
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#1F2937',
        borderRadius: 16,
        width: '100%',
        maxHeight: '80%',
        padding: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#374151',
        paddingBottom: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#F9FAFB',
    },
    modalBody: {
        marginBottom: 10,
    },
    modalText: {
        color: '#D1D5DB',
        fontSize: 14,
        lineHeight: 22,
    },
});
