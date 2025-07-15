import { Tag } from "antd";

export const getStatusTag = (status) => {
  const colorMap = {
    Accepted: "green",
    Waitlisted: "orange",
    Rejected: "red",
  };
  return <Tag color={colorMap[status]}>{status}</Tag>;
};

export const formatTimestamp = (ts) => {
  if (ts?.toDate) return new Date(ts.toDate()).toLocaleString();
  if (ts?.seconds) return new Date(ts.seconds * 1000).toLocaleString();
  return "N/A";
};
