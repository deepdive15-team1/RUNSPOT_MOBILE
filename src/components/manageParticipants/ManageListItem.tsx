import React from "react";

import { Button } from "../common/button/Button";
import ParticipantCard from "../common/card/ParticipantCard";

import { AttendanceMember } from "@/src/types/api/attendance";

interface ManageListItemProps {
  participant: AttendanceMember;
  onPressKickOut: (selectedUser: AttendanceMember) => void;
  isLastItem?: boolean;
}

function ManageListItem({
  participant,
  onPressKickOut,
  isLastItem = false,
}: ManageListItemProps) {
  return (
    <ParticipantCard
      participant={participant}
      isLastItem={isLastItem}
      rightAction={
        <Button
          variant="outline"
          size="sm"
          rounded={true}
          wrapperStyle={{ minWidth: 80 }}
          onPress={() => onPressKickOut(participant)}
        >
          내보내기
        </Button>
      }
    />
  );
}

export default React.memo(ManageListItem);
