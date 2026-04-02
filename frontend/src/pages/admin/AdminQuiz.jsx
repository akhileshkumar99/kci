import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Trophy, Clock, CheckCircle, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';

export default function AdminQuiz() {
  const [quizzes, setQuizzes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', course: '', duration: 30, passingMarks: 40, questions: [] });
  const [question, setQuestion] = useState({ question: '', type: 'mcq', options: ['', '', '', ''], correctAnswer: '', marks: 1 });

  useEffect(() => {
    api.get('/quiz').then(r => setQuizzes(r.data.quizzes || []));
    api.get('/courses').then(r => setCourses(r.data.courses || []));
  }, []);

  const addQuestion = () => {
    if (!question.question || !question.correctAnswer) return toast.error('Fill question and answer');
    setForm(p => ({ ...p, questions: [...p.questions, { ...question }] }));
    setQuestion({ question: '', type: 'mcq', options: ['', '', '', ''], correctAnswer: '', marks: 1 });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.title || form.questions.length === 0) return toast.error('Add title and at least one question');
    try {
      const { data } = await api.post('/quiz', form);
      setQuizzes(p => [data.quiz, ...p]);
      setShowForm(false);
      setForm({ title: '', description: '', course: '', duration: 30, passingMarks: 40, questions: [] });
      toast.success('Quiz created!');
    } catch { toast.error('Failed to create quiz'); }
  };

  const handleDelete = async id => {
    if (!confirm('Delete this quiz?')) return;
    try { await api.delete(`/quiz/${id}`); setQuizzes(p => p.filter(q => q._id !== id)); toast.success('Deleted'); }
    catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Quiz Management</h1><p className="text-sm text-gray-500">Create and manage online quizzes</p></div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 transition-colors">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {showForm ? 'Cancel' : 'Create Quiz'}
        </button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
          <h2 className="font-bold text-gray-900 mb-4">Create New Quiz</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Quiz Title *" className="px-4 py-2.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-orange-500 bg-gray-50" />
              <select value={form.course} onChange={e => setForm(p => ({ ...p, course: e.target.value }))} className="px-4 py-2.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-orange-500 bg-gray-50">
                <option value="">Select Course</option>
                {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
              </select>
              <input type="number" value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} placeholder="Duration (mins)" className="px-4 py-2.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-orange-500 bg-gray-50" />
              <input type="number" value={form.passingMarks} onChange={e => setForm(p => ({ ...p, passingMarks: e.target.value }))} placeholder="Passing % (e.g. 40)" className="px-4 py-2.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-orange-500 bg-gray-50" />
            </div>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Description" rows={2} className="w-full px-4 py-2.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-orange-500 bg-gray-50 resize-none" />

            {/* Add Question */}
            <div className="border-2 border-dashed border-orange-200 rounded-xl p-4 space-y-3">
              <h3 className="font-semibold text-gray-700">Add Question</h3>
              <input value={question.question} onChange={e => setQuestion(p => ({ ...p, question: e.target.value }))} placeholder="Question text *" className="w-full px-4 py-2.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-orange-500 bg-gray-50" />
              <div className="grid sm:grid-cols-3 gap-3">
                <select value={question.type} onChange={e => setQuestion(p => ({ ...p, type: e.target.value }))} className="px-4 py-2.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-orange-500 bg-gray-50">
                  <option value="mcq">MCQ</option>
                  <option value="truefalse">True/False</option>
                  <option value="fillinblank">Fill in Blank</option>
                </select>
                <input value={question.correctAnswer} onChange={e => setQuestion(p => ({ ...p, correctAnswer: e.target.value }))} placeholder="Correct Answer *" className="px-4 py-2.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-orange-500 bg-gray-50" />
                <input type="number" value={question.marks} onChange={e => setQuestion(p => ({ ...p, marks: e.target.value }))} placeholder="Marks" className="px-4 py-2.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-orange-500 bg-gray-50" />
              </div>
              {question.type === 'mcq' && (
                <div className="grid sm:grid-cols-2 gap-2">
                  {question.options.map((opt, i) => (
                    <input key={i} value={opt} onChange={e => { const o = [...question.options]; o[i] = e.target.value; setQuestion(p => ({ ...p, options: o })); }} placeholder={`Option ${String.fromCharCode(65 + i)}`} className="px-4 py-2 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-orange-500 bg-gray-50 text-sm" />
                  ))}
                </div>
              )}
              <button type="button" onClick={addQuestion} className="px-4 py-2 bg-orange-100 text-orange-700 rounded-xl font-semibold text-sm hover:bg-orange-200 transition-colors">
                + Add Question
              </button>
            </div>

            {form.questions.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-600">{form.questions.length} question(s) added:</p>
                {form.questions.map((q, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    <span className="truncate">{q.question}</span>
                    <button type="button" onClick={() => setForm(p => ({ ...p, questions: p.questions.filter((_, j) => j !== i) }))} className="ml-auto text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            )}

            <button type="submit" className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity">
              Create Quiz
            </button>
          </form>
        </motion.div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {quizzes.map((q, i) => (
          <motion.div key={q._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center"><Trophy className="w-5 h-5 text-orange-600" /></div>
              <button onClick={() => handleDelete(q._id)} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
            </div>
            <h3 className="font-bold text-gray-900 mb-1">{q.title}</h3>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> {q.questions?.length} Qs</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {q.duration}m</span>
              <span>{q.attempts?.length || 0} attempts</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
