# TextField

여러 줄 입력용 공통 컴포넌트입니다. `TextInput`(multiline) 기반이며 스타일은 `@/src/constants`의 `theme`과 맞춥니다.

## Import

```tsx
import { TextField } from "@/src/components/common/textfield";
import type {
  TextFieldProps,
  TextFieldVariant,
  TextFieldSize,
} from "@/src/components/common/textfield";
```

## Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| **label** | `React.ReactNode` | - | 상단 라벨 |
| **helperText** | `React.ReactNode` | - | 하단 안내 (`error` 시 `colors.error`) |
| **error** | `boolean` | `false` | 에러 스타일 |
| **variant** | `"primary" \| "secondary"` | `"primary"` | primary: 회색 배경, secondary: 흰 배경+테두리 |
| **size** | `"sm" \| "md" \| "lg"` | `"md"` | 최소 높이·패딩·글자 크기 |
| **fullWidth** | `boolean` | `true` | 너비 100% |
| **rows** / **minRows** | `number` | 행 수 기본 `3` | 최소 행에 맞춘 높이 |
| **maxRows** | `number` | - | 최대 높이·스크롤 |
| **inputProps** | `TextInputProps` | - | 내부 `TextInput`에 전달 |
| **readOnly** | `boolean` | `false` | 읽기 전용 (`editable={false}`) |
| **disabled** | `boolean` | `false` | 비활성 (`editable={false}`) |
| **containerStyle** | `ViewStyle` | - | 바깥 래퍼 |
| **inputStyle** | `TextStyle` | - | 입력란 |

`placeholder`, `value`, `onChangeText` 등 나머지는 `TextInput` props로 그대로 넘길 수 있습니다.

## 사용 예시

```tsx
import { TextField } from "@/src/components/common/textfield";

<TextField label="내용" placeholder="입력하세요" />
<TextField label="보조" variant="secondary" />
<TextField label="Small" size="sm" />
<TextField label="필수" error helperText="입력해 주세요" />
<TextField label="긴 글" minRows={5} maxRows={12} />
<TextField label="읽기 전용" readOnly value="고정" />
```

### 줄(행) 높이: `rows` · `minRows` · `maxRows`

입력 영역의 **최소 높이**는 “몇 줄 분량인지”로 정합니다. 내부적으로 글자 크기·`lineHeights.normal`로 한 줄 높이를 구한 뒤, 행 수만큼 곱해 박스 높이를 맞춥니다.

| 설정 | 의미 |
|------|------|
| **아무 것도 안 줌** | 최소 **3줄** 높이(및 `size`별 최소 높이와 비교해 더 큰 값 사용). |
| **minRows** | 최소 줄 수. `rows`가 없을 때 이 값으로 최소 높이 결정. |
| **rows** | `minRows`보다 **우선**. 최소 높이를 이 줄 수로 맞춤. |
| **maxRows** | 최대 줄 수만큼의 높이까지만 커지고, 그 이상은 **내부 스크롤** (`scrollEnabled`). |

```tsx
// 1) 기본: rows/minRows 없음 → 최소 높이는 약 3줄 분량
<TextField label="기본" placeholder="약 3줄 높이" />

// 2) 최소 5줄 높이만 지정
<TextField label="코멘트" minRows={5} placeholder="최소 5줄" />

// 3) rows가 있으면 minRows보다 우선 (최소 높이 ≈ 4줄)
<TextField label="제목" rows={4} minRows={2} />

// 4) maxRows: 박스는 최대 10줄 높이까지, 넘치면 스크롤
<TextField
  label="긴 본문"
  minRows={3}
  maxRows={10}
  value={longText}
  onChangeText={setLongText}
/>
```

## 참고

- 행 높이는 글자 크기·`lineHeights.normal`로 계산한 근사값입니다.
- 웹 textarea처럼 입력에 따라 박스가 자동으로 늘어나지는 않고, 지정한 최소~최대 높이 범위 안에서 표시됩니다.
