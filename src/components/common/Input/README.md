# Input

단일 줄 입력용 공통 컴포넌트입니다. `TextInput` 기반이며 라벨, 에러 메시지, 좌우 아이콘 배치 및 3가지 디자인 타입(Variant)을 지원합니다. 스타일은 `@/src/constants`의 `theme` 토큰을 기반으로 합니다.

> 💡 **다중 줄(Multi-line) 입력**이 필요한 경우, 이 컴포넌트 대신 `TextField` 컴포넌트를 사용

## Import

```tsx
import { Input } from "@/src/components/common/Input";
import type {
  VariantType,
  SizeType,
} from "@/src/components/common/Input/Input.styles";
```

## Props

| Prop               | 타입                                        | 기본값      | 설명                                                                               |
| ------------------ | ------------------------------------------- | ----------- | ---------------------------------------------------------------------------------- |
| **label**          | `string`                                    | -           | 입력창 상단에 표시될 라벨 텍스트                                                   |
| **errorMessage**   | `string`                                    | -           | 에러 메시지 (값 존재 시 테두리가 빨간색으로 변경됨)                                |
| **variant**        | `"primary"` \| `"neutral"` \| `"underline"` | `"primary"` | primary: 흰 배경 박스<br>neutral: 회색 배경 박스<br>underline: 배경 없는 밑줄 형태 |
| **size**           | `"sm"` \| `"md"` \| `"lg"`                  | `"md"`      | 입력 박스의 높이, 좌우 패딩 및 폰트 크기                                           |
| **fullWidth**      | `boolean`                                   | `true`      | `true` 시 너비 100%, `false` 시 컨텐츠 크기(auto)                                  |
| **startIcon**      | `React.ReactNode`                           | -           | 입력창 내부 좌측에 배치할 아이콘 (SVG 컴포넌트 등)                                 |
| **endIcon**        | `React.ReactNode`                           | -           | 입력창 내부 우측에 배치할 아이콘                                                   |
| **editable**       | `boolean`                                   | `true`      | `false` 시 비활성화(Disabled) 상태 스타일 적용 및 터치 차단                        |
| **wrapperStyle**   | `StyleProp<ViewStyle>`                      | -           | **최상위 래퍼 스타일** (주로 외부 여백 margin, 전체 width 조절 시 사용)            |
| **containerStyle** | `StyleProp<ViewStyle>`                      | -           | **중간 박스 스타일** (테두리, 배경색 등 예외적 덮어쓰기 용도)                      |
| **textStyle**      | `StyleProp<TextStyle>`                      | -           | **내부 텍스트 스타일** (글자색, 폰트 등 예외적 덮어쓰기 용도)                      |

> **💡 기본 TextInput 속성 지원**
> 이 컴포넌트는 React Native의 기본 `TextInput`을 확장하므로, `onChangeText`, `value`, `secureTextEntry`, `keyboardType`, `maxLength` 등 기존 `TextInput`의 모든 속성을 그대로 사용할 수 있습니다.

## 사용 예시

```tsx
import { Input } from "@/src/components/common/Input";
import LocationIcon from "@/assets/icons/location.svg"; // 예시 아이콘

// 1) 기본 사용 (primary)
<Input label="아이디" placeholder="아이디를 입력해주세요." />

// 2) 회색 배경 (neutral)
<Input label="모임 장소" placeholder="장소를 검색하세요" variant="neutral" />

// 3) 밑줄 형태 (underline)
<Input label="제목" placeholder="코스 게시글 제목을 입력하세요" variant="underline" />

// 4) 에러 상태 표시
<Input
  label="비밀번호"
  errorMessage="비밀번호가 일치하지 않습니다."
/>

// 5) 아이콘 포함 (startIcon / endIcon)
<Input
  startIcon={<LocationIcon width={20} height={20} />}
  placeholder="여의도 한강공원 멀티플라자"
/>
```

## 커스텀 스타일 및 확장성

기본적으로는 `variant`와 `size`를 사용하여 디자인 일관성을 유지합니다. 하지만 특정 화면에서만 **예외적으로 완전히 다른 색상이나 폰트 스타일, 여백이 필요한 경우**, 아래의 3가지 프롭을 통해 기본 스타일을 덮어쓸 수 있습니다.

- `wrapperStyle`: 최상위 레이아웃 제어 (외부 여백 `margin`, 위치 등)
- `containerStyle`: 입력 박스 디자인 제어 (`backgroundColor`, `borderColor`, `borderRadius` 등)
- `textStyle`: 내부 텍스트 디자인 제어 (`fontSize`, `color`, `fontWeight` 등)

```tsx
// ❌ 잘못된 사용: 컴포넌트에 기본 style 주입 불가
<Input style={{ marginBottom: 20 }} />

// ✅ 올바른 사용 1: wrapperStyle을 통한 외부 레이아웃 제어
<Input
  label="나이"
  placeholder="20대"
  wrapperStyle={{ marginBottom: 24, paddingHorizontal: 16 }}
/>

// ✅ 올바른 사용 2: 특정 화면에서만 예외적으로 박스/글자 디자인 변경
<Input
  label="특수 입력창"
  variant="primary"
  containerStyle={{ backgroundColor: "#000", borderColor: "#333" }} // 박스 스타일 덮어쓰기
  textStyle={{ color: "yellow", fontWeight: "bold" }} // 글자 스타일 덮어쓰기
/>
```

## 참고

- 컴포넌트 내부(글자, 빈 공간 등) 어디를 터치해도 자동으로 <TextInput>으로 포커스가 이동하도록 설계되어 있습니다.
- Platform.select 최적화가 적용되어 있습니다.
- 안드로이드 환경의 텍스트 수직 쏠림 현상을 방지하기 위해 paddingVertical: 0 처리가 포함되어 있습니다.
