import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../utils/api';
import MemorandumOfMarks from './MemorandumOfMarks';

export default function ResultPage() {
  const [rollNumber, setRollNumber] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    api.get('/courses').then(({ data }) => setCourses(data.courses || [])).catch(() => {});
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!rollNumber.trim()) return toast.error('Please enter roll number');
    setLoading(true);
    setSearched(false);
    setResult(null);
    try {
      const { data } = await api.get(`/results/roll/${rollNumber.trim()}`);
      setResult(data.result);
    } catch {
      setResult(null);
    }
    setSearched(true);
    setLoading(false);
  };

  return (
    <div style={{ paddingTop: 70, minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Times New Roman, serif' }}>

      {/* Search Bar */}
      <div style={{ maxWidth: 600, margin: '0 auto 24px', padding: '24px 20px 20px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 22, fontWeight: 700, color: '#081d5b', marginBottom: 16 }}>
          Check Your Result
        </h2>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10 }}>
          <input
            type="text"
            value={rollNumber}
            onChange={e => setRollNumber(e.target.value.toUpperCase())}
            placeholder="Enter Roll / Enrollment Number (e.g. KCI20240001)"
            style={{
              flex: 1, padding: '10px 14px', fontSize: 14,
              border: '2px solid #081d5b', borderRadius: 4,
              fontFamily: 'inherit', outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              background: '#081d5b', color: '#fff', border: 'none',
              padding: '10px 22px', fontSize: 14, fontWeight: 700,
              borderRadius: 4, cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
        <div style={{ marginTop: 8, fontSize: 12, color: '#666', textAlign: 'center' }}>
          Try: &nbsp;
          {['KCI20240001', 'KCI20230001'].map(r => (
            <button key={r} onClick={() => setRollNumber(r)} style={{ background: 'none', border: '1px solid #081d5b', borderRadius: 3, padding: '2px 8px', fontSize: 12, cursor: 'pointer', marginRight: 6, color: '#081d5b' }}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Not found */}
      {searched && !result && !loading && (
        <div style={{ textAlign: 'center', padding: '30px 20px', color: '#c00', fontSize: 16, fontWeight: 700 }}>
          ❌ No result found for &quot;{rollNumber}&quot;. Please check your roll number.
          <div style={{ marginTop: 10, fontSize: 13, color: '#555', fontWeight: 400 }}>
            Contact: 9936384736 / 9919660880
          </div>
        </div>
      )}

      {/* Memorandum */}
      {result && (
        <div style={{ padding: '0 10px 40px' }}>
          <MemorandumOfMarks result={result} />
        </div>
      )}

    </div>
  );
}
