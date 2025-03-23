import React, { useState, useEffect } from 'react';
import axios from 'axios';

const GroupDocuments = ({ groupId }) => {
  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchDocuments = async () => {
//       setLoading(true);
//       setError(null);
      
//       try {
//         const res = await axios.get(`/api/documents/${groupId}/documents`, {
//           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//         });
        
//         if (Array.isArray(res.data)) {
//           setDocuments(res.data);
//         } else {
//           setError('Invalid data format');
//         }
//       } catch (err) {
//         setError('Failed to fetch documents');
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     fetchDocuments();
//   }, [groupId]);

useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      setError(null);
  
      try {
        console.log("Fetching documents for group:", groupId);
        const res = await axios.get(`/api/documents/${groupId}/documents`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
  
        console.log("Response:", res.data);
  
        if (Array.isArray(res.data)) {
          setDocuments(res.data);
        } else {
          console.log("Invalid response format", res.data);
          setError('Invalid data format');
        }
      } catch (err) {
        console.error('Fetch documents error:', err.response?.data || err.message);
        setError('Failed to fetch documents');
      } finally {
        setLoading(false);
      }
    };
  
    fetchDocuments();
  }, [groupId]);
  

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) return;
    
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await axios.post(`/api/documents/${groupId}/upload`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Refetch documents after upload
      const updatedRes = await axios.get(`/api/documents/${groupId}/documents`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDocuments(updatedRes.data);
    } catch (err) {
      setError('Upload failed');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="group-documents">
      <h3>Documents</h3>
      <form onSubmit={handleUpload}>
        <input type="file" onChange={handleFileChange} />
        <button type="submit">Upload</button>
      </form>
      <ul>
        {documents.map(document => (
          <li key={document._id}>
            <a href={document.filePath} download>{document.fileName}</a>
            <span>Uploaded by: {document.uploaderId.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GroupDocuments;
