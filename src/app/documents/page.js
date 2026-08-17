'use client';

import { useState, useEffect, useRef } from 'react';
import { UploadCloud, File as FileIcon, Trash2, ExternalLink, User } from 'lucide-react';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [owner, setOwner] = useState('Jonathan');
  const fileInputRef = useRef(null);

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/documents');
      const data = await res.json();
      setDocuments(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('owner', owner);

    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        fetchDocuments();
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      if (res.ok) fetchDocuments();
    } catch (e) {
      console.error(e);
    }
  };

  const triggerUpload = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  return (
    <div className="animate-fade-in stagger-1" style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
      <div className="glass-panel" style={{padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column'}}>
        
        {/* Header */}
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
            <FileIcon size={24} color="var(--tier-1)" />
            <h2 style={{fontSize: '1.5rem', fontWeight: 600, margin: 0}}>Joint Documents</h2>
          </div>
          
          <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
            <select className="form-control" value={owner} onChange={e => setOwner(e.target.value)} style={{width: 'auto'}}>
              <option value="Amanda">Amanda</option>
              <option value="Bridie">Bridie</option>
              <option value="Ian">Ian</option>
              <option value="Jonathan">Jonathan</option>
              <option value="Kay">Kay</option>
              <option value="Lizzy">Lizzy</option>
              <option value="Rob">Rob</option>
              <option value="Ryan">Ryan</option>
              <option value="Tim">Tim</option>
            </select>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{display: 'none'}} 
              onChange={handleFileChange}
            />
            <button className="btn btn-primary" onClick={triggerUpload} disabled={uploading} style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <UploadCloud size={18} />
              {uploading ? 'Uploading...' : 'Upload Document'}
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)'}}>Loading documents...</div>
        ) : documents.length === 0 ? (
          <div style={{padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)', borderRadius: '12px'}}>
            <UploadCloud size={48} style={{opacity: 0.5, marginBottom: '1rem'}} />
            <h3>No documents yet</h3>
            <p>Upload a document to share it with the team.</p>
          </div>
        ) : (
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem'}}>
            {documents.map(doc => (
              <div key={doc.id} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '12px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                transition: 'transform 0.2s, background 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}>
                <div style={{display: 'flex', alignItems: 'flex-start', gap: '1rem'}}>
                  <div style={{background: 'var(--tier-2)', padding: '0.75rem', borderRadius: '8px'}}>
                    <FileIcon size={24} color="white" />
                  </div>
                  <div style={{flex: 1, overflow: 'hidden'}}>
                    <h4 style={{margin: '0 0 0.25rem 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}} title={doc.filename}>
                      {doc.filename}
                    </h4>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)'}}>
                      <User size={12} /> {doc.owner}
                    </div>
                  </div>
                </div>
                
                <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>
                  Uploaded on {new Date(doc.uploaded_at).toLocaleDateString('en-GB')}
                </div>

                <div style={{display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)'}}>
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', textDecoration: 'none'}}>
                    <ExternalLink size={16} /> Open
                  </a>
                  <button onClick={() => handleDelete(doc.id)} className="btn btn-outline" style={{padding: '0.5rem', color: 'var(--text-secondary)'}} title="Delete Document">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
