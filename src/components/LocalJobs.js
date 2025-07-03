import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Button,
  Typography,
  Grid,
  Box,
  Container,
  TextField,
} from "@mui/material";
import { Search, Close } from "@mui/icons-material";
import { getFirestore, collection, getDocs } from "firebase/firestore";

// Function to fetch job thumbnails based on job category
const getJobThumbnail = async (jobCategory) => {
  const apiKey = 'wVfIHYpcNwD2ujAjcLjkxCk8ga5oLIqlDHAQ3rw3CrERleDci9uB7eLg'; // Replace with your Pexels API Key
  const categoryKeywords = {
    "Software Engineer": "programming",
    "Data Scientist": "data science",
    "Web Developer": "web development",
    "Graphic Designer": "design",
    "Marketing Specialist": "marketing",
    "Project Manager": "project management",
    // Add more job categories as needed
  };

  const query = categoryKeywords[jobCategory] || jobCategory.toLowerCase();
  const url = `https://api.pexels.com/v1/search?query=${query}&per_page=1`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: apiKey,
      },
    });
    const data = await response.json();
    if (data.photos && data.photos.length > 0) {
      return data.photos[0].src.medium; // Return the medium-sized image URL
    } else {
      return "https://via.placeholder.com/150/9E9E9E/FFFFFF?text=Job";
    }
  } catch (error) {
    console.error("Error fetching image from Pexels:", error);
    return "https://via.placeholder.com/150/9E9E9E/FFFFFF?text=Job";
  }
};

const LocalJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const db = getFirestore();

  // Fetch job listings from the "jobListings" collection in Firestore
  const fetchLocalJobs = async () => {
    setLoading(true);
    try {
      const jobListingsRef = collection(db, "jobListings");
      const snapshot = await getDocs(jobListingsRef);
      const jobsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // Map Firestore fields to expected keys and fetch a thumbnail for each job
      const jobsWithThumbnails = await Promise.all(
        jobsData.map(async (job) => {
          const thumbnail = await getJobThumbnail(job.jobTitle);
          return {
            title: job.jobTitle,             // Map Firestore "jobTitle" to "title"
            location: job.location,
            company: job.company || "Unknown Company", // Optionally include a company field
            description: job.jobDescription, // Map Firestore "jobDescription" to "description"
            link: job.jobLink,
            thumbnail,
          };
        })
      );

      setJobs(jobsWithThumbnails);
      setFilteredJobs(jobsWithThumbnails);
    } catch (error) {
      console.error("Error fetching job listings from Firestore:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocalJobs();
  }, []);

  // Filter jobs based on the search query
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredJobs(jobs);
    } else {
      const filtered = jobs.filter((job) =>
        job.title.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredJobs(filtered);
    }
  };

  return (
    <Container maxWidth="lg">
      {/* Header */}
      <Typography variant="h4" align="center" sx={{ mt: 2, mb: 2, fontFamily:"'Montserrat', sans-serif" }}>
        Local Job Listings
      </Typography>

      {/* Toggle Search Bar */}
      <Box sx={{ textAlign: "center", mb: 2 }}>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => setShowSearch(!showSearch)}
          startIcon={showSearch ? <Close /> : <Search />}
        >
          {showSearch ? "Hide Search" : "Show Search"}
        </Button>
      </Box>

      {/* Search Bar */}
      {showSearch && (
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <TextField
            variant="outlined"
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            sx={{ width: "100%", maxWidth: "500px" }}
          />
        </Box>
      )}

      {/* Loading or Job Listings */}
      {loading ? (
        <Typography variant="h5" align="center" color="primary">
          Loading jobs...
        </Typography>
      ) : filteredJobs.length === 0 ? (
        <Typography variant="h5" align="center" color="textSecondary">
          No jobs available
        </Typography>
      ) : (
        <Grid container spacing={4} justifyContent="center">
          {filteredJobs.map((job, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card variant="outlined" sx={{ boxShadow: 3 }}>
                <CardContent>
                  <Box
                    component="img"
                    src={job.thumbnail}
                    alt={job.title}
                    sx={{
                      width: "100%",
                      height: 150,
                      objectFit: "cover",
                      borderRadius: 1,
                    }}
                  />
                  <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 2 }}>
                    {job.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Location: {job.location}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Company: {job.company}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    {job.description}
                  </Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    sx={{ mt: 3 }}
                    href={job.link}
                    target="_blank"
                  >
                    Apply Now
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default LocalJobs;
