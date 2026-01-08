import React from 'react';
import { View, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { useAppTheme } from '../../hooks/use-app-theme';
import { Colors } from '../../constants/Colors';
import { AccessibleText } from '../../components/ui/AccessibleText';
import { useAccessibilityStore } from '../../store/accessibilityStore';

export default function AccessibilityScreen() {
    const { t } = useTranslation();
    const { theme } = useAppTheme();
    const {
        fontSize,
        highContrast,
        reduceMotion,
        setFontSize,
        toggleHighContrast,
        toggleReduceMotion
    } = useAccessibilityStore();

    const fontSizes = [
        { id: 'small', label: t('accessibility.small') },
        { id: 'medium', label: t('accessibility.medium') },
        { id: 'large', label: t('accessibility.large') },
        { id: 'xlarge', label: t('accessibility.xlarge') },
    ] as const;

    return (
        <ScreenWrapper>
            <Stack.Screen
                options={{
                    title: t('accessibility.title'),
                    headerShown: true,
                    headerTransparent: true,
                    headerTintColor: Colors[theme].text,
                }}
            />

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.section}>
                    <AccessibleText variant="h3" weight="bold" style={[styles.sectionTitle, { color: Colors[theme].text }]}>
                        {t('accessibility.fontSize')}
                    </AccessibleText>

                    <View style={[styles.card, { backgroundColor: Colors[theme].surface }]}>
                        {fontSizes.map((size, index) => (
                            <TouchableOpacity
                                key={size.id}
                                style={[
                                    styles.option,
                                    index !== fontSizes.length - 1 && styles.borderBottom,
                                    { borderBottomColor: Colors[theme].border }
                                ]}
                                onPress={() => setFontSize(size.id)}
                                accessibilityRole="radio"
                                accessibilityState={{ selected: fontSize === size.id }}
                                accessibilityLabel={`${size.label}, ${fontSize === size.id ? 'seleccionado' : ''}`}
                            >
                                <AccessibleText
                                    variant="body"
                                    style={{
                                        color: fontSize === size.id ? Colors[theme].primary : Colors[theme].text,
                                        fontWeight: fontSize === size.id ? 'bold' : 'normal'
                                    }}
                                >
                                    {size.label}
                                </AccessibleText>
                                {fontSize === size.id && (
                                    <Ionicons name="checkmark" size={20} color={Colors[theme].primary} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={[styles.card, { backgroundColor: Colors[theme].surface }]}>
                        <View style={[styles.option, styles.borderBottom, { borderBottomColor: Colors[theme].border }]}>
                            <View style={styles.optionTextContainer}>
                                <AccessibleText variant="body" weight="medium" style={{ color: Colors[theme].text }}>
                                    {t('accessibility.highContrast')}
                                </AccessibleText>
                                <AccessibleText variant="caption" style={{ color: Colors[theme].textSecondary }}>
                                    {t('accessibility.highContrastDesc')}
                                </AccessibleText>
                            </View>
                            <Switch
                                value={highContrast}
                                onValueChange={toggleHighContrast}
                                trackColor={{ false: Colors[theme].border, true: Colors[theme].primary }}
                                thumbColor="#fff"
                            />
                        </View>

                        <View style={styles.option}>
                            <View style={styles.optionTextContainer}>
                                <AccessibleText variant="body" weight="medium" style={{ color: Colors[theme].text }}>
                                    {t('accessibility.reduceMotion')}
                                </AccessibleText>
                                <AccessibleText variant="caption" style={{ color: Colors[theme].textSecondary }}>
                                    {t('accessibility.reduceMotionDesc')}
                                </AccessibleText>
                            </View>
                            <Switch
                                value={reduceMotion}
                                onValueChange={toggleReduceMotion}
                                trackColor={{ false: Colors[theme].border, true: Colors[theme].primary }}
                                thumbColor="#fff"
                            />
                        </View>
                    </View>
                </View>

                <View style={styles.previewSection}>
                    <AccessibleText variant="h3" weight="bold" style={[styles.sectionTitle, { color: Colors[theme].text }]}>
                        Vista Previa
                    </AccessibleText>
                    <View style={[styles.previewCard, { backgroundColor: Colors[theme].surface, borderColor: Colors[theme].border }]}>
                        <AccessibleText variant="h2" weight="bold" style={{ color: Colors[theme].text, marginBottom: 8 }}>
                            Título de Ejemplo
                        </AccessibleText>
                        <AccessibleText variant="body" style={{ color: Colors[theme].textSecondary }}>
                            Este es un texto de ejemplo para que puedas ver cómo se ajusta el tamaño de la fuente según tu preferencia.
                        </AccessibleText>
                    </View>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 20,
        paddingTop: 100,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        marginBottom: 12,
        marginLeft: 4,
    },
    card: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    optionTextContainer: {
        flex: 1,
        marginRight: 16,
    },
    borderBottom: {
        borderBottomWidth: 1,
    },
    previewSection: {
        marginTop: 8,
        marginBottom: 40,
    },
    previewCard: {
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
    },
});
