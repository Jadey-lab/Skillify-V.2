import React, { useEffect, useState } from 'react';
import {
  Row,
  Col,
  Card,
  Typography,
  Spin,
  Tag,
  Button,
  Modal,
  Pagination,
} from 'antd';
import './CareersInSTEMWidget.css';

const { Title, Paragraph } = Typography;

const sampleCareers = [
  {
    title: 'Biomedical Scientist',
    description:
      'Conducts research and performs lab tests to help diagnose and treat diseases.',
    insights: [
      'Works with laboratory equipment such as microscopes, PCR machines, and spectrophotometers.',
      'Collaborates with clinicians to interpret results and recommend further testing.',
      'Opportunities to specialize in immunology, histotechnology, or clinical chemistry.',
    ],
    medianSalary: 'R500,000 / yr',
    outlook: 'Growing need in hospitals, labs, and research institutes.',
    degree: 'BSc Biological Sciences / Medical Sciences',
    alternatePaths: [
      'Complete a National Diploma in Biomedical Technology followed by HPCSA registration.',
      'Pursue a BSc in Physiology or Biochemistry then an Honours in Biomedical Sciences.',
      'Enter laboratory technician roles and upgrade qualification via part-time diploma.',
    ],
    universities: [
      'University of Cape Town',
      'University of Pretoria',
      'University of KwaZulu-Natal',
      'University of the Free State',
      'University of Johannesburg',
    ],
    imageUrl: 'https://images.pexels.com/photos/4031321/pexels-photo-4031321.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    title: 'Microbiologist',
    description:
      'Studies microorganisms and their effects on humans, animals, and the environment.',
    insights: [
      'Performs cultures, staining, and identification of bacteria, viruses and fungi.',
      'Supports food safety, water quality, and pharmaceutical R&D projects.',
      'Can progress into specialized roles in industrial microbiology or microbial genetics.',
    ],
    medianSalary: 'R480,000 / yr',
    outlook: 'Demand in health, water, and food safety sectors.',
    degree: 'BSc Microbiology / Biochemistry',
    alternatePaths: [
      'Obtain a National Diploma in Environmental Health with microbiology modules.',
      'Complete BSc in Biochemistry then bridge into Honours in Microbiology.',
      'Gain lab-tech experience and pursue postgraduate certificates in microbial techniques.',
    ],
    universities: [
      'University of Johannesburg',
      'North-West University',
      'University of Pretoria',
      'Stellenbosch University',
      'University of KwaZulu-Natal',
    ],
    imageUrl: 'https://images.pexels.com/photos/4031442/pexels-photo-4031442.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    title: 'Biochemist',
    description:
      'Explores chemical processes within and related to living organisms.',
    insights: [
      'Designs and runs experiments on enzymes, proteins, and metabolic pathways.',
      'Works in biotech or pharma to develop new products or improve existing ones.',
      'Career progression into R&D management, quality assurance, or regulatory affairs.',
    ],
    medianSalary: 'R530,000 / yr',
    outlook: 'Essential in biotech and pharmaceutical research.',
    degree: 'BSc Biochemistry / Molecular Biology',
    alternatePaths: [
      'Do a National Diploma in Biotechnology then transfer credits to BSc.',
      'Start with BSc in Molecular Biology then specialize in Biochemistry at Honours level.',
      'Enter industry as lab assistant and study part-time for an Honours in Biochemistry.',
    ],
    universities: [
      'University of Cape Town',
      'Stellenbosch University',
      'University of the Western Cape',
      'University of KwaZulu-Natal',
      'University of Pretoria',
    ],
    imageUrl: 'https://images.pexels.com/photos/2280549/pexels-photo-2280549.jpeg',
  },
  {
    title: 'Geneticist',
    description:
      'Studies genes and heredity to understand inherited diseases and traits.',
    insights: [
      'Uses techniques like gene sequencing, CRISPR editing, and cytogenetics.',
      'Provides insights for medical diagnostics, agriculture, and ancestry testing.',
      'High potential in personalized medicine and genomics startups.',
    ],
    medianSalary: 'R620,000 / yr',
    outlook: 'High demand in health, agriculture, and ancestry testing.',
    degree: 'BSc Genetics / Molecular Biology',
    alternatePaths: [
      'Complete BSc in Biotechnology then take postgraduate courses in Genetics.',
      'Earn a diploma in Molecular Diagnostics, then bridge into a BSc Genetics.',
      'Work as a research assistant and enroll for Honours in Genetic Counselling.',
    ],
    universities: [
      'University of Johannesburg',
      'University of Pretoria',
      'University of KwaZulu-Natal',
      'North-West University',
      'Stellenbosch University',
    ],
    imageUrl: 'https://images.pexels.com/photos/8442543/pexels-photo-8442543.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    title: 'Pharmacologist',
    description:
      'Analyzes the effects of drugs and develops new medications.',
    insights: [
      'Designs and interprets in vitro and in vivo drug tests.',
      'Collaborates with chemists, toxicologists, and clinicians.',
      'Paths into regulatory affairs, clinical trials, or pharmaceutical marketing.',
    ],
    medianSalary: 'R650,000 / yr',
    outlook: 'Growing biotech and pharma industry support this field.',
    degree: 'BSc Pharmacology / Biomedical Sciences',
    alternatePaths: [
      'Enroll in a BSc in Biomedical Sciences, then specialise via Honours in Pharmacology.',
      'Complete National Diploma in Pharmacy Technology, then upgrade to BSc.',
      'Work as a pharmacy assistant and study part-time for Honours in Pharmacology.',
    ],
    universities: [
      'University of the Western Cape',
      'Stellenbosch University',
      'University of Cape Town',
      'University of Pretoria',
      'North-West University',
    ],
    imageUrl: 'https://images.pexels.com/photos/8460373/pexels-photo-8460373.jpeg',
  },
  {
    title: 'Environmental Scientist',
    description:
      'Studies the environment and develops solutions for environmental problems.',
    insights: [
      'Conducts field research and data analysis on pollution and ecosystems.',
      'Works with governments and companies to ensure environmental compliance.',
      'Career options in sustainability consulting, policy, and conservation.',
    ],
    medianSalary: 'R480,000 / yr',
    outlook: 'Growing environmental awareness boosts demand.',
    degree: 'BSc Environmental Science / Biology',
    alternatePaths: [
      'Complete diploma in Environmental Management then pursue BSc.',
      'Start with BSc in Biology and specialise through Honours in Environmental Science.',
      'Gain experience with NGOs and take short courses in GIS and environmental law.',
    ],
    universities: [
      'University of Cape Town',
      'University of Pretoria',
      'Stellenbosch University',
      'North-West University',
      'University of the Witwatersrand',
    ],
    imageUrl: 'https://images.pexels.com/photos/2280568/pexels-photo-2280568.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    title: 'Marine Biologist',
    description:
      'Researches ocean ecosystems, marine organisms, and their conservation.',
    insights: [
      'Conducts fieldwork at sea and in labs to study marine biodiversity.',
      'Works with fisheries, conservation bodies, or research institutions.',
      'Important for sustainable marine resource use and coastal protection.',
    ],
    medianSalary: 'R203,000 / yr',
    outlook: 'Growing demand due to marine conservation and climate research.',
    degree: 'BSc Marine Biology / Zoology / Oceanography',
    alternatePaths: [
      'Begin with BSc in Zoology and focus on marine electives or Honours.',
      'Volunteer in coastal research or aquariums during undergraduate studies.',
      'Advance to MSc or PhD for careers in academia and marine policy.',
    ],
    universities: [
      'University of Cape Town',
      'Rhodes University',
      'University of KwaZulu-Natal',
      'Stellenbosch University',
      'University of Johannesburg',
    ],
    imageUrl: 'https://images.pexels.com/photos/847393/pexels-photo-847393.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    title: 'Astrophysicist',
    description:
      'Explores the universe through the study of stars, planets, and cosmic phenomena.',
    insights: [
      'Uses telescopes and simulations to understand space and physics.',
      'Often works at observatories or in university research teams.',
      'SA’s involvement in the SKA boosts astrophysics research opportunities.',
    ],
    medianSalary: 'R450,000 / yr',
    outlook: 'Steady with national investment in astronomy infrastructure.',
    degree: 'BSc Physics / Astrophysics',
    alternatePaths: [
      'Start with BSc Physics, then pursue Honours or MSc in Astrophysics.',
      'Engage in research internships at astronomy observatories.',
      'Develop coding and data analysis skills used in space science.',
    ],
    universities: [
      'University of Cape Town',
      'University of KwaZulu-Natal',
      'University of Pretoria',
      'University of the Witwatersrand',
      'North-West University',
    ],
    imageUrl: 'https://images.pexels.com/photos/32414830/pexels-photo-32414830/free-photo-of-powerful-telescope-in-observatory-at-night.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    title: 'Data Scientist',
    description:
      'Analyzes large datasets to extract patterns and support decision-making.',
    insights: [
      'Uses statistics, machine learning, and coding to interpret complex data.',
      'High demand across business, healthcare, and environmental sectors.',
      'Roles include model development, AI systems, and predictive analytics.',
    ],
    medianSalary: 'R436,000 / yr',
    outlook: 'High demand due to AI and data-driven decision-making.',
    degree: 'BSc Statistics / Mathematics / Computer Science',
    alternatePaths: [
      'Start as a Data Analyst, then upskill with Python and machine learning.',
      'Pursue postgraduate diploma or MSc in Data Science.',
      'Build a strong portfolio of real-world data projects.',
    ],
    universities: [
      'University of Pretoria',
      'University of Cape Town',
      'University of the Witwatersrand',
      'Stellenbosch University',
      'University of Johannesburg',
    ],
    imageUrl: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg',
  },
  {
    title: 'Renewable Energy Engineer',
    description:
      'Designs and optimizes systems for clean energy like solar and wind.',
    insights: [
      'Works on power generation systems, grid integration, and storage.',
      'Helps meet energy targets with sustainable technologies.',
      'Rising demand in SA with national energy and green economy goals.',
    ],
    medianSalary: 'R722,725 / yr',
    outlook: 'Strong growth as SA expands renewable energy capacity.',
    degree: 'BEng Mechanical / Electrical Engineering (Renewables)',
    alternatePaths: [
      'Start with Electrical Engineering and specialize via postgraduate diploma.',
      'Join solar or wind energy startups and gain hands-on experience.',
      'Certify in energy modelling or grid systems for advanced roles.',
    ],
    universities: [
      'University of Cape Town',
      'University of Pretoria',
      'Stellenbosch University',
      'University of the Witwatersrand',
      'University of Johannesburg',
    ],
    imageUrl: 'https://images.pexels.com/photos/8853512/pexels-photo-8853512.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  
  {
    title: 'Robotics Engineer',
    description:
      'Designs and programs robotic systems for automation and smart devices.',
    insights: [
      'Combines mechanical, electronic, and software engineering.',
      'Used in industries like manufacturing, mining, and healthcare.',
      'SA’s automation trends create demand for robotic solutions.',
    ],
    medianSalary: 'R780,475 / yr',
    outlook: 'Rapid growth as automation expands in key industries.',
    degree: 'BEng Mechatronics / Electrical / Mechanical Engineering',
    alternatePaths: [
      'Start with Mechatronics, then gain experience in embedded systems.',
      'Join robotics clubs or competitions to build practical skills.',
      'Take short courses in control systems and AI integration.',
    ],
    universities: [
      'University of the Witwatersrand',
      'University of Cape Town',
      'University of Johannesburg',
      'Stellenbosch University',
      'North-West University',
    ],
    imageUrl: 'https://images.pexels.com/photos/19233057/pexels-photo-19233057/free-photo-of-assembling-machines-in-factory.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    title: 'Nanotechnologist',
    description:
      'Develops materials and devices at the nanoscale for use in electronics, medicine, and materials science.',
    insights: [
      'Studies atoms and molecules to create novel properties.',
      'Works in clean labs with high-tech imaging and fabrication tools.',
      'Research applications include drug delivery, sensors, and energy.',
    ],
    medianSalary: 'R582,429 / yr',
    outlook: 'Emerging field with increasing research investment.',
    degree: 'BSc Nanotechnology / Materials Science / Chemistry',
    alternatePaths: [
      'Start with Chemistry or Physics, then take nano-focused Honours.',
      'Join nanotech research labs or pursue MSc for specialization.',
      'Combine with biomedical or energy focus for more career paths.',
    ],
    universities: [
      'University of Cape Town',
      'University of Johannesburg',
      'North-West University',
      'Stellenbosch University',
      'University of the Witwatersrand',
    ],
    imageUrl: 'https://images.pexels.com/photos/6755059/pexels-photo-6755059.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    title: 'Nuclear Engineer',
    description:
      'Designs and manages systems that use nuclear energy safely and efficiently.',
    insights: [
      'Works on nuclear power, radiation safety, or medical applications.',
      'Monitors systems in research reactors or energy plants.',
      'Highly specialized field with advanced training requirements.',
    ],
    medianSalary: 'R909,338 / yr',
    outlook: 'Consistent need in energy and research; limited but stable roles.',
    degree: 'BEng Nuclear / Mechanical / Electrical Engineering',
    alternatePaths: [
      'Begin with Mechanical Engineering and specialize via postgraduate study.',
      'Work in nuclear safety or energy planning for public sector agencies.',
      'Take radiation protection or reactor physics courses.',
    ],
    universities: [
      'North-West University',
      'University of Johannesburg',
      'University of Pretoria',
      'University of Cape Town',
      'Tshwane University of Technology',
    ],
    imageUrl: 'https://images.pexels.com/photos/6855582/pexels-photo-6855582.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    title: 'Meteorologist',
    description:
      'Forecasts weather and studies climate patterns using atmospheric science.',
    insights: [
      'Uses models and satellite data to predict storms and rainfall.',
      'Important for agriculture, aviation, and disaster preparedness.',
      'Climate change increases demand for long-term climate forecasting.',
    ],
    medianSalary: 'R300,000 / yr',
    outlook: 'High relevance due to climate change and weather variability.',
    degree: 'BSc Meteorology / Atmospheric Science',
    alternatePaths: [
      'Start with Physics or Geography, then specialize in Meteorology.',
      'Pursue internships with weather services or climate NGOs.',
      'Gain coding skills for modelling and simulations.',
    ],
    universities: [
      'University of Cape Town',
      'University of KwaZulu-Natal',
      'University of Pretoria',
      'University of the Witwatersrand',
      'Stellenbosch University',
    ],
    imageUrl: 'https://images.pexels.com/photos/2098318/pexels-photo-2098318.jpeg',
  },
];

// Pagination settings
const pageSize = 3;

export default function CareersInSTEMWidget() {
  const [loading, setLoading] = useState(true);
  const [modalCareer, setModalCareer] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // No async image fetching needed. Just simulate a brief loading state.
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Determine which careers to show on current page
  const startIndex = (currentPage - 1) * pageSize;
  const currentCareers = sampleCareers.slice(startIndex, startIndex + pageSize);

  if (loading) {
    return (
      <Spin
        tip="Loading STEM careers..."
        style={{ display: 'block', margin: '150px auto' }}
        size="large"
      />
    );
  }

  return (
    <>
      <Card
        style={{
          maxWidth: 1200,
          margin: '40px auto',
          borderRadius: 20,
          padding: 32,
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.08)',
        }}
      >
       <Paragraph style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.45)', marginTop: '1rem' }}>
  <strong>Disclaimer:</strong> This information is based on estimates and publicly available sources. Details such as salaries, career paths, and opportunities may vary and are subject to change over time.
</Paragraph>


        <Row gutter={[24, 24]}>
          {currentCareers.map((career) => (
            <Col key={career.title} xs={24} sm={12} md={8}>
              <Card
                hoverable
                className="career-card"
                cover={
                  <div className="card-cover-wrapper">
                    <img
                      alt={career.title}
                      src={career.imageUrl}
                      className="card-cover-image"
                    />
                    <div className="title-overlay">
                      <Title level={4} style={{ color: '#fff', margin: 0 }}>
                        {career.title}
                      </Title>
                    </div>
                  </div>
                }
                bodyStyle={{ padding: '16px 24px' }}
              >
                <Paragraph
                  ellipsis={{ rows: 2, expandable: false }}
                  style={{ color: '#555', marginBottom: 16 }}
                >
                  {career.description}
                </Paragraph>

                <div className="tag-row">
                  <Tag color="blue">🎓 {career.degree}</Tag>
                  <Tag color="green">💰 {career.medianSalary}</Tag>
                </div>

                <Button
                  type="primary"
                  block
                  style={{ marginTop: 12 }}
                  onClick={() => setModalCareer(career)}
                >
                  Learn More
                </Button>
              </Card>
            </Col>
          ))}
        </Row>

        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={sampleCareers.length}
          onChange={(page) => setCurrentPage(page)}
          style={{ textAlign: 'center', marginTop: 40 }}
          showSizeChanger={false}
          hideOnSinglePage={true}
        />
      </Card>

      <Modal
        title={modalCareer?.title || ''}
        open={!!modalCareer}
        onCancel={() => setModalCareer(null)}
        footer={[
          <Button key="close" onClick={() => setModalCareer(null)}>
            Close
          </Button>,
        ]}
        width={720}
        bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
      >
        {modalCareer && (
          <>
            <img
              src={modalCareer.imageUrl}
              alt={modalCareer.title}
              style={{
                width: '100%',
                height: 200,
                objectFit: 'cover',
                borderRadius: 8,
                marginBottom: 16,
              }}
            />

            <Title level={4}>Description</Title>
            <Paragraph>{modalCareer.description}</Paragraph>

            <Title level={4}>Insights</Title>
            <ul>
              {modalCareer.insights.map((insight, i) => (
                <li key={i}>{insight}</li>
              ))}
            </ul>

            <Title level={4}>Job Outlook</Title>
            <Paragraph>{modalCareer.outlook}</Paragraph>

            <Title level={4}>Alternate Education Pathways</Title>
            <ul>
              {modalCareer.alternatePaths.map((path, i) => (
                <li key={i}>{path}</li>
              ))}
            </ul>

            <Title level={4}>Universities Offering Relevant Degrees</Title>
            <ul>
              {modalCareer.universities.map((uni, i) => (
                <li key={i}>{uni}</li>
              ))}
            </ul>
          </>
        )}
      </Modal>
    </>
  );
}
