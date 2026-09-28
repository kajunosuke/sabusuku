import { useEffect, useMemo, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { findService, getCategory, type CategoryId } from '../types';
import { useColors, type Colors } from '../theme';

type Props = {
  name: string;
  category: CategoryId;
  size?: number;
};

function iconUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}

/** ロゴが見つからなかったURL（同じ判定を何度もしないように覚えておく） */
const missingIcons = new Set<string>();

/** サービスのロゴ。一覧にないサービスや読み込めないときは頭文字のアイコンを表示 */
export function ServiceIcon({ name, category, size = 44 }: Props) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const service = findService(name);
  const uri = service ? iconUrl(service.domain) : undefined;
  const [failedUri, setFailedUri] = useState<string | undefined>(() =>
    uri && missingIcons.has(uri) ? uri : undefined,
  );

  // ロゴが見つからないと16pxの地球儀アイコンが返るので、そのときは頭文字にする
  useEffect(() => {
    if (!uri || missingIcons.has(uri)) return;
    let active = true;
    const markMissing = () => {
      missingIcons.add(uri);
      if (active) setFailedUri(uri);
    };
    Image.getSize(
      uri,
      (width) => {
        if (width <= 16) markMissing();
      },
      markMissing,
    );
    return () => {
      active = false;
    };
  }, [uri]);

  const radius = size * 0.26;

  if (uri && failedUri !== uri && !missingIcons.has(uri)) {
    return (
      <View style={[styles.logoBox, { width: size, height: size, borderRadius: radius }]}>
        <Image
          source={{ uri }}
          style={{ width: size * 0.68, height: size * 0.68, borderRadius: size * 0.12 }}
          onError={() => setFailedUri(uri)}
        />
      </View>
    );
  }

  const color = getCategory(category).color;
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  return (
    <View
      style={[
        styles.fallback,
        { width: size, height: size, borderRadius: radius, backgroundColor: color },
      ]}
    >
      <Text style={[styles.initial, { fontSize: size * 0.45 }]}>{initial}</Text>
    </View>
  );
}

function createStyles(colors: Colors) {
  return StyleSheet.create({
    logoBox: {
      backgroundColor: '#fff',
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    fallback: { alignItems: 'center', justifyContent: 'center' },
    initial: { color: '#fff', fontWeight: '800' },
  });
}
