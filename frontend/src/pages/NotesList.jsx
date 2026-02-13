import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import API from '../services/api';
import { FaDownload } from 'react-icons/fa';

const NotesList = () => {
    const [notes, setNotes] = useState([]);

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const { data } = await API.get('/notes');
                setNotes(data);
            } catch (error) {
                console.error('Error fetching notes', error);
            }
        };
        fetchNotes();
    }, []);

    const handleDownload = (fileUrl, title) => {
        const link = document.createElement('a');
        link.href = `http://localhost:5000${fileUrl}`;
        link.setAttribute('download', title);
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    return (
        <Layout>
            <h2 className="mb-4 text-2xl font-bold">Academic Vault</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {notes.map((note) => (
                    <div key={note._id} className="p-4 bg-white rounded shadow">
                        <h3 className="text-lg font-bold text-gray-900">{note.title}</h3>
                        <p className="text-sm text-gray-600">Subject: {note.subject}</p>
                        <p className="text-xs text-gray-500">Uploaded by: {note.uploadedBy.name}</p>
                        <button
                            onClick={() => handleDownload(note.fileUrl, note.title)}
                            className="flex items-center mt-4 text-indigo-600 hover:text-indigo-800"
                        >
                            <FaDownload className="mr-2" /> Download
                        </button>
                    </div>
                ))}
            </div>
        </Layout>
    );
};

export default NotesList;
