import React, { useEffect, useState } from "react";
import {
  Card,
  Spin,
  Row,
  Col,
  Statistic,
  Typography,
  notification,
  Select,
  Button,
} from "antd";
import { db } from "./firebaseConfig";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { getMonth, getYear } from "date-fns";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // ✅ required

const { Title } = Typography;
const { Option } = Select;

const AnalyticsTab = () => {
  const [mentorID, setMentorID] = useState(null);
  const [percentages, setPercentages] = useState({
    acceptedRate: 0,
    rejectedRate: 0,
    waitlistedRate: 0,
  });
  const [multiYearData, setMultiYearData] = useState({});
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [totalBookings, setTotalBookings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [allMenteeData, setAllMenteeData] = useState([]);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const fetchMentorID = async () => {
          try {
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              const userData = userDoc.data();
              setMentorID(userData.mentorID);
            }
          } catch (error) {
            console.error("Error fetching mentor ID:", error);
          }
        };
        fetchMentorID();
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!mentorID) return;

    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const collections = [
          { name: "acceptedRequests", status: "Accepted" },
          { name: "waitlistedRequests", status: "Waitlisted" },
          { name: "rejectedRequests", status: "Rejected" },
          { name: "scheduled", status: "Scheduled" },
        ];

        let acceptedCount = 0;
        let waitlistedCount = 0;
        let rejectedCount = 0;
        let scheduledCount = 0;
        let allData = [];
        let yearlyData = {};
        let yearSet = new Set();

        for (const col of collections) {
          const snapshot = await getDocs(
            query(collection(db, col.name), where("mentorId", "==", mentorID))
          );

          snapshot.docs.forEach((docSnap) => {
            const data = docSnap.data();
            let dateObj =
              data.scheduledCollection?.toDate?.() ||
              data.date?.toDate?.() ||
              null;

            if (dateObj) {
              const year = getYear(dateObj);
              const month = getMonth(dateObj);
              yearSet.add(year);
              if (!yearlyData[year]) {
                yearlyData[year] = Array(12).fill(0);
              }
              if (col.status === "Accepted") {
                yearlyData[year][month]++;
              }
            }

            const exportData = {
              name: data.name || "",
              email: data.email || "",
              mentorId: data.mentorId || "",
              date: dateObj ? dateObj.toLocaleDateString() : "No Date",
              fieldOfStudy: data.fieldOfStudy || "",
              assistanceType: data.assistanceType || "",
              yearOfStudy: data.yearOfStudy || "",
              status: col.status,
              processedAt:
                data.processedAt?.toDate?.().toLocaleString() || "",
              timestamp: data.timestamp?.toDate?.().toLocaleString() || "",
            };

            allData.push(exportData);
          });

          if (col.status === "Accepted") acceptedCount += snapshot.size;
          else if (col.status === "Waitlisted") waitlistedCount += snapshot.size;
          else if (col.status === "Rejected") rejectedCount += snapshot.size;
          else if (col.status === "Scheduled") scheduledCount += snapshot.size;
        }

        const total =
          acceptedCount + waitlistedCount + rejectedCount + scheduledCount;
        setTotalBookings(total);
        setPercentages({
          acceptedRate: total > 0 ? (acceptedCount / total) * 100 : 0,
          waitlistedRate: total > 0 ? (waitlistedCount / total) * 100 : 0,
          rejectedRate: total > 0 ? (rejectedCount / total) * 100 : 0,
        });

        setAvailableYears(Array.from(yearSet).sort((a, b) => b - a));
        setMultiYearData(yearlyData);
        setAllMenteeData(allData);
      } catch (error) {
        console.error("Error fetching analytics:", error);
        notification.error({
          message: "Error",
          description: "Failed to load analytics data.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [mentorID]);

  const handleYearChange = (value) => {
    setSelectedYear(value);
  };

  const handleExportExcel = () => {
    const summarySheet = XLSX.utils.json_to_sheet([
      {
        "Total Bookings": totalBookings,
        "Accepted (%)": percentages.acceptedRate.toFixed(2) + "%",
        "Waitlisted (%)": percentages.waitlistedRate.toFixed(2) + "%",
        "Rejected (%)": percentages.rejectedRate.toFixed(2) + "%",
      },
    ]);

    const menteeSheet = XLSX.utils.json_to_sheet(allMenteeData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");
    XLSX.utils.book_append_sheet(workbook, menteeSheet, "MenteeData");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "MenteeAnalytics.xlsx");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Mentee Information Report", 14, 20);

    const tableData = allMenteeData.map((row) => [
      row.name,
      row.email,
      row.mentorId,
      row.date,
      row.fieldOfStudy,
      row.assistanceType,
      row.yearOfStudy,
      row.status,
      row.processedAt,
      row.timestamp,
    ]);

    autoTable(doc, {
      head: [[
        "Name", "Email", "Mentor", "Date", "Field",
        "Assistance", "Year", "Status", "Processed At", "Timestamp"
      ]],
      body: tableData,
      startY: 30,
      styles: { fontSize: 7 },
    });

    doc.save("MenteeData.pdf");
  };

  return (
    <Card title="Analytics & Insights" bordered={false}>
      <p style={{ fontSize: "0.95rem" }}>Track bookings and export mentee insights.</p>
      {loading ? (
        <Spin tip="Loading analytics..." />
      ) : (
        <>
          <Row gutter={[12, 12]} justify="center">
            <Col xs={12} sm={6}>
              <Statistic title="Total Bookings" value={totalBookings} />
            </Col>
            <Col xs={12} sm={6}>
              <Statistic title="Accepted %" value={`${percentages.acceptedRate.toFixed(2)}%`} />
            </Col>
            <Col xs={12} sm={6}>
              <Statistic title="Waitlisted %" value={`${percentages.waitlistedRate.toFixed(2)}%`} />
            </Col>
            <Col xs={12} sm={6}>
              <Statistic title="Rejected %" value={`${percentages.rejectedRate.toFixed(2)}%`} />
            </Col>
          </Row>

          <Row style={{ marginTop: 24 }} gutter={[16, 16]} justify="space-between" align="middle">
            <Col xs={24} sm={12}>
              <Title level={5}>Accepted Bookings per Month</Title>
              <Select
                style={{ width: "100%", maxWidth: 200 }}
                value={selectedYear}
                onChange={handleYearChange}
              >
                {availableYears.map((year) => (
                  <Option key={year} value={year}>
                    {year}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} style={{ textAlign: "right" }}>
              <Button onClick={handleExportExcel} style={{ marginRight: 10 }}>
                Export to Excel
              </Button>
              <Button onClick={handleExportPDF} type="primary">
                Export to PDF
              </Button>
            </Col>
          </Row>
        </>
      )}
    </Card>
  );
};

export default AnalyticsTab;
