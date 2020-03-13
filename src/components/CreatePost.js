import React from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import { createPost } from '../graphql/mutations';
import { Auth } from 'aws-amplify';

class CreatePost extends React.Component {
  state = {
    postOwnerId: "",
    postOwnerUsername: "",
    postTitle: "",
    postBody: ""
  }

  componentDidMount = async () => {
    await Auth.currentUserInfo()
      .then(user => {
        this.setState({ postOwnerId: user.attributes.sub, postOwnerUsername: user.username })
      })
  }

  handlePostChange = event => {
    this.setState({ [event.target.name]: event.target.value })
  }

  handleAddPost = async (event) => {
    event.preventDefault();

    const { postOwnerId, postOwnerUsername, postTitle, postBody } = this.state;
    const input = {
      postOwnerId,
      postOwnerUsername,
      postBody,
      postTitle,
      createdAt: new Date().toISOString()
    }

    await API.graphql(graphqlOperation(createPost, { input }));
    this.setState({ postTitle: "", postBody: "" });
  }

  render() {
    return (
      <form className="add-post" onSubmit={this.handleAddPost}>
        <input
          style={{ font: '19px' }}
          type="text"
          name="postTitle"
          placeholder="Post Title"
          required
          value={this.state.postTitle}
          onChange={this.handlePostChange}
        />

        <textarea
          type="text"
          name="postBody"
          rows="3"
          cols="40"
          placeholder="New Blog Post"
          required
          value={this.state.postBody}
          onChange={this.handlePostChange}
        />

        <input type="submit" className="btn" style={{ font: '19px' }} />
      </form>
    )
  }
}

export default CreatePost;