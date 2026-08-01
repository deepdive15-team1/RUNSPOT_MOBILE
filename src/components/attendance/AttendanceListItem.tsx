import React from "react";

import { Button } from "../common/button/Button";
import ParticipantCard from "../common/card/ParticipantCard";

import { AttendanceMember, AttendanceStatus } from "@/src/types/api/attendance";

interface AttendanceListItemProps {
  participant: AttendanceMember;
  onToggleStatus: (id: number, status: AttendanceStatus) => void;
  isLastItem?: boolean;
}

function AttendanceListItem({
  participant,
  onToggleStatus,
  isLastItem = false,
}: AttendanceListItemProps) {
  const isAttended = participant.attendanceStatus === "ATTENDED";

  return (
    <ParticipantCard
      participant={participant}
      isLastItem={isLastItem}
      rightAction={
        <Button
          variant={isAttended ? "primary" : "outline"}
          size="sm"
          rounded={true}
          wrapperStyle={{ minWidth: 80 }}
          onPress={() =>
            onToggleStatus(participant.id, participant.attendanceStatus)
          }
        >
          {isAttended ? "출석" : "미출석"}
        </Button>
      }
    />
  );
}

export default React.memo(AttendanceListItem, (prev, next) => {
  return (
    prev.participant.attendanceStatus === next.participant.attendanceStatus &&
    prev.isLastItem === next.isLastItem
  );
});
