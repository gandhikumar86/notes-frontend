import React, { useEffect, useRef, useState } from "react";
import "../styles/Home.css";
import axios from "axios";
import API_URL from "../../config/global";
import { Link, useNavigate } from "react-router-dom";
import { Button, Form, Modal } from "react-bootstrap";

const Home = () => {
  const navigate = useNavigate();
  // const [notes, setNotes] = useState([
  //   {
  //     id: 1,
  //     title: "test note 1",
  //     content: "bla bla note1",
  //   },
  //   {
  //     id: 2,
  //     title: "test note 2 ",
  //     content: "bla bla note2",
  //   },
  //   {
  //     id: 3,
  //     title: "test note 3",
  //     content: "bla bla note3",
  //   },
  //   {
  //     id: 4,
  //     title: "test note 4 ",
  //     content: "bla bla note4",
  //   },
  //   {
  //     id: 5,
  //     title: "test note 5",
  //     content: "bla bla note5",
  //   },
  //   {
  //     id: 6,
  //     title: "test note 6",
  //     content: "bla bla note6",
  //   },
  // ]);
  const [query, setQuery] = useState("");
  const [notes, setNotes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [queryCategory, setQueryCategory] = useState();
  const [addNoteCategory, setAddNoteCategory] = useState();
  const [categoryMap, setCategoryMap] = useState({ "non-category": null });

  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const handleAddCategoryModalClose = () => {
    setShowAddCategoryModal(false);
  };
  const handleAddCategoryModalShow = () => {
    setShowAddCategoryModal(true);
  };
  const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);
  const handleDeleteCategoryModalClose = () => {
    setShowDeleteCategoryModal(false);
  };
  const handleDeleteCategoryModalShow = () => {
    setShowDeleteCategoryModal(true);
  };

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const prevNoteRef = useRef({ title: "", content: "" });

  const [selectedNote, setSelectedNote] = useState(null);

  const [resp, setResp] = useState({});
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    if (user && user.token) {
      getData(user.token);
    } else {
      navigate("/login");
    }
  }, []);
  const getData = async (token) => {
    try {
      const config = {
        headers: {
          Authorization: token,
        },
      };
      const response = await axios.get(`${API_URL}/home`, config);
      //console.log(response);
      if (response.data === "Invalid Token") {
        alert("Login again!");
      } else if (response.data === "Server Busy") {
        alert("Unauthorized access!");
      } else if (response?.status) {
        setResp(response.data.loginCredentials);
        setNotes(response.data.notes);
        console.log(JSON.stringify(response.data.notes));
        const v = {};
        const u = [];
        await response.data.categories.map((c) => {
          v[c.name] = c._id;
          u.push(c.name);
        });
        console.log(JSON.stringify(v));
        console.log(JSON.stringify(u));
        setCategoryMap({ ...v });
        setCategories(["all-category", "non-category", ...u]);
        setQueryCategory("all-category");
        setAddNoteCategory("non-category");
      }
    } catch (e) {
      console.log("Error while in home page!", e);
      alert(
        "Connection error, please try afer sometime later or it persists contact admin!"
      );
    }
  };

  const handleAddNote = async (event) => {
    event.preventDefault();
    try {
      // API logic here
      //console.log("title: ", title);
      //console.log("content: ", content);
      //alert(addNoteCategory);
      //alert(categoryMap[addNoteCategory]);
      //alert(JSON.stringify(categoryMap));

      var newNote = {
        title: title,
        content: content,
        userId: resp._id,
        categoryId: categoryMap[addNoteCategory],
      };

      const response = await axios.post(`${API_URL}/home/addNote`, newNote);

      if (response.data._id !== "") {
        alert("New note added!");
        newNote = response.data;
        setNotes([newNote, ...notes]);
        setTitle("");
        setContent("");
      } else {
        alert("New note not synced!");
      }
    } catch (e) {
      console.log("Add Note Handler", e);
      alert(
        "Connection error, please try after sometime later or it persists contact admin!"
      );
    }
  };

  const handleNoteClick = (note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
    setAddNoteCategory(
      !note.categoryId
        ? "non-category"
        : getKeyByValue(categoryMap, note.categoryId)
    );
    prevNoteRef.current.title = note.title;
    prevNoteRef.current.content = note.content;
  };

  const handleUpdateNote = async (event) => {
    event.preventDefault();
    try {
      if (!selectedNote) {
        return;
      }

      if (
        prevNoteRef.current.title === title &&
        prevNoteRef.current.content === content
      ) {
        alert("No edit done!");
        prevNoteRef.current.title = "";
        prevNoteRef.current.content = "";
        return;
      }

      const updatedNote = {
        _id: selectedNote._id,
        title: title,
        content: content,
        userId: resp._id,
        categoryId: categoryMap[addNoteCategory],
      };

      const response = await axios.post(
        `${API_URL}/home/editNote`,
        updatedNote
      );
      //alert(JSON.stringify(response.data));

      if (response.data !== null) {
        updatedNote.lastModified = response.data.lastModified;
        const updatedNotesList = notes.map((note) =>
          note._id === selectedNote._id ? updatedNote : note
        );
        alert("Note updated!");
        setNotes(updatedNotesList);
        setTitle("");
        setContent("");
        setSelectedNote(null);
        setAddNoteCategory("non-category");
      } else {
        alert("Note update not synced!");
      }
    } catch (e) {
      console.log("Edit Note Handler", e);
      alert(
        "Connection error, please try afer sometime later or it persists contact admin!"
      );
    }
  };

  const handleCancel = () => {
    alert("Note update cancelled!");
    setTitle("");
    setContent("");
    setSelectedNote(null);
    setAddNoteCategory("non-category");
  };

  const deleteNote = async (event, deleteNoteId) => {
    event.stopPropagation();
    //alert(deleteNoteId);

    try {
      if (selectedNote && selectedNote._id === deleteNoteId) {
        alert("Currently in edit!");
        return;
      }
      if (!window.confirm("Are you sure to delete the note?")) {
        return;
      }
      const response = await axios.post(`${API_URL}/home/deleteNote`, {
        deleteNoteId: deleteNoteId,
      });
      if (response.data?._id === deleteNoteId) {
        //alert(JSON.stringify(response.data));
        alert("Note deleted!");
        const updatedNotes = notes.filter((note) => note._id !== deleteNoteId);
        setNotes(updatedNotes);
      } else {
        alert("Note delete not synced!");
      }
    } catch (e) {
      console.log("Delete Note Handler", e);
      alert(
        "Connection error, please try after sometime later or it persists contact admin!"
      );
    }
  };

  const handleLogout = async () => {
    if (window.confirm("Are you sure to logout?")) {
      try {
        const user = JSON.parse(localStorage.getItem("userInfo"));
        const response = await axios.post(
          `${API_URL}/login/logout`,
          user.email
        );
        //alert(response.data);
        if (response.data === "deleted") {
          localStorage.clear();
          window.location.href = "/login";
        } else {
          alert("Server Busy!");
        }
      } catch (e) {
        console.log("Log out Handler", e);
        alert(
          "Connection error, please try sometime later or it persists contact admin!"
        );
      }
    }
  };

  const handleOnSelect = (e) => {
    e.preventDefault();
    setQueryCategory(e.target.value);
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    const categ = e.target.name.value.trim();
    if (categ.length === 0) {
      alert("Please enter valid category!");
      return;
    }
    if (categories.includes(categ)) {
      alert("Category exists, already!");
      return;
    }
    try {
      const response = await axios.post(`${API_URL}/home/addCategory`, {
        categ: categ,
        userId: resp._id,
      });

      if (response.data?._id) {
        alert(`Category "${categ}" added!`);
        setCategoryMap({ ...categoryMap, [categ]: response.data?._id });
        setCategories([...categories, categ]);
        setShowAddCategoryModal(false);
      } else {
        alert("Try again, category not added!");
        return;
      }
    } catch (e) {
      console.log("Add Category Handler", e);
      alert(
        "Connection error, please try sometime later or it persists contact admin!"
      );
    }
  };

  const handleDeleteCategory = async (e) => {
    e.preventDefault();
    if (
      !window.confirm(
        "Deleting category will delete all notes associated with it!\nIf 'non-category' selected, only the notes will be deleted!\nAre you sure to delete it, any way?"
      )
    ) {
      return;
    }
    const cat = e.target.deleteSelect.value;
    //alert(categoryMap[cat]);

    const deleteCategoryId = categoryMap[cat];

    try {
      const response = await axios.post(`${API_URL}/home/deleteCategory`, {
        deleteCategoryId: deleteCategoryId,
      });

      //alert(JSON.stringify(response.data));

      if (response.data) {
        alert(`Category "${cat}" deleted!`);
        setNotes((current) =>
          current.filter((n) => n.categoryId !== deleteCategoryId)
        );

        if (!deleteCategoryId) {
          setCategoryMap((current) => {
            const { cat, ...rest } = current;
            return rest;
          });
          setCategories((current) => current.filter((cate) => cate !== cat));
        }

        setShowDeleteCategoryModal(false);
      } else {
        alert("Try again, category not deleted!");
        return;
      }
    } catch (e) {
      console.log("Delete Category Handler", e);
      alert(
        "Connection error, please try sometime later or it persists contact admin!"
      );
    }
  };

  function getKeyByValue(object, value) {
    return Object.keys(object).find((key) => object[key] === value);
  }

  return (
    <>
      {Object.keys(resp).length !== 0 && (
        <>
          <div>
            <h1>Welcome to our note app, {resp.name}!</h1>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <div>
              <Form.Group controlId="queryCategorySelect">
                <Form.Label>View by category</Form.Label>
                <Form.Control
                  as="select"
                  value={queryCategory}
                  onChange={handleOnSelect}
                >
                  {categories.map((c, i) => (
                    <option key={i}>{c}</option>
                  ))}
                </Form.Control>
              </Form.Group>
              <Button onClick={handleAddCategoryModalShow}>Add category</Button>
              <Modal
                show={showAddCategoryModal}
                onHide={handleAddCategoryModalClose}
              >
                <Modal.Header closeButton>
                  <Modal.Title>Please, enter the category</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Form onSubmit={(e) => handleAddCategory(e)}>
                    <Form.Group>
                      <Form.Label>Category</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        autoComplete="off"
                      />
                    </Form.Group>
                    <Button variant="primary" type="submit">
                      Add Category
                    </Button>
                  </Form>
                </Modal.Body>
              </Modal>
              <Button
                style={{ backgroundColor: "red" }}
                onClick={handleDeleteCategoryModalShow}
              >
                Delete category
              </Button>
              <Modal
                show={showDeleteCategoryModal}
                onHide={handleDeleteCategoryModalClose}
              >
                <Modal.Header closeButton>
                  <Modal.Title>
                    Please, select the category to delete!
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Form onSubmit={(e) => handleDeleteCategory(e)}>
                    <Form.Group>
                      <Form.Label>Category</Form.Label>
                      <Form.Control as="select" name="deleteSelect">
                        {categories.map((c, i) =>
                          c === "all-category" ? (
                            ""
                          ) : (
                            <option key={i}>{c}</option>
                          )
                        )}
                      </Form.Control>
                    </Form.Group>
                    <Button style={{ backgroundColor: "red" }} type="submit">
                      Delete Category
                    </Button>
                  </Form>
                </Modal.Body>
              </Modal>
            </div>
            <div>
              <input
                className="search-box"
                placeholder="search..."
                onChange={(event) => setQuery(event.target.value)}
                value={query}
              />
            </div>
            <Link onClick={handleLogout}>Log out</Link>
          </div>
          <div className="app-container">
            <form
              className="note-form"
              onSubmit={(event) =>
                selectedNote ? handleUpdateNote(event) : handleAddNote(event)
              }
            >
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Title"
                required
              ></input>
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Content"
                rows={10}
                required
              ></textarea>

              <Form.Group controlId="addNoteCategorySelect">
                <Form.Label>Select category</Form.Label>
                <Form.Control
                  disabled={selectedNote}
                  as="select"
                  value={addNoteCategory}
                  onChange={(e) => {
                    //alert(e.target.value);
                    setAddNoteCategory(e.target.value);
                  }}
                >
                  {categories.map((c, i) =>
                    c === "all-category" ? "" : <option key={i}>{c}</option>
                  )}
                </Form.Control>
              </Form.Group>

              {selectedNote ? (
                <div className="edit-buttons">
                  <button type="submit">Save</button>
                  <button onClick={handleCancel}>Cancel</button>
                </div>
              ) : (
                <button type="submit">Add Note</button>
              )}
            </form>
            <div className="notes-grid">
              {notes.length !== 0 &&
                notes
                  .filter((note) => {
                    if (query === "") {
                      //if query is empty
                      return note;
                    } else if (
                      note.content
                        .toLowerCase()
                        .includes(query.toLowerCase()) ||
                      note.title.toLowerCase().includes(query.toLowerCase())
                    ) {
                      //returns filtered array
                      return note;
                    }
                  })
                  .filter((note) => {
                    if (queryCategory === "all-category") return note;
                    else {
                      if (
                        queryCategory ===
                        (note.categoryId === null
                          ? "non-category"
                          : getKeyByValue(categoryMap, note.categoryId))
                      ) {
                        return note;
                      }
                    }
                  })
                  .map((note) => {
                    {
                      //alert(JSON.stringify(note));
                    }
                    return (
                      <div
                        key={note._id}
                        className="note-item"
                        onClick={() => handleNoteClick(note)}
                      >
                        <div className="notes-header">
                          <div>
                            {!note.categoryId
                              ? ""
                              : getKeyByValue(categoryMap, note.categoryId)}
                          </div>
                          <button
                            onClick={(event) => deleteNote(event, note._id)}
                          >
                            x
                          </button>
                        </div>
                        <h2>{note.title}</h2>
                        <p>{note.content}</p>
                        <div className="notes-footer">{note.lastModified}</div>
                      </div>
                    );
                  })}
            </div>
          </div>
        </>
      )}
      {/*Object.keys(resp).length === 0 && (
        <p>
          Please, <Link to="/login">login</Link> here!
        </p>
      )*/}
    </>
  );
};

export default Home;
