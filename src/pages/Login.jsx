import React, { useState } from "react";
import { Container, Form, Button, FormGroup } from "react-bootstrap";
import "../styles/Login.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "../../config/global";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    //console.log(formData);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    //console.log(formData);
    try {
      const response = await axios.post(`${API_URL}/login`, formData);
      //console.log(response);
      if (response.data === "Invalid username or password!") {
        alert("Invalid username or password!");
      } else if (response.data === "Verify your email") {
        alert("Verify your email id!");
      } else if (response?.status) {
        localStorage.setItem("userInfo", JSON.stringify(response.data));
        navigate("/home");
      }
    } catch (e) {
      console.log("Error during login!", e);
    }
  };
  return (
    <Container>
      <h1>Login Form</h1>
      <Form onSubmit={(e) => handleSubmit(e)}>
        <Form.Group>
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={formData.email}
            onChange={(e) => handleChange(e)}
            required
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            value={formData.password}
            onChange={(e) => handleChange(e)}
            required
          />
        </Form.Group>
        <Button variant="primary" type="submit">
          Login
        </Button>
        <p>
          Do not have an account? <Link to="/">Register</Link>
        </p>
      </Form>
    </Container>
  );
};

export default Login;
