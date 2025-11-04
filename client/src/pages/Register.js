import React, { useState, useEffect } from "react";
import { Form, Input, message, Button, Radio } from "antd";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Spinner from "../components/Spinner";

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // Form submission handler
  const submitHandler = async (values) => {
    try {
      setLoading(true);
      await axios.post("/api/v1/users/register", values);
      message.success("Registration Successful!");
      navigate("/login");
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Registration failed. Please try again.";
      message.error(errorMsg);
      console.error('Registration error:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  // Prevent access for logged-in users
  useEffect(() => {
    if (localStorage.getItem("user")) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <div className="auth-container">
      {loading && <Spinner />}
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="brand-title">
            <span className="bank-icon">🏛️</span> Portfolio Manager
          </h1>
          <p className="auth-subtitle">Create your account to get started</p>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={submitHandler}
          className="auth-form"
          requiredMark="optional"
        >
          <Form.Item 
            label={<div className="form-label">Name <span className="required-star">*</span></div>}
            name="name"
            rules={[
              { required: true, message: 'Please enter your name' },
              { min: 3, message: 'Name must be at least 3 characters' }
            ]}
          >
            <Input 
              prefix={<span className="input-icon">👤</span>}
              placeholder="Enter your full name"
              className="auth-input"
            />
          </Form.Item>
          
          <Form.Item 
            label={<div className="form-label">Email Address <span className="required-star">*</span></div>}
            name="email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email address' }
            ]}
          >
            <Input 
              prefix={<span className="input-icon">✉️</span>}
              type="email" 
              placeholder="Enter your email"
              className="auth-input"
            />
          </Form.Item>
          
          <Form.Item 
            label={<div className="form-label">Password <span className="required-star">*</span></div>}
            name="password"
            rules={[
              { required: true, message: 'Please enter your password' },
              { min: 6, message: 'Password must be at least 6 characters' }
            ]}
          >
            <Input.Password 
              prefix={<span className="input-icon">🔒</span>}
              placeholder="Enter your password"
              className="auth-input"
            />
          </Form.Item>

          <div className="auth-options">
            <Radio.Group defaultValue="user">
              <Radio value="user">User</Radio>
              <Radio value="admin">Admin</Radio>
            </Radio.Group>
          </div>

          <Button 
            type="primary" 
            htmlType="submit"
            className="auth-submit-btn"
            loading={loading}
            block
          >
            Create Account
          </Button>

          <div className="auth-links">
            <Link to="/login" className="auth-link">Already have an account? Sign in</Link>
            <Link to="/admin" className="auth-link admin-link">Admin Panel</Link>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Register;
