import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { colors, fontSizes, fontWeights, spacing } from "@/src/constants";

interface LegalSection {
  heading: string;
  body: string;
}

interface LegalDocumentScreenProps {
  title: string;
  updatedAt: string;
  intro?: string;
  sections: readonly LegalSection[];
}

export function LegalDocumentScreen({
  title,
  updatedAt,
  intro,
  sections,
}: LegalDocumentScreenProps) {
  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator
    >
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.updatedAt}>시행일: {updatedAt}</Text>

      {intro ? <Text style={styles.intro}>{intro}</Text> : null}

      {sections.map((section) => (
        <View key={section.heading} style={styles.section}>
          <Text style={styles.heading}>{section.heading}</Text>
          <Text style={styles.body}>{section.body}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.base,
  },
  title: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.gray900,
  },
  updatedAt: {
    fontSize: fontSizes.xs,
    color: colors.gray500,
  },
  intro: {
    fontSize: fontSizes.sm,
    color: colors.gray700,
    lineHeight: 22,
  },
  section: {
    gap: spacing.sm,
  },
  heading: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    color: colors.gray900,
  },
  body: {
    fontSize: fontSizes.sm,
    color: colors.gray700,
    lineHeight: 22,
  },
});
