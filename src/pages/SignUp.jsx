import React, { useState } from "react";
import { Container, Form, Button, FormGroup } from "react-bootstrap";
import "../styles/SignUp.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "../../config/global";

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    //console.log(formData);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    //console.log(formData);
    try {
      const response = await axios.post(`${API_URL}/signin/verify`, formData);
      //console.log(response);
      if (response.data === "none") {
        alert("Registration link successfully sent to your email id!");
      } else if (response.data === "user") {
        alert("User id already exists!");
      } else if (response.data === "verifyUser") {
        alert("Already, verification email sent!");
      }
    } catch (e) {
      console.log("Error during registration! ", e);
    }
  };
  return (
    <Container>
      <h1>Registration Form</h1>
      <Form onSubmit={(e) => handleSubmit(e)}>
        <Form.Group>
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            name="name"
            value={formData.name}
            onChange={(e) => handleChange(e)}
            required
          />
        </Form.Group>
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
          Register
        </Button>
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </Form>
    </Container>
  );
};

export default SignUp;
