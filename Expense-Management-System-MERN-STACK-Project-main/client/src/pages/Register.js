import React, { useState, useEffect } from "react";
import { Form, Input, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Spinner from "../components/Spinner";
const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  // Form submission handler
  const submitHandler = async (values) => {
    try {
      setLoading(true);
      const response = await axios.post("/users/register", values);
      message.success("Registration Successful!");
      setLoading(false);
      navigate("/login");
    } catch (error) {
      setLoading(false);
      const errorMsg = error.response?.data?.message || "Registration failed. Please try again.";
      message.error(errorMsg);
      console.error('Registration error:', error.response?.data || error.message);
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
      <div className="resgister-page ">
        {loading && <Spinner />}
        <Form layout="vertical" onFinish={submitHandler}>
          <h1>Register Form</h1>
          <Form.Item 
            label="Name" 
            name="name"
            rules={[
              { required: true, message: 'Please enter your name!' },
              { min: 3, message: 'Name must be at least 3 characters!' }
            ]}
          >
            <Input placeholder="Enter your full name" />
          </Form.Item>
          <Form.Item 
            label="Email" 
            name="email"
            rules={[
              { required: true, message: 'Please enter your email!' },
              { type: 'email', message: 'Please enter a valid email address!' }
            ]}
          >
            <Input type="email" placeholder="Enter your email address" />
          </Form.Item>
          <Form.Item 
            label="Password" 
            name="password"
            rules={[
              { required: true, message: 'Please enter your password!' },
              { min: 6, message: 'Password must be at least 6 characters!' }
            ]}
          >
            <Input.Password placeholder="Enter your password" />
          </Form.Item>
          <div className="d-flex justify-content-between">
            <Link to="/login">Already Register ? Cleck Here to login</Link>
            <button className="btn btn-primary">Resgiter</button>
          </div>
        </Form>
      </div>
    </>
  );
};

export default Register;
