import React, { useState, useEffect } from "react";
import { Card, CardContent, Button, Typography, Grid, Box, MenuItem, Select, InputLabel, FormControl, Container } from "@mui/material";

// Function to fetch job thumbnails based on job type from Pexels API
const getJobThumbnail = async (jobType) => {
  const apiKey = 'wVfIHYpcNwD2ujAjcLjkxCk8ga5oLIqlDHAQ3rw3CrERleDci9uB7eLg'; // Replace with your Pexels API Key
  const query = jobType.toLowerCase();
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
      return 'https://via.placeholder.com/150/9E9E9E/FFFFFF?text=Job'; // Default placeholder image
    }
  } catch (error) {
    console.error("Error fetching image from Pexels:", error);
    return 'https://via.placeholder.com/150/9E9E9E/FFFFFF?text=Job'; // Default placeholder image
  }
};

// Component for International Jobs
const InternationalJobs = () => {
  // State for storing job data, loading state, and selected country
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [country, setCountry] = useState("any");

  // Function to fetch jobs from the API
  const fetchJobs = async (selectedCountry) => {
    const url = 'https://jooble.org/api/';
    const key = 'a4e98f28-28ae-47ec-b076-ec4af40be2b1';
    const params = {
      keywords: 'scientist',
      location: selectedCountry === "any" ? "" : selectedCountry,
    };

    const http = new XMLHttpRequest();
    http.open('POST', `${url}${key}`, true);
    http.setRequestHeader('Content-type', 'application/json');
    http.onreadystatechange = async () => {
      if (http.readyState === 4 && http.status === 200) {
        const response = JSON.parse(http.responseText);
        setLoading(false);
        if (response.jobs && response.jobs.length > 0) {
          const jobsWithThumbnails = await Promise.all(
            response.jobs.map(async (job) => {
              const thumbnail = await getJobThumbnail(job.title);
              return { ...job, thumbnail };
            })
          );
          setJobs(jobsWithThumbnails);
        } else {
          setJobs([]);
        }
      }
    };
    http.send(JSON.stringify(params));
  };

  // Use useEffect to fetch jobs when the component mounts or country changes
  useEffect(() => {
    fetchJobs(country);
  }, [country]);

  return (
    <div>
      {/* Container for the filter and jobs */}
      <Container maxWidth="lg">
        {/* Country Filter */}
        <Grid container justifyContent="center" sx={{ mt: 2, mb: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Filter by Country</InputLabel>
              <Select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                label="Filter by Country"
              >
                <MenuItem value="any">Any</MenuItem>
                <MenuItem value="USA">USA</MenuItem>
                <MenuItem value="Egypt">Egypt</MenuItem>
                <MenuItem value="Australia">Australia</MenuItem>
                <MenuItem value="Canada">Canada</MenuItem>
                <MenuItem value="China">China</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Loading Section */}
        <section className="job-feed" id="job-feed">
          {loading ? (
            <Typography variant="h4" color="primary" align="center">
              Loading jobs...
            </Typography>
          ) : jobs.length === 0 ? (
            <Typography variant="h4" color="textSecondary" align="center">
              No jobs available
            </Typography>
          ) : (
            <Grid container spacing={4} justifyContent="center">
              {/* Display fetched jobs */}
              {jobs.map((job, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card variant="outlined" sx={{ boxShadow: 3 }}>
                    <CardContent>
                      <Box
                        component="img"
                        src={job.thumbnail} // Use the thumbnail fetched from Pexels
                        alt={job.title}
                        sx={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 1 }}
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
                        href={job.link} // Link to the job application
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
        </section>
      </Container>
    </div>
  );
};

export default InternationalJobs;
