import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { useTranslation } from 'react-i18next';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';

export default function AdvancedAnalyticsScreen() {
    const { t } = useTranslation();

    return (
        <ScreenWrapper headerTitle={t('analytics.advancedTitle', 'Analytics Avanzados')}>
            <AnalyticsDashboard />
        </ScreenWrapper>
    );
}
