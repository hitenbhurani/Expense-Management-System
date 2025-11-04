import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { message, Upload, List, Button } from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';

const FileManagement = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
    const res = await axios.get(`/api/v1/files/list?userId=${user._id}`);
      setFiles(res.data.files);
    } catch (error) {
      message.error('Failed to fetch files');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (info) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    
    if (info.file.status === 'done') {
      message.success(`${info.file.name} uploaded successfully`);
      setLoading(false);
      fetchFiles();
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} upload failed.`);
      setLoading(false);
    }
  };

  const handleDelete = async (key) => {
    try {
  await axios.delete(`/api/v1/files/${encodeURIComponent(key)}?userId=${user._id}`);
      message.success('File deleted successfully');
      fetchFiles();
    } catch (error) {
      message.error('Failed to delete file');
    }
  };

  const uploadProps = {
    name: 'file',
  action: '/api/v1/files/upload',
    data: { userId: user?._id },
    onChange: handleUpload,
    maxSize: 5 * 1024 * 1024, // 5MB
  accept: '.txt',
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>File Management</h2>
      
      <Upload {...uploadProps}>
        <Button icon={<UploadOutlined />}>Upload File</Button>
      </Upload>

      <List
        loading={loading}
        itemLayout="horizontal"
        dataSource={files}
        style={{ marginTop: '20px' }}
        renderItem={file => (
          <List.Item
            actions={[
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(file.key)}
              >
                Delete
              </Button>
            ]}
          >
            <List.Item.Meta
              title={<a href={file.url} target="_blank" rel="noopener noreferrer">{file.key.split('/').pop()}</a>}
              description={`Size: ${(file.size / 1024).toFixed(2)} KB • Uploaded: ${new Date(file.lastModified).toLocaleString()}`}
            />
          </List.Item>
        )}
      />
    </div>
  );
};

export default FileManagement;