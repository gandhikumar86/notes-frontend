/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Container, Form, Button, FormGroup } from "react-bootstrap";
import "../styles/SignUp.css";
import "../styles/Login.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "../../config/global";
import LoadingButton from "../components/LoadingButton";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showLoader, setShowLoader] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    if (user && user.token) {
      navigate("/home");
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    //console.log(formData);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    //console.log(formData);
    try {
      //alert(JSON.stringify(formData));
      setShowLoader(true);
      const response = await axios.post(`${API_URL}/login`, formData);
      setShowLoader(false);
      //console.log(response);
      if ((await response.data) === "Invalid username or password!") {
        alert("Invalid username or password!");
      } else if ((await response.data) === "Verify your email") {
        alert("Please, verify your email id and then login!");
      } else if (response?.status) {
        localStorage.setItem("userInfo", JSON.stringify(await response.data));
        navigate("/home");
      }
    } catch (e) {
      console.log("Error during login!", e);
      setShowLoader(false);
      setFormData({
        email: formData.email,
        password: "",
      });
      alert(
        "Connection error, please try sometime later or it persists contact admin!"
      );
    }
  };
  return (
    <Container>
      <h1>Notes App</h1>
      <h2>Login Form</h2>
      <Form onSubmit={(e) => handleSubmit(e)} disabled={showLoader}>
        <Form.Group>
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            placeholder=""
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
            placeholder=""
            value={formData.password}
            onChange={(e) => handleChange(e)}
            required
          />
        </Form.Group>
        <LoadingButton
          text="Login"
          type="submit"
          loading={showLoader}
          disabled={showLoader}
        />
        <p>
          Do not have an account?
          <Link to={showLoader ? null : "/"}>Register</Link>
        </p>
      </Form>
    </Container>
  );
};

export default Login;
