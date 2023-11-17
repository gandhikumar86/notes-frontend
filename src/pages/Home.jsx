import React, { useEffect, useRef, useState } from "react";
import "../styles/Home.css";
import axios from "axios";
import API_URL from "../../config/global";
import { Link, useNavigate } from "react-router-dom";

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

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const prevNoteRef = useRef({ title: "", content: "" });

  const [selectedNote, setSelectedNote] = useState(null);

  const [resp, setResp] = useState({});
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    if (user && user.token) {
      getData(user.token);
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
      }
    } catch (e) {
      console.log("Error while in home page!", e);
    }
  };

  const handleAddNote = async (event) => {
    event.preventDefault();
    try {
      // API logic here
      //console.log("title: ", title);
      //console.log("content: ", content);
      var newNote = {
        title: title,
        content: content,
        userId: resp._id,
      };

      const response = await axios.post(`${API_URL}/home/addNote`, newNote);

      if (response.data._id !== "") {
        newNote = response.data;
        setNotes([newNote, ...notes]);
        setTitle("");
        setContent("");
      } else {
        alert("New note not synced!");
      }
    } catch (e) {
      console.log("Add Note Handler", e);
    }
  };

  const handleNoteClick = (note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
    prevNoteRef.current.title = note.title;
    prevNoteRef.current.content = note.content;
  };

  const handleUpdateNote = async (event) => {
    event.preventDefault();

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
    };

    const response = await axios.post(`${API_URL}/home/editNote`, updatedNote);
    //alert(JSON.stringify(response.data));

    if (response.data !== null) {
      updatedNote.lastModified = response.data.lastModified;
      const updatedNotesList = notes.map((note) =>
        note._id === selectedNote._id ? updatedNote : note
      );

      setNotes(updatedNotesList);
      setTitle("");
      setContent("");
      setSelectedNote(null);
    } else {
      alert("Note update not synced!");
    }
  };

  const handleCancel = () => {
    setTitle("");
    setContent("");
    setSelectedNote(null);
  };

  const deleteNote = async (event, deleteNoteId) => {
    event.stopPropagation();
    //alert(deleteNoteId);
    if (!window.confirm("Are you sure to delete the note?")) {
      return;
    }

    if (selectedNote && selectedNote._id === deleteNoteId) {
      alert("Currently in edit!");
      return;
    }
    const response = await axios.post(`${API_URL}/home/deleteNote`, {
      deleteNoteId: deleteNoteId,
    });
    if (response.data?._id === deleteNoteId) {
      //alert(JSON.stringify(response.data));
      const updatedNotes = notes.filter((note) => note._id !== deleteNoteId);
      setNotes(updatedNotes);
    } else {
      alert("Note delete not synced!");
    }
  };

  const handleLogout = async () => {
    if (window.confirm("Are you sure to logout?")) {
      localStorage.clear();
      window.location.href = "/login";
    }
  };

  return (
    <>
      {Object.keys(resp).length !== 0 && (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <p>Welcome to our note app, {resp.name}!</p>
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
                          <div>{note.lastModified}</div>
                          <button
                            onClick={(event) => deleteNote(event, note._id)}
                          >
                            x
                          </button>
                        </div>
                        <h2>{note.title}</h2>
                        <p>{note.content}</p>
                      </div>
                    );
                  })}
            </div>
          </div>
        </>
      )}
      {Object.keys(resp).length === 0 && (
        <p>
          Please, <Link to="/login">login</Link> here!
        </p>
      )}
    </>
  );
};

export default Home;
