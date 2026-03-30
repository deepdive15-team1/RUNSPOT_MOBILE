# Button

앱 전반에서 사용되는 공통 버튼 컴포넌트입니다. `Pressable` 기반이며 6가지 디자인 타입(Variant), 5가지 크기(Size), 아이콘 배치, 그리고 다양한 상태(Disabled, Selected)를 지원합니다. 스타일은 `@/src/constants`의 `theme` 토큰을 기반으로 합니다.

> 💡 **아이콘 전용 버튼**이 필요한 경우, 별도의 뷰(View) 조작 없이 `iconOnly` 프롭을 사용하여 완벽한 정사각형 버튼을 쉽게 구현할 수 있습니다.

## Import

```tsx
import { Button } from "@/src/components/common/Button";
import type {
  VariantType,
  SizeType,
} from "@/src/components/common/Button/Button.styles";
```

## Props

| Prop             | 타입                                                                                           | 기본값      | 설명                                                                                      |
| ---------------- | ---------------------------------------------------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------- |
| **variant**      | `"primary"` \| `"outline"` \| `"outlinePrimary"` \| `"neutral"` \| `"text"` \| `"textPrimary"` | `"primary"` | 버튼의 시각적 디자인 타입                                                                 |
| **size**         | `"xs"` \| `"sm"` \| `"md"` \| `"lg"` \| `"xl"`                                                 | `"lg"`      | 버튼의 높이, 좌우 패딩 및 폰트 크기                                                       |
| **fullWidth**    | `boolean`                                                                                      | `false`     | `true` 시 너비를 100%로 채움                                                              |
| **flex**         | `boolean` \| `number`                                                                          | -           | 부모 컨테이너 내에서 flex 비율 조절 (`true` 입력 시 `flex: 1`)                            |
| **iconOnly**     | `boolean`                                                                                      | `false`     | `true` 시 패딩을 없애고 높이(height)와 너비(width)를 동일하게 맞춰 **정사각형 형태** 유지 |
| **rounded**      | `boolean`                                                                                      | `false`     | `true` 시 모서리를 완전히 둥글게 처리 (`borderRadius: 9999`)                              |
| **isSelected**   | `boolean`                                                                                      | `false`     | `true` 시 선택된 상태 표시 (메인 컬러 테두리 및 Bold 텍스트)                              |
| **disabled**     | `boolean`                                                                                      | `false`     | `true` 시 비활성화 상태 적용 (터치 차단 및 `variant`별 회색조 스타일 자동 적용)           |
| **startIcon**    | `React.ReactNode`                                                                              | -           | 텍스트 좌측에 배치할 아이콘 (SVG 컴포넌트 등)                                             |
| **endIcon**      | `React.ReactNode`                                                                              | -           | 텍스트 우측에 배치할 아이콘                                                               |
| **children**     | `React.ReactNode`                                                                              | -           | 버튼 내부 텍스트 (또는 `iconOnly` 시 내부 아이콘)                                         |
| **wrapperStyle** | `StyleProp<ViewStyle>`                                                                         | -           | **최상위 래퍼(Pressable) 스타일** (주로 외부 여백 `margin` 조절 시 사용)                  |
| **textStyle**    | `StyleProp<TextStyle>`                                                                         | -           | **내부 텍스트 스타일** (글자색, 폰트 등 예외적 덮어쓰기 용도)                             |

_(그 외 `onPress` 등 React Native의 기본 `PressableProps`를 모두 지원합니다.)_

## 사용 예시

```tsx
import { Button } from "@/src/components/common/Button";
import { Ionicons } from "@expo/vector-icons"; // 예시 아이콘

// 1) 기본 사용 (primary, lg 사이즈)
<Button onPress={handleSubmit}>다음으로</Button>

// 2) 다양한 Variant 적용
<Button variant="outline">취소</Button>
<Button variant="neutral">나중에 하기</Button>
<Button variant="textPrimary">건너뛰기</Button>

// 3) 크기 조절 (xs ~ xl)
<Button size="sm">평가하기</Button>
<Button size="xl" fullWidth>모임 개설하기</Button>

// 4) 좌우 아이콘 배치 (startIcon / endIcon)
<Button
  variant="primary"
  startIcon={<Ionicons name="star" size={20} color="white" />}
>
  리뷰 남기기
</Button>

<Button
  variant="text"
  endIcon={<Ionicons name="chevron-forward" size={16} color="#333" />}
>
  더 보기
</Button>

// 5) 아이콘 전용 버튼 (iconOnly)
// 💡 iconOnly 속성을 주면 텍스트 대신 children으로 전달된 아이콘이 중앙에 배치됩니다.
<Button variant="outline" size="md" iconOnly rounded>
  <Ionicons name="heart" size={24} color="red" />
</Button>

// 6) 상태 적용 (Selected / Disabled)
<Button variant="outline" isSelected>선택됨</Button>
<Button variant="primary" disabled>입력 완료 시 활성화</Button>
```

## 커스텀 스타일 및 확장성

기본적으로는 `variant`와 `size`를 사용하여 디자인 일관성을 유지합니다. 특정 화면에서만 **예외적으로 외부 여백(margin)을 주거나 폰트를 변경해야 할 경우**, 아래 프롭을 통해 기본 스타일을 덮어쓸 수 있습니다.

- `wrapperStyle`: 최상위 컨테이너 레이아웃 제어 (외부 여백 `margin`, 테두리 등 덮어쓰기)
- `textStyle`: 내부 텍스트 디자인 제어 (`fontSize`, `color` 등 예외 적용)

```tsx
// ❌ 잘못된 사용: 컴포넌트에 기본 style 프롭 주입 불가 (에러 발생 가능)
<Button style={{ marginTop: 20 }}>확인</Button>

// ✅ 올바른 사용 1: wrapperStyle을 통한 외부 레이아웃 제어
<Button wrapperStyle={{ marginTop: 24, marginBottom: 12 }}>
  확인
</Button>

// ✅ 올바른 사용 2: 특정 텍스트 컬러 예외 처리
<Button variant="primary" textStyle={{ color: "#FFFFCC" }}>
  노란색 글씨 버튼
</Button>
```

## 참고

- 버튼을 터치(Press)할 때 기본적으로 `opacity: 0.8` 효과가 적용되어 있어, 웹의 `:active` 나 `:hover` 와 유사한 눌림 피드백을 제공합니다.
- `size="xl"` 인 경우, OS(iOS/Android)에 맞춘 그림자(Shadow/Elevation) 효과가 자동으로 적용되어 있습니다.
- `disabled` 활성화 시 단순히 투명도만 변하는 것이 아니라, `variant` 타입(꽉 찬 버튼, 테두리 버튼 등)에 맞춰 최적화된 회색조 디자인(`gray300`, `gray400` 등)이 자동으로 매핑됩니다.
