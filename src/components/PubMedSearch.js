import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './PubMedSearch.css';
function PubMedSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const defaultResults = [
    {
      title: 'Understanding Cancer',
      source: 'Nature',
      pubdate: '2023-01-01',
      summary: 'A comprehensive overview of cancer research, covering new treatment methods and breakthroughs.',
      link: 'https://pubmed.ncbi.nlm.nih.gov/12345678/',
      thumbnail: 'https://images.pexels.com/photos/6303789/pexels-photo-6303789.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
      title: 'Advances in Microbiology',
      source: 'Science Journal',
      pubdate: '2022-05-12',
      summary: 'Explores the latest developments in microbiology, including the discovery of new microorganisms.',
      link: 'https://pubmed.ncbi.nlm.nih.gov/23456789/',
      thumbnail: 'https://images.pexels.com/photos/3992945/pexels-photo-3992945.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    
    {
    title: 'Genetic Engineering',
    source: 'Medical Today',
    pubdate: '2021-09-15',
    summary: 'Discusses the role of genetic engineering in advancing personalized medicine and disease prevention.',
    link: 'https://pubmed.ncbi.nlm.nih.gov/34567890/',
    thumbnail: 'https://images.pexels.com/photos/17485658/pexels-photo-17485658/free-photo-of-an-artist-s-illustration-of-artificial-intelligence-ai-this-image-depicts-how-ai-could-adapt-to-an-infinite-amount-of-uses-it-was-created-by-nidia-dias-as-part-of-the-visualising-ai-pr.png?auto=compress&cs=tinysrgb&w=600',
   },
  ];

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError('Please enter a search term');
      return;
    }
    setError('');
    setLoading(true);

    const pubMedApiKey = '4b894fb33f1f0acb2c748e70be2116fbec09'; // Replace with your PubMed API key
    const pexelsApiKey = 'wVfIHYpcNwD2ujAjcLjkxCk8ga5oLIqlDHAQ3rw3CrERleDci9uB7eLg'; // Replace with your Pexels API key
    const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(
      searchTerm
    )}&retmax=10&retmode=json&api_key=${pubMedApiKey}`;
    const pexelsUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(
      searchTerm
    )}&per_page=10`;

    try {
      const [pubMedResponse, pexelsResponse] = await Promise.all([
        fetch(searchUrl),
        fetch(pexelsUrl, { headers: { Authorization: pexelsApiKey } }),
      ]);

      if (!pubMedResponse.ok || !pexelsResponse.ok) {
        throw new Error('Error fetching data');
      }

      const pubMedData = await pubMedResponse.json();
      const pexelsData = await pexelsResponse.json();
      const idList = pubMedData.esearchresult.idlist;

      if (idList.length === 0) {
        setResults([]);
      } else {
        const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${idList.join(
          ','
        )}&retmode=json&api_key=${pubMedApiKey}`;
        const summaryResponse = await fetch(summaryUrl);

        if (!summaryResponse.ok) {
          throw new Error('Error fetching PubMed summaries');
        }

        const summaryData = await summaryResponse.json();
        const articles = Object.values(summaryData.result).filter(
          (item) => item.uid
        );

        setResults(
          articles.map((article, index) => ({
            title: article.title,
            source: article.source,
            pubdate: article.pubdate,
            summary: article.summary,  
            link: `https://pubmed.ncbi.nlm.nih.gov/${article.uid}/`,
            thumbnail:
              pexelsData.photos[index]?.src?.medium || 'https://via.placeholder.com/150',
          }))
        );
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">PubMed Search</h2>
      <div className="input-group mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search PubMed"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="btn " onClick={handleSearch}>
          Search
        </button>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="row">
          {(results.length > 0 ? results : defaultResults).map((result, index) => (
            <div className="col-md-4 mb-4" key={index}>
              <div className="result-item">
                <img
                  src={result.thumbnail}
                  alt="Thumbnail"
                  style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                />
                <h5 className="mt-2">{result.title}</h5>
                <p>
                  <em>{result.source}</em> ({result.pubdate})
                </p>
                <a
                  href={result.link}
                  className="btn btn-primary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Read More
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PubMedSearch;
