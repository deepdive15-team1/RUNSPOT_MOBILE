# Select

MAP_FE의 Select(MUI 스타일)를 참고한 **단일 선택** 드롭다운입니다. **Select**는 라벨·트리거·`helperText`·`options`·`value` / `onChange`를 담고, **SelectOption**은 옵션 한 줄 UI(보통 `options` 배열만 사용)입니다. React Native에서는 `Modal`과 `measureInWindow`로 트리거 아래 또는 위에 메뉴를 띄우며, 스타일은 `@/src/constants`의 `theme`과 맞춥니다.

## Import

```tsx
import { Select } from "@/src/components/common/select";
import type {
  SelectProps,
  SelectOptionItem,
  SelectVariantType,
  SelectSizeType,
} from "@/src/components/common/select";
```

## Props

### Select

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| **label** | `React.ReactNode` | - | 상단 라벨 |
| **helperText** | `React.ReactNode` | - | 하단 안내 (`error` 시 빨간색) |
| **error** | `boolean` | `false` | 에러 스타일 |
| **variant** | `"primary" \| "secondary"` | `"primary"` | primary: 흰 배경, secondary: 회색 배경 |
| **size** | `"sm" \| "md" \| "lg"` | `"md"` | 높이·글자 크기 |
| **fullWidth** | `boolean` | `true` | 너비 100% |
| **value** | `Value \| ""` | - | 제어 컴포넌트 값 |
| **defaultValue** | `Value` | - | 비제어 기본값 |
| **onChange** | `(e: SelectChangeEvent<Value>) => void` | - | 변경 시 (`e.target.value`, `e.target.name`) |
| **options** | `SelectOptionItem<Value>[]` | (필수) | 옵션 목록 |
| **placeholder** | `React.ReactNode` | - | 선택 전 표시 |
| **displayEmpty** | `boolean` | `false` | 빈 값도 표시 영역 유지 |
| **renderValue** | `(value: Value) => React.ReactNode` | - | 선택값 커스텀 렌더 |
| **disabled** | `boolean` | `false` | 비활성 |
| **name** | `string` | `""` | `onChange`의 `target.name` |
| **MenuProps** | `{ placement?: MenuPlacement }` | - | 메뉴 배치 (`auto` / `top` / `bottom`) |
| **containerStyle** | `ViewStyle` | - | 바깥 래퍼 |
| **IconComponent** | `(props: { open: boolean }) => React.ReactNode` | 기본 ▼ | 우측 화살표 커스텀 |

### SelectOption

`options`만 쓰면 직접 쓰지 않아도 됩니다. 단일 행을 커스터마이즈할 때 참고합니다.

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| **value** | `string \| number` | (필수) | 옵션 값 |
| **disabled** | `boolean` | `false` | 비활성 |
| **selected** | `boolean` | - | 선택 여부(내부에서 설정) |

## 사용 예시

```tsx
import { useState } from "react";
import { Select } from "@/src/components/common/select";

const AGE_OPTIONS = [
  { value: 10, label: "10대" },
  { value: 20, label: "20대" },
  { value: 30, label: "30대" },
];

export function Example() {
  const [age, setAge] = useState<number | "">("");

  return (
    <Select
      label="나이"
      placeholder="선택하세요"
      value={age}
      onChange={(e) => setAge(e.target.value as number)}
      options={AGE_OPTIONS}
    />
  );
}
```

### 메뉴 위치 (`MenuProps.placement`)

화면 하단에서 잘리면 위로 열리게 하려면:

```tsx
<Select
  label="나이"
  value={age}
  onChange={(e) => setAge(e.target.value as number)}
  options={AGE_OPTIONS}
  MenuProps={{ placement: "top" }}
/>
```

| placement | 동작 |
|-----------|------|
| `"auto"` (기본) | 아래 공간이 부족하면 위로 열림 |
| `"bottom"` | 항상 트리거 아래 |
| `"top"` | 항상 트리거 위 |

## 참고

- 웹의 **SelectInput**·포털 **Menu**는 RN에서는 `Select` 하나에 통합되어 있습니다.
- `ref`는 `{ focus: () => void; value: unknown }` 형태이며, `focus()`는 드롭다운을 엽니다.
