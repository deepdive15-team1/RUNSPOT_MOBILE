# Chip

작은 블록으로 정보나 태그를 표시합니다. MAP_FE Chip을 React Native(`Pressable` / `View`)로 이식했으며, 색·간격은 `@/src/constants`의 `theme`과 맞춥니다.

## Import

```tsx
import Chip from "@/src/components/common/chip";
import type {
  ChipProps,
  ChipVariant,
  ChipSize,
  ChipColor,
} from "@/src/components/common/chip";
```

## Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| **label** | `React.ReactNode` | (필수) | 칩에 표시할 텍스트 또는 노드 |
| **variant** | `"filled" \| "outlined"` | `"filled"` | filled는 배경만, outlined는 테두리만 |
| **size** | `"small" \| "medium"` | `"medium"` | 크기 |
| **color** | `ChipColor` | `"default"` | 색상 |
| **clickable** | `boolean` | `onPress` 유무에 따름 | 클릭 가능 여부 |
| **disabled** | `boolean` | `false` | 비활성화 |
| **icon** | `React.ReactElement` | - | 왼쪽 아이콘 |
| **onDelete** | `(event) => void` | - | 삭제 시 호출, 설정 시 삭제 아이콘 표시 |
| **deleteIcon** | `React.ReactElement` | 기본 × | 삭제 아이콘 커스텀 |
| **onPress** | `() => void` | - | 탭 시 호출 (웹의 `onClick` 대신 `onPress`) |
| **style** | `ViewStyle` | - | 루트 스타일. 너비·높이 등도 여기서 지정 |

## 사용 예시

아이콘은 `react-native`의 `Text` 등으로 감싼 요소를 넘깁니다.

```tsx
import { Text } from "react-native";
import Chip from "@/src/components/common/chip";

<Chip label="기본 칩" />
<Chip label="Secondary outline" color="secondary" variant="outlined" />
<Chip label="Small 경고" size="small" color="warning" />
<Chip label="비활성" color="primary" disabled />
<Chip label="삭제" onDelete={() => {}} color="error" />
<Chip label="성공 액션" onPress={() => {}} color="success" />
<Chip label="아이콘" icon={<Text>🏷️</Text>} color="green" />
<Chip
  label="삭제 아이콘 커스텀"
  onDelete={() => {}}
  deleteIcon={<Text accessibilityLabel="삭제">✕</Text>}
  color="info"
/>
```

### `ChipColor`

`"default"` | `"primary"` | `"secondary"` | `"error"` | `"info"` | `"success"` | `"warning"` | `"green"` | `"yellow"` | `"red"`

### 너비·높이 (`style`)

루트 `style`로 너비·높이를 지정할 수 있습니다. `width`는 숫자(dp) 또는 `'50%'`, `'100%'` 등 문자열을 사용할 수 있습니다.

- **너비만** 지정하면 높이는 `size` 기본값(small: 24, medium: 32 dp)이 유지됩니다.
- **높이까지** 바꾸려면 `style`에 `height`를 함께 넣습니다.

```tsx
<Chip label="고정 너비" style={{ width: 200 }} />
<Chip label="부모의 50%" style={{ width: "50%" }} />
<Chip label="전체 너비" style={{ width: "100%" }} />
<Chip label="너비·높이" style={{ width: 200, height: 40 }} />
```

## 참고

- 삭제·탭 등 인터랙션은 접근성 라벨을 필요에 따라 지정하세요.
