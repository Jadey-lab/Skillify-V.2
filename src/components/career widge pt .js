import React, { useEffect, useState } from 'react';
import { Carousel, Card, Typography, Spin, Tag } from 'antd';
import axios from 'axios';
import './CareersInSTEMWidget.css';

const { Title, Paragraph, Text } = Typography;

const sampleCareers = [
  {
    title: 'Biomedical Scientist',
    description: 'Conducts research and performs lab tests to help diagnose and treat diseases.',
    insights: [
      'Works with laboratory equipment such as microscopes, PCR machines, and spectrophotometers.',
      'Collaborates with clinicians to interpret results and recommend further testing.',
      'Opportunities to specialize in immunology, histotechnology, or clinical chemistry.'
    ],
    medianSalary: 'R500,000 / yr',
    outlook: 'Growing need in hospitals, labs, and research institutes.',
    degree: 'BSc Biological Sciences / Medical Sciences',
    alternatePaths: [
      'Complete a National Diploma in Biomedical Technology followed by HPCSA registration.',
      'Pursue a BSc in Physiology or Biochemistry then an Honours in Biomedical Sciences.',
      'Enter laboratory technician roles and upgrade qualification via part‑time diploma.'
    ],
    universities: [
      'University of Cape Town',
      'University of Pretoria',
      'University of KwaZulu‑Natal',
      'University of the Free State',
      'University of Johannesburg'
    ],
    youtubeQuery: 'career in biomedical science South Africa'
  },
  {
    title: 'Microbiologist',
    description: 'Studies microorganisms and their effects on humans, animals, and the environment.',
    insights: [
      'Performs cultures, staining, and identification of bacteria, viruses and fungi.',
      'Supports food safety, water quality, and pharmaceutical R&D projects.',
      'Can progress into specialized roles in industrial microbiology or microbial genetics.'
    ],
    medianSalary: 'R480,000 / yr',
    outlook: 'Demand in health, water, and food safety sectors.',
    degree: 'BSc Microbiology / Biochemistry',
    alternatePaths: [
      'Obtain a National Diploma in Environmental Health with microbiology modules.',
      'Complete BSc in Biochemistry then bridge into Honours in Microbiology.',
      'Gain lab‑tech experience and pursue postgraduate certificates in microbial techniques.'
    ],
    universities: [
      'University of Johannesburg',
      'North‑West University',
      'University of Pretoria',
      'Stellenbosch University',
      'University of KwaZulu‑Natal'
    ],
    youtubeQuery: 'day in the life of a microbiologist South Africa'
  },
  {
    title: 'Biochemist',
    description: 'Explores chemical processes within and related to living organisms.',
    insights: [
      'Designs and runs experiments on enzymes, proteins, and metabolic pathways.',
      'Works in biotech or pharma to develop new products or improve existing ones.',
      'Career progression into R&D management, quality assurance, or regulatory affairs.'
    ],
    medianSalary: 'R530,000 / yr',
    outlook: 'Essential in biotech and pharmaceutical research.',
    degree: 'BSc Biochemistry / Molecular Biology',
    alternatePaths: [
      'Do a National Diploma in Biotechnology then transfer credits to BSc.',
      'Start with BSc in Molecular Biology then specialize in Biochemistry at Honours level.',
      'Enter industry as lab assistant and study part‑time for an Honours in Biochemistry.'
    ],
    universities: [
      'University of Cape Town',
      'Stellenbosch University',
      'University of the Western Cape',
      'University of KwaZulu‑Natal',
      'University of Pretoria'
    ],
    youtubeQuery: 'career in biochemistry South Africa'
  },
  {
    title: 'Geneticist',
    description: 'Studies genes and heredity to understand inherited diseases and traits.',
    insights: [
      'Uses techniques like gene sequencing, CRISPR editing, and cytogenetics.',
      'Provides insights for medical diagnostics, agriculture, and ancestry testing.',
      'High potential in personalized medicine and genomics startups.'
    ],
    medianSalary: 'R620,000 / yr',
    outlook: 'High demand in health, agriculture, and ancestry testing.',
    degree: 'BSc Genetics / Molecular Biology',
    alternatePaths: [
      'Complete BSc in Biotechnology then take postgraduate courses in Genetics.',
      'Earn a diploma in Molecular Diagnostics, then bridge into a BSc Genetics.',
      'Work as a research assistant and enroll for Honours in Genetic Counselling.'
    ],
    universities: [
      'University of Johannesburg',
      'University of Pretoria',
      'University of KwaZulu‑Natal',
      'North‑West University',
      'Stellenbosch University'
    ],
    youtubeQuery: 'day in the life of a geneticist'
  },
  {
    title: 'Pharmacologist',
    description: 'Analyzes the effects of drugs and develops new medications.',
    insights: [
      'Designs and interprets in vitro and in vivo drug tests.',
      'Collaborates with chemists, toxicologists, and clinicians.',
      'Paths into regulatory affairs, clinical trials, or pharmaceutical marketing.'
    ],
    medianSalary: 'R650,000 / yr',
    outlook: 'Growing biotech and pharma industry support this field.',
    degree: 'BSc Pharmacology / Biomedical Sciences',
    alternatePaths: [
      'Enroll in a BSc in Biomedical Sciences, then specialise via Honours in Pharmacology.',
      'Complete National Diploma in Pharmacy Technology, then upgrade to BSc.',
      'Work as a pharmacy assistant and study part‑time for Honours in Pharmacology.'
    ],
    universities: [
      'University of the Western Cape',
      'Stellenbosch University',
      'University of Cape Town',
      'University of Pretoria',
      'North‑West University'
    ],
    youtubeQuery: 'career in pharmacology South Africa'
  },
  {
    title: 'Forensic Scientist',
    description: 'Applies science to criminal investigations by analyzing evidence.',
    insights: [
      'Processes crime-scene samples: blood, fibers, firearms, and chemical residues.',
      'Prepares detailed reports and may testify as an expert witness.',
      'Specialisations include digital forensics, toxicology, and DNA analysis.'
    ],
    medianSalary: 'R420,000 / yr',
    outlook: 'Needed in SAPS forensic services and private labs.',
    degree: 'BSc Forensic Science / Chemistry',
    alternatePaths: [
      'Obtain a National Diploma in Chemical Technology then bridge to BSc Forensics.',
      'Do BSc in Chemistry then complete Postgrad Diploma in Forensic Science.',
      'Start as a crime lab technician and earn Honours in Forensic Science part‑time.'
    ],
    universities: [
      'Stellenbosch University',
      'University of Johannesburg',
      'North‑West University',
      'University of Pretoria',
      'University of KwaZulu‑Natal'
    ],
    youtubeQuery: 'day in the life of a forensic scientist'
  },
  {
    title: 'Medical Laboratory Scientist',
    description: 'Performs tests to assist doctors in diagnosing and treating diseases.',
    insights: [
      'Runs haematology, microbiology, immunology, and clinical chemistry assays.',
      'Implements quality-control protocols and maintains lab accreditation.',
      'Opportunities in hospital labs, private pathology groups, and research.'
    ],
    medianSalary: 'R500,000 / yr',
    outlook: 'High demand in public and private labs.',
    degree: 'BSc Medical Laboratory Sciences',
    alternatePaths: [
      'Complete BSc in Medical Technology then gain HPCSA registration.',
      'Do National Diploma in Medical Lab Services, then upgrade to BSc.',
      'Work as a lab assistant and take an Honours in Medical Laboratory Sciences.'
    ],
    universities: [
      'Sefako Makgatho Health Sciences University',
      'University of the Western Cape',
      'University of Cape Town',
      'University of the Witwatersrand',
      'University of KwaZulu‑Natal'
    ],
    youtubeQuery: 'medical lab scientist South Africa'
  },
  {
    title: 'Toxicologist',
    description: 'Studies harmful effects of chemicals and develops safety guidelines.',
    insights: [
      'Assesses chemical risks in food, environment, and consumer products.',
      'Designs toxicology studies; analyses dose–response relationships.',
      'Roles in regulatory bodies, environmental agencies, and pharmaceutical firms.'
    ],
    medianSalary: 'R580,000 / yr',
    outlook: 'Rising awareness of chemical safety boosts demand.',
    degree: 'BSc Toxicology / Pharmacology',
    alternatePaths: [
      'Pursue BSc in Pharmacology then specialise via Honours in Toxicology.',
      'Complete National Diploma in Environmental Health with toxicology modules.',
      'Work as a lab technician and study part‑time for postgraduate Diploma in Toxicology.'
    ],
    universities: [
      'University of Pretoria',
      'University of Cape Town',
      'Stellenbosch University',
      'University of Johannesburg',
      'University of KwaZulu‑Natal'
    ],
    youtubeQuery: 'career in toxicology South Africa'
  },
  {
    title: 'Clinical Research Associate',
    description: 'Manages trials to test new drugs and treatments for safety and effectiveness.',
    insights: [
      'Coordinates trial sites, ensures protocol compliance, and monitors data quality.',
      'Liaises between sponsors, investigators, and ethics committees.',
      'Progresses into study management, project management, or regulatory roles.'
    ],
    medianSalary: 'R630,000 / yr',
    outlook: 'Booming healthtech and clinical trials industry.',
    degree: 'BSc Medical Sciences / Pharmacy',
    alternatePaths: [
      'Start with BSc in Medical Sciences, then complete a Postgrad Diploma in Clinical Trials.',
      'Pharmacy degree holders can transition via GCP certification and pharma internships.',
      'Enter as a data coordinator and upgrade to CRA via professional courses.'
    ],
    universities: [
      'University of Cape Town',
      'University of Johannesburg',
      'Stellenbosch University',
      'University of Pretoria',
      'University of KwaZulu‑Natal'
    ],
    youtubeQuery: 'clinical research associate career South Africa'
  },
  {
    title: 'Public Health Analyst',
    description: 'Analyzes health data to guide policies and interventions.',
    insights: [
      'Uses epidemiological methods and statistical tools to identify health trends.',
      'Works with NGOs, government departments, and international agencies.',
      'Can move into health policy, program management, or global health consulting.'
    ],
    medianSalary: 'R560,000 / yr',
    outlook: 'Demand from WHO, NICD, and NGOs.',
    degree: 'BSc Public Health / Epidemiology',
    alternatePaths: [
      'Complete BSc in Epidemiology then specialise via Honours in Public Health.',
      'Do National Diploma in Health Promotion then bridge to BSc Public Health.',
      'Work in health NGOs and pursue part‑time Postgrad Certificate in Epidemiology.'
    ],
    universities: [
      'University of Cape Town',
      'University of Pretoria',
      'University of the Western Cape',
      'Stellenbosch University',
      'University of Johannesburg'
    ],
    youtubeQuery: 'public health career South Africa'
  },
  {
    title: 'Software Developer',
    description: 'Designs and builds computer applications to solve problems and meet user needs.',
    insights: [
      'Writes code in languages like JavaScript, Python, or Java and uses version control.',
      'Collaborates in agile teams with product managers and QA engineers.',
      'Paths into dev‑ops, architecture, or technical leadership roles.'
    ],
    medianSalary: 'R600,000 / yr',
    outlook: 'Very high demand, especially in finance, healthtech, and AI.',
    degree: 'BSc Computer Science / Information Systems',
    alternatePaths: [
      'Obtain a coding bootcamp certificate then apply for junior developer roles.',
      'Complete BSc in Information Systems and specialise via Postgrad Diploma in Software Engineering.',
      'Build a portfolio of personal projects and earn professional certifications (e.g., AWS, Microsoft).'
    ],
    universities: [
      'University of Cape Town',
      'University of Johannesburg',
      'University of KwaZulu‑Natal',
      'North‑West University',
      'Stellenbosch University'
    ],
    youtubeQuery: 'day in the life of a software developer'
  },
  {
    title: 'Data Scientist',
    description: 'Extracts insights from complex data using statistical and machine learning methods.',
    insights: [
      'Cleans and processes large datasets, builds predictive models, and visualises results.',
      'Works across industries: finance, healthcare, and e‑commerce.',
      'Can specialise in NLP, computer vision, or deep learning research.'
    ],
    medianSalary: 'R750,000 / yr',
    outlook: 'Explosive growth in analytics, healthcare, and social platforms.',
    degree: 'BSc Mathematics / Statistics / Data Science',
    alternatePaths: [
      'Earn BSc in Mathematics then complete Postgrad Diploma in Data Science.',
      'Work as a data analyst and pursue online Master’s or certificate programs.',
      'Combine BSc Statistics with professional courses in machine learning.'
    ],
    universities: [
      'University of Cape Town',
      'University of Pretoria',
      'Stellenbosch University',
      'North‑West University',
      'University of Johannesburg'
    ],
    youtubeQuery: 'day in the life of a data scientist'
  },
  {
    title: 'Bioinformatician',
    description: 'Applies computation to analyze biological data like DNA sequences.',
    insights: [
      'Writes code to process genomic and proteomic datasets.',
      'Works at the intersection of biology, statistics, and computer science.',
      'Key roles in genomics, personalised medicine, and agricultural biotech.'
    ],
    medianSalary: 'R690,000 / yr',
    outlook: 'Key role in genomics and personalized medicine.',
    degree: 'BSc Bioinformatics / Computer Science',
    alternatePaths: [
      'Complete BSc in Computer Science then take postgraduate courses in Bioinformatics.',
      'Pursue BSc in Molecular Biology with electives in programming.',
      'Work as a research assistant and study part‑time for Honours in Bioinformatics.'
    ],
    universities: [
      'University of Johannesburg',
      'University of Pretoria',
      'University of the Western Cape',
      'Stellenbosch University',
      'University of Cape Town'
    ],
    youtubeQuery: 'bioinformatics career South Africa'
  },
  {
    title: 'Epidemiologist',
    description: 'Studies disease patterns to inform public health responses.',
    insights: [
      'Designs cohort and case–control studies, performs outbreak investigations.',
      'Analyses data to recommend interventions and policy changes.',
      'Roles in government agencies, WHO, or academic research.'
    ],
    medianSalary: 'R580,000 / yr',
    outlook: 'Critical post‑pandemic; hired by NICD, WHO.',
    degree: 'BSc Epidemiology / Public Health',
    alternatePaths: [
      'Earn BSc in Public Health then specialise via Honours in Epidemiology.',
      'Do National Diploma in Health Promotion then bridge into BSc Epidemiology.',
      'Work in healthcare NGOs and study part‑time for Postgrad Diploma in Epidemiology.'
    ],
    universities: [
      'University of Cape Town',
      'University of Johannesburg',
      'Stellenbosch University',
      'University of Pretoria',
      'University of the Western Cape'
    ],
    youtubeQuery: 'career in epidemiology South Africa'
  },
  {
    title: 'Health Economist',
    description: 'Evaluates healthcare costs and outcomes to guide funding and policy.',
    insights: [
      'Builds economic models to compare interventions and treatments.',
      'Works with policymakers, insurers, and international agencies.',
      'Paths into consultancy, government health departments, or academia.'
    ],
    medianSalary: 'R670,000 / yr',
    outlook: 'Rising with universal health coverage discussions.',
    degree: 'BSc Economics / Public Health',
    alternatePaths: [
      'Complete BSc in Economics then a Postgrad Diploma in Health Economics.',
      'Pursue BSc in Public Health and add microeconomics electives.',
      'Work as a policy analyst and take professional courses in health economics.'
    ],
    universities: [
      'University of Cape Town',
      'Stellenbosch University',
      'University of Pretoria',
      'University of Johannesburg',
      'University of the Western Cape'
    ],
    youtubeQuery: 'career in health economics South Africa'
  },
  {
    title: 'Environmental Scientist',
    description: 'Solves problems related to pollution, conservation, and resource management.',
    insights: [
      'Conducts field surveys, lab analyses, and environmental impact assessments.',
      'Collaborates with government, industry, and communities on sustainability projects.',
      'Can specialise in climate science, waste management, or ecological restoration.'
    ],
    medianSalary: 'R460,000 / yr',
    outlook: 'Demand in government and sustainability consultancies.',
    degree: 'BSc Environmental Science',
    alternatePaths: [
      'Do a National Diploma in Environmental Health then bridge to BSc Environmental Science.',
      'Complete BSc in Biology with environmental electives, then Honours in Environmental Science.',
      'Work as a field technician and study part‑time for a Postgrad Diploma in Environmental Management.'
    ],
    universities: [
      'University of Cape Town',
      'Stellenbosch University',
      'University of Johannesburg',
      'University of KwaZulu‑Natal',
      'North‑West University'
    ],
    youtubeQuery: 'environmental science career South Africa'
  },
  {
    title: 'Biostatistician',
    description: 'Designs experiments and analyzes medical data for evidence-based decisions.',
    insights: [
      'Creates statistical plans for clinical trials and epidemiological studies.',
      'Writes code in R, SAS, or Python for data analysis.',
      'Careers span pharma, academia, government, and CROs.'
    ],
    medianSalary: 'R620,000 / yr',
    outlook: 'In demand at medical research institutions.',
    degree: 'BSc Statistics / Biostatistics',
    alternatePaths: [
      'Complete BSc in Mathematics then a Postgrad Diploma in Biostatistics.',
      'Do National Diploma in Statistical Sciences then bridge to BSc.',
      'Work as a data analyst and pursue part‑time Honours in Biostatistics.'
    ],
    universities: [
      'University of Cape Town',
      'Stellenbosch University',
      'University of Pretoria',
      'North‑West University',
      'University of Johannesburg'
    ],
    youtubeQuery: 'biostatistics career South Africa'
  },
  {
    title: 'Biotechnologist',
    description: 'Develops products using living organisms—like vaccines and enzymes.',
    insights: [
      'Works on gene cloning, fermentation, and cell culture processes.',
      'Partners with engineers and quality teams to scale up production.',
      'High growth in biopharma, agritech, and environmental biotech sectors.'
    ],
    medianSalary: 'R610,000 / yr',
    outlook: 'Fast growth in biotech startups and pharma.',
    degree: 'BSc Biotechnology / Biochemistry',
    alternatePaths: [
      'Pursue BSc in Biochemistry then Honours in Biotechnology.',
      'Complete National Diploma in Biotechnology Technology then upgrade to BSc.',
      'Work in a pilot plant as technician and study part‑time for a Postgrad Diploma in Biotechnology.'
    ],
    universities: [
      'University of Cape Town',
      'Stellenbosch University',
      'University of KwaZulu‑Natal',
      'University of Johannesburg',
      'University of Pretoria'
    ],
    youtubeQuery: 'career in biotechnology South Africa'
  },
  {
    title: 'Occupational Health Scientist',
    description: 'Focuses on workplace safety, chemical exposure, and ergonomics.',
    insights: [
      'Assesses hazards, conducts risk evaluations, and recommends control measures.',
      'Implements health surveillance and compliance with legislation.',
      'Opportunities in mining, manufacturing, and corporate health services.'
    ],
    medianSalary: 'R540,000 / yr',
    outlook: 'Demand across mining, agriculture, and industry.',
    degree: 'BSc Occupational Health / Environmental Science',
    alternatePaths: [
      'Do National Diploma in Environmental Health then Honours in Occupational Hygiene.',
      'Complete BSc in Environmental Science then Postgrad Diploma in Occupational Health.',
      'Work as safety officer and study part‑time for an Honours in Occupational Hygiene.'
    ],
    universities: [
      'North‑West University',
      'University of Johannesburg',
      'University of KwaZulu‑Natal',
      'Stellenbosch University',
      'University of Pretoria'
    ],
    youtubeQuery: 'occupational health science South Africa'
  },
  {
    title: 'Medical Physicist',
    description: 'Applies physics to medical imaging and cancer treatment technologies.',
    insights: [
      'Calibrates and maintains radiation therapy machines and imaging equipment.',
      'Develops treatment plans and ensures patient safety protocols.',
      'Required HPCSA registration and board certification.'
    ],
    medianSalary: 'R700,000 / yr',
    outlook: 'Critical in radiation oncology, CT, and MRI.',
    degree: 'BSc Physics / Medical Physics',
    alternatePaths: [
      'Complete BSc in Physics then Honours in Medical Physics with HPCSA internship.',
      'Do National Diploma in Radiography then bridge to BSc Medical Physics.',
      'Work as a radiotherapy technician and study part‑time for postgraduate Medical Physics.'
    ],
    universities: [
      'University of Cape Town',
      'Stellenbosch University',
      'University of Pretoria',
      'University of KwaZulu‑Natal',
      'North‑West University'
    ],
    youtubeQuery: 'medical physicist South Africa'
  }
];

export default function CareersInSTEMWidget() {
    const [videos, setVideos] = useState({});
    const [loading, setLoading] = useState(true);
  
    const fetchYouTubeVideo = async (query) => {
      try {
        const { data } = await axios.get(
          'https://www.googleapis.com/youtube/v3/search',
          {
            params: {
              part: 'snippet',
              maxResults: 1,
              q: query,
              type: 'video',
              key: 'AIzaSyANGvZz0r7W_veVjMZOM9E2rEB_5899yVo'  // hard‑coded API key
            }
          }
        );
        return data.items[0]?.id.videoId;
      } catch (err) {
        console.error('YouTube API Error:', err);
        return null;
      }
    };
  
    useEffect(() => {
      const loadVideos = async () => {
        const results = {};
        for (const career of sampleCareers) {
          const videoId = await fetchYouTubeVideo(career.youtubeQuery);
          if (videoId) results[career.title] = videoId;
        }
        setVideos(results);
        setLoading(false);
      };
      loadVideos();
    }, []);
  
    if (loading) {
      return <Spin tip="Loading STEM careers..." style={{ display: 'block', margin: 'auto' }} />;
    }
  
    return (
      <Card
        style={{
          maxWidth: 1000,
          margin: 'auto',
          borderRadius: 20,
          padding: 24,
          boxShadow: '0 12px 30px rgba(0,0,0,0.1)'
        }}
      >
        <Title level={3} style={{ textAlign: 'center', marginBottom: 30 }}>
        
        </Title>
        <Carousel autoplay dots={{ className: 'custom-dots' }}>
          {sampleCareers.map((career) => (
            <div key={career.title}>
              <Card bordered={false} style={{ background: '#f5f8ff', borderRadius: 16 }}>
                <Title level={4}>{career.title}</Title>
                <Paragraph>{career.description}</Paragraph>
  
                {career.insights && (
                  <Paragraph>
                    <Text strong>💡 Insights:</Text>
                    <ul className="career-list">
                      {career.insights.map((point, idx) => (
                        <li key={idx}>{point}</li>
                      ))}
                    </ul>
                  </Paragraph>
                )}
  
                <Tag><Text strong>🎓 Degree:</Text> {career.degree}</Tag><br />
                <Tag><Text strong>💰 Salary:</Text> {career.medianSalary}</Tag><br />
                <Tag><Text strong>📈 Outlook:</Text> {career.outlook}</Tag>
  
                {career.alternatePaths && (
                  <Paragraph>
                    <Text strong> Alternate Routes:</Text>
                    <ul className="career-list">
                      {career.alternatePaths.map((path, idx) => (
                        <li key={idx}>{path}</li>
                      ))}
                    </ul>
                  </Paragraph>
                )}
  
                {career.universities && (
                  <Paragraph>
                    <Text strong>🏫 Offered at:</Text> {career.universities.join(', ')}
                  </Paragraph>
                )}
  
                {videos[career.title] && (
                  <iframe
                    width="100%"
                    height="300"
                    src={`https://www.youtube.com/embed/${videos[career.title]}`}
                    title={career.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ marginTop: 20, borderRadius: 12 }}
                  />
                )}
              </Card>
            </div>
          ))}
        </Carousel>
      </Card>
    );
  }
