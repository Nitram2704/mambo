import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, Rect, Path, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { LinearGradient as ExpoGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';

interface InfographicProps {
    type: string;
}

export const Infographic: React.FC<InfographicProps> = ({ type }) => {
    const { t } = useTranslation();
    const { theme } = useAppTheme();
    const colors = Colors[theme];

    const renderContent = () => {
        switch (type) {
            case 'muscle_fiber_growth':
                return (
                    <View className="items-center">
                        <Svg width="200" height="120" viewBox="0 0 200 120">
                            <Defs>
                                <LinearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <Stop offset="0%" stopColor={colors.orange[500]} />
                                    <Stop offset="100%" stopColor={colors.orange[600]} />
                                </LinearGradient>
                            </Defs>
                            {/* Before */}
                            <Rect x="20" y="40" width="60" height="15" rx="7.5" fill={theme === 'dark' ? '#4b5563' : '#9ca3af'} />
                            <Text
                                className="text-[10px] absolute left-5 top-14"
                                style={{ color: theme === 'dark' ? '#9ca3af' : '#4b5563' }}
                            >
                                {t('learn.miniLessons.infographics.muscle_fiber_growth.before')}
                            </Text>

                            {/* Arrow */}
                            <Path d="M95 47 L105 47 L105 42 L115 47 L105 52 L105 47" fill={colors.tabIconSelected} />

                            {/* After */}
                            <Rect x="120" y="30" width="60" height="35" rx="10" fill="url(#grad1)" />
                            <Text className="text-white text-[10px] font-bold absolute right-5 top-14">
                                {t('learn.miniLessons.infographics.muscle_fiber_growth.after')}
                            </Text>
                        </Svg>
                        <Text
                            className="text-xs mt-2 text-center px-4"
                            style={{ color: colors.textSecondary }}
                        >
                            {t('learn.miniLessons.infographics.muscle_fiber_growth.description')}
                        </Text>
                    </View>
                );

            case 'macro_balance':
                return (
                    <View className="items-center w-full">
                        <View className="flex-row items-end justify-around w-full h-32 px-10">
                            <View className="items-center">
                                <ExpoGradient colors={[colors.blue[500], colors.blue[600]]} className="w-8 h-24 rounded-t-lg" />
                                <Text className="text-[10px] font-bold mt-1" style={{ color: colors.blue[500] }}>
                                    {t('learn.miniLessons.infographics.macro_balance.prot')}
                                </Text>
                                <Text className="text-[8px]" style={{ color: colors.textSecondary }}>30%</Text>
                            </View>
                            <View className="items-center">
                                <ExpoGradient colors={[colors.green[500], colors.green[600]]} className="w-8 h-20 rounded-t-lg" />
                                <Text className="text-[10px] font-bold mt-1" style={{ color: colors.green[500] }}>
                                    {t('learn.miniLessons.infographics.macro_balance.carb')}
                                </Text>
                                <Text className="text-[8px]" style={{ color: colors.textSecondary }}>50%</Text>
                            </View>
                            <View className="items-center">
                                <ExpoGradient colors={[colors.yellow[500], colors.yellow[600]]} className="w-8 h-12 rounded-t-lg" />
                                <Text className="text-[10px] font-bold mt-1" style={{ color: colors.yellow[500] }}>
                                    {t('learn.miniLessons.infographics.macro_balance.fat')}
                                </Text>
                                <Text className="text-[8px]" style={{ color: colors.textSecondary }}>20%</Text>
                            </View>
                        </View>
                        <Text
                            className="text-xs mt-4 text-center px-4"
                            style={{ color: colors.textSecondary }}
                        >
                            {t('learn.miniLessons.infographics.macro_balance.description')}
                        </Text>
                    </View>
                );

            case 'calorie_deficit':
                return (
                    <View className="items-center">
                        <Svg width="200" height="100" viewBox="0 0 200 100">
                            {/* Base */}
                            <Path d="M100 80 L80 100 L120 100 Z" fill={theme === 'dark' ? '#4b5563' : '#9ca3af'} />
                            {/* Beam */}
                            <G transform="rotate(-15, 100, 80)">
                                <Rect x="20" y="75" width="160" height="4" fill={theme === 'dark' ? '#9ca3af' : '#4b5563'} />
                                {/* Left Side (Burned) */}
                                <Circle cx="30" cy="65" r="15" fill={colors.error} />
                                <Text
                                    className="text-[8px] absolute left-2 top-10"
                                    style={{ color: colors.error }}
                                >
                                    {t('learn.miniLessons.infographics.calorie_deficit.burned')}
                                </Text>
                                {/* Right Side (Consumed) */}
                                <Circle cx="170" cy="85" r="10" fill={colors.tabIconSelected} />
                                <Text
                                    className="text-[8px] absolute right-2 top-14"
                                    style={{ color: colors.tabIconSelected }}
                                >
                                    {t('learn.miniLessons.infographics.calorie_deficit.consumed')}
                                </Text>
                            </G>
                        </Svg>
                        <Text
                            className="text-xs mt-2 text-center px-4"
                            style={{ color: colors.textSecondary }}
                        >
                            {t('learn.miniLessons.infographics.calorie_deficit.description')}
                        </Text>
                    </View>
                );

            case 'sleep_cycle':
                return (
                    <View className="items-center">
                        <Svg width="220" height="100" viewBox="0 0 220 100">
                            <Path
                                d="M0 50 Q25 10, 50 50 T100 50 T150 50 T200 50"
                                fill="none"
                                stroke={colors.primary}
                                strokeWidth="3"
                            />
                            <Circle cx="50" cy="50" r="5" fill={colors.primary} />
                            <Text
                                className="text-[8px] absolute left-10 top-14"
                                style={{ color: colors.primary }}
                            >
                                {t('learn.miniLessons.infographics.sleep_cycle.deep')}
                            </Text>
                            <Text
                                className="text-[8px] absolute left-2 top-10"
                                style={{ color: colors.textSecondary }}
                            >
                                {t('learn.miniLessons.infographics.sleep_cycle.rem')}
                            </Text>
                        </Svg>
                        <Text
                            className="text-xs mt-2 text-center px-4"
                            style={{ color: colors.textSecondary }}
                        >
                            {t('learn.miniLessons.infographics.sleep_cycle.description')}
                        </Text>
                    </View>
                );

            case 'fiber_types':
                return (
                    <View className="flex-row justify-around w-full p-4">
                        <View className="items-center flex-1">
                            <View
                                className="w-12 h-12 rounded-full items-center justify-center border"
                                style={{
                                    backgroundColor: `${colors.error}20`,
                                    borderColor: colors.error
                                }}
                            >
                                <View
                                    className="w-6 h-6 rounded-full opacity-50"
                                    style={{ backgroundColor: colors.error }}
                                />
                            </View>
                            <Text className="font-bold text-[10px] mt-2" style={{ color: colors.error }}>
                                {t('learn.miniLessons.infographics.fiber_types.type1')}
                            </Text>
                            <Text
                                className="text-[8px] text-center"
                                style={{ color: colors.textSecondary }}
                            >
                                {t('learn.miniLessons.infographics.fiber_types.type1Desc')}
                            </Text>
                        </View>
                        <View className="items-center flex-1">
                            <View
                                className="w-16 h-16 rounded-full items-center justify-center border"
                                style={{
                                    backgroundColor: `${colors.orange[500]}20`,
                                    borderColor: colors.orange[500]
                                }}
                            >
                                <View
                                    className="w-10 h-10 rounded-full"
                                    style={{ backgroundColor: colors.orange[500] }}
                                />
                            </View>
                            <Text className="font-bold text-[10px] mt-2" style={{ color: colors.orange[500] }}>
                                {t('learn.miniLessons.infographics.fiber_types.type2')}
                            </Text>
                            <Text
                                className="text-[8px] text-center"
                                style={{ color: colors.textSecondary }}
                            >
                                {t('learn.miniLessons.infographics.fiber_types.type2Desc')}
                            </Text>
                        </View>
                    </View>
                );

            case 'overtraining_signs':
                return (
                    <View className="flex-row flex-wrap justify-center gap-2 p-2">
                        {[
                            t('learn.miniLessons.infographics.overtraining_signs.fatigue'),
                            t('learn.miniLessons.infographics.overtraining_signs.insomnia'),
                            t('learn.miniLessons.infographics.overtraining_signs.pain'),
                            t('learn.miniLessons.infographics.overtraining_signs.irritability')
                        ].map(sign => (
                            <View
                                key={sign}
                                className="px-3 py-1 rounded-full border"
                                style={{
                                    backgroundColor: `${colors.error}10`,
                                    borderColor: `${colors.error}30`
                                }}
                            >
                                <Text className="text-[10px] font-bold" style={{ color: colors.error }}>{sign}</Text>
                            </View>
                        ))}
                    </View>
                );

            case 'proven_supplements':
                return (
                    <View className="w-full px-4">
                        <View
                            className="p-3 rounded-xl border"
                            style={{
                                backgroundColor: `${colors.green[500]}10`,
                                borderColor: `${colors.green[500]}30`
                            }}
                        >
                            <Text className="font-bold text-xs mb-2" style={{ color: colors.green[500] }}>
                                {t('learn.miniLessons.infographics.proven_supplements.title')}
                            </Text>
                            <Text className="text-[10px]" style={{ color: colors.text }}>
                                {t('learn.miniLessons.infographics.proven_supplements.creatine')}
                            </Text>
                            <Text className="text-[10px]" style={{ color: colors.text }}>
                                {t('learn.miniLessons.infographics.proven_supplements.protein')}
                            </Text>
                            <Text className="text-[10px]" style={{ color: colors.text }}>
                                {t('learn.miniLessons.infographics.proven_supplements.caffeine')}
                            </Text>
                        </View>
                    </View>
                );

            case 'vitamin_wheel':
                return (
                    <View className="items-center">
                        <Svg width="120" height="120" viewBox="0 0 120 120">
                            <Circle cx="60" cy="60" r="50" fill="none" stroke={colors.border} strokeWidth="1" strokeDasharray="5,5" />
                            {/* Vitamins */}
                            {[0, 60, 120, 180, 240, 300].map((angle, i) => {
                                const x = 60 + 40 * Math.cos((angle * Math.PI) / 180);
                                const y = 60 + 40 * Math.sin((angle * Math.PI) / 180);
                                const vColors = [colors.error, colors.yellow[500], colors.green[500], colors.blue[500], colors.purple[500], colors.pink[500]];
                                const labels = ['A', 'B', 'C', 'D', 'E', 'K'];
                                return (
                                    <G key={i}>
                                        <Circle cx={x} cy={y} r="10" fill={vColors[i]} />
                                        <Text
                                            className="text-white text-[8px] font-bold absolute"
                                            style={{ left: x - 3, top: y - 5 }}
                                        >
                                            {labels[i]}
                                        </Text>
                                    </G>
                                );
                            })}
                            <Circle cx="60" cy="60" r="15" fill={colors.tabIconSelected} opacity="0.2" />
                            <Text
                                className="text-[8px] font-bold absolute left-[48px] top-[55px]"
                                style={{ color: colors.tabIconSelected }}
                            >
                                {t('learn.miniLessons.infographics.vitamin_wheel.title')}
                            </Text>
                        </Svg>
                        <Text
                            className="text-xs mt-2 text-center px-4"
                            style={{ color: colors.textSecondary }}
                        >
                            {t('learn.miniLessons.infographics.vitamin_wheel.description')}
                        </Text>
                    </View>
                );

            case 'meal_timing':
                return (
                    <View className="w-full px-6">
                        <View className="flex-row items-center justify-between mb-2">
                            <View className="items-center">
                                <View
                                    className="w-8 h-8 rounded-full items-center justify-center border"
                                    style={{
                                        backgroundColor: `${colors.blue[500]}20`,
                                        borderColor: colors.blue[500]
                                    }}
                                >
                                    <Ionicons name="sunny" size={16} color={colors.blue[500]} />
                                </View>
                                <Text className="text-[8px] mt-1" style={{ color: colors.textSecondary }}>
                                    {t('learn.miniLessons.infographics.meal_timing.pre')}
                                </Text>
                            </View>
                            <View className="h-[1px] flex-1 mx-2" style={{ backgroundColor: colors.border }} />
                            <View className="items-center">
                                <View
                                    className="w-10 h-10 rounded-full items-center justify-center shadow-lg"
                                    style={{
                                        backgroundColor: colors.orange[500],
                                        shadowColor: colors.orange[500]
                                    }}
                                >
                                    <Ionicons name="fitness" size={20} color="white" />
                                </View>
                                <Text className="text-[8px] font-bold mt-1" style={{ color: colors.orange[500] }}>
                                    {t('learn.miniLessons.infographics.meal_timing.workout')}
                                </Text>
                            </View>
                            <View className="h-[1px] flex-1 mx-2" style={{ backgroundColor: colors.border }} />
                            <View className="items-center">
                                <View
                                    className="w-8 h-8 rounded-full items-center justify-center border"
                                    style={{
                                        backgroundColor: `${colors.green[500]}20`,
                                        borderColor: colors.green[500]
                                    }}
                                >
                                    <Ionicons name="restaurant" size={16} color={colors.green[500]} />
                                </View>
                                <Text className="text-[8px] mt-1" style={{ color: colors.textSecondary }}>
                                    {t('learn.miniLessons.infographics.meal_timing.post')}
                                </Text>
                            </View>
                        </View>
                        <Text
                            className="text-[10px] text-center"
                            style={{ color: colors.textSecondary }}
                        >
                            {t('learn.miniLessons.infographics.meal_timing.description')}
                        </Text>
                    </View>
                );

            case 'active_recovery':
                return (
                    <View className="items-center">
                        <View className="flex-row gap-4">
                            <View className="items-center">
                                <Ionicons name="walk" size={32} color={colors.tabIconSelected} />
                                <Text className="text-[8px] mt-1" style={{ color: colors.tabIconSelected }}>
                                    {t('learn.miniLessons.infographics.active_recovery.walk')}
                                </Text>
                            </View>
                            <View className="items-center">
                                <Ionicons name="bicycle" size={32} color={colors.tabIconSelected} />
                                <Text className="text-[8px] mt-1" style={{ color: colors.tabIconSelected }}>
                                    {t('learn.miniLessons.infographics.active_recovery.bike')}
                                </Text>
                            </View>
                            <View className="items-center">
                                <Ionicons name="water" size={32} color={colors.tabIconSelected} />
                                <Text className="text-[8px] mt-1" style={{ color: colors.tabIconSelected }}>
                                    {t('learn.miniLessons.infographics.active_recovery.swim')}
                                </Text>
                            </View>
                        </View>
                        <Text
                            className="text-xs mt-3 text-center px-4"
                            style={{ color: colors.textSecondary }}
                        >
                            {t('learn.miniLessons.infographics.active_recovery.description')}
                        </Text>
                    </View>
                );

            case 'body_recomp':
                return (
                    <View className="items-center">
                        <View className="flex-row items-center gap-4">
                            <View className="items-center">
                                <View
                                    className="w-16 h-16 rounded-full items-center justify-center"
                                    style={{ backgroundColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}
                                >
                                    <View
                                        className="w-12 h-12 rounded-full"
                                        style={{ backgroundColor: `${colors.error}40` }}
                                    />
                                    <View
                                        className="w-6 h-6 rounded-full absolute"
                                        style={{ backgroundColor: colors.orange[500] }}
                                    />
                                </View>
                                <Text className="text-[8px] mt-1" style={{ color: colors.textSecondary }}>
                                    {t('learn.miniLessons.infographics.body_recomp.start')}
                                </Text>
                            </View>
                            <Ionicons name="arrow-forward" size={20} color={colors.border} />
                            <View className="items-center">
                                <View
                                    className="w-16 h-16 rounded-full items-center justify-center"
                                    style={{ backgroundColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}
                                >
                                    <View
                                        className="w-6 h-6 rounded-full"
                                        style={{ backgroundColor: `${colors.error}20` }}
                                    />
                                    <View
                                        className="w-12 h-12 rounded-full"
                                        style={{ backgroundColor: colors.orange[500] }}
                                    />
                                </View>
                                <Text className="text-[8px] font-bold mt-1" style={{ color: colors.orange[500] }}>
                                    {t('learn.miniLessons.infographics.body_recomp.recomp')}
                                </Text>
                            </View>
                        </View>
                        <Text
                            className="text-xs mt-3 text-center px-4"
                            style={{ color: colors.textSecondary }}
                        >
                            {t('learn.miniLessons.infographics.body_recomp.description')}
                        </Text>
                    </View>
                );

            case 'marketing_myths':
                return (
                    <View className="w-full px-4">
                        <View
                            className="p-3 rounded-xl border"
                            style={{
                                backgroundColor: `${colors.error}10`,
                                borderColor: `${colors.error}30`
                            }}
                        >
                            <Text className="font-bold text-xs mb-2" style={{ color: colors.error }}>
                                {t('learn.miniLessons.infographics.marketing_myths.title')}
                            </Text>
                            <View className="flex-row items-center mb-1">
                                <Ionicons name="close-circle" size={12} color={colors.error} />
                                <Text className="text-[10px] ml-2" style={{ color: colors.textSecondary }}>
                                    &quot;{t('learn.miniLessons.infographics.marketing_myths.myth1')}&quot;
                                </Text>
                            </View>
                            <View className="flex-row items-center mb-1">
                                <Ionicons name="close-circle" size={12} color={colors.error} />
                                <Text className="text-[10px] ml-2" style={{ color: colors.textSecondary }}>
                                    &quot;{t('learn.miniLessons.infographics.marketing_myths.myth2')}&quot;
                                </Text>
                            </View>
                            <View className="flex-row items-center">
                                <Ionicons name="close-circle" size={12} color={colors.error} />
                                <Text className="text-[10px] ml-2" style={{ color: colors.textSecondary }}>
                                    &quot;{t('learn.miniLessons.infographics.marketing_myths.myth3')}&quot;
                                </Text>
                            </View>
                        </View>
                    </View>
                );

            case 'muscle_building':
                return (
                    <View className="items-center">
                        <Svg width="160" height="100" viewBox="0 0 160 100">
                            <Path d="M20 80 L140 20" stroke={colors.border} strokeWidth="2" strokeDasharray="4,4" />
                            <Path d="M20 80 Q80 70, 140 20" fill="none" stroke={colors.orange[500]} strokeWidth="4" />
                            <Circle cx="140" cy="20" r="6" fill={colors.orange[500]} />
                            <Text
                                className="text-[8px] font-bold absolute right-2 top-2"
                                style={{ color: colors.orange[500] }}
                            >
                                {t('learn.miniLessons.infographics.muscle_building.progress')}
                            </Text>
                        </Svg>
                        <Text
                            className="text-xs mt-2 text-center px-4"
                            style={{ color: colors.textSecondary }}
                        >
                            {t('learn.miniLessons.infographics.muscle_building.description')}
                        </Text>
                    </View>
                );

            case 'supplement_timing':
                return (
                    <View className="w-full px-4">
                        <View
                            className="p-3 rounded-xl border"
                            style={{
                                backgroundColor: `${colors.tabIconSelected}10`,
                                borderColor: `${colors.tabIconSelected}30`
                            }}
                        >
                            <Text className="font-bold text-xs mb-2" style={{ color: colors.tabIconSelected }}>
                                {t('learn.miniLessons.infographics.supplement_timing.title')}
                            </Text>
                            <Text className="text-[10px]" style={{ color: colors.textSecondary }}>
                                • {t('learn.miniLessons.infographics.supplement_timing.creatine')}
                            </Text>
                            <Text className="text-[10px]" style={{ color: colors.textSecondary }}>
                                • {t('learn.miniLessons.infographics.supplement_timing.caffeine')}
                            </Text>
                            <Text className="text-[10px]" style={{ color: colors.textSecondary }}>
                                • {t('learn.miniLessons.infographics.supplement_timing.protein')}
                            </Text>
                        </View>
                    </View>
                );

            case 'recovery_cycle':
                return (
                    <View className="items-center">
                        <Svg width="120" height="120" viewBox="0 0 120 120">
                            <Path d="M60 10 A50 50 0 0 1 110 60" fill="none" stroke={colors.tabIconSelected} strokeWidth="4" strokeLinecap="round" />
                            <Path d="M110 60 A50 50 0 0 1 60 110" fill="none" stroke={colors.green[500]} strokeWidth="4" strokeLinecap="round" />
                            <Path d="M60 110 A50 50 0 0 1 10 60" fill="none" stroke={colors.yellow[500]} strokeWidth="4" strokeLinecap="round" />
                            <Path d="M10 60 A50 50 0 0 1 60 10" fill="none" stroke={colors.error} strokeWidth="4" strokeLinecap="round" />
                            <Text
                                className="text-white text-[8px] font-bold absolute left-[45px] top-[55px]"
                                style={{ color: colors.text }}
                            >
                                {t('learn.miniLessons.infographics.recovery_cycle.title')}
                            </Text>
                        </Svg>
                        <View className="flex-row flex-wrap justify-center gap-2 mt-2">
                            <Text className="text-[8px]" style={{ color: colors.error }}>
                                {t('learn.miniLessons.infographics.recovery_cycle.stress')}
                            </Text>
                            <Text className="text-[8px]" style={{ color: colors.tabIconSelected }}>
                                {t('learn.miniLessons.infographics.recovery_cycle.rest')}
                            </Text>
                            <Text className="text-[8px]" style={{ color: colors.green[500] }}>
                                {t('learn.miniLessons.infographics.recovery_cycle.adaptation')}
                            </Text>
                        </View>
                    </View>
                );

            default:
                return (
                    <View className="items-center p-4">
                        <ExpoGradient colors={[colors.tabIconSelected, colors.primary]} className="w-12 h-12 rounded-full items-center justify-center">
                            <Ionicons name="information-circle" size={24} color="white" />
                        </ExpoGradient>
                        <Text className="text-xs mt-2" style={{ color: colors.textSecondary }}>
                            {t('learn.miniLessons.infographics.moreInfo')}
                        </Text>
                    </View>
                );
        }
    };

    return (
        <View
            className="my-4 p-4 rounded-2xl border overflow-hidden"
            style={{
                backgroundColor: theme === 'dark' ? 'rgba(31, 41, 55, 0.5)' : 'rgba(243, 244, 246, 0.8)',
                borderColor: colors.border
            }}
        >
            <Text
                className="text-[10px] font-bold uppercase tracking-widest mb-4 text-center"
                style={{ color: colors.textSecondary }}
            >
                {t('learn.miniLessons.infographics.visualization')}: {type.replace(/_/g, ' ')}
            </Text>
            {renderContent()}
        </View>
    );
};
