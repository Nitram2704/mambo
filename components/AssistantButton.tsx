import React from 'react';
import { TouchableOpacity, View, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAssistantStore } from '@/store/assistantStore';
import { AssistantChat } from './AssistantChat';

export function AssistantButton() {
    return <AssistantChat />;
}
