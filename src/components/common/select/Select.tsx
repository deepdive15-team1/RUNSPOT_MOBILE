import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ForwardedRef,
  type ReactNode,
} from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
  Dimensions,
  StyleSheet,
  type ViewStyle,
} from "react-native";

import SelectOption from "./SelectOption";
import type { SelectOptionItem } from "./SelectOption";

import {
  borderRadius,
  colors,
  dropdownMenuShadow,
  fontSizes,
  fontWeights,
  selectErrorRingShadow,
  spacing,
  zIndex,
} from "@/src/constants";

export type SelectVariantType = "primary" | "secondary";
export type SelectSizeType = "sm" | "md" | "lg";

export interface SelectChangeEvent<Value = unknown> {
  target: { value: Value; name: string };
}

export type MenuPlacement = "auto" | "bottom" | "top";

const MENU_MAX_HEIGHT = 300;
const GAP = 4;

const DEFAULT_PROPS = {
  variant: "primary" as SelectVariantType,
  size: "md" as SelectSizeType,
  fullWidth: true,
  error: false,
} as const;

interface SizePreset {
  fontSize: number;
  height: number;
  paddingH: number;
}

const SIZES: Record<SelectSizeType, SizePreset> = {
  sm: { fontSize: fontSizes.xs, height: 40, paddingH: 12 },
  md: { fontSize: fontSizes.sm, height: 44, paddingH: 14 },
  lg: { fontSize: fontSizes.base, height: 52, paddingH: 16 },
};

const VARIANTS: Record<
  SelectVariantType,
  { backgroundColor: string; borderColor: string }
> = {
  primary: {
    backgroundColor: colors.white,
    borderColor: colors.gray200,
  },
  secondary: {
    backgroundColor: colors.gray100,
    borderColor: colors.gray200,
  },
};

function useControlled<T>({
  controlled,
  default: defaultProp,
}: {
  controlled: T | undefined;
  default: T;
}): [T, (v: T) => void] {
  const [internal, setInternal] = useState<T>(defaultProp);
  const isControlled = controlled !== undefined;
  const value = (isControlled ? controlled : internal) as T;
  const setValue = useCallback(
    (v: T) => {
      if (!isControlled) setInternal(v);
    },
    [isControlled],
  );
  return [value, setValue];
}

function areEqualValues(a: unknown, b: unknown): boolean {
  if (typeof b === "object" && b !== null) return a === b;
  return String(a) === String(b);
}

function isEmptyDisplay(display: ReactNode): boolean {
  return display == null || (typeof display === "string" && !display.trim());
}

export interface SelectMenuProps {
  placement?: MenuPlacement;
}

export interface SelectProps<Value = unknown> {
  variant?: SelectVariantType;
  size?: SelectSizeType;
  fullWidth?: boolean;
  error?: boolean;
  label?: ReactNode;
  helperText?: ReactNode;
  options: SelectOptionItem<Value>[];
  value?: Value | "";
  defaultValue?: Value;
  onChange?: (event: SelectChangeEvent<Value>) => void;
  placeholder?: ReactNode;
  displayEmpty?: boolean;
  renderValue?: (value: Value) => ReactNode;
  disabled?: boolean;
  name?: string;
  MenuProps?: SelectMenuProps;
  containerStyle?: ViewStyle;
  IconComponent?: (props: { open: boolean }) => ReactNode;
}

function DefaultSelectIcon({ open }: { open: boolean }) {
  return (
    <Text
      style={[styles.chevron, open && styles.chevronOpen]}
      accessibilityElementsHidden
      importantForAccessibility="no"
    >
      ▼
    </Text>
  );
}

export const Select = forwardRef<
  { focus: () => void; value: unknown },
  SelectProps<unknown>
>(function SelectInner<Value = unknown>(
  props: SelectProps<Value>,
  ref: ForwardedRef<{ focus: () => void; value: unknown }>,
) {
  const {
    label,
    helperText,
    error = DEFAULT_PROPS.error,
    variant = DEFAULT_PROPS.variant,
    size = DEFAULT_PROPS.size,
    fullWidth = DEFAULT_PROPS.fullWidth,
    options,
    value: valueProp,
    defaultValue,
    onChange,
    placeholder,
    displayEmpty = false,
    renderValue,
    disabled = false,
    name = "",
    MenuProps,
    containerStyle,
    IconComponent = DefaultSelectIcon,
  } = props;

  const placement = MenuProps?.placement ?? "auto";
  const triggerRef = useRef<View>(null);
  const [open, setOpen] = useState(false);
  const [layout, setLayout] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const [value, setValueState] = useControlled<Value | "">({
    controlled: valueProp as Value | "" | undefined,
    default: (defaultValue ?? "") as Value | "",
  });

  const openMenu = useCallback(() => {
    const node = triggerRef.current;
    if (!node || disabled) return;
    node.measureInWindow((x, y, width, height) => {
      setLayout({ x, y, width, height });
      setOpen(true);
    });
  }, [disabled]);

  const closeMenu = useCallback(() => {
    setOpen(false);
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      focus: () => {
        openMenu();
      },
      value,
    }),
    [value, openMenu],
  );

  const windowH = Dimensions.get("window").height;

  const openAbove = (() => {
    if (!layout) return false;
    if (placement === "top") return true;
    if (placement === "bottom") return false;
    const spaceBelow = windowH - (layout.y + layout.height);
    const spaceAbove = layout.y;
    return spaceBelow < MENU_MAX_HEIGHT && spaceAbove > spaceBelow;
  })();

  const menuMaxHeight = layout
    ? openAbove
      ? Math.min(MENU_MAX_HEIGHT, Math.max(0, layout.y - GAP - 8))
      : Math.min(
          MENU_MAX_HEIGHT,
          Math.max(0, windowH - layout.y - layout.height - GAP - 8),
        )
    : MENU_MAX_HEIGHT;

  const menuStyle = layout
    ? openAbove
      ? {
          position: "absolute" as const,
          left: layout.x,
          width: layout.width,
          minWidth: layout.width,
          maxWidth: layout.width,
          maxHeight: menuMaxHeight,
          bottom: windowH - layout.y + GAP,
        }
      : {
          position: "absolute" as const,
          left: layout.x,
          top: layout.y + layout.height + GAP,
          width: layout.width,
          minWidth: layout.width,
          maxWidth: layout.width,
          maxHeight: menuMaxHeight,
        }
    : null;

  const preset = SIZES[size];
  const shell = VARIANTS[variant];

  const hasValue = value !== "" && value !== undefined;
  const hasDisplay = hasValue || displayEmpty;

  let display: ReactNode = null;
  let computeDisplay = false;
  if (hasDisplay) {
    if (renderValue) display = renderValue(value as Value);
    else computeDisplay = true;
  }

  const selectedOption = options.find((opt) =>
    areEqualValues(value, opt.value),
  );

  if (computeDisplay) {
    display = selectedOption?.label ?? null;
  }

  const showPlaceholder =
    !hasDisplay ||
    (isEmptyDisplay(display) && placeholder != null && placeholder !== "");

  const contentColor = disabled
    ? colors.gray400
    : showPlaceholder
      ? colors.gray500
      : colors.text;

  const textStyle = [
    styles.display,
    { fontSize: preset.fontSize, color: contentColor },
  ];

  let triggerContent: ReactNode;
  if (showPlaceholder && placeholder != null && placeholder !== "") {
    triggerContent =
      typeof placeholder === "string" || typeof placeholder === "number" ? (
        <Text style={textStyle} numberOfLines={1}>
          {placeholder}
        </Text>
      ) : (
        <View style={styles.displayGrow}>{placeholder}</View>
      );
  } else if (isEmptyDisplay(display)) {
    triggerContent = (
      <Text style={textStyle} accessibilityElementsHidden>
        {"\u200b"}
      </Text>
    );
  } else if (typeof display === "string" || typeof display === "number") {
    triggerContent = (
      <Text style={textStyle} numberOfLines={1}>
        {display}
      </Text>
    );
  } else {
    triggerContent = <View style={styles.displayGrow}>{display}</View>;
  }

  const handleSelect = useCallback(
    (opt: SelectOptionItem<Value>) => {
      if (opt.disabled) return;
      const newValue = opt.value;
      if (!areEqualValues(value, newValue)) {
        setValueState(newValue as Value | "");
        onChange?.({
          target: { value: newValue, name },
        });
      }
      closeMenu();
    },
    [value, name, onChange, setValueState, closeMenu],
  );

  useEffect(() => {
    if (!open) return;
    const sub = Dimensions.addEventListener("change", () => {
      triggerRef.current?.measureInWindow((x, y, width, height) => {
        setLayout({ x, y, width, height });
      });
    });
    return () => sub.remove();
  }, [open]);

  const hasLabel = label != null && label !== "";

  return (
    <View
      style={[
        styles.wrap,
        fullWidth ? styles.wFull : styles.wAuto,
        containerStyle,
      ]}
    >
      {hasLabel && <Text style={styles.label}>{label}</Text>}

      <View
        ref={triggerRef}
        collapsable={false}
        style={[
          styles.root,
          fullWidth && styles.rootFullWidth,
          {
            borderWidth: 1,
            borderColor: error ? colors.error : shell.borderColor,
            backgroundColor: disabled ? colors.gray100 : shell.backgroundColor,
            minHeight: preset.height,
            paddingHorizontal: preset.paddingH,
          },
          error && selectErrorRingShadow(),
        ]}
      >
        <View style={styles.triggerOuter}>
          <Pressable
            disabled={disabled}
            onPress={openMenu}
            style={styles.triggerInner}
            accessibilityRole="button"
            accessibilityState={{
              disabled,
              expanded: open,
            }}
          >
            {triggerContent}
            <View style={styles.iconWrap}>
              <IconComponent open={open} />
            </View>
          </Pressable>
        </View>
      </View>

      {helperText != null && helperText !== "" && (
        <Text style={[styles.helper, error && { color: colors.error }]}>
          {helperText}
        </Text>
      )}

      <Modal
        visible={open && layout != null}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeMenu}
      >
        <View style={styles.modalRoot}>
          <Pressable
            style={styles.backdrop}
            onPress={closeMenu}
            accessibilityLabel="닫기"
          />
          {menuStyle != null && (
            <View
              style={[
                styles.menuPaper,
                dropdownMenuShadow(),
                menuStyle,
                { zIndex: zIndex.modal },
              ]}
            >
              <ScrollView
                keyboardShouldPersistTaps="handled"
                style={[styles.menuScroll, { maxHeight: menuMaxHeight }]}
                contentContainerStyle={styles.menuScrollContent}
                nestedScrollEnabled
              >
                {options.map((opt, index) => {
                  const selected = areEqualValues(value, opt.value);
                  return (
                    <SelectOption
                      key={`${index}-${String(opt.value)}`}
                      value={opt.value as string | number}
                      disabled={opt.disabled}
                      selected={selected}
                      onPress={() => handleSelect(opt)}
                    >
                      {opt.label}
                    </SelectOption>
                  );
                })}
              </ScrollView>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}) as <Value = unknown>(
  props: SelectProps<Value> & {
    ref?: React.Ref<{ focus: () => void; value: unknown }>;
  },
) => React.ReactElement;

(Select as { displayName?: string }).displayName = "Select";

export default Select;

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
  },
  wFull: { width: "100%" },
  wAuto: { alignSelf: "flex-start" },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.text,
    width: "100%",
    textAlign: "left",
  },
  root: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: borderRadius.base,
    overflow: "hidden",
  },
  rootFullWidth: {
    alignSelf: "stretch",
    width: "100%",
  },
  triggerOuter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "stretch",
  },
  triggerInner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    minHeight: 40,
  },
  display: {
    flex: 1,
    minWidth: 0,
    fontWeight: fontWeights.normal,
  },
  displayGrow: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
  },
  iconWrap: {
    marginLeft: spacing.sm,
  },
  chevron: {
    fontSize: 10,
    color: colors.gray600,
    transform: [{ rotate: "0deg" }],
  },
  chevronOpen: {
    transform: [{ rotate: "180deg" }],
  },
  helper: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
  modalRoot: {
    flex: 1,
    pointerEvents: "box-none",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
    zIndex: zIndex.overlay,
  },
  menuPaper: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: borderRadius.base,
    overflow: "hidden",
    pointerEvents: "box-none",
  },
  menuScroll: {
    width: "100%",
  },
  menuScrollContent: {
    width: "100%",
  },
});
