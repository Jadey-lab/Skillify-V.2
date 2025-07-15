import React, { useState, useMemo } from "react";
import { List, Input, Select, Pagination, Row, Col } from "antd";
import RequestItem from "./RequestItem";

const { Option } = Select;

const RequestList = ({ data = [], readonly = false, ...handlers }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // 🔍 Filter and sort requests
  const filteredAndSorted = useMemo(() => {
    const filtered = data.filter((r) =>
      r.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sorted = [...filtered].sort((a, b) => {
      const dateA = a.timestamp?.toDate?.() || new Date(a.timestamp);
      const dateB = b.timestamp?.toDate?.() || new Date(b.timestamp);
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    return sorted;
  }, [data, searchTerm, sortOrder]);

  // 📃 Paginate the result
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSorted.slice(start, start + pageSize);
  }, [filteredAndSorted, currentPage]);

  return (
    <>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={12}>
          <Input
            placeholder="Search by name"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to page 1 on new search
            }}
            allowClear
          />
        </Col>
        <Col xs={24} md={12}>
          <Select
            value={sortOrder}
            onChange={setSortOrder}
            style={{ width: "100%" }}
          >
            <Option value="desc">Newest First</Option>
            <Option value="asc">Oldest First</Option>
          </Select>
        </Col>
      </Row>

      <List
        itemLayout="vertical"
        dataSource={paginatedData}
        renderItem={(request) => (
          <RequestItem
            key={request.id}
            request={request}
            readonly={readonly}
            {...handlers}
          />
        )}
      />

      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={filteredAndSorted.length}
        onChange={(page) => setCurrentPage(page)}
        style={{ marginTop: 16, textAlign: "center" }}
      />
    </>
  );
};

export default RequestList;
