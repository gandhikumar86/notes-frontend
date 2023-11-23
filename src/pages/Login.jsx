/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Container, Form, Button, Modal } from "react-bootstrap";
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

  const defaultMsg = {
    title: "Please, wait...!",
    body: "We are getting back to you in a while....!",
  };

  const [showLoader, setShowLoader] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
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
      //alert(JSON.stringify(formData));
      setShowLoader(true);
      setShowLoginModal(true);
      const response = await axios.post(`${API_URL}/login`, formData);
      setShowLoader(false);
      //console.log(response);
      if ((await response.data) === "Invalid username or password!") {
        setMsg({
          title: "Invalid username or password!",
          body: "Username or password, entered is wrong. Please try with right credentials!",
        });
      } else if ((await response.data) === "Verify your email") {
        setMsg({
          title: "Verify your account!",
          body: "Verification email sent already. Please check your inbox or spam folder!",
        });
      } else if (response?.status) {
        localStorage.setItem("userInfo", JSON.stringify(await response.data));
        handleShowLoginModalClose();
        navigate("/home");
      }
    } catch (e) {
      console.log("Error during login!", e);
      setShowLoader(false);
      setFormData({
        email: formData.email,
        password: "",
      });
      setMsg({
        title: "Connection Error!",
        body: "Connection error, please try sometime later or it persists contact admin!",
      });
    }
  };
  const handleShowLoginModalClose = () => {
    setShowLoginModal(false);
    setMsg(defaultMsg);
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
      <Modal
        show={showLoginModal}
        backdrop="static"
        keyboard={false}
        onHide={handleShowLoginModalClose}
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
            onClick={handleShowLoginModalClose}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Login;
