# NaverMapComponent

오직 **'데이터를 받아 지도를 시각화'**하는 역할만 수행하는 순수 공통 지도 컴포넌트입니다.
러닝 코스 생성, 기록 조회, 커뮤니티 정적 지도 등 다양한 도메인에서 재사용할 수 있도록 상태 관리와 비즈니스 로직을 철저히 배제했습니다.

> 💡 **아키텍처 가이드:** > '현재 위치로 가기', '코스 지우기' 등의 기능 조작 버튼은 이 컴포넌트 내부에 추가하지 않습니다. 버튼은 지도를 호출하는 상위 페이지(Screen)에서 `position: absolute`를 이용해 지도 위에 오버레이(Overlay) 하는 방식으로 구현해야 레이아웃 충돌과 Props Drilling 을 방지할 수 있습니다.

## Import

```tsx
import { NaverMapComponent } from "@/src/components/common/map/NaverMapComponent";
import type { MarkerType } from "@/src/components/common/map/NaverMapComponent";
import { NaverMapViewRef } from "@mj-studio/react-native-naver-map"; // ref 제어 시 필요
```

## Props

| Prop                        | 타입                                                     | 기본값              | 설명                                                                                |
| :-------------------------- | :------------------------------------------------------- | :------------------ | :---------------------------------------------------------------------------------- |
| **camera**                  | `{ latitude: number, longitude: number, zoom?: number }` | -                   | **(필수 권장)** 지도의 초기 중심 좌표. 미설정 시 바다 한가운데가 보일 수 있습니다.  |
| **markers**                 | `MarkerType[]`                                           | `[]`                | 지도에 표시할 마커 데이터 배열.                                                     |
| **routePath**               | `{ latitude: number, longitude: number }[]`              | -                   | 좌표들을 이어 경로(선)를 그릴 배열 데이터. (러닝 코스 표시용)                       |
| **isCreateMode**            | `boolean`                                                | `false`             | `true` 시 지도 터치 이벤트가 활성화되어 코스를 그릴 수 있습니다.                    |
| **onMapTap**                | `(lat, lng) => void`                                     | -                   | `isCreateMode`가 `true`일 때, 지도를 터치하면 해당 좌표를 부모에게 전달합니다.      |
| **showLocationButton**      | `boolean`                                                | `false`             | 네이버 기본 제공 '내 위치 버튼' 표시 여부. (커스텀 디자인 사용을 위해 `false` 권장) |
| **isShowZoomControls**      | `boolean`                                                | `false`             | 네이버 기본 제공 '줌(+/-) 버튼' 표시 여부. (제스처 사용을 위해 `false` 권장)        |
| **isScrollGesturesEnabled** | `boolean`                                                | `false`             | `true` 시 손가락으로 지도를 패닝(이동)할 수 있습니다.                               |
| **isZoomGesturesEnabled**   | `boolean`                                                | `false`             | `true` 시 두 손가락 핀치 제스처로 지도를 확대/축소할 수 있습니다.                   |
| **lineColor**               | `string`                                                 | `theme.colors.main` | 경로 선의 색상 지정.                                                                |
| **lineWidth**               | `number`                                                 | `5`                 | 경로 선의 두께 지정.                                                                |

## 사용 예시

### 1. 커뮤니티 피드용 정적 지도 (단순 조회)

스크롤을 막고 단순히 백엔드에서 받아온 코스를 이미지처럼 보여줍니다.

```tsx
<View style={{ height: 200, width: "100%" }}>
  <NaverMapComponent
    camera={{ latitude: 37.3947, longitude: 127.1111, zoom: 14 }}
    routePath={feedData.routePath}
    isScrollGesturesEnabled={false} // 피드 스크롤 방해 금지
    isZoomGesturesEnabled={false}
  />
</View>
```

### 2. 러닝 기록 상세 보기

```tsx
<View style={{ flex: 1 }}>
  <NaverMapComponent
    camera={{ latitude: 37.3947, longitude: 127.1111, zoom: 15 }}
    routePath={myRunRecord.routePath}
    isScrollGesturesEnabled={true}
    isZoomGesturesEnabled={true}
  />
</View>
```

### 코스 그리기 모드 + 커스텀 UI 오버레이

지도는 데이터를 화면에 뿌리는 도화지 역할만 하고, 상호작용 버튼은 부모 컴포넌트에서 absolute로 띄워 제어합니다.

```tsx
import { useRef, useState } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { NaverMapComponent } from "@/src/components/common/map/NaverMapComponent";
import { NaverMapViewRef } from "@mj-studio/react-native-naver-map";
import { MaterialIcons } from "@expo/vector-icons";

export default function CourseCreateScreen() {
  const mapRef = useRef<NaverMapViewRef>(null);
  const [routePath, setRoutePath] = useState([]);

  // 내 위치 이동 함수
  const handleMyLocation = () => {
    mapRef.current?.animateCameraTo({
      latitude: 37.3947, // 실제 구현 시 기기 GPS 연동
      longitude: 127.1111,
      zoom: 15,
      duration: 500,
    });
  };

  return (
    <View style={styles.container}>
      {/* 1. 지도 도화지 */}
      <NaverMapComponent
        ref={mapRef} // 지도 제어를 위해 리모컨 연결
        camera={{ latitude: 37.3947, longitude: 127.1111, zoom: 14 }}
        isCreateMode={true} // 터치 활성화
        isScrollGesturesEnabled={true}
        isZoomGesturesEnabled={true}
        onMapTap={(lat, lng) =>
          setRoutePath((prev) => [...prev, { latitude: lat, longitude: lng }])
        }
        routePath={routePath}
      />

      {/* 2. 커스텀 UI 오버레이 (지도 외부에 배치) */}
      <View style={styles.buttonGroup}>
        {/* 코스 초기화 버튼 */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setRoutePath([])}
        >
          <MaterialIcons name="refresh" size={24} color="black" />
        </TouchableOpacity>

        {/* 내 위치 이동 버튼 */}
        <TouchableOpacity style={styles.iconButton} onPress={handleMyLocation}>
          <MaterialIcons name="my-location" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  buttonGroup: {
    position: "absolute",
    right: 20,
    bottom: 40, // 바텀시트 등의 높이를 고려하여 조절
    gap: 12,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5, // 안드로이드 그림자
  },
});
```

## 참고

- 성능 최적화 (React.memo): 커뮤니티 피드(FlatList 등)에서 여러 개의 지도가 렌더링될 때의 성능 저하를 막기 위해 컴포넌트 전체가 memo로 감싸져 있습니다. Props가 변경되지 않으면 불필요한 리렌더링을 방지합니다.

- 제어 위임 (forwardRef): 상위 컴포넌트에서 지도의 카메라 위치나 줌 레벨을 직접 조작(animateCameraTo)할 수 있도록 forwardRef가 구현되어 있습니다.
