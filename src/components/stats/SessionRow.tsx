import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Icon } from '@/components/ui/Icon';
import { formatTimeOfDay } from '@/lib/format';
import { useAppTheme } from '@/theme/ThemeProvider';
import type { FocusSession } from '@/types/session';

export function SessionRow({ session }: { session: FocusSession }) {
  const { colors } = useAppTheme();
  const completed = session.status === 'COMPLETED';
  const minutes = Math.round(session.focusedSeconds / 60);

  return (
    <View style={styles.row}>
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: completed ? colors.accentMint + '22' : colors.danger + '18' },
        ]}
      >
        <Icon
          name={completed ? 'checkmark.circle.fill' : 'xmark.circle.fill'}
          size={18}
          color={completed ? colors.accentMint : colors.danger}
        />
      </View>
      <View style={styles.textWrap}>
        <AppText weight="medium">{formatTimeOfDay(session.startedAt)}</AppText>
        <AppText variant="small" muted style={{ marginTop: 2 }}>
          {completed ? 'Completed' : 'Interrupted'}
        </AppText>
      </View>
      <AppText weight="semibold">{minutes} min</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
  },
});
