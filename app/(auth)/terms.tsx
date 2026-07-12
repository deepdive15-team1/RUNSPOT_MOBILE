import { LegalDocumentScreen } from "@/src/components/auth/LegalDocumentScreen";
import { TERMS_OF_SERVICE } from "@/src/constants/legal";

export default function TermsScreen() {
  return (
    <LegalDocumentScreen
      title={TERMS_OF_SERVICE.title}
      updatedAt={TERMS_OF_SERVICE.updatedAt}
      sections={TERMS_OF_SERVICE.sections}
    />
  );
}
