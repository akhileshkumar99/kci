import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, XCircle, Trophy, ArrowRight, RotateCcw, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { toast } from 'react-hot-toast';
import api from '../utils/api';
import SectionTitle from '../components/SectionTitle';

function QuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/quiz').then(r => setQuizzes(r.data.quizzes || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <section className="relative bg-gradient-to-br from-orange-600 to-red-600 py-12 text-white text-center overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 40" className="w-full" preserveAspectRatio="none">
            <path d="M0,20 C360,40 1080,0 1440,20 L1440,40 L0,40 Z" fill="#f9fafb" />
          </svg>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative max-w-3xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-4">
            <Trophy className="w-4 h-4 text-yellow-400" /> Online Quiz System
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-2">Take a <span className="text-yellow-400">Quiz</span></h1>
          <p className="text-orange-200">Test your knowledge and earn certificates</p>
        </motion.div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <SectionTitle title="Available Quizzes" subtitle="Choose a quiz to test your knowledge" />
        {loading ? (
          <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-200" />
            <p className="text-lg font-semibold">No quizzes available yet</p>
            <p className="text-sm mt-1">Check back later for new quizzes</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-5 mt-8">
            {quizzes.map((q, i) => (
              <motion.div key={q._id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }} className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-xl transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">Active</span>
                </div>
                <h3 className="font-black text-gray-900 text-lg mb-1">{q.title}</h3>
                <p className="text-gray-500 text-sm mb-4">{q.description || 'Test your knowledge'}</p>
                <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                  <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> {q.questions?.length || 0} Questions</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {q.duration} mins</span>
                  <span className="flex items-center gap-1"><Trophy className="w-3.5 h-3.5" /> Pass: {q.passingMarks}%</span>
                </div>
                <a href={`/quiz/${q._id}`} className="block w-full text-center py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity">
                  Start Quiz <ArrowRight className="inline w-4 h-4 ml-1" />
                </a>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function QuizAttempt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/quiz/${id}`).then(r => {
      setQuiz(r.data.quiz);
      setTimeLeft(r.data.quiz.duration * 60);
    }).catch(() => navigate('/quiz')).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!quiz || submitted || timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft(p => { if (p <= 1) { clearInterval(t); handleSubmit(); return 0; } return p - 1; }), 1000);
    return () => clearInterval(t);
  }, [quiz, submitted, timeLeft]);

  const handleSubmit = async () => {
    if (submitted) return;
    setSubmitted(true);
    try {
      const { data } = await api.post(`/quiz/${id}/attempt`, { answers: Object.values(answers) });
      setResult(data);
    } catch {
      toast.error('Failed to submit quiz');
    }
  };

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const progress = quiz ? ((current + 1) / quiz.questions.length) * 100 : 0;

  if (loading) return <div className="flex justify-center items-center h-screen"><div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!quiz) return null;

  const downloadResult = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a5' });
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();

    // Background
    doc.setFillColor(255, 247, 237);
    doc.rect(0, 0, W, H, 'F');

    // Border
    doc.setDrawColor(234, 88, 12);
    doc.setLineWidth(1.5);
    doc.rect(6, 6, W - 12, H - 12);
    doc.setLineWidth(0.5);
    doc.rect(8, 8, W - 16, H - 16);

    // Header
    doc.setFillColor(234, 88, 12);
    doc.rect(0, 0, W, 22, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('KEERTI COMPUTER INSTITUTE', W / 2, 10, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Quiz Result Certificate', W / 2, 17, { align: 'center' });

    // Trophy emoji area
    doc.setTextColor(234, 88, 12);
    doc.setFontSize(28);
    doc.text(result.passed ? '🏆' : '📋', W / 2, 40, { align: 'center' });

    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(result.passed ? 22 : 220, result.passed ? 163 : 38, result.passed ? 74 : 38);
    doc.text(result.passed ? 'CONGRATULATIONS!' : 'RESULT CARD', W / 2, 52, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(result.passed ? 'You have successfully passed the quiz!' : 'Better luck next time!', W / 2, 59, { align: 'center' });

    // Quiz title
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text(quiz?.title || 'Quiz', W / 2, 68, { align: 'center' });

    // Score boxes
    const boxY = 76; const boxH = 18; const boxW = 42;
    const boxes = [
      { label: 'SCORE', value: String(result.score), color: [59, 130, 246] },
      { label: 'PERCENTAGE', value: `${result.percentage}%`, color: [16, 185, 129] },
      { label: 'STATUS', value: result.passed ? 'PASS' : 'FAIL', color: result.passed ? [16, 185, 129] : [239, 68, 68] },
    ];
    const startX = (W - boxes.length * boxW - (boxes.length - 1) * 5) / 2;
    boxes.forEach((b, i) => {
      const x = startX + i * (boxW + 5);
      doc.setFillColor(...b.color);
      doc.roundedRect(x, boxY, boxW, boxH, 3, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(b.value, x + boxW / 2, boxY + 10, { align: 'center' });
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text(b.label, x + boxW / 2, boxY + 15.5, { align: 'center' });
    });

    // Date
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}`, W / 2, H - 14, { align: 'center' });
    doc.text('www.kci.org.in  |  9936384736', W / 2, H - 9, { align: 'center' });

    doc.save(`KCI_Quiz_Result_${result.percentage}%.pdf`);
  };

  if (result) return (
    <div className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${result.passed ? 'bg-green-100' : 'bg-red-100'}`}>
          {result.passed ? <CheckCircle className="w-12 h-12 text-green-500" /> : <XCircle className="w-12 h-12 text-red-500" />}
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-2">{result.passed ? '🎉 Congratulations!' : '😔 Better Luck Next Time'}</h2>
        <p className="text-gray-500 mb-6">{result.passed ? 'You passed the quiz!' : 'You did not pass this time.'}</p>
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-50 rounded-xl p-3"><div className="text-2xl font-black text-blue-700">{result.score}</div><div className="text-xs text-gray-400">Score</div></div>
          <div className="bg-green-50 rounded-xl p-3"><div className="text-2xl font-black text-green-700">{result.percentage}%</div><div className="text-xs text-gray-400">Percentage</div></div>
          <div className={`${result.passed ? 'bg-green-50' : 'bg-red-50'} rounded-xl p-3`}><div className={`text-2xl font-black ${result.passed ? 'text-green-700' : 'text-red-700'}`}>{result.passed ? 'PASS' : 'FAIL'}</div><div className="text-xs text-gray-400">Status</div></div>
        </div>
        <div className="flex flex-col gap-3">
          <button onClick={downloadResult}
            className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
            <Download className="w-4 h-4" /> Download Result
          </button>
          <div className="flex gap-3">
            <button onClick={() => navigate('/quiz')} className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
              <RotateCcw className="w-4 h-4" /> Try Again
            </button>
            <button onClick={() => navigate('/dashboard')} className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity">
              Dashboard
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const q = quiz.questions[current];

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6 flex items-center justify-between">
          <div>
            <h2 className="font-black text-gray-900">{quiz.title}</h2>
            <p className="text-xs text-gray-400">Question {current + 1} of {quiz.questions.length}</p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm ${timeLeft < 60 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-orange-100 text-orange-600'}`}>
            <Clock className="w-4 h-4" /> {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </div>
        </div>

        {/* Progress */}
        <div className="h-2 bg-gray-200 rounded-full mb-6 overflow-hidden">
          <motion.div className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full" animate={{ width: `${progress}%` }} />
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div key={current} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 mb-6">
            <div className="flex items-start gap-3 mb-6">
              <span className="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center font-black text-sm shrink-0">{current + 1}</span>
              <p className="text-gray-900 font-semibold text-lg leading-relaxed">{q.question}</p>
            </div>

            {q.type === 'mcq' && (
              <div className="space-y-3">
                {q.options.map((opt, i) => (
                  <button key={i} onClick={() => setAnswers(p => ({ ...p, [current]: opt }))}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all font-medium ${answers[current] === opt ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-100 hover:border-orange-200 hover:bg-orange-50/50'}`}>
                    <span className="inline-flex w-6 h-6 rounded-full border-2 mr-3 items-center justify-center text-xs font-bold">{String.fromCharCode(65 + i)}</span>
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {q.type === 'truefalse' && (
              <div className="flex gap-4">
                {['True', 'False'].map(opt => (
                  <button key={opt} onClick={() => setAnswers(p => ({ ...p, [current]: opt }))}
                    className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${answers[current] === opt ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-100 hover:border-orange-200'}`}>
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {q.type === 'fillinblank' && (
              <input value={answers[current] || ''} onChange={e => setAnswers(p => ({ ...p, [current]: e.target.value }))}
                placeholder="Type your answer here..."
                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-orange-500 bg-gray-50 focus:bg-white transition-all" />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-3">
          {current > 0 && (
            <button onClick={() => setCurrent(p => p - 1)} className="px-6 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              Previous
            </button>
          )}
          {current < quiz.questions.length - 1 ? (
            <button onClick={() => setCurrent(p => p + 1)} className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold hover:opacity-90 transition-opacity">
              Next Question
            </button>
          ) : (
            <button onClick={handleSubmit} className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:opacity-90 transition-opacity">
              Submit Quiz 🎯
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function QuizPage() {
  const { id } = useParams();
  return id ? <QuizAttempt /> : <QuizList />;
}
