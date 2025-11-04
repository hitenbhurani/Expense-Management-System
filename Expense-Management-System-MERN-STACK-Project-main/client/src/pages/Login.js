import React, { useState, useEffect } from "react";
import { Form, Input, message, Select, Switch, Card, Row, Col, Typography, Divider } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, BankOutlined, TeamOutlined } from "@ant-design/icons";
import axios from "axios";
import Spinner from "../components/Spinner";

const { Option } = Select;
const { Title, Text } = Typography;
const Login = () => {
  const [loading, setLoading] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  
  //from submit
  const submitHandler = async (values) => {
    try {
      setLoading(true);
      const { data } = await axios.post("/users/login", values);
      setLoading(false);
      message.success("login success");
      localStorage.setItem(
        "user",
        JSON.stringify({ ...data.user, password: "" })
      );
      
      // Redirect based on role
      if (data.user.role === 'admin') {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (error) {
      setLoading(false);
      message.error("Invalid credentials. Please try again.");
    }
  };

  //prevent for login user
  useEffect(() => {
    if (localStorage.getItem("user")) {
      navigate("/");
    }
  }, [navigate]);
  return (
    <>
      <div style={{ 
        minHeight: '100vh', 
        background: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        {loading && <Spinner />}
        
        <Card 
          style={{ 
            width: '100%', 
            maxWidth: 500,
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            border: 'none'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <Title level={2} style={{ color: 'var(--primary)', margin: 0 }}>
              <BankOutlined /> Portfolio Manager
            </Title>
            <Text type="secondary">Sign in to your account</Text>
          </div>

          <Form 
            form={form}
            layout="vertical" 
            onFinish={submitHandler}
            size="large"
          >
            <Form.Item 
              label="Email Address" 
              name="email"
              rules={[
                { required: true, message: 'Please enter your email!' },
                { type: 'email', message: 'Please enter a valid email!' }
              ]}
            >
              <Input 
                prefix={<MailOutlined style={{ color: 'var(--primary)' }} />}
                placeholder="Enter your email"
                style={{ borderRadius: '8px' }}
              />
            </Form.Item>
            
            <Form.Item 
              label="Password" 
              name="password"
              rules={[{ required: true, message: 'Please enter your password!' }]}
            >
              <Input.Password 
                prefix={<LockOutlined style={{ color: 'var(--primary)' }} />}
                placeholder="Enter your password"
                style={{ borderRadius: '8px' }}
              />
            </Form.Item>

            {isAdminLogin && (
              <>
                <Divider orientation="left" plain>
                  <Text strong style={{ color: 'var(--primary)' }}>Admin Details</Text>
                </Divider>
                
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item 
                      label="Full Name" 
                      name="fullName"
                      rules={[{ required: true, message: 'Please enter your full name!' }]}
                    >
                      <Input 
                        prefix={<UserOutlined style={{ color: 'var(--primary)' }} />}
                        placeholder="Full Name"
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item 
                      label="Phone Number" 
                      name="phone"
                      rules={[{ required: true, message: 'Please enter your phone number!' }]}
                    >
                      <Input 
                        prefix={<PhoneOutlined style={{ color: 'var(--primary)' }} />}
                        placeholder="Phone Number"
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item 
                  label="Organization" 
                  name="organization"
                  rules={[{ required: true, message: 'Please enter your organization!' }]}
                >
                  <Input 
                    prefix={<TeamOutlined style={{ color: 'var(--primary)' }} />}
                    placeholder="Company/Organization Name"
                    style={{ borderRadius: '8px' }}
                  />
                </Form.Item>

                <Form.Item 
                  label="Department" 
                  name="department"
                  rules={[{ required: true, message: 'Please select your department!' }]}
                >
                  <Select 
                    placeholder="Select Department"
                    style={{ borderRadius: '8px' }}
                  >
                    <Option value="IT">Information Technology</Option>
                    <Option value="Finance">Finance</Option>
                    <Option value="Operations">Operations</Option>
                    <Option value="Management">Management</Option>
                    <Option value="HR">Human Resources</Option>
                    <Option value="Other">Other</Option>
                  </Select>
                </Form.Item>

                <Form.Item 
                  label="Admin Level" 
                  name="adminLevel"
                  rules={[{ required: true, message: 'Please select admin level!' }]}
                >
                  <Select 
                    placeholder="Select Admin Level"
                    style={{ borderRadius: '8px' }}
                  >
                    <Option value="super">Super Admin</Option>
                    <Option value="senior">Senior Admin</Option>
                    <Option value="junior">Junior Admin</Option>
                  </Select>
                </Form.Item>

                <Form.Item 
                  label="Access Level" 
                  name="accessLevel"
                  rules={[{ required: true, message: 'Please select access level!' }]}
                >
                  <Select 
                    placeholder="Select Access Level"
                    style={{ borderRadius: '8px' }}
                  >
                    <Option value="full">Full Access</Option>
                    <Option value="limited">Limited Access</Option>
                    <Option value="readonly">Read Only</Option>
                  </Select>
                </Form.Item>
              </>
            )}

            <Form.Item style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Switch 
                  checked={isAdminLogin}
                  onChange={setIsAdminLogin}
                  checkedChildren="Admin"
                  unCheckedChildren="User"
                />
                <div style={{ display: 'flex', gap: '16px' }}>
                  <Link to="/admin" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
                    Admin Panel
                  </Link>
                    <Link to="/register" style={{ color: 'var(--primary)' }}>
                    Don't have an account? Register here
                  </Link>
                </div>
              </div>
            </Form.Item>

            <Form.Item>
              <button 
                type="submit"
                className="btn-flat"
                style={{
                  width: '100%',
                  height: '45px',
                  background: 'var(--primary)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {isAdminLogin ? 'Login as Admin' : 'Login'}
              </button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </>
  );
};

export default Login;
