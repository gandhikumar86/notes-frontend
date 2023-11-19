import React, { useState, useEffect } from "react";
import { Container, Form, Button, FormGroup } from "react-bootstrap";
import "../styles/SignUp.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "../../config/global";
import LoadingButton from "../components/LoadingButton";

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
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
      setShowLoader(true);
      const response = await axios.post(`${API_URL}/signin/verify`, formData);
      //console.log(response);
      setShowLoader(false);
      if ((await response.data) === "none") {
        alert(
          "Registration link successfully sent to your email id! Please, verify and then login!"
        );
        navigate("/login");
      } else if ((await response.data) === "user") {
        alert("User id exists, already! Please, login!");
        navigate("/login");
      } else if ((await response.data) === "verifyUser") {
        alert("Verification email sent, already! Please, verify!");
      }
      setFormData({
        name: "",
        email: "",
        password: "",
      });
    } catch (e) {
      console.log("Error during registration! ", e);
      setShowLoader(false);
      setFormData({
        name: formData.name,
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
      <h2>Registration Form</h2>
      <Form onSubmit={(e) => handleSubmit(e)} disabled={showLoader}>
        <Form.Group>
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            name="name"
            placeholder=""
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
          text="Register"
          type="submit"
          loading={showLoader}
          disabled={showLoader}
        />
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </Form>
    </Container>
  );
};

export default SignUp;
