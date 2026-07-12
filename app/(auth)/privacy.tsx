import { LegalDocumentScreen } from "@/src/components/auth/LegalDocumentScreen";
import { PRIVACY_POLICY } from "@/src/constants/legal";

export default function PrivacyScreen() {
  return (
    <LegalDocumentScreen
      title={PRIVACY_POLICY.title}
      updatedAt={PRIVACY_POLICY.updatedAt}
      intro={PRIVACY_POLICY.intro}
      sections={PRIVACY_POLICY.sections}
    />
  );
}
