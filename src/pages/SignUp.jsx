/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Container, Form, Button, Modal } from "react-bootstrap";
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

  const defaultMsg = {
    title: "Please, wait...!",
    body: "We are getting back to you in a while....!",
  };

  const [showLoader, setShowLoader] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [msg, setMsg] = useState(defaultMsg);

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
      setShowSignUpModal(true);
      const response = await axios.post(`${API_URL}/signin/verify`, formData);
      //console.log(response);
      setShowLoader(false);
      if ((await response.data) === "none") {
        setMsg({
          title: "Registration success!",
          body: "Registration link successfully sent to your email id! Check your spam folder if not received in inbox. Please, verify and then login!",
        });
        //navigate("/login");
      } else if ((await response.data) === "user") {
        setMsg({
          title: "Already registered!",
          body: "User id exists, already! Please, login!",
        });
        //navigate("/login");
      } else if ((await response.data) === "verifyUser") {
        setMsg({
          title: "Please, verify your account!",
          body: "Verification email sent, already! Please, verify!",
        });
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
      setMsg({
        title: "Connection Error!",
        body: "Connection error, please try sometime later or it persists contact admin!",
      });
    }
  };
  const handleShowSignUpModalClose = () => {
    setShowSignUpModal(false);
    setMsg(defaultMsg);
  };
  return (
    <Container>
      <h1>Notes App</h1>
      <h2>Registration Form</h2>
      <Form onSubmit={(e) => handleSubmit(e)}>
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
        <Button type="submit" variant="primary">
          Register
        </Button>
        <p>
          Already have an account?
          <Link to={showLoader ? null : "/login"}>Login</Link>
        </p>
      </Form>
      <Modal
        show={showSignUpModal}
        backdrop="static"
        keyboard={false}
        onHide={handleShowSignUpModalClose}
      >
        <Modal.Header closeButton={!showLoader}>
          <Modal.Title>{msg.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{msg.body}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            type="button"
            disabled={showLoader}
            onClick={handleShowSignUpModalClose}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default SignUp;
