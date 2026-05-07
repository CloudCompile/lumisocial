import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

const UploadPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mediaType, setMediaType] = useState(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (selectedFile.type.startsWith('image/')) {
      if (selectedFile.size > maxSize) {
        setError('Image size exceeds 10MB limit');
        return;
      }
      setMediaType('image');
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError(null);
    } else if (selectedFile.type.startsWith('video/')) {
      setMediaType('video');
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError(null);
    } else {
      setError('Only images and videos are supported');
      setFile(null);
      setPreview(null);
    }
  };

  const uploadToCloudinary = async (videoFile) => {
    const formData = new FormData();
    formData.append('file', videoFile);
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/video/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to upload video to Cloudinary');
    }

    const data = await response.json();
    return data.secure_url;
  };

  const uploadToPollinationsAPI = async (imageFile) => {
    const formData = new FormData();
    formData.append('file', imageFile);

    const response = await fetch('https://media.pollinations.ai/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_POLLINATIONS_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image to Pollinations');
    }

    const data = await response.json();
    return data.url;
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let mediaUrl;
      if (mediaType === 'image') {
        mediaUrl = await uploadToPollinationsAPI(file);
      } else {
        mediaUrl = await uploadToCloudinary(file);
      }

      await api.post('/posts', {
        media_url: mediaUrl,
        media_type: mediaType,
        caption: caption.trim(),
      });

      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to upload post');
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-accent', 'bg-gray-800');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('border-accent', 'bg-gray-800');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-accent', 'bg-gray-800');
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFileSelect({ target: { files: [droppedFile] } });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-6">Create Post</h1>

      {error && (
        <div className="bg-red-900 text-red-100 p-4 rounded-lg mb-4">
          {error}
        </div>
      )}

      {!preview ? (
        <div
          className="border-2 border-dashed border-gray-600 rounded-xl p-12 text-center cursor-pointer transition hover:border-accent hover:bg-gray-800 hover:bg-opacity-50"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <p className="text-4xl mb-2">📸</p>
          <p className="text-lg font-semibold mb-2">Click to upload or drag and drop</p>
          <p className="text-sm text-gray-400">PNG, JPG, GIF or MP4 (Max 10MB for images)</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      ) : (
        <div className="bg-gray-900 rounded-xl overflow-hidden mb-6 border border-gray-800">
          {mediaType === 'image' ? (
            <img src={preview} alt="Preview" className="w-full max-h-96 object-cover" />
          ) : (
            <video src={preview} controls className="w-full max-h-96 object-cover" />
          )}
        </div>
      )}

      {preview && (
        <div className="space-y-4">
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption..."
            className="w-full p-4 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            rows="4"
          />

          <div className="flex gap-4">
            <button
              onClick={() => {
                setFile(null);
                setPreview(null);
                setCaption('');
                setMediaType(null);
              }}
              className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-accent hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition font-semibold"
            >
              {loading ? 'Uploading...' : 'Post'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadPage;
