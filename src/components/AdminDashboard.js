import React from "react";
import { Grid, Paper, Typography, Box } from "@mui/material";
import { Bar } from "react-chartjs-2";
import { DataGrid } from "@mui/x-data-grid";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register chart components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  // Mock data for chart
  const chartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May"],
    datasets: [
      {
        label: "Monthly attendence",
        data: [12, 19, 3, 5, 2],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };

  // Mock data for table
  const rows = [
    { id: 1, col1: "John Doe", col2: "Completed Task" },
    { id: 2, col1: "Jane Smith", col2: "Pending Approval" },
  ];
  const columns = [
    { field: "col1", headerName: "Name", width: 150 },
    { field: "col2", headerName: "Status", width: 200 },
  ];

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        {/* Widget 1: Statistics Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6">Total Students Reached</Typography>
            <Typography variant="h4" color="primary">
              1,245
            </Typography>
          </Paper>
        </Grid>

        {/* Widget 2: Bar Chart */}
        <Grid item xs={12} sm={6} md={8}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
             Event Attendance
            </Typography>
            <Bar data={chartData} />
          </Paper>
        </Grid>

        {/* Widget 3: Recent Activity Table */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <DataGrid rows={rows} columns={columns} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
