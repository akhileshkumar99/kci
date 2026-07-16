import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Trash2, X, Save, Edit2, FileText, Award, Calendar, Hash, User, BookOpen, Upload, Eye, ImageIcon, Download } from 'lucide-react';
import api from '../../utils/api';
import Loader from '../../components/Loader';

const API_URL = import.meta.env.VITE_API_URL || '';
const emptyForm = { rollNumber: '', studentName: '', courseName: '', certificateNumber: '', issueDate: '', grade: '' };

// ── Field positions on the template (percentage-based, editable via drag) ──
const DEFAULT_FIELDS = [
  { key: 'studentName',      label: 'Student Name',      x: 50, y: 42, fontSize: 28, bold: true,  color: '#1a1a2e' },
  { key: 'courseName',       label: 'Course Name',       x: 50, y: 52, fontSize: 20, bold: false, color: '#1a3a6e' },
  { key: 'rollNumber',       label: 'Roll Number',       x: 28, y: 62, fontSize: 15, bold: false, color: '#333333' },
  { key: 'certificateNumber',label: 'Certificate No.',   x: 72, y: 62, fontSize: 15, bold: false, color: '#333333' },
  { key: 'grade',            label: 'Grade',             x: 50, y: 70, fontSize: 18, bold: true,  color: '#c8860a' },
  { key: 'issueDate',        label: 'Issue Date',        x: 50, y: 78, fontSize: 14, bold: false, color: '#555555' },
];

function CertificateCanvas({ templateUrl, certData, fieldLayout }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = templateUrl;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      fieldLayout.forEach(f => {
        const val = f.key === 'issueDate'
          ? (certData[f.key] ? new Date(certData[f.key]).toLocaleDateString('en-IN') : '')
          : (certData[f.key] || '');
        if (!val) return;
        ctx.font = `${f.bold ? 'bold ' : ''}${(f.fontSize / 100) * img.width * 0.08}px serif`;
        ctx.fillStyle = f.color;
        ctx.textAlign = 'center';
        ctx.fillText(val, (f.x / 100) * img.width, (f.y / 100) * img.height);
      });
    };
  }, [templateUrl, certData, fieldLayout]);

  return <canvas ref={canvasRef} className="w-full rounded-xl border border-gray-200 shadow" />;
}

export default function AdminCertificates() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [certFile, setCertFile] = useState(null);
  const [saving, setSaving] = useState(false);

  // Template state
  const [templateUrl, setTemplateUrl] = useState(null);
  const [templateFile, setTemplateFile] = useState(null);
  const [uploadingTpl, setUploadingTpl] = useState(false);
  const [fieldLayout, setFieldLayout] = useState(DEFAULT_FIELDS);
  const [previewCert, setPreviewCert] = useState(null);
  const [showLayoutEditor, setShowLayoutEditor] = useState(false);

  useEffect(() => { fetchCerts(); fetchTemplate(); }, []);

  const fetchCerts = async () => {
    try { const { data } = await api.get('/certificates'); setCerts(data.certificates); } catch {}
    setLoading(false);
  };

  const fetchTemplate = async () => {
    try {
      const { data } = await api.get('/certificates/template');
      if (data.templateUrl) setTemplateUrl(`${API_URL}${data.templateUrl}`);
    } catch {}
  };

  const handleTemplateUpload = async () => {
    if (!templateFile) return toast.error('Please select a template image');
    setUploadingTpl(true);
    try {
      const fd = new FormData();
      fd.append('template', templateFile);
      const { data } = await api.post('/certificates/template', fd);
      setTemplateUrl(`${API_URL}${data.templateUrl}`);
      setTemplateFile(null);
      toast.success('Template uploaded successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    }
    setUploadingTpl(false);
  };

  const openAdd = () => { setForm(emptyForm); setCertFile(null); setEditing(null); setModal(true); };
  const openEdit = (c) => {
    setForm({
      rollNumber: c.rollNumber, studentName: c.studentName, courseName: c.courseName,
      certificateNumber: c.certificateNumber, grade: c.grade || '',
      issueDate: c.issueDate ? new Date(c.issueDate).toISOString().split('T')[0] : '',
    });
    setCertFile(null); setEditing(c._id); setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.rollNumber || !form.studentName || !form.certificateNumber || !form.issueDate)
      return toast.error('Fill all required fields');
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (certFile) fd.append('certificateFile', certFile);
      if (editing) { await api.put(`/certificates/${editing}`, fd); toast.success('Certificate updated'); }
      else { await api.post('/certificates', fd); toast.success('Certificate issued'); }
      setModal(false); fetchCerts();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this certificate?')) return;
    try { await api.delete(`/certificates/${id}`); toast.success('Deleted'); fetchCerts(); }
    catch { toast.error('Error'); }
  };

  const handleDownload = (cert) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = templateUrl;
    img.onload = () => {
      canvas.width = img.width; canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      fieldLayout.forEach(f => {
        const val = f.key === 'issueDate'
          ? new Date(cert[f.key]).toLocaleDateString('en-IN')
          : (cert[f.key] || '');
        if (!val) return;
        ctx.font = `${f.bold ? 'bold ' : ''}${(f.fontSize / 100) * img.width * 0.08}px serif`;
        ctx.fillStyle = f.color; ctx.textAlign = 'center';
        ctx.fillText(val, (f.x / 100) * img.width, (f.y / 100) * img.height);
      });
      const a = document.createElement('a');
      a.download = `${cert.certificateNumber}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
  };

  const fields = [
    { name: 'rollNumber', label: 'Roll Number', icon: Hash, placeholder: 'e.g. KCI20240001', required: true },
    { name: 'studentName', label: 'Student Name', icon: User, placeholder: 'Full name', required: true },
    { name: 'courseName', label: 'Course Name', icon: BookOpen, placeholder: 'e.g. DCA', required: true },
    { name: 'certificateNumber', label: 'Certificate Number', icon: Award, placeholder: 'e.g. KCI/2024/DCA/0001', required: true },
    { name: 'grade', label: 'Grade', icon: Award, placeholder: 'e.g. A, B+', required: false },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Certificates</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5">{certs.length} certificate{certs.length !== 1 ? 's' : ''} issued</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-600 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Issue Certificate</span><span className="sm:hidden">Issue</span>
        </button>
      </div>

      {/* ── Template Upload Section ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <ImageIcon className="w-5 h-5 text-purple-600" />
          <h2 className="font-bold text-gray-800">Certificate Template</h2>
          {templateUrl && (
            <button onClick={() => setShowLayoutEditor(v => !v)} className="ml-auto text-xs px-3 py-1 bg-purple-50 text-purple-700 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors">
              {showLayoutEditor ? 'Hide' : 'Edit Field Positions'}
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start">
          {/* Upload control */}
          <div className="flex-1">
            <label className="flex items-center gap-3 w-full px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all group">
              <div className="w-9 h-9 bg-purple-100 group-hover:bg-purple-200 rounded-lg flex items-center justify-center shrink-0 transition-colors">
                <Upload className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">
                  {templateFile ? templateFile.name : 'Upload Certificate Template (Image)'}
                </p>
                <p className="text-xs text-gray-400">PNG or JPG recommended • Your design, logo, border included</p>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={e => setTemplateFile(e.target.files[0])} />
            </label>
            {templateFile && (
              <button onClick={handleTemplateUpload} disabled={uploadingTpl}
                className="mt-2 w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
                {uploadingTpl ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploading...</> : <><Upload className="w-4 h-4" /> Save Template</>}
              </button>
            )}
            {templateUrl && !templateFile && (
              <p className="mt-2 text-xs text-green-600 font-medium">✓ Template active — all new certificates will use this design</p>
            )}
          </div>

          {/* Template preview */}
          {templateUrl && (
            <div className="w-full sm:w-64 shrink-0">
              <img src={templateUrl} alt="Template" className="w-full rounded-xl border border-gray-200 shadow-sm" />
            </div>
          )}
        </div>

        {/* Field Layout Editor */}
        {showLayoutEditor && templateUrl && (
          <div className="mt-5 border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-500 mb-3">Adjust X/Y position (0–100%) and font size for each field on the template:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {fieldLayout.map((f, i) => (
                <div key={f.key} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-xs font-semibold text-gray-700 mb-2">{f.label}</p>
                  <div className="flex gap-2 flex-wrap">
                    {['x', 'y', 'fontSize'].map(prop => (
                      <label key={prop} className="flex flex-col text-xs text-gray-500 gap-0.5">
                        {prop === 'fontSize' ? 'Size' : prop.toUpperCase() + ' %'}
                        <input type="number" value={f[prop]} min={prop === 'fontSize' ? 8 : 0} max={prop === 'fontSize' ? 80 : 100}
                          onChange={e => setFieldLayout(prev => prev.map((item, idx) => idx === i ? { ...item, [prop]: Number(e.target.value) } : item))}
                          className="w-16 px-2 py-1 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-purple-400" />
                      </label>
                    ))}
                    <label className="flex flex-col text-xs text-gray-500 gap-0.5">
                      Color
                      <input type="color" value={f.color}
                        onChange={e => setFieldLayout(prev => prev.map((item, idx) => idx === i ? { ...item, color: e.target.value } : item))}
                        className="w-10 h-7 border border-gray-200 rounded-lg cursor-pointer" />
                    </label>
                    <label className="flex items-center gap-1 text-xs text-gray-500 mt-3">
                      <input type="checkbox" checked={f.bold}
                        onChange={e => setFieldLayout(prev => prev.map((item, idx) => idx === i ? { ...item, bold: e.target.checked } : item))} />
                      Bold
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Certificates Table ── */}
      {loading ? <Loader /> : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Certificate No.', 'Student', 'Roll No.', 'Course', 'Grade', 'Issue Date', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {certs.map((c) => (
                <tr key={c._id} className="border-t border-gray-100 hover:bg-blue-50/30 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className="font-mono text-xs text-blue-700 font-semibold">{c.certificateNumber}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-medium text-gray-900">{c.studentName}</td>
                  <td className="px-4 py-3.5"><span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-mono">{c.rollNumber}</span></td>
                  <td className="px-4 py-3.5 text-gray-600 max-w-[160px] truncate">{c.courseName}</td>
                  <td className="px-4 py-3.5">
                    {c.grade ? <span className="px-2.5 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-bold border border-green-100">{c.grade}</span> : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3.5 text-gray-500 text-xs">{new Date(c.issueDate).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      {templateUrl && (
                        <>
                          <button onClick={() => setPreviewCert(c)} className="p-1.5 text-purple-500 hover:bg-purple-50 rounded-lg transition-colors" title="Preview">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDownload(c)} className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg transition-colors" title="Download">
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      <button onClick={() => openEdit(c)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(c._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {certs.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-16 text-center text-gray-400">
                  <Award className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                  <p className="font-medium">No certificates issued yet</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Issue/Edit Modal ── */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-blue-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Award className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-base font-bold text-white">{editing ? 'Edit Certificate' : 'Issue Certificate'}</h2>
              </div>
              <button onClick={() => setModal(false)} className="text-white/70 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {fields.map(({ name, label, icon: Icon, placeholder, required }) => (
                <div key={name}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label} {required && <span className="text-red-500">*</span>}</label>
                  <div className="relative">
                    <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input value={form[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })} placeholder={placeholder}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors" />
                  </div>
                </div>
              ))}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Issue Date <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="date" value={form.issueDate} onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors" />
                </div>
              </div>
              {!templateUrl && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Certificate File (PDF / Image)</label>
                  <label className="flex items-center gap-3 w-full px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all group">
                    <div className="w-9 h-9 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center shrink-0 transition-colors">
                      <Upload className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">{certFile ? certFile.name : editing ? 'Upload new file (optional)' : 'Choose file to upload'}</p>
                      <p className="text-xs text-gray-400">PDF or image, max 5MB</p>
                    </div>
                    <input type="file" accept=".pdf,image/*" className="hidden" onChange={(e) => setCertFile(e.target.files[0])} />
                  </label>
                </div>
              )}
              {templateUrl && (
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 text-xs text-purple-700">
                  ✓ Certificate will be auto-generated using your uploaded template
                </div>
              )}
              <button type="submit" disabled={saving}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-60">
                {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> {editing ? 'Update Certificate' : 'Issue Certificate'}</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Certificate Preview Modal ── */}
      {previewCert && templateUrl && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setPreviewCert(null)}>
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <h2 className="font-bold text-gray-800">Certificate Preview — {previewCert.studentName}</h2>
              <div className="flex items-center gap-2">
                <button onClick={() => handleDownload(previewCert)} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors">
                  <Download className="w-3.5 h-3.5" /> Download PNG
                </button>
                <button onClick={() => setPreviewCert(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
              </div>
            </div>
            <div className="p-4">
              <CertificateCanvas templateUrl={templateUrl} certData={previewCert} fieldLayout={fieldLayout} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
